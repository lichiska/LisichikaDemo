/* Signal Noir asset rule: archive and detail artwork must resolve from verified hosted WebP files, never fragile remote thumbnail URLs. */
export type Transmission = { id: string; title: string; type: "Animation" | "Music video" | "Story"; duration: string; date: string; views: string; thumb: string; youtube: string; note: string; description: string; };

export const transmissionAssets = {
  theatrical: "/manus-storage/groza-theatrical_0cd6bcf6.webp",
  intimate: "/manus-storage/groza-intimate_63ef7724.webp",
  symbolic: "/manus-storage/groza-symbolic_c140208a.webp",
  lithograph: "/manus-storage/groza-lithograph_eecd3ae8.webp",
  storm: "/manus-storage/storm-within_50e3b418.webp",
} as const;

export const transmissions: Transmission[] = [
  { id: "01", title: "Mulan Meets Heavy Metal", type: "Animation", duration: "05:14", date: "11 AUG 2026", views: "111 views", thumb: transmissionAssets.symbolic, youtube: "https://www.youtube.com/watch?v=JTjcqzLYwFI", note: "A mythic collision of legend, distortion, and arena-scale motion.", description: "An AI animation experiment that throws a familiar legend into a louder, heavier visual frequency." },
  { id: "02", title: "Knife in Velvet", type: "Music video", duration: "05:52", date: "12 AUG 2026", views: "3 views", thumb: transmissionAssets.intimate, youtube: "https://www.youtube.com/watch?v=3zVSqM9XFcs", note: "An eastern tale of love and betrayal, cut like a late-night transmission.", description: "A velvet-dark animated music video about devotion, danger, and the moment a beautiful story turns." },
  { id: "03", title: "The Storm Within", type: "Story", duration: "15:38", date: "08 AUG 2026", views: "25 views", thumb: transmissionAssets.storm, youtube: "https://www.youtube.com/watch?v=rgxwL5vz1DI", note: "A painterly Russian drama where freedom, ritual, and weather collide.", description: "A visual adaptation of Ostrovsky’s storm: a story of confinement, longing, and the landscape that remembers everything." },
];

export const getTransmission = (id: string) => transmissions.find((item) => item.id === id);
