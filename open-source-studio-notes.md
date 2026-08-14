# Open-source Studio implementation notes

## Video editing

For the browser workspace, use an original local-first timeline UI backed by native browser media APIs. WebCodecs is the standards-based browser API for encoding and decoding audio/video, while OpenReel Video is a relevant open-source reference for multi-track React/TypeScript/WebCodecs/WebGPU editing. The first implementation can provide real clip selection, trim, split, track ordering, transitions, caption toggles, zoom, and export settings without uploading local media. Actual MP4 rendering should remain an explicit export step and can be upgraded to a WebCodecs/worker pipeline later.

References:
- https://github.com/Augani/openreel-video
- https://github.com/w3c/webcodecs

## Music generation

For the browser-native open-source music workspace, use Web Audio API concepts for a local sketch/sequencer: tempo, key, scale, bars, instruments, arrangement, stems, and preview transport. A server-side model connector can later route prompts to Stable Audio or another permitted model. The UI should be honest that local sketch mode is deterministic browser audio rather than claiming it is full generative AI. StableDAW is a useful open-source reference for an AI audio DAW workflow.

References:
- https://github.com/gantasmo/stabledaw
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
