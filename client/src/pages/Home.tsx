// Signal Noir design reminder: asymmetric broadcast-wall layout, cinematic imagery, paper-cream type, signal coral accents, tuned-signal motion.
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Clock3, ExternalLink, Play, Radio, ScanLine, Sparkles, Volume2 } from "lucide-react";
import { useMemo, useState } from "react";

type Transmission = {
  id: string;
  title: string;
  type: "Animation" | "Music video" | "Story";
  duration: string;
  date: string;
  views: string;
  thumb: string;
  accent: string;
  youtube: string;
  note: string;
};

const transmissions: Transmission[] = [
  {
    id: "01",
    title: "Mulan Meets Heavy Metal",
    type: "Animation",
    duration: "05:14",
    date: "11 AUG 2026",
    views: "111 views",
    thumb: "https://i.ytimg.com/vi/JTjcqzLYwFI/hqdefault.jpg",
    accent: "coral",
    youtube: "https://www.youtube.com/watch?v=JTjcqzLYwFI",
    note: "A mythic collision of legend, distortion, and arena-scale motion."
  },
  {
    id: "02",
    title: "Knife in Velvet",
    type: "Music video",
    duration: "05:52",
    date: "12 AUG 2026",
    views: "3 views",
    thumb: "https://i.ytimg.com/vi/3zVSqM9XFcs/hqdefault.jpg",
    accent: "gold",
    youtube: "https://www.youtube.com/watch?v=3zVSqM9XFcs",
    note: "An eastern tale of love and betrayal, cut like a late-night transmission."
  },
  {
    id: "03",
    title: "The Storm Within",
    type: "Story",
    duration: "15:38",
    date: "08 AUG 2026",
    views: "25 views",
    thumb: "https://i.ytimg.com/vi/rgxwL5vz1DI/hqdefault.jpg",
    accent: "lime",
    youtube: "https://www.youtube.com/watch?v=rgxwL5vz1DI",
    note: "A painterly Russian drama where freedom, ritual, and weather collide."
  }
];

const filters = ["All transmissions", "Animation", "Music video", "Story"] as const;

export default function Home() {
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("All transmissions");
  const [selectedId, setSelectedId] = useState("01");
  const selected = transmissions.find((item) => item.id === selectedId) ?? transmissions[0];
  const filtered = useMemo(
    () => activeFilter === "All transmissions" ? transmissions : transmissions.filter((item) => item.type === activeFilter),
    [activeFilter]
  );

  return (
    <main className="site-shell">
      <div className="grain" aria-hidden="true" />
      <div className="signal-rail" aria-hidden="true">
        <span className="rail-mark">FC</span>
        <span className="rail-line" />
        <span className="rail-vertical">FOXY CODENAME / 2026</span>
        <span className="rail-index">001—003</span>
      </div>

      <header className="topbar">
        <a className="brand" href="#top" aria-label="Foxy CodeName home">
          <span className="fox-mark" aria-hidden="true"><i /><i /><b /></span>
          <span>FOXY <em>CODE</em>NAME</span>
        </a>
        <nav className="topnav" aria-label="Primary navigation">
          <a href="#transmissions">Transmissions</a>
          <a href="#about">Signal notes</a>
          <a href="https://youtube.com/@foxycodename" target="_blank" rel="noreferrer">YouTube <ExternalLink size={13} /></a>
        </nav>
        <div className="live-chip"><span className="live-dot" /> ON AIR</div>
      </header>

      <section className="hero" id="top">
        <div className="hero-image-wrap">
          <img src="/manus-storage/storm-dawn_feb38f36.png" alt="Cinematic storm over a river, used as a visual signal for Foxy CodeName" className="hero-image" />
          <div className="hero-image-wash" />
          <div className="hero-timecode">SIGNAL 00:01:26:18 / TUNED</div>
        </div>
        <div className="hero-copy">
          <p className="eyebrow"><Radio size={14} /> INDEPENDENT VISUAL TRANSMISSIONS</p>
          <h1>Make the<br /><span>strange</span> visible.</h1>
          <p className="hero-dek">Foxy CodeName is a small studio for animated music videos, mythic edits, and stories that arrive from somewhere just beyond the feed.</p>
          <div className="hero-actions">
            <a className="button button-coral" href="#transmissions">Enter the archive <ArrowUpRight size={16} /></a>
            <a className="text-link" href="https://youtube.com/@foxycodename" target="_blank" rel="noreferrer"><Play size={15} fill="currentColor" /> Watch on YouTube</a>
          </div>
        </div>
        <div className="hero-stamp"><span>FC</span><small>CHANNEL<br />01</small></div>
      </section>

      <section className="ticker" aria-label="Channel status">
        <div><ScanLine size={15} /> LIVE INDEX</div><span>THREE NEW TRANSMISSIONS DETECTED</span><span>•</span><span>FOXYCODENAME / @FOXYCODENAME</span><span>•</span><span>PLAY SOMETHING UNEXPECTED</span>
      </section>

      <section className="archive-section" id="transmissions">
        <div className="section-intro">
          <div><p className="eyebrow">01 / THE ARCHIVE</p><h2>Recent<br /><i>signals.</i></h2></div>
          <p className="section-note">A living shelf of animated fragments, music-video experiments, and visual worlds from the channel.</p>
        </div>
        <div className="filter-row" role="tablist" aria-label="Filter transmissions">
          {filters.map((filter) => <button key={filter} className={activeFilter === filter ? "filter active" : "filter"} onClick={() => setActiveFilter(filter)}>{filter}</button>)}
        </div>
        <div className="transmission-layout">
          <div className="transmission-list">
            <AnimatePresence mode="popLayout">
              {filtered.map((item, index) => (
                <motion.button layout key={item.id} className={selectedId === item.id ? "transmission-row selected" : "transmission-row"} onClick={() => setSelectedId(item.id)} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ delay: index * 0.06 }}>
                  <span className={`row-number ${item.accent}`}>{item.id}</span>
                  <span className="row-copy"><b>{item.title}</b><small>{item.type} / {item.date}</small></span>
                  <span className="row-duration"><Clock3 size={13} /> {item.duration}</span>
                  <ArrowUpRight className="row-arrow" size={19} />
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
          <AnimatePresence mode="wait">
            <motion.article className="featured-transmission" key={selected.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}>
              <div className="featured-media"><img src={selected.thumb} alt={`${selected.title} YouTube thumbnail`} /><div className="media-overlay" /><span className="featured-label">TRANSMISSION {selected.id}</span><span className="play-button"><Play size={20} fill="currentColor" /></span></div>
              <div className="featured-meta"><span>{selected.type}</span><span>{selected.views}</span><span>{selected.date}</span></div>
              <h3>{selected.title}</h3><p>{selected.note}</p>
              <a className="button button-outline" href={selected.youtube} target="_blank" rel="noreferrer">Watch the full cut <ArrowUpRight size={16} /></a>
            </motion.article>
          </AnimatePresence>
        </div>
      </section>

      <section className="manifesto" id="about">
        <div className="manifesto-art"><img src="/manus-storage/groza-theatrical_6c9f4f4e.png" alt="A dramatic storm poster from the Foxy CodeName visual archive" /><span className="art-caption">FIELD NOTE 03 / THE WEATHER IS A CHARACTER</span></div>
        <div className="manifesto-copy"><p className="eyebrow">02 / SIGNAL NOTES</p><h2>Not content.<br /><i>Atmosphere.</i></h2><p>Every cut starts as a question: what happens when a familiar story is tuned to a different frequency? The answer might be a metal riff, a velvet knife, or a storm over the Volga.</p><div className="note-signature"><span className="signature-dot" /><span>FOXY CODENAME<br /><small>AN INDEPENDENT AI VISUAL STUDIO</small></span></div></div>
      </section>

      <section className="cta-band"><div><p className="eyebrow"><Volume2 size={14} /> NEXT TRANSMISSION</p><h2>Follow the signal.</h2></div><a className="button button-coral" href="https://youtube.com/@foxycodename?sub_confirmation=1" target="_blank" rel="noreferrer">Subscribe on YouTube <ArrowUpRight size={16} /></a><Sparkles className="cta-spark" size={30} /></section>

      <footer className="footer"><span>© 2026 FOXY CODENAME</span><span>MADE BETWEEN SIGNALS</span><a href="https://youtube.com/@foxycodename" target="_blank" rel="noreferrer">@FOXYCODENAME <ArrowUpRight size={13} /></a></footer>
    </main>
  );
}
