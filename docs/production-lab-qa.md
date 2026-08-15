# ProductionLab acceptance verification

This document records the repeatable acceptance path for the industrial-studio slice. It intentionally uses a local D1 Worker account and does not seed fake public content.

## API persistence checks

1. Start the local Worker with `pnpm exec wrangler dev --local --port 8788` and apply migrations with `pnpm db:migrate:local`.
2. Register a test account through `POST /api/auth/register`, then create a production through `POST /api/productions`.
3. Create one character, one world, and one asset through their production-scoped endpoints. Read the production detail and confirm all three records appear.
4. Update and then delete each record through `PUT` and `DELETE` on `/api/productions/:id/{characters|worlds|assets}/:entityId`. Read the detail again and confirm the revised name appears after update and the record is absent after delete.
5. Create a scene analysis, a review, and a compliance event. Read `/reviews` and `/compliance` and confirm both event collections contain the stored records.
6. Resolve the review through `PATCH /api/productions/:id/reviews/:reviewId` and confirm the review resolution changes and a `remediated` lineage event is present.

## ProductionLab UI checks

After signing in at `/account` and opening `/production`, verify that the ontology registry displays `data-testid="ontology-characters-*"`, `data-testid="ontology-worlds-*"`, and `data-testid="ontology-assets-*"` rows. Click **Revise** and confirm the corresponding row name changes. Click **Delete** and confirm the corresponding row disappears after the detail refresh.

Paste a scene into `#scene-script`, run structured narrative analysis, and verify the `intent`, `themes`, `archetypes`, `subtext`, `pacing`, and `emotionalArc` tabs render separate typed values. The raw provider response must remain behind the disclosure panel. Verify `[data-testid="review-timeline"]` shows the review and that its **Resolve** action changes the resolution. Verify `[data-testid="compliance-timeline"]` renders the actual policy and decision returned by the compliance endpoint.

## Build gates

The required gates are `pnpm check`, `pnpm test`, `pnpm build`, and `pnpm exec wrangler deploy --dry-run`. No gate may depend on Manus, Replit, or Atoms packages.
