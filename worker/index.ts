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
