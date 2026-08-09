import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mic, Volume2, Wand2, Upload, Play, Pause, Download, Loader2, Music, AudioLines, Languages, Sparkles, Users, Radio, Headphones, Globe, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const ELEVENLABS_API_KEY = 'sk_55a4650c959426e2d090d08b6f959bdc5afbaa9a196c7548';
const API_BASE = 'https://api.elevenlabs.io/v1';

const IMAGES = {
  mascot: 'https://mgx-backend-cdn.metadl.com/generate/images/1498224/2026-08-01/ttjdxryaajqq/mascot-foxy-artist-2026.png',
  pattern: 'https://mgx-backend-cdn.metadl.com/generate/images/1498224/2026-08-01/ttjdzsacajqq/pattern-animation-tools-dark-2026.png',
  aiBrain: 'https://mgx-backend-cdn.metadl.com/generate/images/1498224/2026-08-01/ttjdyyicajrq/ai-creative-brain-2026.png',
};

// ElevenLabs Logo SVG Component
const ElevenLabsLogo = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 76 65" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M31.5 0H38.5V65H31.5V0Z" fill="currentColor"/>
    <path d="M44.5 0H51.5V65H44.5V0Z" fill="currentColor"/>
  </svg>
);

interface Voice {
  voice_id: string;
  name: string;
  category?: string;
  labels?: Record<string, string>;
  preview_url?: string;
}

interface GeneratedAudio {
  url: string;
  filename: string;
  timestamp: number;
  type: string;
}

const ElevenLabs = () => {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
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

  // Sound Effects state
  const [sfxText, setSfxText] = useState('');
  const [sfxDuration, setSfxDuration] = useState('');
  const [isGeneratingSfx, setIsGeneratingSfx] = useState(false);

  // Voice Cloning state
  const [cloneName, setCloneName] = useState('');
  const [cloneDescription, setCloneDescription] = useState('');
  const [cloneFiles, setCloneFiles] = useState<File[]>([]);
  const [isCloning, setIsCloning] = useState(false);

  // Speech-to-Text state
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

  // Audio Isolation state
  const [isolationFile, setIsolationFile] = useState<File | null>(null);
  const [isIsolating, setIsIsolating] = useState(false);

  // Dubbing state
  const [dubbingFile, setDubbingFile] = useState<File | null>(null);
  const [dubbingSourceLang, setDubbingSourceLang] = useState('en');
  const [dubbingTargetLang, setDubbingTargetLang] = useState('es');
  const [isDubbing, setIsDubbing] = useState(false);
  const [dubbingResult, setDubbingResult] = useState('');

  // Music Generation state
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

  const [activeTab, setActiveTab] = useState('tts');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  const fetchVoices = async () => {
    if (voicesLoaded) return;
    setLoadingVoices(true);
    try {
      const response = await fetch(`${API_BASE}/voices`, {
        headers: { 'xi-api-key': ELEVENLABS_API_KEY },
      });
      if (!response.ok) throw new Error('Failed to fetch voices');
      const data = await response.json();
      setVoices(data.voices || []);
      if (data.voices?.length > 0) {
        setSelectedVoice(data.voices[0].voice_id);
      }
      setVoicesLoaded(true);
    } catch (err) {
      toast.error('Failed to load voices. Check your API key.');
      console.error(err);
    } finally {
      setLoadingVoices(false);
    }
  };

  const generateSpeech = async () => {
    if (!ttsText.trim()) { toast.error('Please enter some text to convert to speech.'); return; }
    if (!selectedVoice) { toast.error('Please select a voice first.'); return; }
    setIsGenerating(true);
    try {
      const response = await fetch(`${API_BASE}/text-to-speech/${selectedVoice}`, {
        method: 'POST',
        headers: { 'xi-api-key': ELEVENLABS_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: ttsText, model_id: selectedModel,
          voice_settings: { stability: stability[0], similarity_boost: similarityBoost[0], style: style[0], use_speaker_boost: true },
        }),
      });
      if (!response.ok) { const errData = await response.json().catch(() => ({})); throw new Error(errData?.detail?.message || 'Failed to generate speech'); }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setGeneratedAudios((prev) => [{ url, filename: `speech_${Date.now()}.mp3`, timestamp: Date.now(), type: 'Speech' }, ...prev]);
      toast.success('Speech generated successfully!');
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Generation failed'); }
    finally { setIsGenerating(false); }
  };

  const generateSoundEffect = async () => {
    if (!sfxText.trim()) { toast.error('Please describe the sound effect.'); return; }
    setIsGeneratingSfx(true);
    try {
      const body: Record<string, unknown> = { text: sfxText };
      if (sfxDuration) body.duration_seconds = parseFloat(sfxDuration);
      const response = await fetch(`${API_BASE}/sound-generation`, {
        method: 'POST',
        headers: { 'xi-api-key': ELEVENLABS_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) { const errData = await response.json().catch(() => ({})); throw new Error(errData?.detail?.message || 'Failed to generate sound effect'); }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setGeneratedAudios((prev) => [{ url, filename: `sfx_${Date.now()}.mp3`, timestamp: Date.now(), type: 'Sound Effect' }, ...prev]);
      toast.success('Sound effect generated!');
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Generation failed'); }
    finally { setIsGeneratingSfx(false); }
  };

  const cloneVoice = async () => {
    if (!cloneName.trim()) { toast.error('Please enter a name for the cloned voice.'); return; }
    if (cloneFiles.length === 0) { toast.error('Please upload at least one audio sample.'); return; }
    setIsCloning(true);
    try {
      const formData = new FormData();
      formData.append('name', cloneName);
      formData.append('description', cloneDescription);
      cloneFiles.forEach((file) => formData.append('files', file));
      const response = await fetch(`${API_BASE}/voices/add`, {
        method: 'POST', headers: { 'xi-api-key': ELEVENLABS_API_KEY }, body: formData,
      });
      if (!response.ok) { const errData = await response.json().catch(() => ({})); throw new Error(errData?.detail?.message || 'Failed to clone voice'); }
      toast.success(`Voice "${cloneName}" cloned successfully!`);
      setCloneName(''); setCloneDescription(''); setCloneFiles([]);
      setVoicesLoaded(false); fetchVoices();
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Cloning failed'); }
    finally { setIsCloning(false); }
  };

  const transcribeAudio = async () => {
    if (!sttFile) { toast.error('Please upload an audio file to transcribe.'); return; }
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('file', sttFile);
      formData.append('model_id', 'scribe_v1');
      const response = await fetch(`${API_BASE}/speech-to-text`, {
        method: 'POST', headers: { 'xi-api-key': ELEVENLABS_API_KEY }, body: formData,
      });
      if (!response.ok) { const errData = await response.json().catch(() => ({})); throw new Error(errData?.detail?.message || 'Transcription failed'); }
      const data = await response.json();
      setSttResult(data.text || JSON.stringify(data, null, 2));
      toast.success('Transcription complete!');
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Transcription failed'); }
    finally { setIsTranscribing(false); }
  };

  const designVoice = async () => {
    if (!vdText.trim()) { toast.error('Please enter preview text.'); return; }
    setIsDesigning(true);
    try {
      const response = await fetch(`${API_BASE}/voice-generation/generate-voice/preview`, {
        method: 'POST',
        headers: { 'xi-api-key': ELEVENLABS_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voice_description: `A ${vdAge} ${vdGender} with a ${vdAccent} accent`,
          text: vdText, gender: vdGender, age: vdAge, accent: vdAccent, accent_strength: vdAccentStrength[0],
        }),
      });
      if (!response.ok) { const errData = await response.json().catch(() => ({})); throw new Error(errData?.detail?.message || 'Voice design failed'); }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setGeneratedAudios((prev) => [{ url, filename: `voice_design_${Date.now()}.mp3`, timestamp: Date.now(), type: 'Voice Design' }, ...prev]);
      toast.success('Voice design preview generated!');
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Voice design failed'); }
    finally { setIsDesigning(false); }
  };

  const isolateAudio = async () => {
    if (!isolationFile) { toast.error('Please upload an audio file.'); return; }
    setIsIsolating(true);
    try {
      const formData = new FormData();
      formData.append('audio', isolationFile);
      const response = await fetch(`${API_BASE}/audio-isolation`, {
        method: 'POST', headers: { 'xi-api-key': ELEVENLABS_API_KEY }, body: formData,
      });
      if (!response.ok) { const errData = await response.json().catch(() => ({})); throw new Error(errData?.detail?.message || 'Audio isolation failed'); }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setGeneratedAudios((prev) => [{ url, filename: `isolated_${Date.now()}.mp3`, timestamp: Date.now(), type: 'Isolated Audio' }, ...prev]);
      toast.success('Audio isolated successfully!');
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Isolation failed'); }
    finally { setIsIsolating(false); }
  };

  const dubAudio = async () => {
    if (!dubbingFile) { toast.error('Please upload an audio/video file to dub.'); return; }
    setIsDubbing(true); setDubbingResult('');
    try {
      const formData = new FormData();
      formData.append('file', dubbingFile);
      formData.append('source_lang', dubbingSourceLang);
      formData.append('target_lang', dubbingTargetLang);
      formData.append('mode', 'automatic');
      formData.append('num_speakers', '0');
      const response = await fetch(`${API_BASE}/dubbing`, {
        method: 'POST', headers: { 'xi-api-key': ELEVENLABS_API_KEY }, body: formData,
      });
      if (!response.ok) { const errData = await response.json().catch(() => ({})); throw new Error(errData?.detail?.message || 'Dubbing failed'); }
      const data = await response.json();
      setDubbingResult(`Dubbing job started! ID: ${data.dubbing_id}\nExpected duration: ~${data.expected_duration_sec || 'unknown'}s\n\nThe dubbing is processing. Check status using the dubbing ID.`);
      toast.success('Dubbing job submitted successfully!');
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Dubbing failed'); }
    finally { setIsDubbing(false); }
  };

  const generateMusic = async () => {
    if (!musicPrompt.trim() && !musicLyrics.trim()) { toast.error('Please enter a music prompt or lyrics.'); return; }
    setIsGeneratingMusic(true);
    try {
      let fullPrompt = musicPrompt;
      if (musicGenre && musicGenre !== 'any') fullPrompt += ` Genre: ${musicGenre}.`;
      if (musicMood && musicMood !== 'any') fullPrompt += ` Mood: ${musicMood}.`;
      if (musicTempo && musicTempo !== 'any') fullPrompt += ` Tempo: ${musicTempo}.`;
      if (musicInstrumental) fullPrompt += ' Instrumental only, no vocals.';
      if (musicLyrics.trim() && !musicInstrumental) fullPrompt += ` Lyrics: ${musicLyrics}`;
      const body: Record<string, unknown> = { text: fullPrompt.trim() };
      if (musicDuration) body.duration_seconds = parseFloat(musicDuration);
      const response = await fetch(`${API_BASE}/sound-generation`, {
        method: 'POST',
        headers: { 'xi-api-key': ELEVENLABS_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) { const errData = await response.json().catch(() => ({})); throw new Error(errData?.detail?.message || 'Music generation failed'); }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setGeneratedAudios((prev) => [{ url, filename: `music_${musicGenre}_${Date.now()}.mp3`, timestamp: Date.now(), type: 'Music' }, ...prev]);
      toast.success('Music generated successfully!');
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Music generation failed'); }
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

  const tabItems = [
    { value: 'tts', label: 'Text to Speech', icon: Volume2, color: 'text-cyan-400' },
    { value: 'music', label: 'Music', icon: Music, color: 'text-pink-400' },
    { value: 'sfx', label: 'Sound Effects', icon: Radio, color: 'text-purple-400' },
    { value: 'clone', label: 'Voice Clone', icon: Users, color: 'text-emerald-400' },
    { value: 'design', label: 'Voice Design', icon: Wand2, color: 'text-amber-400' },
    { value: 'stt', label: 'Speech to Text', icon: Mic, color: 'text-orange-400' },
    { value: 'isolation', label: 'Audio Isolation', icon: Headphones, color: 'text-sky-400' },
    { value: 'dubbing', label: 'Dubbing', icon: Globe, color: 'text-rose-400' },
  ];

  return (
    <div className="min-h-screen bg-[#060411] text-white overflow-x-hidden">
      {/* Animated grain texture - same as landing */}
      <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.025]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none z-[0] overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float-random"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: ['#06b6d4', '#a855f7', '#ec4899', '#10b981', '#f59e0b'][Math.floor(Math.random() * 5)],
              opacity: Math.random() * 0.4 + 0.1,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${Math.random() * 10 + 8}s`,
            }}
          />
        ))}
      </div>

      {/* Interactive gradient orb following mouse */}
      <div
        className="fixed w-[600px] h-[600px] rounded-full blur-[200px] opacity-10 transition-all duration-[3000ms] ease-out pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, #06b6d4 0%, #a855f7 50%, #ec4899 100%)',
          left: `${mousePos.x * 60}%`,
          top: `${mousePos.y * 60}%`,
        }}
      />

      {/* Background pattern layer */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.03]">
        <img src={IMAGES.pattern} alt="" className="w-full h-full object-cover" />
      </div>

      {/* Static gradient orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[180px] opacity-8 bg-cyan-600 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[160px] opacity-8 bg-purple-600 animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full blur-[140px] opacity-5 bg-pink-500 animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Navigation - matching app style */}
      <nav className="fixed top-0 w-full z-50 bg-[#060411]/80 backdrop-blur-xl border-b border-white/[0.03]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/ai"
              className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-[13px] font-medium tracking-wide">AI TOOLS</span>
            </Link>
            <div className="w-px h-5 bg-white/10" />
            <div className="flex items-center gap-3 group cursor-default">
              <img
                src={IMAGES.mascot}
                alt="Foxy"
                className="w-9 h-9 object-contain group-hover:rotate-12 transition-transform duration-300"
              />
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight" style={{ fontFamily: 'Fredoka' }}>
                  <span className="text-orange-400">Foxy</span>{' '}
                  <span className="text-white/80">×</span>
                </span>
                <ElevenLabsLogo className="w-5 h-5 text-white/90" />
                <span className="text-lg font-bold text-white/90" style={{ fontFamily: 'Fredoka' }}>ElevenLabs</span>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-bold text-cyan-300 tracking-wide">8 AI AUDIO TOOLS</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-28 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] mb-8">
              <ElevenLabsLogo className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white/50 tracking-wide">POWERED BY ELEVENLABS API</span>
            </div>
            <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-black leading-[0.88] tracking-tight mb-6" style={{ fontFamily: 'Fredoka' }}>
              <span className="block text-white">AI-Powered</span>
              <span className="block bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-shift">
                Audio Studio.
              </span>
            </h1>
            <p className="text-white/35 text-lg max-w-2xl mx-auto leading-relaxed mb-4">
              Generate lifelike speech, create music with lyrics, clone voices, design new voices,
              produce sound effects, isolate audio, dub content, and transcribe — all in one place.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative z-10 py-6 px-6">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); if (val === 'tts' || val === 'clone') fetchVoices(); }} className="w-full">
            {/* Tab Navigation */}
            <div className="overflow-x-auto pb-3 mb-8 -mx-2 px-2 animate-slide-up" style={{ animationDelay: '150ms' }}>
              <TabsList className="inline-flex w-auto min-w-full md:grid md:grid-cols-8 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-1.5 gap-1">
                {tabItems.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={`rounded-xl data-[state=active]:bg-white/[0.08] data-[state=active]:border-white/[0.1] data-[state=active]:shadow-lg text-white/40 font-medium text-[11px] gap-1.5 whitespace-nowrap px-3 py-2.5 transition-all duration-300 border border-transparent hover:bg-white/[0.03]`}
                  >
                    <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.value ? tab.color : ''}`} />
                    <span className={activeTab === tab.value ? tab.color : ''}>{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* TEXT TO SPEECH */}
            <TabsContent value="tts" className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-5">
                  <div className="p-7 rounded-2xl bg-gradient-to-br from-cyan-500/[0.04] to-purple-500/[0.02] border border-white/[0.06] hover:border-cyan-500/20 transition-all duration-500">
                    <Label className="text-white/50 text-xs font-mono tracking-widest uppercase mb-3 block">Enter Text</Label>
                    <Textarea
                      value={ttsText}
                      onChange={(e) => setTtsText(e.target.value)}
                      placeholder="Type or paste the text you want to convert to speech..."
                      className="min-h-[180px] bg-white/[0.02] border-white/[0.06] text-white placeholder:text-white/20 resize-none focus:border-cyan-500/40 rounded-xl text-sm"
                    />
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-[11px] text-white/25 font-mono">{ttsText.length} chars</span>
                      <Button
                        onClick={generateSpeech}
                        disabled={isGenerating || !ttsText.trim() || !selectedVoice}
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-7 py-2.5 rounded-xl hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/20 transition-all"
                      >
                        {isGenerating ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
                        ) : (
                          <><AudioLines className="w-4 h-4 mr-2" />Generate Speech</>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4 hover:border-white/[0.1] transition-all duration-500">
                    <div>
                      <Label className="text-white/50 text-xs font-mono tracking-widest uppercase mb-2 block">Voice</Label>
                      {loadingVoices ? (
                        <div className="flex items-center gap-2 text-white/40 text-sm"><Loader2 className="w-4 h-4 animate-spin" />Loading...</div>
                      ) : (
                        <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                          <SelectTrigger className="bg-white/[0.03] border-white/[0.06] text-white rounded-xl"><SelectValue placeholder="Select a voice" /></SelectTrigger>
                          <SelectContent className="bg-[#0d0a1a] border-white/[0.1] rounded-xl max-h-[300px]">
                            {voices.map((voice) => (
                              <SelectItem key={voice.voice_id} value={voice.voice_id} className="text-white hover:bg-white/[0.05]">
                                {voice.name} {voice.category ? `(${voice.category})` : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    <div>
                      <Label className="text-white/50 text-xs font-mono tracking-widest uppercase mb-2 block">Model</Label>
                      <Select value={selectedModel} onValueChange={setSelectedModel}>
                        <SelectTrigger className="bg-white/[0.03] border-white/[0.06] text-white rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-[#0d0a1a] border-white/[0.1] rounded-xl">
                          <SelectItem value="eleven_multilingual_v2" className="text-white hover:bg-white/[0.05]">Multilingual v2 (29 langs)</SelectItem>
                          <SelectItem value="eleven_turbo_v2_5" className="text-white hover:bg-white/[0.05]">Turbo v2.5 (Fastest)</SelectItem>
                          <SelectItem value="eleven_turbo_v2" className="text-white hover:bg-white/[0.05]">Turbo v2</SelectItem>
                          <SelectItem value="eleven_monolingual_v1" className="text-white hover:bg-white/[0.05]">English v1</SelectItem>
                          <SelectItem value="eleven_multilingual_v1" className="text-white hover:bg-white/[0.05]">Multilingual v1</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-white/40 text-[11px] font-medium mb-1.5 block">Stability: <span className="text-cyan-400">{stability[0].toFixed(2)}</span></Label>
                      <Slider value={stability} onValueChange={setStability} min={0} max={1} step={0.01} className="[&_[role=slider]]:bg-cyan-400" />
                    </div>
                    <div>
                      <Label className="text-white/40 text-[11px] font-medium mb-1.5 block">Similarity: <span className="text-purple-400">{similarityBoost[0].toFixed(2)}</span></Label>
                      <Slider value={similarityBoost} onValueChange={setSimilarityBoost} min={0} max={1} step={0.01} className="[&_[role=slider]]:bg-purple-400" />
                    </div>
                    <div>
                      <Label className="text-white/40 text-[11px] font-medium mb-1.5 block">Style: <span className="text-pink-400">{style[0].toFixed(2)}</span></Label>
                      <Slider value={style} onValueChange={setStyle} min={0} max={1} step={0.01} className="[&_[role=slider]]:bg-pink-400" />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* MUSIC GENERATION */}
            <TabsContent value="music" className="space-y-6 animate-fade-in">
              <div className="max-w-3xl mx-auto">
                <div className="p-8 rounded-2xl bg-gradient-to-br from-pink-500/[0.04] to-purple-500/[0.02] border border-white/[0.06] hover:border-pink-500/20 transition-all duration-500 space-y-6">
                  <div className="text-center mb-2">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Music className="w-8 h-8 text-pink-400" />
                    </div>
                    <h3 className="text-2xl font-bold" style={{ fontFamily: 'Fredoka' }}>
                      <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">AI Music Generation</span>
                    </h3>
                    <p className="text-white/30 text-sm mt-1">Create original music — add lyrics, choose genre, mood, and tempo</p>
                  </div>

                  <div>
                    <Label className="text-white/50 text-xs font-mono tracking-widest uppercase mb-2 block">Music Prompt</Label>
                    <Textarea
                      value={musicPrompt}
                      onChange={(e) => setMusicPrompt(e.target.value)}
                      placeholder="e.g., An upbeat electronic dance track with synth pads, driving bass, and energetic drums..."
                      className="min-h-[100px] bg-white/[0.02] border-white/[0.06] text-white placeholder:text-white/20 resize-none focus:border-pink-500/40 rounded-xl text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-white/50 text-xs font-mono tracking-widest uppercase mb-2 block">Genre</Label>
                      <Select value={musicGenre} onValueChange={setMusicGenre}>
                        <SelectTrigger className="bg-white/[0.03] border-white/[0.06] text-white rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-[#0d0a1a] border-white/[0.1] rounded-xl">
                          {['any', 'pop', 'rock', 'electronic', 'hip-hop', 'jazz', 'classical', 'r&b', 'country', 'ambient', 'metal', 'folk', 'reggae', 'latin', 'lo-fi', 'cinematic'].map(g => (
                            <SelectItem key={g} value={g} className="text-white hover:bg-white/[0.05] capitalize">{g === 'any' ? 'Any Genre' : g.charAt(0).toUpperCase() + g.slice(1)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white/50 text-xs font-mono tracking-widest uppercase mb-2 block">Mood</Label>
                      <Select value={musicMood} onValueChange={setMusicMood}>
                        <SelectTrigger className="bg-white/[0.03] border-white/[0.06] text-white rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-[#0d0a1a] border-white/[0.1] rounded-xl">
                          {['any', 'upbeat', 'sad', 'energetic', 'calm', 'dark', 'romantic', 'epic', 'mysterious', 'aggressive', 'dreamy', 'nostalgic', 'playful'].map(m => (
                            <SelectItem key={m} value={m} className="text-white hover:bg-white/[0.05] capitalize">{m === 'any' ? 'Any Mood' : m.charAt(0).toUpperCase() + m.slice(1)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white/50 text-xs font-mono tracking-widest uppercase mb-2 block">Tempo</Label>
                      <Select value={musicTempo} onValueChange={setMusicTempo}>
                        <SelectTrigger className="bg-white/[0.03] border-white/[0.06] text-white rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-[#0d0a1a] border-white/[0.1] rounded-xl">
                          <SelectItem value="any" className="text-white hover:bg-white/[0.05]">Any Tempo</SelectItem>
                          <SelectItem value="very slow" className="text-white hover:bg-white/[0.05]">Very Slow (60-80 BPM)</SelectItem>
                          <SelectItem value="slow" className="text-white hover:bg-white/[0.05]">Slow (80-100 BPM)</SelectItem>
                          <SelectItem value="medium" className="text-white hover:bg-white/[0.05]">Medium (100-120 BPM)</SelectItem>
                          <SelectItem value="fast" className="text-white hover:bg-white/[0.05]">Fast (120-140 BPM)</SelectItem>
                          <SelectItem value="very fast" className="text-white hover:bg-white/[0.05]">Very Fast (140+ BPM)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-white/50 text-xs font-mono tracking-widest uppercase">Lyrics</Label>
                      <div className="flex items-center gap-2">
                        <Label className="text-white/30 text-xs">Instrumental only</Label>
                        <Switch checked={musicInstrumental} onCheckedChange={setMusicInstrumental} />
                      </div>
                    </div>
                    {!musicInstrumental && (
                      <Textarea
                        value={musicLyrics}
                        onChange={(e) => setMusicLyrics(e.target.value)}
                        placeholder={"[Verse 1]\nWrite your lyrics here...\n\n[Chorus]\nThe catchy part goes here..."}
                        className="min-h-[120px] bg-white/[0.02] border-white/[0.06] text-white placeholder:text-white/20 resize-none focus:border-pink-500/40 rounded-xl font-mono text-sm"
                      />
                    )}
                  </div>

                  <div>
                    <Label className="text-white/50 text-xs font-mono tracking-widest uppercase mb-2 block">Duration</Label>
                    <div className="flex gap-2 flex-wrap">
                      {['10', '15', '22', '30'].map((d) => (
                        <Button
                          key={d}
                          variant="outline"
                          size="sm"
                          onClick={() => setMusicDuration(d)}
                          className={`rounded-xl border transition-all ${musicDuration === d ? 'bg-pink-500/15 text-pink-300 border-pink-500/30 shadow-lg shadow-pink-500/10' : 'bg-white/[0.02] border-white/[0.06] text-white/40 hover:text-white hover:bg-white/[0.05] hover:border-white/[0.12]'}`}
                        >
                          {d}s
                        </Button>
                      ))}
                      <Input
                        type="number"
                        value={musicDuration}
                        onChange={(e) => setMusicDuration(e.target.value)}
                        className="w-20 bg-white/[0.02] border-white/[0.06] text-white text-sm rounded-xl"
                        min="1" max="60"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={generateMusic}
                    disabled={isGeneratingMusic || (!musicPrompt.trim() && !musicLyrics.trim())}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-bold py-3 rounded-xl hover:scale-[1.02] hover:shadow-xl hover:shadow-pink-500/20 transition-all"
                  >
                    {isGeneratingMusic ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating Music...</>) : (<><Music className="w-4 h-4 mr-2" />Generate Music</>)}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* SOUND EFFECTS */}
            <TabsContent value="sfx" className="space-y-6 animate-fade-in">
              <div className="max-w-2xl mx-auto">
                <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-500/[0.04] to-indigo-500/[0.02] border border-white/[0.06] hover:border-purple-500/20 transition-all duration-500 space-y-5">
                  <div className="text-center mb-2">
                    <div className="w-16 h-16 rounded-2xl bg-purple-500/15 flex items-center justify-center mx-auto mb-3">
                      <Radio className="w-8 h-8 text-purple-400" />
                    </div>
                    <h3 className="text-2xl font-bold" style={{ fontFamily: 'Fredoka' }}>
                      <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">AI Sound Effects</span>
                    </h3>
                    <p className="text-white/30 text-sm mt-1">Describe any sound and AI will generate it instantly</p>
                  </div>

                  <div>
                    <Label className="text-white/50 text-xs font-mono tracking-widest uppercase mb-2 block">Describe the Sound</Label>
                    <Textarea
                      value={sfxText}
                      onChange={(e) => setSfxText(e.target.value)}
                      placeholder="e.g., A thunderstorm with heavy rain and distant thunder, footsteps on gravel, sci-fi laser blast..."
                      className="min-h-[120px] bg-white/[0.02] border-white/[0.06] text-white placeholder:text-white/20 resize-none focus:border-purple-500/40 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-white/50 text-xs font-mono tracking-widest uppercase mb-2 block">Duration</Label>
                    <div className="flex gap-2 flex-wrap">
                      {['2', '5', '10', '15', '22'].map((d) => (
                        <Button key={d} variant="outline" size="sm" onClick={() => setSfxDuration(d)}
                          className={`rounded-xl border transition-all ${sfxDuration === d ? 'bg-purple-500/15 text-purple-300 border-purple-500/30' : 'bg-white/[0.02] border-white/[0.06] text-white/40 hover:text-white hover:bg-white/[0.05]'}`}
                        >{d}s</Button>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => setSfxDuration('')}
                        className={`rounded-xl border transition-all ${sfxDuration === '' ? 'bg-purple-500/15 text-purple-300 border-purple-500/30' : 'bg-white/[0.02] border-white/[0.06] text-white/40 hover:text-white hover:bg-white/[0.05]'}`}
                      >Auto</Button>
                    </div>
                  </div>

                  <Button onClick={generateSoundEffect} disabled={isGeneratingSfx || !sfxText.trim()}
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold rounded-xl hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/20 transition-all"
                  >
                    {isGeneratingSfx ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>) : (<><Sparkles className="w-4 h-4 mr-2" />Generate Sound Effect</>)}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* VOICE CLONING */}
            <TabsContent value="clone" className="space-y-6 animate-fade-in">
              <div className="max-w-2xl mx-auto">
                <div className="p-8 rounded-2xl bg-gradient-to-br from-emerald-500/[0.04] to-teal-500/[0.02] border border-white/[0.06] hover:border-emerald-500/20 transition-all duration-500 space-y-5">
                  <div className="text-center mb-2">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center mx-auto mb-3">
                      <Users className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-bold" style={{ fontFamily: 'Fredoka' }}>
                      <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Instant Voice Cloning</span>
                    </h3>
                    <p className="text-white/30 text-sm mt-1">Upload audio samples to create a custom voice clone</p>
                  </div>

                  <div>
                    <Label className="text-white/50 text-xs font-mono tracking-widest uppercase mb-2 block">Voice Name</Label>
                    <Input value={cloneName} onChange={(e) => setCloneName(e.target.value)} placeholder="e.g., My Custom Voice"
                      className="bg-white/[0.02] border-white/[0.06] text-white placeholder:text-white/20 focus:border-emerald-500/40 rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-white/50 text-xs font-mono tracking-widest uppercase mb-2 block">Description</Label>
                    <Input value={cloneDescription} onChange={(e) => setCloneDescription(e.target.value)} placeholder="Describe the voice..."
                      className="bg-white/[0.02] border-white/[0.06] text-white placeholder:text-white/20 focus:border-emerald-500/40 rounded-xl" />
                  </div>
                  <div>
                    <Label className="text-white/50 text-xs font-mono tracking-widest uppercase mb-2 block">Audio Samples</Label>
                    <div onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-white/[0.08] rounded-2xl p-8 text-center cursor-pointer hover:border-emerald-500/30 hover:bg-emerald-500/[0.02] transition-all">
                      <Upload className="w-8 h-8 text-white/20 mx-auto mb-2" />
                      <p className="text-white/35 text-sm">Click to upload audio files</p>
                      <p className="text-white/15 text-xs mt-1">MP3, WAV, M4A • Best with 3+ samples of 1-2 min each</p>
                      {cloneFiles.length > 0 && (
                        <div className="mt-3 space-y-1">{cloneFiles.map((f, i) => (<p key={i} className="text-emerald-400 text-xs">{f.name}</p>))}</div>
                      )}
                    </div>
                    <input ref={fileInputRef} type="file" accept="audio/*" multiple className="hidden"
                      onChange={(e) => { if (e.target.files) setCloneFiles(Array.from(e.target.files)); }} />
                  </div>
                  <Button onClick={cloneVoice} disabled={isCloning || !cloneName.trim() || cloneFiles.length === 0}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/20 transition-all"
                  >
                    {isCloning ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Cloning...</>) : (<><Wand2 className="w-4 h-4 mr-2" />Clone Voice</>)}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* VOICE DESIGN */}
            <TabsContent value="design" className="space-y-6 animate-fade-in">
              <div className="max-w-2xl mx-auto">
                <div className="p-8 rounded-2xl bg-gradient-to-br from-amber-500/[0.04] to-orange-500/[0.02] border border-white/[0.06] hover:border-amber-500/20 transition-all duration-500 space-y-5">
                  <div className="text-center mb-2">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/15 flex items-center justify-center mx-auto mb-3">
                      <Wand2 className="w-8 h-8 text-amber-400" />
                    </div>
                    <h3 className="text-2xl font-bold" style={{ fontFamily: 'Fredoka' }}>
                      <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Voice Design Lab</span>
                    </h3>
                    <p className="text-white/30 text-sm mt-1">Create entirely new synthetic voices from scratch</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-white/50 text-xs font-mono tracking-widest uppercase mb-2 block">Gender</Label>
                      <Select value={vdGender} onValueChange={setVdGender}>
                        <SelectTrigger className="bg-white/[0.03] border-white/[0.06] text-white rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-[#0d0a1a] border-white/[0.1] rounded-xl">
                          <SelectItem value="female" className="text-white hover:bg-white/[0.05]">Female</SelectItem>
                          <SelectItem value="male" className="text-white hover:bg-white/[0.05]">Male</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white/50 text-xs font-mono tracking-widest uppercase mb-2 block">Age</Label>
                      <Select value={vdAge} onValueChange={setVdAge}>
                        <SelectTrigger className="bg-white/[0.03] border-white/[0.06] text-white rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-[#0d0a1a] border-white/[0.1] rounded-xl">
                          <SelectItem value="young" className="text-white hover:bg-white/[0.05]">Young</SelectItem>
                          <SelectItem value="middle_aged" className="text-white hover:bg-white/[0.05]">Middle Aged</SelectItem>
                          <SelectItem value="old" className="text-white hover:bg-white/[0.05]">Old</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white/50 text-xs font-mono tracking-widest uppercase mb-2 block">Accent</Label>
                      <Select value={vdAccent} onValueChange={setVdAccent}>
                        <SelectTrigger className="bg-white/[0.03] border-white/[0.06] text-white rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-[#0d0a1a] border-white/[0.1] rounded-xl">
                          {['american', 'british', 'australian', 'indian', 'african', 'irish', 'italian', 'swedish'].map(a => (
                            <SelectItem key={a} value={a} className="text-white hover:bg-white/[0.05] capitalize">{a.charAt(0).toUpperCase() + a.slice(1)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-white/40 text-[11px] font-medium mb-1.5 block">Accent Strength: <span className="text-amber-400">{vdAccentStrength[0].toFixed(1)}</span></Label>
                    <Slider value={vdAccentStrength} onValueChange={setVdAccentStrength} min={0.3} max={2.0} step={0.1} className="[&_[role=slider]]:bg-amber-400" />
                  </div>

                  <div>
                    <Label className="text-white/50 text-xs font-mono tracking-widest uppercase mb-2 block">Preview Text</Label>
                    <Textarea value={vdText} onChange={(e) => setVdText(e.target.value)} placeholder="Enter text to preview..."
                      className="min-h-[80px] bg-white/[0.02] border-white/[0.06] text-white placeholder:text-white/20 resize-none focus:border-amber-500/40 rounded-xl text-sm" />
                  </div>

                  <Button onClick={designVoice} disabled={isDesigning || !vdText.trim()}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold rounded-xl hover:scale-[1.02] hover:shadow-xl hover:shadow-amber-500/20 transition-all"
                  >
                    {isDesigning ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Designing...</>) : (<><Sparkles className="w-4 h-4 mr-2" />Generate Voice Preview</>)}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* SPEECH TO TEXT */}
            <TabsContent value="stt" className="space-y-6 animate-fade-in">
              <div className="max-w-2xl mx-auto">
                <div className="p-8 rounded-2xl bg-gradient-to-br from-orange-500/[0.04] to-red-500/[0.02] border border-white/[0.06] hover:border-orange-500/20 transition-all duration-500 space-y-5">
                  <div className="text-center mb-2">
                    <div className="w-16 h-16 rounded-2xl bg-orange-500/15 flex items-center justify-center mx-auto mb-3">
                      <Mic className="w-8 h-8 text-orange-400" />
                    </div>
                    <h3 className="text-2xl font-bold" style={{ fontFamily: 'Fredoka' }}>
                      <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Speech to Text</span>
                    </h3>
                    <p className="text-white/30 text-sm mt-1">Transcribe audio files with high accuracy in 90+ languages</p>
                  </div>

                  <div>
                    <div onClick={() => sttFileInputRef.current?.click()}
                      className="border-2 border-dashed border-white/[0.08] rounded-2xl p-8 text-center cursor-pointer hover:border-orange-500/30 hover:bg-orange-500/[0.02] transition-all">
                      <Upload className="w-8 h-8 text-white/20 mx-auto mb-2" />
                      <p className="text-white/35 text-sm">Click to upload an audio file</p>
                      <p className="text-white/15 text-xs mt-1">MP3, WAV, M4A, FLAC, OGG, WEBM</p>
                      {sttFile && <p className="text-orange-400 text-xs mt-3">{sttFile.name}</p>}
                    </div>
                    <input ref={sttFileInputRef} type="file" accept="audio/*" className="hidden"
                      onChange={(e) => { if (e.target.files?.[0]) setSttFile(e.target.files[0]); }} />
                  </div>

                  <Button onClick={transcribeAudio} disabled={isTranscribing || !sttFile}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold rounded-xl hover:scale-[1.02] hover:shadow-xl hover:shadow-orange-500/20 transition-all"
                  >
                    {isTranscribing ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Transcribing...</>) : (<><Languages className="w-4 h-4 mr-2" />Transcribe Audio</>)}
                  </Button>

                  {sttResult && (
                    <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <Label className="text-white/50 text-xs font-mono tracking-widest uppercase mb-2 block">Result</Label>
                      <p className="text-white/75 text-sm leading-relaxed whitespace-pre-wrap">{sttResult}</p>
                      <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(sttResult); toast.success('Copied!'); }}
                        className="mt-3 text-white/30 hover:text-white text-xs">Copy to clipboard</Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* AUDIO ISOLATION */}
            <TabsContent value="isolation" className="space-y-6 animate-fade-in">
              <div className="max-w-2xl mx-auto">
                <div className="p-8 rounded-2xl bg-gradient-to-br from-sky-500/[0.04] to-blue-500/[0.02] border border-white/[0.06] hover:border-sky-500/20 transition-all duration-500 space-y-5">
                  <div className="text-center mb-2">
                    <div className="w-16 h-16 rounded-2xl bg-sky-500/15 flex items-center justify-center mx-auto mb-3">
                      <Headphones className="w-8 h-8 text-sky-400" />
                    </div>
                    <h3 className="text-2xl font-bold" style={{ fontFamily: 'Fredoka' }}>
                      <span className="bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">Audio Isolation</span>
                    </h3>
                    <p className="text-white/30 text-sm mt-1">Remove background noise and isolate vocals from any audio</p>
                  </div>

                  <div>
                    <div onClick={() => isolationFileInputRef.current?.click()}
                      className="border-2 border-dashed border-white/[0.08] rounded-2xl p-8 text-center cursor-pointer hover:border-sky-500/30 hover:bg-sky-500/[0.02] transition-all">
                      <Upload className="w-8 h-8 text-white/20 mx-auto mb-2" />
                      <p className="text-white/35 text-sm">Upload audio with background noise</p>
                      <p className="text-white/15 text-xs mt-1">MP3, WAV, M4A • Isolates voice from music/noise</p>
                      {isolationFile && <p className="text-sky-400 text-xs mt-3">{isolationFile.name}</p>}
                    </div>
                    <input ref={isolationFileInputRef} type="file" accept="audio/*" className="hidden"
                      onChange={(e) => { if (e.target.files?.[0]) setIsolationFile(e.target.files[0]); }} />
                  </div>

                  <Button onClick={isolateAudio} disabled={isIsolating || !isolationFile}
                    className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold rounded-xl hover:scale-[1.02] hover:shadow-xl hover:shadow-sky-500/20 transition-all"
                  >
                    {isIsolating ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Isolating...</>) : (<><Headphones className="w-4 h-4 mr-2" />Isolate Vocals</>)}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* DUBBING */}
            <TabsContent value="dubbing" className="space-y-6 animate-fade-in">
              <div className="max-w-2xl mx-auto">
                <div className="p-8 rounded-2xl bg-gradient-to-br from-rose-500/[0.04] to-pink-500/[0.02] border border-white/[0.06] hover:border-rose-500/20 transition-all duration-500 space-y-5">
                  <div className="text-center mb-2">
                    <div className="w-16 h-16 rounded-2xl bg-rose-500/15 flex items-center justify-center mx-auto mb-3">
                      <Globe className="w-8 h-8 text-rose-400" />
                    </div>
                    <h3 className="text-2xl font-bold" style={{ fontFamily: 'Fredoka' }}>
                      <span className="bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">AI Dubbing</span>
                    </h3>
                    <p className="text-white/30 text-sm mt-1">Automatically dub audio/video content into other languages</p>
                  </div>

                  <div>
                    <div onClick={() => dubbingFileInputRef.current?.click()}
                      className="border-2 border-dashed border-white/[0.08] rounded-2xl p-8 text-center cursor-pointer hover:border-rose-500/30 hover:bg-rose-500/[0.02] transition-all">
                      <Upload className="w-8 h-8 text-white/20 mx-auto mb-2" />
                      <p className="text-white/35 text-sm">Upload audio or video file</p>
                      <p className="text-white/15 text-xs mt-1">MP3, WAV, MP4, MOV, MKV</p>
                      {dubbingFile && <p className="text-rose-400 text-xs mt-3">{dubbingFile.name}</p>}
                    </div>
                    <input ref={dubbingFileInputRef} type="file" accept="audio/*,video/*" className="hidden"
                      onChange={(e) => { if (e.target.files?.[0]) setDubbingFile(e.target.files[0]); }} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white/50 text-xs font-mono tracking-widest uppercase mb-2 block">Source</Label>
                      <Select value={dubbingSourceLang} onValueChange={setDubbingSourceLang}>
                        <SelectTrigger className="bg-white/[0.03] border-white/[0.06] text-white rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-[#0d0a1a] border-white/[0.1] rounded-xl">
                          {[['en','English'],['es','Spanish'],['fr','French'],['de','German'],['it','Italian'],['pt','Portuguese'],['ja','Japanese'],['ko','Korean'],['zh','Chinese'],['hi','Hindi'],['ar','Arabic'],['ru','Russian'],['pl','Polish'],['tr','Turkish']].map(([v,l]) => (
                            <SelectItem key={v} value={v} className="text-white hover:bg-white/[0.05]">{l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white/50 text-xs font-mono tracking-widest uppercase mb-2 block">Target</Label>
                      <Select value={dubbingTargetLang} onValueChange={setDubbingTargetLang}>
                        <SelectTrigger className="bg-white/[0.03] border-white/[0.06] text-white rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-[#0d0a1a] border-white/[0.1] rounded-xl">
                          {[['en','English'],['es','Spanish'],['fr','French'],['de','German'],['it','Italian'],['pt','Portuguese'],['ja','Japanese'],['ko','Korean'],['zh','Chinese'],['hi','Hindi'],['ar','Arabic'],['ru','Russian'],['pl','Polish'],['tr','Turkish'],['nl','Dutch'],['sv','Swedish']].map(([v,l]) => (
                            <SelectItem key={v} value={v} className="text-white hover:bg-white/[0.05]">{l}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button onClick={dubAudio} disabled={isDubbing || !dubbingFile}
                    className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-bold rounded-xl hover:scale-[1.02] hover:shadow-xl hover:shadow-rose-500/20 transition-all"
                  >
                    {isDubbing ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Starting...</>) : (<><Globe className="w-4 h-4 mr-2" />Start Dubbing</>)}
                  </Button>

                  {dubbingResult && (
                    <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <p className="text-white/75 text-sm leading-relaxed whitespace-pre-wrap">{dubbingResult}</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Generated Audio History */}
          {generatedAudios.length > 0 && (
            <div className="mt-12 animate-slide-up">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                  <AudioLines className="w-4 h-4 text-cyan-400" />
                </div>
                <h3 className="text-lg font-bold" style={{ fontFamily: 'Fredoka' }}>
                  <span className="text-white/70">Generated Audio</span>
                  <span className="text-white/20 text-sm font-normal ml-2">({generatedAudios.length})</span>
                </h3>
              </div>
              <div className="space-y-3">
                {generatedAudios.map((audio) => (
                  <div key={audio.timestamp}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300 group">
                    <Button variant="ghost" size="icon" onClick={() => playAudio(audio.url)}
                      className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/15 to-purple-500/15 hover:from-cyan-500/25 hover:to-purple-500/25 text-cyan-400 shrink-0 group-hover:scale-105 transition-transform">
                      {playingUrl === audio.url ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </Button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/70 font-medium truncate">{audio.filename}</p>
                      <p className="text-[11px] text-white/25">
                        <span className="text-cyan-400/60 font-medium">{audio.type}</span>
                        <span className="mx-1.5">•</span>
                        {new Date(audio.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => downloadAudio(audio.url, audio.filename)}
                      className="w-9 h-9 text-white/30 hover:text-white hover:bg-white/[0.05] rounded-xl shrink-0">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Overview - matching landing page card style */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-cyan-400/70 text-xs font-mono tracking-widest uppercase">All Features</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3" style={{ fontFamily: 'Fredoka' }}>
              Everything <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">ElevenLabs</span> offers.
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Volume2, title: 'Text to Speech', desc: '29+ languages, 5 models', color: 'text-cyan-400', gradient: 'from-cyan-500/10 to-blue-500/5', border: 'hover:border-cyan-500/20' },
              { icon: Music, title: 'Music Generation', desc: 'Lyrics, genres, moods', color: 'text-pink-400', gradient: 'from-pink-500/10 to-purple-500/5', border: 'hover:border-pink-500/20' },
              { icon: Radio, title: 'Sound Effects', desc: 'Any sound from text', color: 'text-purple-400', gradient: 'from-purple-500/10 to-indigo-500/5', border: 'hover:border-purple-500/20' },
              { icon: Users, title: 'Voice Cloning', desc: 'Clone any voice instantly', color: 'text-emerald-400', gradient: 'from-emerald-500/10 to-teal-500/5', border: 'hover:border-emerald-500/20' },
              { icon: Wand2, title: 'Voice Design', desc: 'Create voices from scratch', color: 'text-amber-400', gradient: 'from-amber-500/10 to-orange-500/5', border: 'hover:border-amber-500/20' },
              { icon: Mic, title: 'Speech to Text', desc: 'Transcribe 90+ languages', color: 'text-orange-400', gradient: 'from-orange-500/10 to-red-500/5', border: 'hover:border-orange-500/20' },
              { icon: Headphones, title: 'Audio Isolation', desc: 'Remove background noise', color: 'text-sky-400', gradient: 'from-sky-500/10 to-blue-500/5', border: 'hover:border-sky-500/20' },
              { icon: Globe, title: 'AI Dubbing', desc: 'Dub to any language', color: 'text-rose-400', gradient: 'from-rose-500/10 to-pink-500/5', border: 'hover:border-rose-500/20' },
            ].map((feature, i) => (
              <div key={i} className={`group p-5 rounded-2xl bg-gradient-to-br ${feature.gradient} border border-white/[0.04] ${feature.border} transition-all duration-500 hover:translate-y-[-2px]`}>
                <div className="w-11 h-11 rounded-xl bg-white/[0.05] flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <h4 className="text-sm font-bold text-white/80 mb-1" style={{ fontFamily: 'Fredoka' }}>{feature.title}</h4>
                <p className="text-[11px] text-white/30 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer - matching app style */}
      <footer className="border-t border-white/[0.04] py-10 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={IMAGES.mascot} alt="Foxy" className="w-7 h-7 object-contain" />
            <span className="text-sm font-bold" style={{ fontFamily: 'Fredoka' }}>
              <span className="text-orange-400">Foxy</span>{' '}
              <span className="text-white/60">Code</span>
            </span>
            <span className="text-white/20 mx-2">×</span>
            <ElevenLabsLogo className="w-4 h-4 text-white/50" />
            <span className="text-sm text-white/50 font-medium">ElevenLabs</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xs text-white/25 hover:text-orange-400 transition-colors font-medium">Home</Link>
            <Link to="/ai" className="text-xs text-white/25 hover:text-purple-400 transition-colors font-medium">AI Tools</Link>
            <Link to="/ai/chat" className="text-xs text-white/25 hover:text-cyan-400 transition-colors font-medium">AI Chat</Link>
          </div>
          <p className="text-[11px] text-white/15">© 2026 Foxy Code Animation Studio</p>
        </div>
      </footer>
    </div>
  );
};

export default ElevenLabs;