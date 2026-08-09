import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mic, Volume2, Wand2, Upload, Play, Pause, Download, Loader2, Music, AudioLines, Languages, Sparkles, Users, Radio, Headphones, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const ELEVENLABS_API_KEY = 'sk_55a4650c959426e2d090d08b6f959bdc5afbaa9a196c7548';
const API_BASE = 'https://api.elevenlabs.io/v1';

// ElevenLabs Logo SVG
const ElevenLabsLogo = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 76 65" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M31.5 0H38.5V65H31.5V0Z" fill="currentColor"/>
    <path d="M44.5 0H51.5V65H44.5V0Z" fill="currentColor"/>
  </svg>
);

// Mini icon components for each tool
const TTSIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 18.5a6.5 6.5 0 006.5-6.5V6.5a6.5 6.5 0 00-13 0V12a6.5 6.5 0 006.5 6.5z" strokeLinecap="round"/>
    <path d="M19 10v2a7 7 0 01-14 0v-2M12 18.5V22M8 22h8" strokeLinecap="round"/>
    <path d="M3 7h2M3 12h2M19 7h2M19 12h2" strokeLinecap="round" opacity="0.5"/>
  </svg>
);

const MusicIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.5">
    <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
  </svg>
);

const SFXIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 12h2l3-8 4 16 4-12 3 6h4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CloneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.5">
    <circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" strokeLinecap="round"/>
    <path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87" strokeLinecap="round" opacity="0.6"/>
  </svg>
);

const DesignIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const STTIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.5">
    <path d="M4 7h16M4 12h10M4 17h14" strokeLinecap="round"/>
    <circle cx="19" cy="12" r="2.5" fill="currentColor" opacity="0.4"/>
  </svg>
);

const IsolationIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 18v-6a9 9 0 0118 0v6" strokeLinecap="round"/>
    <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3v5zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3v5z" strokeLinecap="round"/>
  </svg>
);

const DubbingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" strokeLinecap="round"/>
  </svg>
);

interface Voice {
  voice_id: string;
  name: string;
  category?: string;
}

interface GeneratedAudio {
  url: string;
  filename: string;
  timestamp: number;
  type: string;
}

type ToolId = 'tts' | 'music' | 'sfx' | 'clone' | 'design' | 'stt' | 'isolation' | 'dubbing';

interface ToolItem {
  id: ToolId;
  label: string;
  icon: React.FC;
  color: string;
  bgColor: string;
  description: string;
}

const tools: ToolItem[] = [
  { id: 'tts', label: 'Text to Speech', icon: TTSIcon, color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', description: 'Convert text into lifelike speech' },
  { id: 'music', label: 'Music', icon: MusicIcon, color: 'text-pink-400', bgColor: 'bg-pink-500/10', description: 'Generate original music with lyrics' },
  { id: 'sfx', label: 'Sound Effects', icon: SFXIcon, color: 'text-violet-400', bgColor: 'bg-violet-500/10', description: 'Create any sound from a description' },
  { id: 'clone', label: 'Voice Clone', icon: CloneIcon, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', description: 'Clone a voice from audio samples' },
  { id: 'design', label: 'Voice Design', icon: DesignIcon, color: 'text-amber-400', bgColor: 'bg-amber-500/10', description: 'Design new voices from scratch' },
  { id: 'stt', label: 'Speech to Text', icon: STTIcon, color: 'text-orange-400', bgColor: 'bg-orange-500/10', description: 'Transcribe audio in 90+ languages' },
  { id: 'isolation', label: 'Isolation', icon: IsolationIcon, color: 'text-sky-400', bgColor: 'bg-sky-500/10', description: 'Remove background noise' },
  { id: 'dubbing', label: 'Dubbing', icon: DubbingIcon, color: 'text-rose-400', bgColor: 'bg-rose-500/10', description: 'Dub content into other languages' },
];

const ElevenLabs = () => {
  const [activeTool, setActiveTool] = useState<ToolId>('tts');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // TTS state
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [ttsText, setTtsText] = useState('');
  const [stability, setStability] = useState([0.5]);
  const [similarityBoost, setSimilarityBoost] = useState([0.75]);
  const [style, setStyle] = useState([0.0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudios, setGeneratedAudios] = useState<GeneratedAudio[]>([]);
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [selectedModel, setSelectedModel] = useState('eleven_multilingual_v2');

  // SFX state
  const [sfxText, setSfxText] = useState('');
  const [sfxDuration, setSfxDuration] = useState('');
  const [isGeneratingSfx, setIsGeneratingSfx] = useState(false);

  // Clone state
  const [cloneName, setCloneName] = useState('');
  const [cloneDescription, setCloneDescription] = useState('');
  const [cloneFiles, setCloneFiles] = useState<File[]>([]);
  const [isCloning, setIsCloning] = useState(false);

  // STT state
  const [sttFile, setSttFile] = useState<File | null>(null);
  const [sttResult, setSttResult] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Voice Design state
  const [vdGender, setVdGender] = useState('female');
  const [vdAge, setVdAge] = useState('young');
  const [vdAccent, setVdAccent] = useState('american');
  const [vdAccentStrength, setVdAccentStrength] = useState([1.0]);
  const [vdText, setVdText] = useState('Hello! This is a preview of the generated voice.');
  const [isDesigning, setIsDesigning] = useState(false);

  // Isolation state
  const [isolationFile, setIsolationFile] = useState<File | null>(null);
  const [isIsolating, setIsIsolating] = useState(false);

  // Dubbing state
  const [dubbingFile, setDubbingFile] = useState<File | null>(null);
  const [dubbingSourceLang, setDubbingSourceLang] = useState('en');
  const [dubbingTargetLang, setDubbingTargetLang] = useState('es');
  const [isDubbing, setIsDubbing] = useState(false);
  const [dubbingResult, setDubbingResult] = useState('');

  // Music state
  const [musicPrompt, setMusicPrompt] = useState('');
  const [musicLyrics, setMusicLyrics] = useState('');
  const [musicDuration, setMusicDuration] = useState('30');
  const [musicInstrumental, setMusicInstrumental] = useState(false);
  const [musicGenre, setMusicGenre] = useState('pop');
  const [musicMood, setMusicMood] = useState('upbeat');
  const [musicTempo, setMusicTempo] = useState('medium');
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const sttFileInputRef = useRef<HTMLInputElement | null>(null);
  const isolationFileInputRef = useRef<HTMLInputElement | null>(null);
  const dubbingFileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchVoices = async () => {
    if (voicesLoaded) return;
    setLoadingVoices(true);
    try {
      const res = await fetch(`${API_BASE}/voices`, { headers: { 'xi-api-key': ELEVENLABS_API_KEY } });
      if (!res.ok) throw new Error('Failed to fetch voices');
      const data = await res.json();
      setVoices(data.voices || []);
      if (data.voices?.length > 0) setSelectedVoice(data.voices[0].voice_id);
      setVoicesLoaded(true);
    } catch { toast.error('Failed to load voices.'); }
    finally { setLoadingVoices(false); }
  };

  const generateSpeech = async () => {
    if (!ttsText.trim()) { toast.error('Enter text first.'); return; }
    if (!selectedVoice) { toast.error('Select a voice.'); return; }
    setIsGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/text-to-speech/${selectedVoice}`, {
        method: 'POST', headers: { 'xi-api-key': ELEVENLABS_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: ttsText, model_id: selectedModel, voice_settings: { stability: stability[0], similarity_boost: similarityBoost[0], style: style[0], use_speaker_boost: true } }),
      });
      if (!res.ok) throw new Error('Generation failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setGeneratedAudios(prev => [{ url, filename: `speech_${Date.now()}.mp3`, timestamp: Date.now(), type: 'Speech' }, ...prev]);
      toast.success('Speech generated!');
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Failed'); }
    finally { setIsGenerating(false); }
  };

  const generateSoundEffect = async () => {
    if (!sfxText.trim()) { toast.error('Describe the sound.'); return; }
    setIsGeneratingSfx(true);
    try {
      const body: Record<string, unknown> = { text: sfxText };
      if (sfxDuration) body.duration_seconds = parseFloat(sfxDuration);
      const res = await fetch(`${API_BASE}/sound-generation`, { method: 'POST', headers: { 'xi-api-key': ELEVENLABS_API_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('Failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setGeneratedAudios(prev => [{ url, filename: `sfx_${Date.now()}.mp3`, timestamp: Date.now(), type: 'SFX' }, ...prev]);
      toast.success('Sound effect created!');
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Failed'); }
    finally { setIsGeneratingSfx(false); }
  };

  const cloneVoice = async () => {
    if (!cloneName.trim() || cloneFiles.length === 0) { toast.error('Name and samples required.'); return; }
    setIsCloning(true);
    try {
      const fd = new FormData();
      fd.append('name', cloneName); fd.append('description', cloneDescription);
      cloneFiles.forEach(f => fd.append('files', f));
      const res = await fetch(`${API_BASE}/voices/add`, { method: 'POST', headers: { 'xi-api-key': ELEVENLABS_API_KEY }, body: fd });
      if (!res.ok) throw new Error('Clone failed');
      toast.success(`Voice "${cloneName}" cloned!`);
      setCloneName(''); setCloneDescription(''); setCloneFiles([]);
      setVoicesLoaded(false); fetchVoices();
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Failed'); }
    finally { setIsCloning(false); }
  };

  const transcribeAudio = async () => {
    if (!sttFile) { toast.error('Upload a file first.'); return; }
    setIsTranscribing(true);
    try {
      const fd = new FormData(); fd.append('file', sttFile); fd.append('model_id', 'scribe_v1');
      const res = await fetch(`${API_BASE}/speech-to-text`, { method: 'POST', headers: { 'xi-api-key': ELEVENLABS_API_KEY }, body: fd });
      if (!res.ok) throw new Error('Transcription failed');
      const data = await res.json();
      setSttResult(data.text || JSON.stringify(data, null, 2));
      toast.success('Transcription complete!');
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Failed'); }
    finally { setIsTranscribing(false); }
  };

  const designVoice = async () => {
    if (!vdText.trim()) { toast.error('Enter preview text.'); return; }
    setIsDesigning(true);
    try {
      const res = await fetch(`${API_BASE}/voice-generation/generate-voice/preview`, {
        method: 'POST', headers: { 'xi-api-key': ELEVENLABS_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ voice_description: `A ${vdAge} ${vdGender} with a ${vdAccent} accent`, text: vdText, gender: vdGender, age: vdAge, accent: vdAccent, accent_strength: vdAccentStrength[0] }),
      });
      if (!res.ok) throw new Error('Design failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setGeneratedAudios(prev => [{ url, filename: `voice_design_${Date.now()}.mp3`, timestamp: Date.now(), type: 'Voice Design' }, ...prev]);
      toast.success('Voice preview generated!');
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Failed'); }
    finally { setIsDesigning(false); }
  };

  const isolateAudio = async () => {
    if (!isolationFile) { toast.error('Upload a file.'); return; }
    setIsIsolating(true);
    try {
      const fd = new FormData(); fd.append('audio', isolationFile);
      const res = await fetch(`${API_BASE}/audio-isolation`, { method: 'POST', headers: { 'xi-api-key': ELEVENLABS_API_KEY }, body: fd });
      if (!res.ok) throw new Error('Isolation failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setGeneratedAudios(prev => [{ url, filename: `isolated_${Date.now()}.mp3`, timestamp: Date.now(), type: 'Isolated' }, ...prev]);
      toast.success('Audio isolated!');
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Failed'); }
    finally { setIsIsolating(false); }
  };

  const dubAudio = async () => {
    if (!dubbingFile) { toast.error('Upload a file.'); return; }
    setIsDubbing(true); setDubbingResult('');
    try {
      const fd = new FormData();
      fd.append('file', dubbingFile); fd.append('source_lang', dubbingSourceLang);
      fd.append('target_lang', dubbingTargetLang); fd.append('mode', 'automatic'); fd.append('num_speakers', '0');
      const res = await fetch(`${API_BASE}/dubbing`, { method: 'POST', headers: { 'xi-api-key': ELEVENLABS_API_KEY }, body: fd });
      if (!res.ok) throw new Error('Dubbing failed');
      const data = await res.json();
      setDubbingResult(`Dubbing started! ID: ${data.dubbing_id}`);
      toast.success('Dubbing job submitted!');
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Failed'); }
    finally { setIsDubbing(false); }
  };

  const generateMusic = async () => {
    if (!musicPrompt.trim() && !musicLyrics.trim()) { toast.error('Enter a prompt or lyrics.'); return; }
    setIsGeneratingMusic(true);
    try {
      let prompt = musicPrompt;
      if (musicGenre !== 'any') prompt += ` Genre: ${musicGenre}.`;
      if (musicMood !== 'any') prompt += ` Mood: ${musicMood}.`;
      if (musicTempo !== 'any') prompt += ` Tempo: ${musicTempo}.`;
      if (musicInstrumental) prompt += ' Instrumental only.';
      if (musicLyrics.trim() && !musicInstrumental) prompt += ` Lyrics: ${musicLyrics}`;
      const body: Record<string, unknown> = { text: prompt.trim() };
      if (musicDuration) body.duration_seconds = parseFloat(musicDuration);
      const res = await fetch(`${API_BASE}/sound-generation`, { method: 'POST', headers: { 'xi-api-key': ELEVENLABS_API_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('Music generation failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setGeneratedAudios(prev => [{ url, filename: `music_${Date.now()}.mp3`, timestamp: Date.now(), type: 'Music' }, ...prev]);
      toast.success('Music generated!');
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Failed'); }
    finally { setIsGeneratingMusic(false); }
  };

  const playAudio = (url: string) => {
    if (playingUrl === url) { audioRef.current?.pause(); setPlayingUrl(null); return; }
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(url);
    audio.onended = () => setPlayingUrl(null);
    audio.play();
    audioRef.current = audio;
    setPlayingUrl(url);
  };

  const downloadAudio = (url: string, filename: string) => {
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  };

  const handleToolChange = (id: ToolId) => {
    setActiveTool(id);
    if (id === 'tts' || id === 'clone') fetchVoices();
  };

  const currentTool = tools.find(t => t.id === activeTool)!;

  // Render content for each tool
  const renderContent = () => {
    switch (activeTool) {
      case 'tts':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3 space-y-4">
                <div>
                  <Label className="text-[11px] text-white/40 font-medium uppercase tracking-wider mb-2 block">Text</Label>
                  <Textarea value={ttsText} onChange={(e) => setTtsText(e.target.value)} placeholder="Type or paste text to convert to speech..."
                    className="min-h-[200px] bg-white/[0.02] border-white/[0.06] text-white/90 placeholder:text-white/15 resize-none focus:border-cyan-500/30 rounded-xl text-[14px] leading-relaxed" />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[10px] text-white/15 font-mono">{ttsText.length} characters</span>
                  </div>
                </div>
                <Button onClick={generateSpeech} disabled={isGenerating || !ttsText.trim() || !selectedVoice}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-xl h-11 transition-all hover:shadow-lg hover:shadow-cyan-500/20">
                  {isGenerating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><AudioLines className="w-4 h-4 mr-2" />Generate Speech</>}
                </Button>
              </div>
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <Label className="text-[11px] text-white/40 font-medium uppercase tracking-wider mb-2 block">Voice</Label>
                  {loadingVoices ? <div className="flex items-center gap-2 text-white/30 text-xs"><Loader2 className="w-3 h-3 animate-spin" />Loading...</div> : (
                    <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                      <SelectTrigger className="bg-white/[0.02] border-white/[0.06] text-white/80 rounded-xl h-9 text-sm"><SelectValue placeholder="Select voice" /></SelectTrigger>
                      <SelectContent className="bg-[#0f0c1a] border-white/[0.08] rounded-xl max-h-[250px]">
                        {voices.map(v => <SelectItem key={v.voice_id} value={v.voice_id} className="text-white/80 text-sm">{v.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div>
                  <Label className="text-[11px] text-white/40 font-medium uppercase tracking-wider mb-2 block">Model</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="bg-white/[0.02] border-white/[0.06] text-white/80 rounded-xl h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#0f0c1a] border-white/[0.08] rounded-xl">
                      <SelectItem value="eleven_multilingual_v2" className="text-white/80 text-sm">Multilingual v2</SelectItem>
                      <SelectItem value="eleven_turbo_v2_5" className="text-white/80 text-sm">Turbo v2.5</SelectItem>
                      <SelectItem value="eleven_turbo_v2" className="text-white/80 text-sm">Turbo v2</SelectItem>
                      <SelectItem value="eleven_monolingual_v1" className="text-white/80 text-sm">English v1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3 pt-2">
                  <div>
                    <div className="flex justify-between mb-1"><Label className="text-[10px] text-white/30">Stability</Label><span className="text-[10px] text-cyan-400/70 font-mono">{stability[0].toFixed(2)}</span></div>
                    <Slider value={stability} onValueChange={setStability} min={0} max={1} step={0.01} className="[&_[role=slider]]:bg-cyan-400 [&_[role=slider]]:w-3 [&_[role=slider]]:h-3" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1"><Label className="text-[10px] text-white/30">Similarity</Label><span className="text-[10px] text-purple-400/70 font-mono">{similarityBoost[0].toFixed(2)}</span></div>
                    <Slider value={similarityBoost} onValueChange={setSimilarityBoost} min={0} max={1} step={0.01} className="[&_[role=slider]]:bg-purple-400 [&_[role=slider]]:w-3 [&_[role=slider]]:h-3" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1"><Label className="text-[10px] text-white/30">Style</Label><span className="text-[10px] text-pink-400/70 font-mono">{style[0].toFixed(2)}</span></div>
                    <Slider value={style} onValueChange={setStyle} min={0} max={1} step={0.01} className="[&_[role=slider]]:bg-pink-400 [&_[role=slider]]:w-3 [&_[role=slider]]:h-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'music':
        return (
          <div className="space-y-5 max-w-3xl">
            <div>
              <Label className="text-[11px] text-white/40 font-medium uppercase tracking-wider mb-2 block">Prompt</Label>
              <Textarea value={musicPrompt} onChange={(e) => setMusicPrompt(e.target.value)} placeholder="Describe the music you want to create..."
                className="min-h-[100px] bg-white/[0.02] border-white/[0.06] text-white/90 placeholder:text-white/15 resize-none focus:border-pink-500/30 rounded-xl text-sm" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-[11px] text-white/40 font-medium uppercase tracking-wider mb-2 block">Genre</Label>
                <Select value={musicGenre} onValueChange={setMusicGenre}>
                  <SelectTrigger className="bg-white/[0.02] border-white/[0.06] text-white/80 rounded-xl h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#0f0c1a] border-white/[0.08] rounded-xl">
                    {['any','pop','rock','electronic','hip-hop','jazz','classical','ambient','lo-fi','cinematic'].map(g => <SelectItem key={g} value={g} className="text-white/80 text-sm capitalize">{g === 'any' ? 'Any' : g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[11px] text-white/40 font-medium uppercase tracking-wider mb-2 block">Mood</Label>
                <Select value={musicMood} onValueChange={setMusicMood}>
                  <SelectTrigger className="bg-white/[0.02] border-white/[0.06] text-white/80 rounded-xl h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#0f0c1a] border-white/[0.08] rounded-xl">
                    {['any','upbeat','sad','energetic','calm','dark','romantic','epic','dreamy'].map(m => <SelectItem key={m} value={m} className="text-white/80 text-sm capitalize">{m === 'any' ? 'Any' : m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[11px] text-white/40 font-medium uppercase tracking-wider mb-2 block">Tempo</Label>
                <Select value={musicTempo} onValueChange={setMusicTempo}>
                  <SelectTrigger className="bg-white/[0.02] border-white/[0.06] text-white/80 rounded-xl h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#0f0c1a] border-white/[0.08] rounded-xl">
                    {['any','slow','medium','fast','very fast'].map(t => <SelectItem key={t} value={t} className="text-white/80 text-sm capitalize">{t === 'any' ? 'Any' : t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Label className="text-[11px] text-white/40">Duration (sec)</Label>
                <Input type="number" value={musicDuration} onChange={(e) => setMusicDuration(e.target.value)} className="w-20 h-8 bg-white/[0.02] border-white/[0.06] text-white/80 rounded-lg text-sm" min="5" max="60" />
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-[11px] text-white/40">Instrumental</Label>
                <Switch checked={musicInstrumental} onCheckedChange={setMusicInstrumental} />
              </div>
            </div>
            {!musicInstrumental && (
              <div>
                <Label className="text-[11px] text-white/40 font-medium uppercase tracking-wider mb-2 block">Lyrics</Label>
                <Textarea value={musicLyrics} onChange={(e) => setMusicLyrics(e.target.value)} placeholder="[Verse 1]\nYour lyrics here..."
                  className="min-h-[120px] bg-white/[0.02] border-white/[0.06] text-white/90 placeholder:text-white/15 resize-none focus:border-pink-500/30 rounded-xl font-mono text-sm" />
              </div>
            )}
            <Button onClick={generateMusic} disabled={isGeneratingMusic || (!musicPrompt.trim() && !musicLyrics.trim())}
              className="w-full bg-pink-500 hover:bg-pink-400 text-black font-semibold rounded-xl h-11 transition-all hover:shadow-lg hover:shadow-pink-500/20">
              {isGeneratingMusic ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><Music className="w-4 h-4 mr-2" />Generate Music</>}
            </Button>
          </div>
        );

      case 'sfx':
        return (
          <div className="space-y-5 max-w-2xl">
            <div>
              <Label className="text-[11px] text-white/40 font-medium uppercase tracking-wider mb-2 block">Describe the Sound</Label>
              <Textarea value={sfxText} onChange={(e) => setSfxText(e.target.value)} placeholder="e.g., Thunder with heavy rain, footsteps on gravel, sci-fi laser..."
                className="min-h-[140px] bg-white/[0.02] border-white/[0.06] text-white/90 placeholder:text-white/15 resize-none focus:border-violet-500/30 rounded-xl text-sm" />
            </div>
            <div>
              <Label className="text-[11px] text-white/40 font-medium uppercase tracking-wider mb-2 block">Duration</Label>
              <div className="flex gap-2">
                {['', '2', '5', '10', '15', '22'].map(d => (
                  <Button key={d} variant="outline" size="sm" onClick={() => setSfxDuration(d)}
                    className={`rounded-lg text-xs border transition-all ${sfxDuration === d ? 'bg-violet-500/15 text-violet-300 border-violet-500/30' : 'bg-transparent border-white/[0.06] text-white/40 hover:text-white/70 hover:bg-white/[0.03]'}`}>
                    {d === '' ? 'Auto' : `${d}s`}
                  </Button>
                ))}
              </div>
            </div>
            <Button onClick={generateSoundEffect} disabled={isGeneratingSfx || !sfxText.trim()}
              className="w-full bg-violet-500 hover:bg-violet-400 text-black font-semibold rounded-xl h-11 transition-all hover:shadow-lg hover:shadow-violet-500/20">
              {isGeneratingSfx ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><Sparkles className="w-4 h-4 mr-2" />Generate Sound</>}
            </Button>
          </div>
        );

      case 'clone':
        return (
          <div className="space-y-5 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-[11px] text-white/40 font-medium uppercase tracking-wider mb-2 block">Voice Name</Label>
                <Input value={cloneName} onChange={(e) => setCloneName(e.target.value)} placeholder="My Custom Voice"
                  className="bg-white/[0.02] border-white/[0.06] text-white/80 placeholder:text-white/15 rounded-xl h-9" />
              </div>
              <div>
                <Label className="text-[11px] text-white/40 font-medium uppercase tracking-wider mb-2 block">Description</Label>
                <Input value={cloneDescription} onChange={(e) => setCloneDescription(e.target.value)} placeholder="Optional description"
                  className="bg-white/[0.02] border-white/[0.06] text-white/80 placeholder:text-white/15 rounded-xl h-9" />
              </div>
            </div>
            <div>
              <Label className="text-[11px] text-white/40 font-medium uppercase tracking-wider mb-2 block">Audio Samples</Label>
              <div onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-white/[0.08] rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500/30 hover:bg-emerald-500/[0.01] transition-all">
                <Upload className="w-6 h-6 text-white/15 mx-auto mb-2" />
                <p className="text-white/30 text-sm">Click to upload audio samples</p>
                <p className="text-white/10 text-xs mt-1">MP3, WAV, M4A • 3+ samples recommended</p>
                {cloneFiles.length > 0 && <div className="mt-3 space-y-0.5">{cloneFiles.map((f, i) => <p key={i} className="text-emerald-400/70 text-xs">{f.name}</p>)}</div>}
              </div>
              <input ref={fileInputRef} type="file" accept="audio/*" multiple className="hidden" onChange={(e) => { if (e.target.files) setCloneFiles(Array.from(e.target.files)); }} />
            </div>
            <Button onClick={cloneVoice} disabled={isCloning || !cloneName.trim() || cloneFiles.length === 0}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl h-11 transition-all hover:shadow-lg hover:shadow-emerald-500/20">
              {isCloning ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Cloning...</> : <><Wand2 className="w-4 h-4 mr-2" />Clone Voice</>}
            </Button>
          </div>
        );

      case 'design':
        return (
          <div className="space-y-5 max-w-2xl">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-[11px] text-white/40 font-medium uppercase tracking-wider mb-2 block">Gender</Label>
                <Select value={vdGender} onValueChange={setVdGender}>
                  <SelectTrigger className="bg-white/[0.02] border-white/[0.06] text-white/80 rounded-xl h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#0f0c1a] border-white/[0.08] rounded-xl">
                    <SelectItem value="female" className="text-white/80 text-sm">Female</SelectItem>
                    <SelectItem value="male" className="text-white/80 text-sm">Male</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[11px] text-white/40 font-medium uppercase tracking-wider mb-2 block">Age</Label>
                <Select value={vdAge} onValueChange={setVdAge}>
                  <SelectTrigger className="bg-white/[0.02] border-white/[0.06] text-white/80 rounded-xl h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#0f0c1a] border-white/[0.08] rounded-xl">
                    <SelectItem value="young" className="text-white/80 text-sm">Young</SelectItem>
                    <SelectItem value="middle_aged" className="text-white/80 text-sm">Middle Aged</SelectItem>
                    <SelectItem value="old" className="text-white/80 text-sm">Old</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[11px] text-white/40 font-medium uppercase tracking-wider mb-2 block">Accent</Label>
                <Select value={vdAccent} onValueChange={setVdAccent}>
                  <SelectTrigger className="bg-white/[0.02] border-white/[0.06] text-white/80 rounded-xl h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#0f0c1a] border-white/[0.08] rounded-xl">
                    {['american','british','australian','indian','african','irish'].map(a => <SelectItem key={a} value={a} className="text-white/80 text-sm capitalize">{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1"><Label className="text-[10px] text-white/30">Accent Strength</Label><span className="text-[10px] text-amber-400/70 font-mono">{vdAccentStrength[0].toFixed(1)}</span></div>
              <Slider value={vdAccentStrength} onValueChange={setVdAccentStrength} min={0.3} max={2.0} step={0.1} className="[&_[role=slider]]:bg-amber-400 [&_[role=slider]]:w-3 [&_[role=slider]]:h-3" />
            </div>
            <div>
              <Label className="text-[11px] text-white/40 font-medium uppercase tracking-wider mb-2 block">Preview Text</Label>
              <Textarea value={vdText} onChange={(e) => setVdText(e.target.value)} placeholder="Text to preview..."
                className="min-h-[80px] bg-white/[0.02] border-white/[0.06] text-white/90 placeholder:text-white/15 resize-none focus:border-amber-500/30 rounded-xl text-sm" />
            </div>
            <Button onClick={designVoice} disabled={isDesigning || !vdText.trim()}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl h-11 transition-all hover:shadow-lg hover:shadow-amber-500/20">
              {isDesigning ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Designing...</> : <><Sparkles className="w-4 h-4 mr-2" />Generate Voice</>}
            </Button>
          </div>
        );

      case 'stt':
        return (
          <div className="space-y-5 max-w-2xl">
            <div>
              <div onClick={() => sttFileInputRef.current?.click()}
                className="border border-dashed border-white/[0.08] rounded-xl p-10 text-center cursor-pointer hover:border-orange-500/30 hover:bg-orange-500/[0.01] transition-all">
                <Mic className="w-8 h-8 text-white/10 mx-auto mb-3" />
                <p className="text-white/30 text-sm">Upload audio to transcribe</p>
                <p className="text-white/10 text-xs mt-1">MP3, WAV, M4A, FLAC, OGG</p>
                {sttFile && <p className="text-orange-400/70 text-xs mt-3">{sttFile.name}</p>}
              </div>
              <input ref={sttFileInputRef} type="file" accept="audio/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) setSttFile(e.target.files[0]); }} />
            </div>
            <Button onClick={transcribeAudio} disabled={isTranscribing || !sttFile}
              className="w-full bg-orange-500 hover:bg-orange-400 text-black font-semibold rounded-xl h-11 transition-all hover:shadow-lg hover:shadow-orange-500/20">
              {isTranscribing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Transcribing...</> : <><Languages className="w-4 h-4 mr-2" />Transcribe</>}
            </Button>
            {sttResult && (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{sttResult}</p>
                <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(sttResult); toast.success('Copied!'); }}
                  className="mt-2 text-white/25 hover:text-white text-xs">Copy</Button>
              </div>
            )}
          </div>
        );

      case 'isolation':
        return (
          <div className="space-y-5 max-w-2xl">
            <div>
              <div onClick={() => isolationFileInputRef.current?.click()}
                className="border border-dashed border-white/[0.08] rounded-xl p-10 text-center cursor-pointer hover:border-sky-500/30 hover:bg-sky-500/[0.01] transition-all">
                <Headphones className="w-8 h-8 text-white/10 mx-auto mb-3" />
                <p className="text-white/30 text-sm">Upload audio with background noise</p>
                <p className="text-white/10 text-xs mt-1">Isolates vocals from music/noise</p>
                {isolationFile && <p className="text-sky-400/70 text-xs mt-3">{isolationFile.name}</p>}
              </div>
              <input ref={isolationFileInputRef} type="file" accept="audio/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) setIsolationFile(e.target.files[0]); }} />
            </div>
            <Button onClick={isolateAudio} disabled={isIsolating || !isolationFile}
              className="w-full bg-sky-500 hover:bg-sky-400 text-black font-semibold rounded-xl h-11 transition-all hover:shadow-lg hover:shadow-sky-500/20">
              {isIsolating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Isolating...</> : <><Headphones className="w-4 h-4 mr-2" />Isolate Audio</>}
            </Button>
          </div>
        );

      case 'dubbing':
        return (
          <div className="space-y-5 max-w-2xl">
            <div>
              <div onClick={() => dubbingFileInputRef.current?.click()}
                className="border border-dashed border-white/[0.08] rounded-xl p-10 text-center cursor-pointer hover:border-rose-500/30 hover:bg-rose-500/[0.01] transition-all">
                <Globe className="w-8 h-8 text-white/10 mx-auto mb-3" />
                <p className="text-white/30 text-sm">Upload audio or video to dub</p>
                <p className="text-white/10 text-xs mt-1">MP3, WAV, MP4, MOV</p>
                {dubbingFile && <p className="text-rose-400/70 text-xs mt-3">{dubbingFile.name}</p>}
              </div>
              <input ref={dubbingFileInputRef} type="file" accept="audio/*,video/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) setDubbingFile(e.target.files[0]); }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[11px] text-white/40 font-medium uppercase tracking-wider mb-2 block">Source Language</Label>
                <Select value={dubbingSourceLang} onValueChange={setDubbingSourceLang}>
                  <SelectTrigger className="bg-white/[0.02] border-white/[0.06] text-white/80 rounded-xl h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#0f0c1a] border-white/[0.08] rounded-xl">
                    {[['en','English'],['es','Spanish'],['fr','French'],['de','German'],['it','Italian'],['pt','Portuguese'],['ja','Japanese'],['ko','Korean'],['zh','Chinese'],['hi','Hindi'],['ar','Arabic'],['ru','Russian']].map(([v,l]) => <SelectItem key={v} value={v} className="text-white/80 text-sm">{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[11px] text-white/40 font-medium uppercase tracking-wider mb-2 block">Target Language</Label>
                <Select value={dubbingTargetLang} onValueChange={setDubbingTargetLang}>
                  <SelectTrigger className="bg-white/[0.02] border-white/[0.06] text-white/80 rounded-xl h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#0f0c1a] border-white/[0.08] rounded-xl">
                    {[['en','English'],['es','Spanish'],['fr','French'],['de','German'],['it','Italian'],['pt','Portuguese'],['ja','Japanese'],['ko','Korean'],['zh','Chinese'],['hi','Hindi'],['ar','Arabic'],['ru','Russian'],['nl','Dutch'],['sv','Swedish']].map(([v,l]) => <SelectItem key={v} value={v} className="text-white/80 text-sm">{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={dubAudio} disabled={isDubbing || !dubbingFile}
              className="w-full bg-rose-500 hover:bg-rose-400 text-black font-semibold rounded-xl h-11 transition-all hover:shadow-lg hover:shadow-rose-500/20">
              {isDubbing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Starting...</> : <><Globe className="w-4 h-4 mr-2" />Start Dubbing</>}
            </Button>
            {dubbingResult && (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <p className="text-white/70 text-sm whitespace-pre-wrap">{dubbingResult}</p>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#060411] text-white overflow-hidden">
      {/* Dynamic Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-[68px]' : 'w-[240px]'} h-full border-r border-white/[0.04] bg-[#080515] flex flex-col transition-all duration-300 ease-in-out shrink-0`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/[0.04] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center shrink-0">
            <ElevenLabsLogo className="w-4 h-4 text-white/80" />
          </div>
          {!sidebarCollapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white/90 truncate">ElevenLabs</p>
              <p className="text-[10px] text-white/25 truncate">AI Audio Studio</p>
            </div>
          )}
        </div>

        {/* Tool Navigation */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {tools.map((tool) => {
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => handleToolChange(tool.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                  ${isActive
                    ? 'bg-white/[0.06] shadow-sm'
                    : 'hover:bg-white/[0.03]'
                  }`}
                title={sidebarCollapsed ? tool.label : undefined}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full ${tool.color.replace('text-', 'bg-')}`} />
                )}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200
                  ${isActive ? `${tool.bgColor} ${tool.color}` : 'text-white/30 group-hover:text-white/50'}`}>
                  <tool.icon />
                </div>
                {!sidebarCollapsed && (
                  <span className={`text-[13px] font-medium truncate transition-colors ${isActive ? 'text-white/90' : 'text-white/40 group-hover:text-white/60'}`}>
                    {tool.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-white/[0.04]">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-white/20 hover:text-white/40 hover:bg-white/[0.02] transition-all text-xs"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 border-b border-white/[0.04] flex items-center justify-between px-6 shrink-0 bg-[#060411]/80 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <Link to="/ai" className="flex items-center gap-1.5 text-white/25 hover:text-white/50 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium tracking-wide">Back</span>
            </Link>
            <div className="w-px h-4 bg-white/[0.06]" />
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${currentTool.color.replace('text-', 'bg-')}`} />
              <h1 className="text-sm font-semibold text-white/80">{currentTool.label}</h1>
            </div>
          </div>
          <p className="text-[11px] text-white/20 hidden md:block">{currentTool.description}</p>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {renderContent()}

            {/* Generated Audio List */}
            {generatedAudios.length > 0 && (
              <div className="mt-10 pt-8 border-t border-white/[0.04]">
                <div className="flex items-center gap-2 mb-4">
                  <AudioLines className="w-4 h-4 text-white/20" />
                  <h3 className="text-xs font-medium text-white/30 uppercase tracking-wider">Generated ({generatedAudios.length})</h3>
                </div>
                <div className="space-y-2">
                  {generatedAudios.map((audio) => (
                    <div key={audio.timestamp} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.015] border border-white/[0.04] hover:bg-white/[0.03] transition-all group">
                      <button onClick={() => playAudio(audio.url)}
                        className="w-9 h-9 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-white/50 hover:text-white transition-all shrink-0">
                        {playingUrl === audio.url ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/60 font-medium truncate">{audio.filename}</p>
                        <p className="text-[10px] text-white/20">{audio.type} • {new Date(audio.timestamp).toLocaleTimeString()}</p>
                      </div>
                      <button onClick={() => downloadAudio(audio.url, audio.filename)}
                        className="w-8 h-8 rounded-lg text-white/15 hover:text-white/50 hover:bg-white/[0.04] flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ElevenLabs;