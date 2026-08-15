import { chromium } from "playwright";

const baseURL = process.env.FOXY_UI_URL || "http://127.0.0.1:8789";
const username = `ui_${Date.now()}`;
const password = "StrongPass123!";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  await page.goto(`${baseURL}/account`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /need an account/i }).click();
  await page.getByLabel(/username/i).fill(username);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /create account/i }).click();
  await page.waitForTimeout(250);
  await page.goto(`${baseURL}/production`, { waitUntil: "networkidle" });
  await page.getByPlaceholder(/production title/i).fill("UI acceptance production");
  await page.getByPlaceholder(/logline/i).fill("A browser-level ontology acceptance pass.");
  await page.getByRole("button", { name: /create production/i }).click();
  await page.getByPlaceholder(/new character, world, or asset/i).fill("UI character");
  await page.getByRole("button", { name: "+ Character", exact: true }).click();
  await page.waitForTimeout(250);
  await page.getByPlaceholder(/new character, world, or asset/i).fill("UI world");
  await page.getByRole("button", { name: "+ World", exact: true }).click();
  await page.waitForTimeout(250);
  await page.getByPlaceholder(/new character, world, or asset/i).fill("UI asset");
  await page.getByRole("button", { name: "+ Asset", exact: true }).click();
  const productionId = await page.evaluate(async () => { const data = await (await fetch("/api/productions")).json(); return data.productions.find((item) => item.title === "UI acceptance production").id; });
  await page.evaluate(async (id) => {
    await fetch(`/api/productions/${id}/reviews`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ entity_type: "production", entity_id: id, category: "ui-acceptance", score: 0.9, findings: { status: "human-review-required" } }) });
    await fetch(`/api/productions/${id}/compliance`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ policy: "ui-acceptance-policy", decision: "review", details: { source: "browser-acceptance" } }) });
    await fetch(`/api/productions/${id}/reviews`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ entity_type: "characters", entity_id: id, category: "consistency-drift", score: 0.6, findings: { driftFindings: ["seeded acceptance finding"], provenanceGaps: [], provider: "browser-acceptance" } }) });
  }, productionId);
  await page.reload({ waitUntil: "networkidle" });
  await page.getByTestId(/ontology-worlds-/).getByRole("button", { name: /revise/i }).click();
  await page.getByTestId(/ontology-worlds-/).getByRole("button", { name: /delete/i }).click();
  await page.getByTestId(/ontology-assets-/).getByRole("button", { name: /revise/i }).click();
  await page.getByTestId(/ontology-assets-/).getByRole("button", { name: /delete/i }).click();
  const consistencyButtons = page.getByRole("button", { name: /audit (characters|worlds|assets)/i });
  if (await consistencyButtons.count() !== 3) throw new Error("Expected three entity-specific consistency controls.");
  for (const workspace of ["storyboard", "camera", "audio", "orchestration", "export"]) {
    if (workspace === "camera") {
      let injectedFailure = false;
      await page.route(new RegExp(`/api/productions/${productionId}/workspaces/camera$`), async (route) => { if (!injectedFailure && route.request().method() === "GET") { injectedFailure = true; await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Injected workspace load failure" }) }); } else await route.continue(); });
      await page.getByRole("button", { name: workspace, exact: true }).click();
      await page.getByRole("alert").filter({ hasText: /workspace error/i }).waitFor();
      await page.unroute(new RegExp(`/api/productions/${productionId}/workspaces/camera$`));
    }
    await page.getByRole("button", { name: workspace, exact: true }).click();
    await page.waitForTimeout(400);
    await page.locator(".workspace-editor textarea").first().fill(`${workspace} acceptance payload`);
    await page.waitForFunction((label) => Array.from(document.querySelectorAll("button")).some((button) => button.textContent?.toLowerCase().includes(`save ${label} workspace`) && !button.disabled), workspace);
    await page.getByRole("button", { name: new RegExp(`save ${workspace} workspace`, "i") }).click();
    await page.getByText(new RegExp(`${workspace} workspace saved`, "i")).waitFor();
  }
  const invalidWorkspaceResponse = await page.evaluate(async (id) => { const response = await fetch(`/api/productions/${id}/workspaces/not-a-workspace`); return response.status; }, productionId);
  if (![400, 404].includes(invalidWorkspaceResponse)) throw new Error(`Expected invalid workspace request to return a client error, got ${invalidWorkspaceResponse}`);
  const seededCharacterFinding = await page.getByTestId("consistency-characters").locator(".analysis-output").textContent();
  const characterAuditButton = page.getByTestId("consistency-characters").getByRole("button", { name: /audit characters/i });
  await characterAuditButton.waitFor({ state: "visible" });
  await page.waitForFunction(() => { const button = document.querySelector('[data-testid="consistency-characters"] button'); return Boolean(button && !button.disabled); });
  await characterAuditButton.click();
  await page.getByText(/characters consistency finding recorded/i).waitFor({ timeout: 10000 });
  const auditedCharacterFinding = await page.getByTestId("consistency-characters").locator(".analysis-output").textContent();
  if (!auditedCharacterFinding || auditedCharacterFinding === seededCharacterFinding) throw new Error("Character audit UI action did not change the visible entity-specific finding.");
  await page.getByTestId("review-timeline").waitFor();
  const workspaceResponse = await page.evaluate(async (id) => { const response = await fetch(`/api/productions/${id}/workspaces/storyboard`); return { status: response.status, body: await response.json() }; }, productionId);
  const workspaceApiState = workspaceResponse.body.workspace;
  if (workspaceResponse.status !== 200 || !workspaceApiState) throw new Error(`Storyboard workspace was not returned by the API after save: ${JSON.stringify(workspaceResponse)}`);
  await page.reload({ waitUntil: "networkidle" });
  const savedWorkspaceValues = {};
  for (const workspace of ["storyboard", "camera", "audio", "orchestration", "export"]) {
    await page.getByRole("button", { name: workspace, exact: true }).click();
    await page.waitForTimeout(400);
    const value = await page.locator(".workspace-editor textarea").first().inputValue();
    savedWorkspaceValues[workspace] = value;
    if (value !== `${workspace} acceptance payload`) throw new Error(`${workspace} state did not reload: ${value}`);
  }
  const savedStoryboard = savedWorkspaceValues.storyboard;
  const persistedCharacterFinding = await page.getByTestId("consistency-characters").locator(".analysis-output").textContent();
  if (persistedCharacterFinding !== auditedCharacterFinding) throw new Error("Audited character finding did not persist after refresh.");
  if (await page.locator('[role="alert"].workspace-error').count()) throw new Error("Workspace error state remained visible after successful saves.");
  await page.getByTestId("compliance-timeline").waitFor();
  console.log(JSON.stringify({ ok: true, username, worldRowsAfterDelete: await page.locator('[data-testid^="ontology-worlds-"]').count(), assetRowsAfterDelete: await page.locator('[data-testid^="ontology-assets-"]').count(), characterRows: await page.locator('[data-testid^="ontology-characters-"]').count(), reviewTimeline: true, complianceTimeline: true, consistencyAudit: true, auditedFindingChanged: true, invalidWorkspaceError: true, visibleWorkspaceError: true, workspaces: ["storyboard", "camera", "audio", "orchestration", "export"], savedAllWorkspaceFields: true, persistedConsistencyFinding: true }));
} finally {
  await browser.close();
}
