# Standalone Cloudflare implementation notes

## Sources

1. Cloudflare Workers static assets binding: https://developers.cloudflare.com/workers/static-assets/binding/
2. Cloudflare Workers SPA routing: https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/
3. Cloudflare D1 Worker API: https://developers.cloudflare.com/d1/worker-api/d1-database/
4. Cloudflare D1 prepared statements: https://developers.cloudflare.com/d1/worker-api/prepared-statements/
5. Puter AI overview: https://docs.puter.com/AI/
6. Puter chat API: https://docs.puter.com/AI/chat/
7. Puter listModels API: https://docs.puter.com/AI/listModels/
8. Puter text-to-image API: https://docs.puter.com/AI/txt2img/

## Verified architecture facts

Cloudflare Workers can serve a SPA from an assets directory and expose that collection through an `ASSETS` binding. With `assets.not_found_handling` set to `single-page-application`, unknown navigation routes resolve to `index.html`. With `assets.run_worker_first` configured for `/api/*`, API requests are handled by the Worker while normal assets are served from the asset collection.

A D1 database is available inside the Worker through `env.DB` when the Wrangler binding uses `binding: "DB"`. Queries should use `env.DB.prepare(...).bind(...).first()`, `.all()`, or `.run()`. Batched statements are available through `env.DB.batch([...])`.

Puter.js officially exposes browser-side `puter.ai.chat`, `listModels`, `listModelProviders`, `txt2img`, `img2txt`, `txt2speech`, `speech2speech`, `txt2vid`, and `speech2txt`. `listModels(provider?)` returns model objects with `id`, `provider`, and optional metadata such as context, max_tokens, and cost. `chat` accepts model/provider/stream/max_tokens/temperature and can return a response object or async iterable when streaming. `txt2img` returns an HTMLImageElement and supports model/provider/quality/ratio and input-image options. Puter user-pays requests must be invoked from the browser; no server-side API key should be fabricated.

## Constraints for this migration

The existing managed project was upgraded to a full-stack scaffold that still contains Manus OAuth, Forge storage proxies, tRPC, Drizzle MySQL, and Express. A standalone migration should remove those runtime assumptions, retain the existing React visual frontend, add a Cloudflare Worker entrypoint, and use D1 directly from the Worker. Username/password authentication should use a strong password hash, random session tokens stored server-side in D1, HttpOnly Secure SameSite cookies, and prepared statements. No credentials or Cloudflare API tokens belong in source control.
