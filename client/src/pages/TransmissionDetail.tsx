// Signal Noir design reminder: detail route is a focused screening-room state with clear escape routes.
import { ArrowLeft, ArrowUpRight, Clock3, ExternalLink, Play } from "lucide-react";
import { Link, useRoute } from "wouter";
import { PageFrame } from "../components/SiteHeader";
import { getTransmission, transmissions } from "../lib/transmissions";

export default function TransmissionDetail() {
  const [, params] = useRoute<{ id: string }>("/transmissions/:id");
  const item = getTransmission(params?.id ?? "01");
  if (!item) return <PageFrame eyebrow="404 / LOST SIGNAL" title={<>Transmission<br /><i>not found.</i></>} intro="This frequency is quiet. Return to the archive and choose another cut."><div className="empty-state"><Link className="button button-coral" href="/transmissions">Back to archive <ArrowLeft size={16} /></Link></div></PageFrame>;
  const related = transmissions.filter((candidate) => candidate.id !== item.id);
  return <PageFrame eyebrow={`TRANSMISSION ${item.id} / ${item.type.toUpperCase()}`} title={item.title} intro={item.description}><section className="detail-layout"><div className="detail-hero"><img src={item.thumb} alt={`${item.title} thumbnail`} /><div className="detail-overlay" /><a className="detail-play" href={item.youtube} target="_blank" rel="noreferrer"><Play size={28} fill="currentColor" /> Watch on YouTube</a></div><aside className="detail-aside"><div className="detail-facts"><span><Clock3 size={14} /> {item.duration}</span><span>{item.date}</span><span>{item.views}</span></div><p>{item.note}</p><a className="button button-coral" href={item.youtube} target="_blank" rel="noreferrer">Play the full cut <ExternalLink size={16} /></a><Link className="back-link" href="/transmissions"><ArrowLeft size={15} /> Back to archive</Link></aside></section><section className="related-section"><div className="section-kicker">NEXT ON THE FREQUENCY</div><div className="related-grid">{related.map((candidate) => <Link className="related-card" key={candidate.id} href={`/transmissions/${candidate.id}`}><img src={candidate.thumb} alt="" /><span>{candidate.id} / {candidate.type}</span><b>{candidate.title}</b><ArrowUpRight size={15} /></Link>)}</div></section></PageFrame>;
}
