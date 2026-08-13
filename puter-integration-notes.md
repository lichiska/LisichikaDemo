# Puter.js integration notes

Puter.js is available client-side through `https://js.puter.com/v2/` or the `@heyputer/puter.js` package. Official documentation lists `puter.ai.chat()`, `listModels()`, `listModelProviders()`, `txt2img()`, `img2txt()`, `txt2speech()`, `speech2speech()`, `txt2vid()`, and `speech2txt()` as supported AI capabilities.

The implementation will keep the static frontend boundary. The site will load the client library from the document head, access it through a small typed browser bridge, and expose graceful local fallbacks when Puter.js is unavailable or a user has not authorized a capability. No secret API keys will be placed in the frontend.

Primary source: https://docs.puter.com/AI/
Secondary source: https://developer.puter.com/ai/
Image-generation source: https://developer.puter.com/image-generation/
