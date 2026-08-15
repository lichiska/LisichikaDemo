// Signal Noir design reminder: detail route is a focused screening-room state with clear escape routes.
import { ArrowLeft, ArrowUpRight, Clock3, ExternalLink, Play } from "lucide-react";
import { Link, useRoute } from "wouter";
import { usePreferences } from "../contexts/PreferencesContext";
import { PageFrame } from "../components/SiteHeader";
import { getTransmission, transmissionAssets, transmissions } from "../lib/transmissions";

export default function TransmissionDetail() {
  const { language } = usePreferences();
  const isRu = language === "ru";
  const [, params] = useRoute<{ id: string }>("/transmissions/:id");
  const item = getTransmission(params?.id ?? "01");
  if (!item) return <PageFrame eyebrow={isRu ? "404 / СИГНАЛ ПОТЕРЯН" : "404 / LOST SIGNAL"} title={isRu ? <>Трансляция<br /><i>не найдена.</i></> : <>Transmission<br /><i>not found.</i></>} intro={isRu ? "Эта частота молчит. Вернитесь в архив и выберите другой кадр." : "This frequency is quiet. Return to the archive and choose another cut."}><div className="empty-state"><Link className="button button-coral" href="/transmissions">Back to archive <ArrowLeft size={16} /></Link></div></PageFrame>;
  const related = transmissions.filter((candidate) => candidate.id !== item.id);
  return <PageFrame eyebrow={`${isRu ? "ТРАНСЛЯЦИЯ" : "TRANSMISSION"} ${item.id} / ${item.type.toUpperCase()}`} title={item.title} intro={item.description}><section className="detail-layout"><div className="detail-hero"><img src={item.thumb} alt={`${item.title} thumbnail`} loading="eager" decoding="async" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = transmissionAssets.storm; }} /><div className="detail-overlay" /><a className="detail-play" href={item.youtube} target="_blank" rel="noreferrer"><Play size={28} fill="currentColor" /> {isRu ? "Смотреть на YouTube" : "Watch on YouTube"}</a></div><aside className="detail-aside"><div className="detail-facts"><span><Clock3 size={14} /> {item.duration}</span><span>{item.date}</span><span>{item.views}</span></div><p>{item.note}</p><a className="button button-coral" href={item.youtube} target="_blank" rel="noreferrer">{isRu ? "Включить полный выпуск" : "Play the full cut"} <ExternalLink size={16} /></a><Link className="back-link" href="/transmissions"><ArrowLeft size={15} /> {isRu ? "Назад в архив" : "Back to archive"}</Link></aside></section><section className="related-section"><div className="section-kicker">{isRu ? "СЛЕДУЮЩЕЕ НА ЧАСТОТЕ" : "NEXT ON THE FREQUENCY"}</div><div className="related-grid">{related.map((candidate) => <Link className="related-card" key={candidate.id} href={`/transmissions/${candidate.id}`}><img src={candidate.thumb} alt="" loading="lazy" decoding="async" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = transmissionAssets.storm; }} /><span>{candidate.id} / {candidate.type}</span><b>{candidate.title}</b><ArrowUpRight size={15} /></Link>)}</div></section></PageFrame>;
}
