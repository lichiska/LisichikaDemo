// Signal Noir design reminder: navigation is a broadcast control strip with clear active routes and direct YouTube escape hatch.
import { ExternalLink, Radio } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function SiteHeader() {
  const [location] = useLocation();
  return <header className="topbar site-header"><Link className="brand" href="/"><span className="fox-mark" aria-hidden="true"><i /><i /><b /></span><span>FOXY <em>CODE</em>NAME</span></Link><nav className="topnav" aria-label="Primary navigation"><Link className={location === "/transmissions" ? "active-nav" : ""} href="/transmissions">Transmissions</Link><Link className={location === "/tools" ? "active-nav" : ""} href="/tools">AI tools</Link><Link className={location === "/about" ? "active-nav" : ""} href="/about">Signal notes</Link><Link className={location === "/contact" ? "active-nav" : ""} href="/contact">Contact</Link><a href="https://youtube.com/@foxycodename" target="_blank" rel="noreferrer">YouTube <ExternalLink size={13} /></a></nav><div className="live-chip"><span className="live-dot" /> ON AIR</div></header>;
}

export function PageFrame({ children, eyebrow, title, intro, artifact }: { children: React.ReactNode; eyebrow: string; title: React.ReactNode; intro?: string; artifact?: React.ReactNode }) {
  return <main className="site-shell inner-page"><div className="grain" aria-hidden="true" /><div className="signal-rail" aria-hidden="true"><span className="rail-mark">FC</span><span className="rail-line" /><span className="rail-vertical">FOXY CODENAME / 2026</span><span className="rail-index">001—003</span></div><SiteHeader /><section className="page-heading"><div className="page-heading-copy"><p className="eyebrow"><Radio size={14} /> {eyebrow}</p><h1>{title}</h1>{intro && <p>{intro}</p>}</div>{artifact}</section>{children}</main>;
}
