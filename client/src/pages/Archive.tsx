// Signal Noir design reminder: archive page acts like a browsable broadcast index with compact metadata and strong image focus.
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Clock3, Play } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { PageFrame } from "../components/SiteHeader";
import { transmissionAssets, transmissions } from "../lib/transmissions";
import { usePreferences } from "../contexts/PreferencesContext";

const filters = ["All", "Animation", "Music video", "Story"] as const;
export default function Archive() {
  const { language } = usePreferences();
  const isRu = language === "ru";
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const list = useMemo(() => filter === "All" ? transmissions : transmissions.filter((item) => item.type === filter), [filter]);
  return <PageFrame eyebrow={isRu ? "01 / АРХИВ" : "01 / THE ARCHIVE"} title={isRu ? <>Каждый кадр —<br /><i>сигнал.</i></> : <>Every cut is a<br /><i>signal.</i></>} intro={isRu ? "Полный журнал трансляций Foxy CodeName. Выберите формат и войдите в мир за пределами обложки." : "Browse the full Foxy CodeName transmission log. Filter by format, pick a cut, and enter the world behind the thumbnail."}><section className="archive-page-content"><div className="filter-row">{filters.map((item) => <button key={item} className={filter === item ? "filter active" : "filter"} onClick={() => setFilter(item)}>{isRu ? ({ All: "Все", Animation: "Анимация", "Music video": "Музыкальное видео", Story: "История" } as Record<string, string>)[item] : item}</button>)}</div><div className="archive-grid"><AnimatePresence mode="popLayout">{list.map((item, index) => <motion.article layout key={item.id} className="archive-card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ delay: index * .08 }}><Link href={`/transmissions/${item.id}`}><div className="archive-card-media"><img src={item.thumb} alt={`${item.title} thumbnail`} loading="lazy" decoding="async" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = transmissionAssets.storm; }} /><span className="card-play"><Play size={17} fill="currentColor" /></span><span className="card-index">{item.id}</span></div><div className="archive-card-meta"><span>{item.type}</span><span><Clock3 size={12} /> {item.duration}</span><span>{item.views}</span></div><h2>{item.title}</h2><p>{item.note}</p><span className="card-link">{isRu ? "Открыть трансляцию" : "Open transmission"} <ArrowUpRight size={15} /></span></Link></motion.article>)}</AnimatePresence></div></section></PageFrame>;
}
