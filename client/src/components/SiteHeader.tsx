// Signal Noir design reminder: navigation is a broadcast control strip with clear active routes and direct YouTube escape hatch.
import { ExternalLink, Radio } from "lucide-react";
import PreferencesPanel from "./PreferencesPanel";
import { usePreferences } from "../contexts/PreferencesContext";
import { Link, useLocation } from "wouter";

export default function SiteHeader() {
  const [location] = useLocation();
  const { language } = usePreferences();
  const labels = language === "ru" ? { transmissions: "Трансляции", tools: "AI-инструменты", notes: "Заметки", contact: "Контакт" } : { transmissions: "Transmissions", tools: "AI tools", notes: "Signal notes", contact: "Contact" };
  return <><a className="skip-link" href="#main-content">{language === "ru" ? "К содержанию" : "Skip to content"}</a><header className="topbar site-header"><Link className="brand" href="/"><span className="fox-mark" aria-hidden="true"><i /><i /><b /></span><span>FOXY <em>CODE</em>NAME</span></Link><nav className="topnav" aria-label="Primary navigation"><Link className={location === "/transmissions" ? "active-nav" : ""} href="/transmissions">{labels.transmissions}</Link><Link className={location === "/tools" ? "active-nav ai-nav" : "ai-nav"} href="/tools">{labels.tools}</Link><Link className={location === "/about" ? "active-nav" : ""} href="/about">{labels.notes}</Link><Link className={location === "/contact" ? "active-nav" : ""} href="/contact">{labels.contact}</Link><a href="https://youtube.com/@foxycodename" target="_blank" rel="noreferrer">YouTube <ExternalLink size={13} /></a></nav><div className="header-actions"><div className="live-chip"><span className="live-dot" /> ON AIR</div><PreferencesPanel /></div></header></>;
}

export function PageFrame({ children, eyebrow, title, intro, artifact }: { children: React.ReactNode; eyebrow: string; title: React.ReactNode; intro?: string; artifact?: React.ReactNode }) {
  return <main id="main-content" className="site-shell inner-page"><div className="grain" aria-hidden="true" /><div className="signal-rail" aria-hidden="true"><span className="rail-mark">FC</span><span className="rail-line" /><span className="rail-vertical">FOXY CODENAME / 2026</span><span className="rail-index">001—003</span></div><SiteHeader /><section className="page-heading"><div className="page-heading-copy"><p className="eyebrow"><Radio size={14} /> {eyebrow}</p><h1>{title}</h1>{intro && <p>{intro}</p>}</div>{artifact}</section>{children}</main>;
}
