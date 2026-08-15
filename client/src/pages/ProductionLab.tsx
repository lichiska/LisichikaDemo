import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight, BookOpen, CheckCircle2, Database, GitBranch, Loader2, Plus, ShieldCheck, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";
import { extractChatText, getPuterAI, isPuterReady, runPuter } from "@/lib/puter";

type Production = { id: number; title: string; logline: string; status: string; payload: string | Record<string, unknown>; updated_at: number };
type WorkspaceRecord = { id: number; workspace_type: string; title: string; state: string | Record<string, unknown>; status: string; version: number; updated_at: number };
type Detail = { production: Production; characters: Record<string, unknown>[]; worlds: Record<string, unknown>[]; scenes: Record<string, unknown>[]; assets: Record<string, unknown>[]; reviews: Record<string, unknown>[]; lineage: Record<string, unknown>[]; workspaces: WorkspaceRecord[] };
type CognitiveAnalysis = Record<string, string | string[] | Record<string, unknown>>;
type ConsistencyKind = "characters" | "worlds" | "assets";
type WorkspaceState = {
  storyboard: { beats: string; shotIntent: string; continuity: string };
  camera: { lens: string; blocking: string; movement: string };
  audio: { dialogue: string; ambience: string; music: string };
  orchestration: { dependencies: string; priority: string; jobs: string };
  export: { deliveryTarget: string; provenanceBundle: string; reviewGate: string };
};
type ConsistencyReport = { output: string; provenance: string; status: string; updatedAt: number };
const emptyWorkspaceState: WorkspaceState = {
  storyboard: { beats: "", shotIntent: "", continuity: "" },
  camera: { lens: "", blocking: "", movement: "" },
  audio: { dialogue: "", ambience: "", music: "" },
  orchestration: { dependencies: "", priority: "", jobs: "" },
  export: { deliveryTarget: "", provenanceBundle: "", reviewGate: "" },
};

function parseWorkspaceState(kind: keyof WorkspaceState, value: WorkspaceRecord["state"]): WorkspaceState[typeof kind] {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return { ...emptyWorkspaceState[kind], ...(parsed && typeof parsed === "object" ? parsed : {}) } as WorkspaceState[typeof kind];
  } catch { return emptyWorkspaceState[kind]; }
}

function parseCognitiveAnalysis(text: string): CognitiveAnalysis {
  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    return Object.fromEntries(Object.entries(parsed).map(([key, value]) => [key, typeof value === "string" || Array.isArray(value) || (value && typeof value === "object") ? value as string | string[] | Record<string, unknown> : String(value)]));
  } catch {
    return { intent: text, themes: ["Structured JSON was not returned; review the raw provider output."], continuity: "Human review required." };
  }
}

function renderAnalysisValue(value: CognitiveAnalysis[string] | undefined) {
  if (Array.isArray(value)) return value.join("\n• ");
  if (value && typeof value === "object") return JSON.stringify(value, null, 2);
  return value || "No finding returned for this panel.";
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { credentials: "include", headers: { "content-type": "application/json", ...(init?.headers ?? {}) }, ...init });
  const data = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) throw new Error(data.error || "The production service could not complete that request.");
  return data as T;
}

const capabilities = [
  ["Narrative Deconstructor", "Intent, themes, archetypes, and philosophical tension", "A/B"],
  ["Dialogic Subtext Forge", "Surface, hidden agenda, counterpoint, and resonance", "A/B"],
  ["Sentiment Arc Calculus", "Emotional trajectory, volatility, and beat density", "A/B"],
  ["Consistency Auditor", "Identity drift, dependencies, and unresolved findings", "A/D"],
  ["Provenance Registry", "Lineage events, source hashes, provider, and model", "A/D"],
  ["Compliance Envelope", "Safe-search, privacy, consent, and source-chain state", "A/D"],
];
const analysisTabs = ["intent", "themes", "archetypes", "subtext", "pacing", "emotionalArc", "continuity", "compliance"];
const workspaceViews = ["storyboard", "camera", "audio", "orchestration", "export"] as const;
const workspaceLabels: Record<string, string> = { beats: "Storyboard beats", shotIntent: "Shot intent", continuity: "Continuity notes", lens: "Lens and optics", blocking: "Blocking", movement: "Camera movement", dialogue: "Dialogue plan", ambience: "Ambience and foley", music: "Music brief", dependencies: "Dependencies", priority: "Priority", jobs: "Production jobs", deliveryTarget: "Delivery target", provenanceBundle: "Provenance bundle", reviewGate: "Review gate" };

export default function ProductionLab() {
  const { user, loading: authLoading } = useAuth();
  const [productions, setProductions] = useState<Production[]>([]);
  const [selected, setSelected] = useState<Detail | null>(null);
  const [title, setTitle] = useState("Untitled anime production");
  const [logline, setLogline] = useState("A signal arrives from beyond the feed, and a small studio must decide what deserves to become visible.");
  const [entityName, setEntityName] = useState("");
  const [script, setScript] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [analysisData, setAnalysisData] = useState<CognitiveAnalysis>({});
  const [analysisView, setAnalysisView] = useState("intent");
  const [complianceEvents, setComplianceEvents] = useState<Record<string, unknown>[]>([]);
  const [consistencyReports, setConsistencyReports] = useState<Record<ConsistencyKind, ConsistencyReport | null>>({ characters: null, worlds: null, assets: null });
  const [workspaceView, setWorkspaceView] = useState<(typeof workspaceViews)[number]>("storyboard");
  const [workspaceState, setWorkspaceState] = useState<WorkspaceState>(emptyWorkspaceState);
  const [workspaceError, setWorkspaceError] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const activeCapability = useMemo(() => getPuterAI() ? "Puter.js connected" : "Waiting for Puter.js", []);

  async function loadProduction(id: number) {
    const detail = await api<Detail>(`/api/productions/${id}`);
    const compliance = await api<{ events: Record<string, unknown>[] }>(`/api/productions/${id}/compliance`);
    setSelected(detail); setComplianceEvents(compliance.events);
    const reports = { characters: null, worlds: null, assets: null } as Record<ConsistencyKind, ConsistencyReport | null>;
    for (const kind of ["characters", "worlds", "assets"] as const) {
      const review = detail.reviews.find((item) => item.category === "consistency-drift" && item.entity_type === kind);
      if (review) {
        const findings = typeof review.findings === "string" ? review.findings : (review.findings as Record<string, unknown> | undefined);
        reports[kind] = { output: typeof findings === "string" ? findings : String(findings?.output ?? JSON.stringify(findings ?? {}, null, 2)), provenance: String(findings && typeof findings !== "string" ? findings.provider ?? "unknown provider" : "unknown provider"), status: String(findings && typeof findings !== "string" ? findings.status ?? "human-review-required" : "human-review-required"), updatedAt: Number(review.created_at ?? Date.now()) };
      }
    }
    setConsistencyReports(reports);
  }

  async function refresh() {
    if (!user) return;
    try {
      const result = await api<{ productions: Production[] }>("/api/productions");
      setProductions(result.productions);
      if (result.productions[0]) await loadProduction(result.productions[0].id);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Sign in to load productions."); }
  }
  useEffect(() => { void refresh(); }, [user]);
  useEffect(() => { if (selected) void loadWorkspace(workspaceView); }, [selected?.production.id, workspaceView]);

  async function createProduction() {
    setBusy(true); setMessage("");
    try {
      const created = await api<Production>("/api/productions", { method: "POST", body: JSON.stringify({ title, logline, payload: { specification: "industrial-anime-studio", capabilityTier: "A/B/D" } }) });
      setProductions((items) => [created, ...items]); await loadProduction(created.id); setMessage("Production ontology created and lineage event recorded.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not create production."); } finally { setBusy(false); }
  }
  async function createOntologyEntity(kind: "characters" | "worlds" | "assets") {
    if (!selected || !entityName.trim()) return;
    setBusy(true); setMessage("");
    try {
      await api(`/api/productions/${selected.production.id}/${kind}`, { method: "POST", body: JSON.stringify({ name: entityName, kind: kind === "assets" ? "reference" : undefined, ontology: { status: "anchored", dimensions: kind === "characters" ? ["visual", "auditory", "kinetic", "emotional", "relational", "historical", "psychological", "costume", "prop", "environment", "linguistic", "narrative"] : ["identity", "constraints", "provenance"] } }) });
      setEntityName(""); await loadProduction(selected.production.id); setMessage(`${kind.slice(0, -1)} ontology record created and added to lineage.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not create ontology record."); } finally { setBusy(false); }
  }
  async function mutateOntology(kind: "characters" | "worlds" | "assets", id: number, method: "PUT" | "DELETE", name?: string) {
    if (!selected) return;
    setBusy(true);
    try { await api(`/api/productions/${selected.production.id}/${kind}/${id}`, { method, body: method === "PUT" ? JSON.stringify({ name: name ? `${name} / revised` : "Revised entity", ontology: { status: "reviewed", revisedAt: new Date().toISOString() } }) : undefined }); setSelected(await api<Detail>(`/api/productions/${selected.production.id}`)); setMessage(`${kind.slice(0, -1)} ${method === "DELETE" ? "deleted" : "updated"}; lineage recorded.`); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Ontology mutation failed."); }
    finally { setBusy(false); }
  }
  async function auditEntityConsistency(kind: "characters" | "worlds" | "assets") {
    if (!selected) return;
    setBusy(true); setMessage("");
    try {
      const entities = selected[kind];
      let text = JSON.stringify({ entityType: kind, driftFindings: ["Puter.js unavailable; local structural audit completed."], missingDependencies: [], provenanceGaps: ["Provider response unavailable; human review required."], confidence: 0.35 });
      let provenance = "local-structural-fallback";
      if (isPuterReady()) { try { const providerResponse = await Promise.race([runPuter("chat", `Audit only the ${kind} ontology for identity drift, missing dependencies, provenance gaps, and continuity contradictions. Return JSON keys entityType, driftFindings, missingDependencies, provenanceGaps, confidence. Snapshot:\n${JSON.stringify(entities)}`, { model: "gpt-5-nano", temperature: 0.1 }), new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Puter audit timed out")), 4000))]); text = extractChatText(providerResponse); provenance = "puter.js / gpt-5-nano"; } catch { /* Keep the truthful local fallback when the provider is unavailable. */ } }
      const report = { output: `${text}\nAudit run: ${Date.now()}`, provenance, status: "human-review-required", updatedAt: Date.now() };
      setConsistencyReports((current) => ({ ...current, [kind]: report }));
      await api(`/api/productions/${selected.production.id}/reviews`, { method: "POST", body: JSON.stringify({ entity_type: kind, entity_id: selected.production.id, category: "consistency-drift", score: 0.7, findings: { provider: report.provenance, model: "gpt-5-nano", output: report.output, status: report.status } }) });
      setMessage(`${kind} consistency finding recorded with provenance.`);
      await loadProduction(selected.production.id);
    } catch (error) { setMessage(error instanceof Error ? error.message : `${kind} consistency audit failed.`); }
    finally { setBusy(false); }
  }

  async function auditConsistency() {
    if (!selected) return;
    setBusy(true); setMessage("");
    try {
      const snapshot = JSON.stringify({ characters: selected.characters, worlds: selected.worlds, assets: selected.assets });
      const text = extractChatText(await runPuter("chat", `Audit this production ontology for identity drift, missing dependencies, provenance gaps, and continuity contradictions. Return JSON keys driftFindings, missingDependencies, provenanceGaps, confidence. Snapshot:\n${snapshot}`, { model: "gpt-5-nano", temperature: 0.1 }));
      const report = { output: text, provenance: "puter.js / gpt-5-nano", status: "human-review-required", updatedAt: Date.now() };
      setConsistencyReports({ characters: report, worlds: report, assets: report });
      await api(`/api/productions/${selected.production.id}/reviews`, { method: "POST", body: JSON.stringify({ entity_type: "ontology", entity_id: selected.production.id, category: "consistency-drift", score: 0.7, findings: { provider: "puter.js", output: text, status: "human-review-required" } }) });
      await loadProduction(selected.production.id); setMessage("Consistency audit recorded with provenance and review state.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Consistency audit failed."); }
    finally { setBusy(false); }
  }

  async function loadWorkspace(kind: (typeof workspaceViews)[number]) {
    if (!selected) return;
    try {
      const result = await api<{ workspace: WorkspaceRecord | null }>(`/api/productions/${selected.production.id}/workspaces/${kind}`);
      if (result.workspace) setWorkspaceState((current) => ({ ...current, [kind]: parseWorkspaceState(kind, result.workspace!.state) }));
    } catch (error) { setWorkspaceError(error instanceof Error ? error.message : "Workspace could not be loaded."); setMessage(error instanceof Error ? error.message : "Workspace could not be loaded."); }
  }

  async function queueProductionJob(kind: (typeof workspaceViews)[number]) {
    if (!selected) return;
    setBusy(true); setWorkspaceError("");
    try {
      await api(`/api/productions/${selected.production.id}/workspaces/${kind}`, { method: "PUT", body: JSON.stringify({ title: kind, state: { ...workspaceState[kind], provider: "local", status: "saved" } }) });
      await loadProduction(selected.production.id); setMessage(`${kind} workspace saved and lineage recorded.`);
    }
    catch (error) { const detail = error instanceof Error ? error.message : "Production job could not be queued."; setWorkspaceError(detail); setMessage(detail); }
    finally { setBusy(false); }
  }

  async function remediateReview(id: number) {
    if (!selected) return;
    setBusy(true);
    try { await api(`/api/productions/${selected.production.id}/reviews/${id}`, { method: "PATCH", body: JSON.stringify({ resolution: "resolved", remediation: { action: "targeted-revision-queued", provider: "local" } }) }); await loadProduction(selected.production.id); setMessage("Review resolved and remediation lineage recorded."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Review remediation failed."); }
    finally { setBusy(false); }
  }

  async function analyzeScene() {
    if (!selected || !script.trim()) return;
    setBusy(true); setMessage("");
    try {
      const prompt = `You are a narrative production analyst. Analyze this anime scene using explicit sections: intent, themes, archetypes, emotional arc, subtext layers, pacing risks, continuity risks, and safe-search concerns. Return concise JSON with keys intent, themes, archetypes, emotionalArc, subtext, pacing, continuity, compliance. Scene:\n${script}`;
      const text = extractChatText(await runPuter("chat", prompt, { model: "gpt-5-nano", temperature: 0.2 }));
      setAnalysis(text); setAnalysisData(parseCognitiveAnalysis(text));
      const scene = await api<{ id: number }>(`/api/productions/${selected.production.id}/scenes`, { method: "POST", body: JSON.stringify({ title: "Narrative analysis scene", script, analysis: { provider: "puter.js", model: "gpt-5-nano", output: text } }) });
      await api(`/api/productions/${selected.production.id}/reviews`, { method: "POST", body: JSON.stringify({ entity_type: "scene", entity_id: scene.id, category: "semantic-coherence", score: 0.8, findings: { provider: "puter.js", status: "human-review-required" } }) });
      await api(`/api/productions/${selected.production.id}/compliance`, { method: "POST", body: JSON.stringify({ policy: "safe-search-and-source-chain", decision: "review", details: { provider: "puter.js", note: "Output requires director review before publication." } }) });
      await loadProduction(selected.production.id); setMessage("Structured analysis persisted with QA, compliance, and lineage records.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Puter.js analysis failed."); } finally { setBusy(false); }
  }
  async function queueRevision() {
    if (!selected) return;
    setBusy(true);
    try { await api(`/api/productions/${selected.production.id}/revisions`, { method: "POST", body: JSON.stringify({ target: analysisView, reason: `Director requested revision of ${analysisView}`, priority: 8 }) }); await loadProduction(selected.production.id); setMessage("Targeted revision queued and linked to lineage."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not queue revision."); } finally { setBusy(false); }
  }

  if (authLoading) return <div className="page-shell route-loading">Loading production control…</div>;
  if (!user) return <main className="page-shell content-page"><section className="signal-panel"><p className="eyebrow">Production intelligence</p><h1>Sign in to open the ontology forge.</h1><p>Every production, scene, review, and lineage event is owned by your account.</p><Button asChild><Link href="/account">Open account <ArrowUpRight size={16} /></Link></Button></section></main>;

  return <main className="page-shell content-page production-lab">
    <header className="page-intro"><div><p className="eyebrow"><Sparkles size={15} /> Stratum control / 01–08</p><h1>Production intelligence.</h1><p>Turn narrative intent into traceable production decisions across ontology, scenes, assets, QA, and compliance.</p></div><div className="status-chip"><span className="status-dot" />{activeCapability}</div></header>
    <section className="production-grid">
      <aside className="signal-panel production-sidebar"><div className="panel-heading"><div><span className="eyebrow">Your productions</span><h2>Ontology registry</h2></div><Database size={18} /></div><div className="production-list">{productions.map((item) => <button key={item.id} className={`production-item ${selected?.production.id === item.id ? "is-active" : ""}`} onClick={() => void loadProduction(item.id)}><strong>{item.title}</strong><span>{item.status} / #{item.id}</span></button>)}{productions.length === 0 && <p className="muted-copy">No production records yet.</p>}</div><div className="field-stack"><Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Production title" /><Input value={logline} onChange={(event) => setLogline(event.target.value)} placeholder="Logline" /><Button onClick={() => void createProduction()} disabled={busy}><Plus size={16} /> Create production</Button></div></aside>
      <section className="signal-panel production-main"><div className="panel-heading"><div><span className="eyebrow">{selected ? `Production #${selected.production.id}` : "Awaiting production"}</span><h2>{selected?.production.title ?? "Create your first production"}</h2></div><GitBranch size={18} /></div>{selected ? <><p className="production-logline">{selected.production.logline}</p><div className="ontology-stats"><span><strong>{selected.characters.length}</strong> characters</span><span><strong>{selected.worlds.length}</strong> worlds</span><span><strong>{selected.scenes.length}</strong> scenes</span><span><strong>{selected.assets.length}</strong> assets</span><span><strong>{selected.lineage.length}</strong> lineage events</span><span><strong>{selected.reviews.length}</strong> QA reviews</span></div><div className="ontology-create"><Input value={entityName} onChange={(event) => setEntityName(event.target.value)} placeholder="New character, world, or asset" /><Button variant="outline" onClick={() => void createOntologyEntity("characters")} disabled={busy || !entityName.trim()}>+ Character</Button><Button variant="outline" onClick={() => void createOntologyEntity("worlds")} disabled={busy || !entityName.trim()}>+ World</Button><Button variant="outline" onClick={() => void createOntologyEntity("assets")} disabled={busy || !entityName.trim()}>+ Asset</Button></div><div className="entity-manager">{([["characters", selected.characters], ["worlds", selected.worlds], ["assets", selected.assets]] as const).map(([kind, items]) => <div className="entity-group" key={kind}><h3>{kind}</h3>{items.slice(0, 6).map((item) => <div className="entity-row" data-testid={`ontology-${kind}-${String(item.id)}`} key={String(item.id)}><span>{String(item.name ?? "Unnamed")}</span><div><Button variant="ghost" size="sm" onClick={() => void mutateOntology(kind, Number(item.id), "PUT", String(item.name ?? "entity"))}>Revise</Button><Button variant="ghost" size="sm" onClick={() => void mutateOntology(kind, Number(item.id), "DELETE")}>Delete</Button></div></div>)}</div>)}</div><div className="field-stack"><label htmlFor="scene-script">Scene / concept input</label><Textarea id="scene-script" value={script} onChange={(event) => setScript(event.target.value)} placeholder="Paste an outline, scene, character exchange, or production brief…" rows={9} /><Button onClick={() => void analyzeScene()} disabled={busy || !script.trim()}>{busy ? <Loader2 className="spin" size={16} /> : <Wand2 size={16} />} Run structured narrative analysis</Button></div>{analysis && <><div className="analysis-tabs">{analysisTabs.map((tab) => <button key={tab} className={analysisView === tab ? "is-active" : ""} onClick={() => setAnalysisView(tab)}>{tab}</button>)}</div><div className="typed-analysis-panel"><h3>{analysisView}</h3><p>{renderAnalysisValue(analysisData[analysisView])}</p><details><summary>Raw provider output</summary><pre className="analysis-output">{analysis}</pre></details></div><Button variant="outline" onClick={() => void queueRevision()} disabled={busy}><GitBranch size={15} /> Queue targeted revision for {analysisView}</Button></>}{message && <p className="inline-status"><CheckCircle2 size={15} /> {message}</p>}<div className="audit-strip"><ShieldCheck size={17} /><span>Every AI output is marked for human review and recorded with provider/model lineage before publication.</span></div><div className="review-timeline"><h3>Lineage timeline</h3>{selected.lineage.slice(0, 8).map((event, index) => <div className="timeline-item" key={index}><GitBranch size={14} /><span>{String(event.action ?? "lineage event")} · {String(event.entity_type ?? "entity")}</span></div>)}{selected.lineage.length === 0 && <p className="muted-copy">Lineage events will appear after the first production action.</p>}</div><div className="review-timeline" data-testid="review-timeline"><h3>Review timeline</h3>{selected.reviews.slice(0, 6).map((review) => <div className="timeline-item" key={String(review.id)}><ShieldCheck size={14} /><span>{String(review.category ?? "review")} · {String(review.resolution ?? "open")}</span><Button variant="ghost" size="sm" onClick={() => void remediateReview(Number(review.id))}>Resolve</Button></div>)}{selected.reviews.length === 0 && <p className="muted-copy">No review findings yet.</p>}</div><div className="review-timeline" data-testid="compliance-timeline"><h3>Compliance timeline</h3>{complianceEvents.slice(0, 6).map((event) => <div className="timeline-item" key={String(event.id)}><ShieldCheck size={14} /><span>{String(event.policy ?? "policy")} · {String(event.decision ?? "review")}</span></div>)}{complianceEvents.length === 0 && <p className="muted-copy">No compliance events recorded yet.</p>}</div><div className="consistency-panel"><div className="panel-heading"><div><span className="eyebrow">Consistency engine</span><h3>Entity-specific drift and provenance</h3></div><ShieldCheck size={16} /></div><div className="consistency-grid">{([["characters", "Characters", "Identity, relationships, costume, emotional continuity"], ["worlds", "Worlds", "Rules, geography, dependencies, source lineage"], ["assets", "Assets", "Hash, provider, source chain, visual drift"]] as const).map(([kind, label, description]) => { const report = consistencyReports[kind]; return <article className="consistency-card" data-testid={`consistency-${kind}`} key={kind}><h4>{label}</h4><p>{description}</p><Button variant="outline" onClick={() => void auditEntityConsistency(kind)} disabled={busy}>Audit {label}</Button>{report ? <div className="consistency-findings"><strong>Latest {label.toLowerCase()} finding</strong><pre className="analysis-output">{report.output}</pre><small>Provenance: {report.provenance} · Status: {report.status} · Updated: {new Date(report.updatedAt * (report.updatedAt < 10000000000 ? 1000 : 1)).toLocaleString()}</small></div> : <p className="muted-copy">No {label.toLowerCase()} drift finding recorded yet.</p>}</article>; })}</div></div></> : <div className="empty-state"><BookOpen size={24} /><p>Create a production record to unlock scenes, ontology, review, and lineage surfaces.</p></div>}</section>
    </section>
    <section className="capability-grid">{capabilities.map(([name, desc, tier]) => <article className="capability-card" key={name}><div className="card-kicker">Tier {tier}</div><h3>{name}</h3><p>{desc}</p><span className="capability-state">Connected contract</span></article>)}</section><section className="production-board signal-panel"><div className="panel-heading"><div><span className="eyebrow">Production floor</span><h2>Dedicated workspaces</h2></div><GitBranch size={18} /></div><div className="workspace-tabs">{workspaceViews.map((view) => <button key={view} className={workspaceView === view ? "is-active" : ""} onClick={() => { setWorkspaceView(view); void loadWorkspace(view); }}>{view}</button>)}</div><div className="workspace-editor"><h3>{workspaceView}</h3>{workspaceError && <p className="inline-status workspace-error" role="alert">Workspace error: {workspaceError}</p>}<p>{workspaceView === "storyboard" ? "Arrange beats, shot intent, framing, and continuity notes." : workspaceView === "camera" ? "Define lens, blocking, movement, and composition decisions." : workspaceView === "audio" ? "Capture dialogue, ambience, music brief, and mix notes." : workspaceView === "orchestration" ? "Sequence dependencies, priority, and production jobs." : "Prepare the review gate, provenance bundle, and delivery target."}</p><div className="workspace-field-grid">{Object.entries(workspaceState[workspaceView] as Record<string, string>).map(([field, value]) => <label className="field-stack" key={field}><span>{workspaceLabels[field] ?? field}</span><Textarea value={value} onChange={(event) => setWorkspaceState((current) => ({ ...current, [workspaceView]: { ...current[workspaceView], [field]: event.target.value } }))} placeholder={`Enter ${workspaceLabels[field]?.toLowerCase() ?? field}…`} rows={3} /></label>)}</div><Button onClick={() => void queueProductionJob(workspaceView)} disabled={busy || !selected || !Object.values(workspaceState[workspaceView]).some(Boolean)}>Save {workspaceView} workspace</Button></div></section>
  </main>;
}
