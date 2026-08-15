export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  SESSION_SECRET?: string;
}

type UserRow = { id: number; username: string; created_at: number };
type SessionRow = { user_id: number; username: string; expires_at: number };

const SESSION_COOKIE = "foxy_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const encoder = new TextEncoder();

function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "content-type": "application/json; charset=utf-8", ...(init.headers ?? {}) },
  });
}

function cookieHeader(token: string, maxAge = SESSION_TTL_SECONDS) {
  return `${SESSION_COOKIE}=${token}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Lax`;
}

function readCookie(request: Request, name: string) {
  const header = request.headers.get("cookie") ?? "";
  return header.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1) ?? null;
}

function bytesToBase64(bytes: Uint8Array) {
  let value = "";
  for (const byte of bytes) value += String.fromCharCode(byte);
  return btoa(value).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64ToBytes(value: string) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(normalized);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function digest(value: string) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}

async function hashPassword(password: string, salt: Uint8Array) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: salt as unknown as BufferSource, iterations: 120_000, hash: "SHA-256" }, key, 256);
  return new Uint8Array(bits);
}

function equalBytes(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
}

async function passwordRecord(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await hashPassword(password, salt);
  return `${bytesToBase64(salt)}.${bytesToBase64(hash)}`;
}

async function verifyPassword(password: string, record: string) {
  const [encodedSalt, encodedHash] = record.split(".");
  if (!encodedSalt || !encodedHash) return false;
  return equalBytes(await hashPassword(password, base64ToBytes(encodedSalt)), base64ToBytes(encodedHash));
}

async function createSession(db: D1Database, userId: number) {
  const token = bytesToBase64(crypto.getRandomValues(new Uint8Array(32)));
  const tokenHash = bytesToBase64(await digest(token));
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  await db.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)").bind(tokenHash, userId, expiresAt).run();
  return token;
}

async function currentUser(request: Request, db: D1Database) {
  const token = readCookie(request, SESSION_COOKIE);
  if (!token) return null;
  const tokenHash = bytesToBase64(await digest(token));
  const row = await db.prepare("SELECT users.id, users.username, users.created_at FROM sessions JOIN users ON users.id = sessions.user_id WHERE sessions.token_hash = ? AND sessions.expires_at > ?").bind(tokenHash, Math.floor(Date.now() / 1000)).first<UserRow>();
  return row ?? null;
}

async function body(request: Request) {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function validCredentials(username: unknown, password: unknown) {
  return typeof username === "string" && /^[a-zA-Z0-9_.-]{3,32}$/.test(username) && typeof password === "string" && password.length >= 10 && password.length <= 256;
}

async function handleApi(request: Request, env: Env) {
  const url = new URL(request.url);
  const method = request.method;
  const db = env.DB;

  if (url.pathname === "/api/health") return json({ ok: true, service: "foxy-codename-worker", database: Boolean(db) });

  if (url.pathname === "/api/auth/me" && method === "GET") {
    return json({ user: await currentUser(request, db) });
  }

  if (url.pathname === "/api/auth/register" && method === "POST") {
    const input = await body(request);
    const username = typeof input?.username === "string" ? input.username.trim().toLowerCase() : "";
    const password = input?.password;
    if (!validCredentials(username, password)) return json({ error: "Username must be 3–32 characters and password must be at least 10 characters." }, { status: 400 });
    const existing = await db.prepare("SELECT id FROM users WHERE username = ?").bind(username).first<{ id: number }>();
    if (existing) return json({ error: "That username is already registered." }, { status: 409 });
    const record = await passwordRecord(password as string);
    const result = await db.prepare("INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)").bind(username, record, Math.floor(Date.now() / 1000)).run();
    const session = await createSession(db, Number(result.meta.last_row_id));
    return json({ user: { id: Number(result.meta.last_row_id), username }, ok: true }, { headers: { "set-cookie": cookieHeader(session) } });
  }

  if (url.pathname === "/api/auth/login" && method === "POST") {
    const input = await body(request);
    const username = typeof input?.username === "string" ? input.username.trim().toLowerCase() : "";
    const password = input?.password;
    if (!validCredentials(username, password)) return json({ error: "Enter a valid username and password." }, { status: 400 });
    const user = await db.prepare("SELECT id, username, password_hash, created_at FROM users WHERE username = ?").bind(username).first<UserRow & { password_hash: string }>();
    if (!user || !(await verifyPassword(password as string, user.password_hash))) return json({ error: "Username or password is incorrect." }, { status: 401 });
    const session = await createSession(db, user.id);
    return json({ user: { id: user.id, username: user.username, created_at: user.created_at }, ok: true }, { headers: { "set-cookie": cookieHeader(session) } });
  }

  if (url.pathname === "/api/auth/logout" && method === "POST") {
    const token = readCookie(request, SESSION_COOKIE);
    if (token) await db.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(bytesToBase64(await digest(token))).run();
    return json({ ok: true }, { headers: { "set-cookie": cookieHeader("", 0) } });
  }

  if (url.pathname === "/api/projects" && method === "GET") {
    const user = await currentUser(request, db);
    if (!user) return json({ error: "Authentication required." }, { status: 401 });
    const projects = await db.prepare("SELECT id, name, payload, updated_at FROM projects WHERE user_id = ? ORDER BY updated_at DESC").bind(user.id).all();
    return json({ projects: projects.results });
  }

  if (url.pathname === "/api/projects" && method === "POST") {
    const user = await currentUser(request, db);
    if (!user) return json({ error: "Authentication required." }, { status: 401 });
    const input = await body(request);
    const name = typeof input?.name === "string" ? input.name.trim().slice(0, 100) : "Untitled project";
    const payload = JSON.stringify(input?.payload ?? {});
    const now = Math.floor(Date.now() / 1000);
    const result = await db.prepare("INSERT INTO projects (user_id, name, payload, updated_at) VALUES (?, ?, ?, ?)").bind(user.id, name, payload, now).run();
    return json({ id: Number(result.meta.last_row_id), name, payload, updated_at: now }, { status: 201 });
  }

  const projectMatch = url.pathname.match(/^\/api\/projects\/(\d+)$/);
  if (projectMatch && method === "PUT") {
    const user = await currentUser(request, db);
    if (!user) return json({ error: "Authentication required." }, { status: 401 });
    const input = await body(request);
    const name = typeof input?.name === "string" ? input.name.trim().slice(0, 100) : "Untitled project";
    const payload = JSON.stringify(input?.payload ?? {});
    const now = Math.floor(Date.now() / 1000);
    await db.prepare("UPDATE projects SET name = ?, payload = ?, updated_at = ? WHERE id = ? AND user_id = ?").bind(name, payload, now, Number(projectMatch[1]), user.id).run();
    return json({ ok: true, id: Number(projectMatch[1]), name, payload, updated_at: now });
  }

  if (url.pathname === "/api/productions" && method === "GET") {
    const user = await currentUser(request, db);
    if (!user) return json({ error: "Authentication required." }, { status: 401 });
    const productions = await db.prepare("SELECT id, title, logline, status, payload, created_at, updated_at FROM productions WHERE user_id = ? ORDER BY updated_at DESC").bind(user.id).all();
    return json({ productions: productions.results });
  }

  if (url.pathname === "/api/productions" && method === "POST") {
    const user = await currentUser(request, db);
    if (!user) return json({ error: "Authentication required." }, { status: 401 });
    const input = await body(request);
    const title = typeof input?.title === "string" ? input.title.trim().slice(0, 160) : "Untitled production";
    const logline = typeof input?.logline === "string" ? input.logline.trim().slice(0, 1000) : "";
    const now = Math.floor(Date.now() / 1000);
    const result = await db.prepare("INSERT INTO productions (user_id, title, logline, status, payload, created_at, updated_at) VALUES (?, ?, ?, 'development', ?, ?, ?)").bind(user.id, title, logline, JSON.stringify(input?.payload ?? {}), now, now).run();
    const id = Number(result.meta.last_row_id);
    await db.prepare("INSERT INTO lineage_events (production_id, user_id, entity_type, entity_id, action, provider, created_at) VALUES (?, ?, 'production', ?, 'created', 'local', ?)").bind(id, user.id, id, now).run();
    return json({ id, title, logline, status: "development", payload: input?.payload ?? {}, updated_at: now }, { status: 201 });
  }

  const productionMatch = url.pathname.match(/^\/api\/productions\/(\d+)$/);
  if (productionMatch && method === "GET") {
    const user = await currentUser(request, db);
    if (!user) return json({ error: "Authentication required." }, { status: 401 });
    const productionId = Number(productionMatch[1]);
    const production = await db.prepare("SELECT id, title, logline, status, payload, created_at, updated_at FROM productions WHERE id = ? AND user_id = ?").bind(productionId, user.id).first();
    if (!production) return json({ error: "Production not found." }, { status: 404 });
    const [characters, worlds, scenes, assets, reviews, lineage, workspaces] = await Promise.all([
      db.prepare("SELECT * FROM characters WHERE production_id = ? AND user_id = ? ORDER BY updated_at DESC").bind(productionId, user.id).all(),
      db.prepare("SELECT * FROM worlds WHERE production_id = ? AND user_id = ? ORDER BY updated_at DESC").bind(productionId, user.id).all(),
      db.prepare("SELECT * FROM scenes WHERE production_id = ? AND user_id = ? ORDER BY updated_at DESC").bind(productionId, user.id).all(),
      db.prepare("SELECT * FROM assets WHERE production_id = ? AND user_id = ? ORDER BY updated_at DESC").bind(productionId, user.id).all(),
      db.prepare("SELECT * FROM reviews WHERE production_id = ? AND user_id = ? ORDER BY created_at DESC, id DESC").bind(productionId, user.id).all(),
      db.prepare("SELECT * FROM lineage_events WHERE production_id = ? AND user_id = ? ORDER BY created_at DESC").bind(productionId, user.id).all(),
      db.prepare("SELECT * FROM production_workspaces WHERE production_id = ? AND user_id = ? ORDER BY updated_at DESC").bind(productionId, user.id).all(),
    ]);
    return json({ production, characters: characters.results, worlds: worlds.results, scenes: scenes.results, assets: assets.results, reviews: reviews.results, lineage: lineage.results, workspaces: workspaces.results });
  }

  const ontologyMatch = url.pathname.match(/^\/api\/productions\/(\d+)\/(characters|worlds|assets)$/);
  if (ontologyMatch && method === "POST") {
    const user = await currentUser(request, db);
    if (!user) return json({ error: "Authentication required." }, { status: 401 });
    const productionId = Number(ontologyMatch[1]);
    const kind = ontologyMatch[2];
    const input = await body(request);
    const owned = await db.prepare("SELECT id FROM productions WHERE id = ? AND user_id = ?").bind(productionId, user.id).first();
    if (!owned) return json({ error: "Production not found." }, { status: 404 });
    const name = typeof input?.name === "string" ? input.name.trim().slice(0, 160) : `Untitled ${kind.slice(0, -1)}`;
    const payload = JSON.stringify(input?.ontology ?? input?.metadata ?? {});
    const now = Math.floor(Date.now() / 1000);
    const table = kind === "characters" ? "characters" : kind === "worlds" ? "worlds" : "assets";
    const columns = table === "assets" ? "production_id, user_id, kind, name, uri, sha256, metadata, created_at, updated_at" : "production_id, user_id, name, ontology, created_at, updated_at";
    const statement = table === "assets"
      ? "INSERT INTO assets (production_id, user_id, kind, name, uri, sha256, metadata, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
      : `INSERT INTO ${table} (production_id, user_id, name, ontology, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`;
    const result = table === "assets"
      ? await db.prepare(statement).bind(productionId, user.id, typeof input?.kind === "string" ? input.kind.slice(0, 80) : "reference", name, typeof input?.uri === "string" ? input.uri.slice(0, 500) : "", typeof input?.sha256 === "string" ? input.sha256.slice(0, 128) : "", payload, now, now).run()
      : await db.prepare(statement).bind(productionId, user.id, name, payload, now, now).run();
    const id = Number(result.meta.last_row_id);
    await db.prepare("INSERT INTO lineage_events (production_id, user_id, entity_type, entity_id, action, provider, created_at) VALUES (?, ?, ?, ?, 'created', 'local', ?)").bind(productionId, user.id, table.slice(0, -1), id, now).run();
    return json({ id, name, kind: table.slice(0, -1), ontology: input?.ontology ?? input?.metadata ?? {}, updated_at: now }, { status: 201 });
  }

  const workspaceMatch = url.pathname.match(/^\/api\/productions\/(\d+)\/workspaces\/(storyboard|camera|audio|orchestration|export)$/);
  if (workspaceMatch && (method === "GET" || method === "PUT")) {
    const user = await currentUser(request, db);
    if (!user) return json({ error: "Authentication required." }, { status: 401 });
    const productionId = Number(workspaceMatch[1]);
    const workspaceType = workspaceMatch[2];
    const owned = await db.prepare("SELECT id FROM productions WHERE id = ? AND user_id = ?").bind(productionId, user.id).first();
    if (!owned) return json({ error: "Production not found." }, { status: 404 });
    if (method === "GET") {
      const workspace = await db.prepare("SELECT * FROM production_workspaces WHERE production_id = ? AND user_id = ? AND workspace_type = ?").bind(productionId, user.id, workspaceType).first();
      return json({ workspace: workspace ?? null });
    }
    const input = await body(request);
    const title = typeof input?.title === "string" ? input.title.trim().slice(0, 160) : workspaceType;
    const state = JSON.stringify(input?.state ?? {});
    const now = Math.floor(Date.now() / 1000);
    await db.prepare("INSERT INTO production_workspaces (production_id, user_id, workspace_type, title, state, status, version, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'saved', 1, ?, ?) ON CONFLICT(production_id, user_id, workspace_type) DO UPDATE SET title = excluded.title, state = excluded.state, status = 'saved', version = production_workspaces.version + 1, updated_at = excluded.updated_at").bind(productionId, user.id, workspaceType, title, state, now, now).run();
    await db.prepare("INSERT INTO lineage_events (production_id, user_id, entity_type, entity_id, action, provider, created_at) VALUES (?, ?, ?, ?, 'workspace-saved', 'local', ?)").bind(productionId, user.id, workspaceType, productionId, now).run();
    const workspace = await db.prepare("SELECT * FROM production_workspaces WHERE production_id = ? AND user_id = ? AND workspace_type = ?").bind(productionId, user.id, workspaceType).first();
    return json({ workspace });
  }

  const revisionMatch = url.pathname.match(/^\/api\/productions\/(\d+)\/revisions$/);
  if (revisionMatch && method === "POST") {
    const user = await currentUser(request, db);
    if (!user) return json({ error: "Authentication required." }, { status: 401 });
    const productionId = Number(revisionMatch[1]);
    const input = await body(request);
    const owned = await db.prepare("SELECT id FROM productions WHERE id = ? AND user_id = ?").bind(productionId, user.id).first();
    if (!owned) return json({ error: "Production not found." }, { status: 404 });
    const now = Math.floor(Date.now() / 1000);
    const result = await db.prepare("INSERT INTO jobs (production_id, user_id, kind, status, priority, payload, result, created_at, updated_at) VALUES (?, ?, 'targeted-revision', 'queued', ?, ?, '{}', ?, ?)").bind(productionId, user.id, typeof input?.priority === "number" ? Math.max(1, Math.min(10, input.priority)) : 8, JSON.stringify(input ?? {}), now, now).run();
    const id = Number(result.meta.last_row_id);
    await db.prepare("INSERT INTO lineage_events (production_id, user_id, entity_type, entity_id, action, provider, created_at) VALUES (?, ?, 'job', ?, 'revision-queued', 'local', ?)").bind(productionId, user.id, id, now).run();
    return json({ id, kind: "targeted-revision", status: "queued", created_at: now }, { status: 201 });
  }

  const sceneMatch = url.pathname.match(/^\/api\/productions\/(\d+)\/scenes$/);
  if (sceneMatch && method === "POST") {
    const user = await currentUser(request, db);
    if (!user) return json({ error: "Authentication required." }, { status: 401 });
    const productionId = Number(sceneMatch[1]);
    const input = await body(request);
    const title = typeof input?.title === "string" ? input.title.trim().slice(0, 160) : "Untitled scene";
    const script = typeof input?.script === "string" ? input.script.slice(0, 20000) : "";
    const analysis = JSON.stringify(input?.analysis ?? {});
    const now = Math.floor(Date.now() / 1000);
    const owned = await db.prepare("SELECT id FROM productions WHERE id = ? AND user_id = ?").bind(productionId, user.id).first();
    if (!owned) return json({ error: "Production not found." }, { status: 404 });
    const result = await db.prepare("INSERT INTO scenes (production_id, user_id, title, script, analysis, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(productionId, user.id, title, script, analysis, now, now).run();
    const id = Number(result.meta.last_row_id);
    await db.prepare("INSERT INTO lineage_events (production_id, user_id, entity_type, entity_id, action, provider, created_at) VALUES (?, ?, 'scene', ?, 'created', 'local', ?)").bind(productionId, user.id, id, now).run();
    return json({ id, title, script, analysis: input?.analysis ?? {}, updated_at: now }, { status: 201 });
  }

  const entityMatch = url.pathname.match(/^\/api\/productions\/(\d+)\/(characters|worlds|assets)\/(\d+)$/);
  if (entityMatch && (method === "PUT" || method === "DELETE")) {
    const user = await currentUser(request, db);
    if (!user) return json({ error: "Authentication required." }, { status: 401 });
    const productionId = Number(entityMatch[1]);
    const table = entityMatch[2] === "characters" ? "characters" : entityMatch[2] === "worlds" ? "worlds" : "assets";
    const entityId = Number(entityMatch[3]);
    const owned = await db.prepare(`SELECT id FROM ${table} WHERE id = ? AND production_id = ? AND user_id = ?`).bind(entityId, productionId, user.id).first();
    if (!owned) return json({ error: "Ontology entity not found." }, { status: 404 });
    if (method === "DELETE") {
      await db.prepare(`DELETE FROM ${table} WHERE id = ? AND production_id = ? AND user_id = ?`).bind(entityId, productionId, user.id).run();
      const now = Math.floor(Date.now() / 1000);
      await db.prepare("INSERT INTO lineage_events (production_id, user_id, entity_type, entity_id, action, provider, created_at) VALUES (?, ?, ?, ?, 'deleted', 'local', ?)").bind(productionId, user.id, table.slice(0, -1), entityId, now).run();
      return json({ ok: true, id: entityId, action: "deleted" });
    }
    const input = await body(request);
    const name = typeof input?.name === "string" ? input.name.trim().slice(0, 160) : "Untitled entity";
    const payload = JSON.stringify(input?.ontology ?? input?.metadata ?? {});
    const now = Math.floor(Date.now() / 1000);
    if (table === "assets") await db.prepare("UPDATE assets SET name = ?, metadata = ?, updated_at = ? WHERE id = ? AND production_id = ? AND user_id = ?").bind(name, payload, now, entityId, productionId, user.id).run();
    else await db.prepare(`UPDATE ${table} SET name = ?, ontology = ?, updated_at = ? WHERE id = ? AND production_id = ? AND user_id = ?`).bind(name, payload, now, entityId, productionId, user.id).run();
    await db.prepare("INSERT INTO lineage_events (production_id, user_id, entity_type, entity_id, action, provider, created_at) VALUES (?, ?, ?, ?, 'updated', 'local', ?)").bind(productionId, user.id, table.slice(0, -1), entityId, now).run();
    return json({ ok: true, id: entityId, name, action: "updated", updated_at: now });
  }

  const reviewListMatch = url.pathname.match(/^\/api\/productions\/(\d+)\/(reviews|compliance)$/);
  if (reviewListMatch && method === "GET") {
    const user = await currentUser(request, db);
    if (!user) return json({ error: "Authentication required." }, { status: 401 });
    const productionId = Number(reviewListMatch[1]);
    const table = reviewListMatch[2] === "reviews" ? "reviews" : "compliance_events";
    const rows = await db.prepare(`SELECT * FROM ${table} WHERE production_id = ? AND user_id = ? ORDER BY created_at DESC`).bind(productionId, user.id).all();
    return json({ events: rows.results });
  }

  const reviewResolutionMatch = url.pathname.match(/^\/api\/productions\/(\d+)\/reviews\/(\d+)$/);
  if (reviewResolutionMatch && method === "PATCH") {
    const user = await currentUser(request, db);
    if (!user) return json({ error: "Authentication required." }, { status: 401 });
    const input = await body(request);
    const productionId = Number(reviewResolutionMatch[1]);
    const reviewId = Number(reviewResolutionMatch[2]);
    const resolution = typeof input?.resolution === "string" ? input.resolution.slice(0, 40) : "resolved";
    const remediation = JSON.stringify(input?.remediation ?? {});
    const now = Math.floor(Date.now() / 1000);
    const result = await db.prepare("UPDATE reviews SET resolution = ?, findings = ? WHERE id = ? AND production_id = ? AND user_id = ?").bind(resolution, remediation, reviewId, productionId, user.id).run();
    if (!result.meta.changes) return json({ error: "Review not found." }, { status: 404 });
    await db.prepare("INSERT INTO lineage_events (production_id, user_id, entity_type, entity_id, action, provider, created_at) VALUES (?, ?, 'review', ?, 'remediated', 'local', ?)").bind(productionId, user.id, reviewId, now).run();
    return json({ ok: true, id: reviewId, resolution, remediation: input?.remediation ?? {}, updated_at: now });
  }

  const reviewMatch = url.pathname.match(/^\/api\/productions\/(\d+)\/reviews$/);
  if (reviewMatch && method === "POST") {
    const user = await currentUser(request, db);
    if (!user) return json({ error: "Authentication required." }, { status: 401 });
    const productionId = Number(reviewMatch[1]);
    const input = await body(request);
    const owned = await db.prepare("SELECT id FROM productions WHERE id = ? AND user_id = ?").bind(productionId, user.id).first();
    if (!owned) return json({ error: "Production not found." }, { status: 404 });
    const now = Math.floor(Date.now() / 1000);
    const entityType = typeof input?.entity_type === "string" ? input.entity_type.slice(0, 80) : "production";
    const entityId = Number(input?.entity_id ?? productionId);
    const category = typeof input?.category === "string" ? input.category.slice(0, 80) : "semantic-coherence";
    const score = typeof input?.score === "number" ? Math.max(0, Math.min(1, input.score)) : 0;
    const findings = JSON.stringify(input?.findings ?? {});
    const result = await db.prepare("INSERT INTO reviews (production_id, user_id, entity_type, entity_id, category, score, findings, resolution, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'open', ?)").bind(productionId, user.id, entityType, entityId, category, score, findings, now).run();
    return json({ id: Number(result.meta.last_row_id), category, score, findings: input?.findings ?? {}, resolution: "open", created_at: now }, { status: 201 });
  }

  const complianceMatch = url.pathname.match(/^\/api\/productions\/(\d+)\/compliance$/);
  if (complianceMatch && method === "POST") {
    const user = await currentUser(request, db);
    if (!user) return json({ error: "Authentication required." }, { status: 401 });
    const productionId = Number(complianceMatch[1]);
    const input = await body(request);
    const owned = await db.prepare("SELECT id FROM productions WHERE id = ? AND user_id = ?").bind(productionId, user.id).first();
    if (!owned) return json({ error: "Production not found." }, { status: 404 });
    const now = Math.floor(Date.now() / 1000);
    const policy = typeof input?.policy === "string" ? input.policy.slice(0, 120) : "safe-search";
    const decision = typeof input?.decision === "string" ? input.decision.slice(0, 40) : "review";
    const details = JSON.stringify(input?.details ?? {});
    const result = await db.prepare("INSERT INTO compliance_events (production_id, user_id, policy, decision, details, created_at) VALUES (?, ?, ?, ?, ?, ?)").bind(productionId, user.id, policy, decision, details, now).run();
    return json({ id: Number(result.meta.last_row_id), policy, decision, details: input?.details ?? {}, created_at: now }, { status: 201 });
  }

  return json({ error: "Not found" }, { status: 404 });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      try {
        return await handleApi(request, env);
      } catch (error) {
        console.error("Worker API error", error);
        return json({ error: "The service could not complete that request." }, { status: 500 });
      }
    }
    return env.ASSETS.fetch(request);
  },
};
