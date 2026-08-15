# Multi-page expansion checklist

- [x] Add shared site layout and active navigation state across routes.
- [x] Build `/transmissions` archive page with working category filters and selectable featured item.
- [x] Build `/transmissions/:id` detail page with video metadata, watch action, and related transmissions.
- [x] Build `/about` signal-notes page with channel story, principles, and YouTube CTA.
- [x] Build `/contact` page with a functioning mailto/contact action and social links.
- [x] Add 404 page escape route with links back to the archive and channel.
- [x] Verify route navigation, filter interactions, outbound YouTube links, and responsive layouts.
- [x] Run typecheck/build and capture desktop/mobile screenshots before checkpoint.

# AI Tools page redesign checklist

- [x] Add an AI Tools route and active navigation entry.
- [x] Replace the current AI tools layout with a command-center style interface.
- [x] Add searchable, filterable tool catalog with categories and status chips.
- [x] Add interactive tool preview panel with input, mode selection, and run state.
- [x] Add saved/recent tool states and keyboard-friendly interactions.
- [x] Add responsive desktop/mobile layouts and accessible empty states.
- [x] Verify route, filters, preview interactions, typecheck, build, and screenshots.

# Accessibility, language, and AI tool sections checklist

- [x] Add prominent AI Tools entry points on the homepage and shared header.
- [x] Add global language switcher with English and Russian UI dictionaries.
- [x] Add accessibility settings panel with reduced motion, larger text, high contrast, and focus mode.
- [x] Make accessibility and language settings persist locally across routes.
- [x] Redesign AI Chat, Scene Architect, Hook Foundry, Story Signal, Frame Director, Voice Tuner, and Signal Decoder as distinct sections.
- [x] Adapt AI tool labels, prompts, output scaffolding, and recent states to the active language.
- [x] Verify keyboard navigation, focus states, language switching, settings persistence, routes, and responsive layouts.

# Puter.js AI workspace expansion checklist

- [x] Document the Puter.js integration boundary and client fallback behavior.
- [x] Add the Puter.js client script and typed browser bridge.
- [x] Expand the catalog with AI Chat, Vision, Image, Audio, Transcribe, Translate, Rewrite, Code, and Workflow tools.
- [x] Add distinct tool-specific input and output panels with working local states.
- [x] Connect supported tools to Puter.js calls and show a clear fallback when the library is unavailable.
- [x] Adapt new tools and outputs to the selected website language.
- [x] Verify integration loading, error states, keyboard flow, responsive layouts, typecheck, and build.

# Versatile AI settings, translation, and dynamic thumbnails checklist

- [x] Add model/provider/mode/temperature/length/format controls for AI tools.
- [x] Add theme presets and per-tool advanced settings with reset/apply behavior.
- [x] Complete main-page English/Russian translation for labels, metadata, filters, ticker, and footer.
- [x] Add a Russian-friendly display font and rebalance oversized headings.
- [x] Create custom English and Russian thumbnail variants for the homepage.
- [x] Add automatic thumbnail rotation with language-aware captions and pause controls.
- [x] Verify settings behavior, translation completeness, typography, dynamic rotation, typecheck, build, and responsive layouts.

# Full creator Studio expansion checklist

- [x] Rename AI Tools to Studio in navigation, homepage CTAs, routes, headings, and settings copy.
- [x] Add a Studio overview with project-based workflow stages and active production state.
- [x] Add a Wan video workspace with prompt, storyboard, duration, aspect ratio, motion, camera, seed, and generation state controls.
- [x] Add an ElevenLabs music workspace with prompt, genre, mood, duration, tempo, instruments, vocals, and generation state controls.
- [x] Add cartoon production stages for concept, script, storyboard, voices, music, scenes, edit, and export.
- [x] Add integration availability badges and safe fallback states without downloading media to the user’s phone.
- [x] Localize all new Studio copy in English and Russian and preserve theme/accessibility preferences.
- [x] Verify navigation, settings, responsive layouts, simulated generation states, and production build.

# Final studio expansion checklist

- [x] Make homepage Animation, Music video, and Story category controls navigate and filter the archive.
- [x] Finish remaining English/Russian homepage labels, metadata, and responsive typography adjustments.
- [x] Expand Studio settings with model, mode, theme, quality, seed, aspect ratio, and export controls.
- [x] Add an open-source-friendly browser video editor workspace with timeline, tracks, trim, split, transitions, captions, and export settings.
- [x] Add an open-source-friendly music generator workspace with prompt, genre, tempo, key, structure, instruments, vocals, stems, and export settings.
- [x] Add local-only media handling guidance so assets are not downloaded automatically to mobile devices.
- [x] Verify all buttons, routes, settings, filters, responsive states, typecheck, and build.
- [x] Prepare a GitHub-ready checkpoint without using the previously exposed credential.

# Persistent media workflow checklist

- [x] Add a local-first Studio project model with project name, active stage, settings, and draft metadata.
- [x] Add autosave, project switching, duplicate, reset, JSON export, and JSON import controls.
- [x] Add local video/audio file import with object URL previews and explicit revoke cleanup.
- [x] Add editor clip metadata, trim markers, split state, track selection, captions, and preview playback.
- [x] Add playable music-lab sketch transport with Web Audio oscillator preview and BPM/key controls.
- [x] Add export-ready audio/video state and clear local-only privacy messaging.
- [x] Verify persistence, import/export, media preview, audio transport, responsive layouts, typecheck, and build.

# Secure GitHub push checklist

- [x] Confirm a fresh secure GitHub authorization is active; never reuse the exposed token.
- [x] Confirm the target remote is `lichiska/LisichikaDemo`.
- [x] Validate the current project build and working tree before push.
- [x] Push the complete project to the authorized remote branch.
- [x] Verify the remote commit and report the resulting repository state.

# Deployment repair checklist

- [x] Inspect the repository Vite config and Wrangler-generated files.
- [x] Add a valid plugins array while preserving the existing Manus/Vite build behavior.
- [x] Add or correct Cloudflare deployment configuration without committing credentials.
- [x] Run `pnpm check`, `pnpm build`, and a Wrangler-compatible validation.
- [x] Commit and push the deployment fix to `lichiska/LisichikaDemo`.
