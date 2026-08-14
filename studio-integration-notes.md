# Studio integration notes

## Wan video

Wan’s official API surface supports developer-facing video generation. The Alibaba Cloud Model Studio reference describes text-to-video tasks as asynchronous and typically taking one to five minutes, so the Studio should model Wan as a queued generation job with progress, polling, cancel, and preview states rather than an instant synchronous response. The video workspace should expose prompt, reference mode, duration, aspect ratio, motion/camera direction, seed, and output quality controls, while keeping credentials server-side for a production connection.

References:
- https://wan.video/api
- https://www.alibabacloud.com/help/en/model-studio/text-to-video-api-reference

## ElevenLabs music

Eleven Music is available through the ElevenLabs API and supports text-prompt composition, vocal or instrumental versions, genre and style direction, and streaming/composition workflows. The Studio should model music generation as a long-running composition job with prompt, duration, instrumental/vocal mode, tempo, genre, mood, instruments, variation, and preview/download states. API keys must not be embedded in the static client; the current frontend should provide a clear integration-ready state and local simulated generation until a secure server-side proxy is connected.

References:
- https://elevenlabs.io/docs/overview/capabilities/music
- https://elevenlabs.io/docs/api-reference/music/stream
- https://elevenlabs.io/blog/eleven-music-now-available-in-the-api
