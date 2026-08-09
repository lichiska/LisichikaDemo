import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mic, Volume2, Wand2, Upload, Play, Pause, Download, Loader2, Music, AudioLines, Languages, Sparkles, Users, Radio, Headphones, Globe, FileAudio } from 'lucide-react';
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

  // Active tab for mobile scrolling
  const [activeTab, setActiveTab] = useState('tts');

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
    if (!ttsText.trim()) {
      toast.error('Please enter some text to convert to speech.');
      return;
    }
    if (!selectedVoice) {
      toast.error('Please select a voice first.');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(`${API_BASE}/text-to-speech/${selectedVoice}`, {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: ttsText,
          model_id: selectedModel,
          voice_settings: {
            stability: stability[0],
            similarity_boost: similarityBoost[0],
            style: style[0],
            use_speaker_boost: true,
          },
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.detail?.message || 'Failed to generate speech');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio: GeneratedAudio = {
        url,
        filename: `speech_${Date.now()}.mp3`,
        timestamp: Date.now(),
        type: 'Speech',
      };
      setGeneratedAudios((prev) => [audio, ...prev]);
      toast.success('Speech generated successfully!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Generation failed';
      toast.error(message);
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSoundEffect = async () => {
    if (!sfxText.trim()) {
      toast.error('Please describe the sound effect.');
      return;
    }

    setIsGeneratingSfx(true);
    try {
      const body: Record<string, unknown> = { text: sfxText };
      if (sfxDuration) body.duration_seconds = parseFloat(sfxDuration);

      const response = await fetch(`${API_BASE}/sound-generation`, {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.detail?.message || 'Failed to generate sound effect');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio: GeneratedAudio = {
        url,
        filename: `sfx_${Date.now()}.mp3`,
        timestamp: Date.now(),
        type: 'Sound Effect',
      };
      setGeneratedAudios((prev) => [audio, ...prev]);
      toast.success('Sound effect generated!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Generation failed';
      toast.error(message);
      console.error(err);
    } finally {
      setIsGeneratingSfx(false);
    }
  };

  const cloneVoice = async () => {
    if (!cloneName.trim()) {
      toast.error('Please enter a name for the cloned voice.');
      return;
    }
    if (cloneFiles.length === 0) {
      toast.error('Please upload at least one audio sample.');
      return;
    }

    setIsCloning(true);
    try {
      const formData = new FormData();
      formData.append('name', cloneName);
      formData.append('description', cloneDescription);
      cloneFiles.forEach((file) => formData.append('files', file));

      const response = await fetch(`${API_BASE}/voices/add`, {
        method: 'POST',
        headers: { 'xi-api-key': ELEVENLABS_API_KEY },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.detail?.message || 'Failed to clone voice');
      }

      toast.success(`Voice "${cloneName}" cloned successfully!`);
      setCloneName('');
      setCloneDescription('');
      setCloneFiles([]);
      setVoicesLoaded(false);
      fetchVoices();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Cloning failed';
      toast.error(message);
      console.error(err);
    } finally {
      setIsCloning(false);
    }
  };

  const transcribeAudio = async () => {
    if (!sttFile) {
      toast.error('Please upload an audio file to transcribe.');
      return;
    }

    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('file', sttFile);
      formData.append('model_id', 'scribe_v1');

      const response = await fetch(`${API_BASE}/speech-to-text`, {
        method: 'POST',
        headers: { 'xi-api-key': ELEVENLABS_API_KEY },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.detail?.message || 'Transcription failed');
      }

      const data = await response.json();
      setSttResult(data.text || JSON.stringify(data, null, 2));
      toast.success('Transcription complete!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Transcription failed';
      toast.error(message);
      console.error(err);
    } finally {
      setIsTranscribing(false);
    }
  };

  const designVoice = async () => {
    if (!vdText.trim()) {
      toast.error('Please enter preview text.');
      return;
    }

    setIsDesigning(true);
    try {
      const response = await fetch(`${API_BASE}/voice-generation/generate-voice/preview`, {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voice_description: `A ${vdAge} ${vdGender} with a ${vdAccent} accent`,
          text: vdText,
          gender: vdGender,
          age: vdAge,
          accent: vdAccent,
          accent_strength: vdAccentStrength[0],
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.detail?.message || 'Voice design failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio: GeneratedAudio = {
        url,
        filename: `voice_design_${Date.now()}.mp3`,
        timestamp: Date.now(),
        type: 'Voice Design',
      };
      setGeneratedAudios((prev) => [audio, ...prev]);
      toast.success('Voice design preview generated!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Voice design failed';
      toast.error(message);
      console.error(err);
    } finally {
      setIsDesigning(false);
    }
  };

  const isolateAudio = async () => {
    if (!isolationFile) {
      toast.error('Please upload an audio file.');
      return;
    }

    setIsIsolating(true);
    try {
      const formData = new FormData();
      formData.append('audio', isolationFile);

      const response = await fetch(`${API_BASE}/audio-isolation`, {
        method: 'POST',
        headers: { 'xi-api-key': ELEVENLABS_API_KEY },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.detail?.message || 'Audio isolation failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio: GeneratedAudio = {
        url,
        filename: `isolated_${Date.now()}.mp3`,
        timestamp: Date.now(),
        type: 'Isolated Audio',
      };
      setGeneratedAudios((prev) => [audio, ...prev]);
      toast.success('Audio isolated successfully! Background noise removed.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Isolation failed';
      toast.error(message);
      console.error(err);
    } finally {
      setIsIsolating(false);
    }
  };

  const dubAudio = async () => {
    if (!dubbingFile) {
      toast.error('Please upload an audio/video file to dub.');
      return;
    }

    setIsDubbing(true);
    setDubbingResult('');
    try {
      const formData = new FormData();
      formData.append('file', dubbingFile);
      formData.append('source_lang', dubbingSourceLang);
      formData.append('target_lang', dubbingTargetLang);
      formData.append('mode', 'automatic');
      formData.append('num_speakers', '0');

      const response = await fetch(`${API_BASE}/dubbing`, {
        method: 'POST',
        headers: { 'xi-api-key': ELEVENLABS_API_KEY },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.detail?.message || 'Dubbing failed');
      }

      const data = await response.json();
      setDubbingResult(`Dubbing job started! ID: ${data.dubbing_id}\nExpected duration: ~${data.expected_duration_sec || 'unknown'}s\n\nThe dubbing is processing. You can check the status using the dubbing ID.`);
      toast.success('Dubbing job submitted successfully!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Dubbing failed';
      toast.error(message);
      console.error(err);
    } finally {
      setIsDubbing(false);
    }
  };

  const generateMusic = async () => {
    if (!musicPrompt.trim() && !musicLyrics.trim()) {
      toast.error('Please enter a music prompt or lyrics.');
      return;
    }

    setIsGeneratingMusic(true);
    try {
      // Build the full prompt with all options
      let fullPrompt = musicPrompt;
      if (musicGenre && musicGenre !== 'any') fullPrompt += ` Genre: ${musicGenre}.`;
      if (musicMood && musicMood !== 'any') fullPrompt += ` Mood: ${musicMood}.`;
      if (musicTempo && musicTempo !== 'any') fullPrompt += ` Tempo: ${musicTempo}.`;
      if (musicInstrumental) fullPrompt += ' Instrumental only, no vocals.';
      if (musicLyrics.trim() && !musicInstrumental) fullPrompt += ` Lyrics: ${musicLyrics}`;

      const body: Record<string, unknown> = {
        text: fullPrompt.trim(),
      };
      if (musicDuration) body.duration_seconds = parseFloat(musicDuration);

      // Use sound generation endpoint for music creation
      const response = await fetch(`${API_BASE}/sound-generation`, {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.detail?.message || 'Music generation failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio: GeneratedAudio = {
        url,
        filename: `music_${musicGenre}_${Date.now()}.mp3`,
        timestamp: Date.now(),
        type: 'Music',
      };
      setGeneratedAudios((prev) => [audio, ...prev]);
      toast.success('Music generated successfully!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Music generation failed';
      toast.error(message);
      console.error(err);
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  const playAudio = (url: string) => {
    if (playingUrl === url) {
      audioRef.current?.pause();
      setPlayingUrl(null);
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(url);
    audio.onended = () => setPlayingUrl(null);
    audio.play();
    audioRef.current = audio;
    setPlayingUrl(url);
  };

  const downloadAudio = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const tabItems = [
    { value: 'tts', label: 'Text to Speech', icon: Volume2 },
    { value: 'music', label: 'Music', icon: Music },
    { value: 'sfx', label: 'Sound Effects', icon: Radio },
    { value: 'clone', label: 'Voice Clone', icon: Users },
    { value: 'design', label: 'Voice Design', icon: Wand2 },
    { value: 'stt', label: 'Speech to Text', icon: Mic },
    { value: 'isolation', label: 'Audio Isolation', icon: Headphones },
    { value: 'dubbing', label: 'Dubbing', icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-[#060411] text-white overflow-x-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[200px] opacity-10 bg-blue-600" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[180px] opacity-10 bg-cyan-600" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[150px] opacity-5 bg-indigo-500" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#060411]/80 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/ai"
              className="flex items-center gap-2 text-white/50 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm font-medium">Back to AI Tools</span>
            </Link>
            <div className="w-px h-5 bg-white/10" />
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <AudioLines className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-base" style={{ fontFamily: 'Fredoka' }}>
                <span className="text-blue-400">ElevenLabs</span>{' '}
                <span className="text-white/80">AI Audio</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-bold text-blue-300">All Features</span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-10 pb-4 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black leading-[0.9] mb-3" style={{ fontFamily: 'Fredoka' }}>
            <span className="text-white">AI-Powered </span>
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              Audio Studio
            </span>
          </h1>
          <p className="text-white/40 text-base max-w-2xl mx-auto leading-relaxed">
            Generate speech, music, sound effects, clone voices, design new voices, isolate audio, dub content, and transcribe — all powered by ElevenLabs.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative z-10 py-6 px-6">
        <div className="max-w-5xl mx-auto">
          <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); if (val === 'tts' || val === 'clone') fetchVoices(); }} className="w-full">
            {/* Tab Navigation - Scrollable on mobile */}
            <div className="overflow-x-auto pb-2 mb-6 -mx-2 px-2">
              <TabsList className="inline-flex w-auto min-w-full md:grid md:grid-cols-8 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1">
                {tabItems.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="rounded-lg data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 text-white/50 font-medium text-xs gap-1.5 whitespace-nowrap px-3 py-2"
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* TEXT TO SPEECH */}
            <TabsContent value="tts" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-5">
                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <Label className="text-white/60 text-sm font-medium mb-2 block">Enter Text</Label>
                    <Textarea
                      value={ttsText}
                      onChange={(e) => setTtsText(e.target.value)}
                      placeholder="Type or paste the text you want to convert to speech..."
                      className="min-h-[160px] bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/25 resize-none focus:border-blue-500/40"
                    />
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs text-white/30">{ttsText.length} characters</span>
                      <Button
                        onClick={generateSpeech}
                        disabled={isGenerating || !ttsText.trim() || !selectedVoice}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold px-6"
                      >
                        {isGenerating ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
                        ) : (
                          <><Wand2 className="w-4 h-4 mr-2" />Generate Speech</>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4">
                    <div>
                      <Label className="text-white/60 text-sm font-medium mb-2 block">Voice</Label>
                      {loadingVoices ? (
                        <div className="flex items-center gap-2 text-white/40 text-sm">
                          <Loader2 className="w-4 h-4 animate-spin" />Loading voices...
                        </div>
                      ) : (
                        <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                          <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-white">
                            <SelectValue placeholder="Select a voice" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0f0b1e] border-white/[0.1] max-h-[300px]">
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
                      <Label className="text-white/60 text-sm font-medium mb-2 block">Model</Label>
                      <Select value={selectedModel} onValueChange={setSelectedModel}>
                        <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0f0b1e] border-white/[0.1]">
                          <SelectItem value="eleven_multilingual_v2" className="text-white hover:bg-white/[0.05]">Multilingual v2 (29 langs)</SelectItem>
                          <SelectItem value="eleven_turbo_v2_5" className="text-white hover:bg-white/[0.05]">Turbo v2.5 (Fastest)</SelectItem>
                          <SelectItem value="eleven_turbo_v2" className="text-white hover:bg-white/[0.05]">Turbo v2</SelectItem>
                          <SelectItem value="eleven_monolingual_v1" className="text-white hover:bg-white/[0.05]">English v1</SelectItem>
                          <SelectItem value="eleven_multilingual_v1" className="text-white hover:bg-white/[0.05]">Multilingual v1</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-white/60 text-sm font-medium mb-1.5 block">Stability: {stability[0].toFixed(2)}</Label>
                      <Slider value={stability} onValueChange={setStability} min={0} max={1} step={0.01} className="[&_[role=slider]]:bg-blue-400" />
                      <p className="text-[10px] text-white/20 mt-0.5">Lower = expressive, Higher = consistent</p>
                    </div>

                    <div>
                      <Label className="text-white/60 text-sm font-medium mb-1.5 block">Similarity: {similarityBoost[0].toFixed(2)}</Label>
                      <Slider value={similarityBoost} onValueChange={setSimilarityBoost} min={0} max={1} step={0.01} className="[&_[role=slider]]:bg-cyan-400" />
                    </div>

                    <div>
                      <Label className="text-white/60 text-sm font-medium mb-1.5 block">Style: {style[0].toFixed(2)}</Label>
                      <Slider value={style} onValueChange={setStyle} min={0} max={1} step={0.01} className="[&_[role=slider]]:bg-teal-400" />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* MUSIC GENERATION */}
            <TabsContent value="music" className="space-y-6">
              <div className="max-w-3xl mx-auto">
                <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-5">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-3">
                      <Music className="w-8 h-8 text-pink-400" />
                    </div>
                    <h3 className="text-xl font-bold" style={{ fontFamily: 'Fredoka' }}>AI Music Generation</h3>
                    <p className="text-white/35 text-sm mt-1">Create original music with AI — add lyrics, choose genre, mood, and tempo</p>
                  </div>

                  <div>
                    <Label className="text-white/60 text-sm font-medium mb-2 block">Music Description / Prompt</Label>
                    <Textarea
                      value={musicPrompt}
                      onChange={(e) => setMusicPrompt(e.target.value)}
                      placeholder="e.g., An upbeat electronic dance track with synth pads, driving bass, and energetic drums..."
                      className="min-h-[100px] bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/25 resize-none focus:border-pink-500/40"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-white/60 text-sm font-medium mb-2 block">Genre</Label>
                      <Select value={musicGenre} onValueChange={setMusicGenre}>
                        <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0f0b1e] border-white/[0.1]">
                          <SelectItem value="any" className="text-white hover:bg-white/[0.05]">Any Genre</SelectItem>
                          <SelectItem value="pop" className="text-white hover:bg-white/[0.05]">Pop</SelectItem>
                          <SelectItem value="rock" className="text-white hover:bg-white/[0.05]">Rock</SelectItem>
                          <SelectItem value="electronic" className="text-white hover:bg-white/[0.05]">Electronic / EDM</SelectItem>
                          <SelectItem value="hip-hop" className="text-white hover:bg-white/[0.05]">Hip-Hop / Rap</SelectItem>
                          <SelectItem value="jazz" className="text-white hover:bg-white/[0.05]">Jazz</SelectItem>
                          <SelectItem value="classical" className="text-white hover:bg-white/[0.05]">Classical</SelectItem>
                          <SelectItem value="r&b" className="text-white hover:bg-white/[0.05]">R&B / Soul</SelectItem>
                          <SelectItem value="country" className="text-white hover:bg-white/[0.05]">Country</SelectItem>
                          <SelectItem value="ambient" className="text-white hover:bg-white/[0.05]">Ambient / Chill</SelectItem>
                          <SelectItem value="metal" className="text-white hover:bg-white/[0.05]">Metal</SelectItem>
                          <SelectItem value="folk" className="text-white hover:bg-white/[0.05]">Folk / Acoustic</SelectItem>
                          <SelectItem value="reggae" className="text-white hover:bg-white/[0.05]">Reggae</SelectItem>
                          <SelectItem value="latin" className="text-white hover:bg-white/[0.05]">Latin</SelectItem>
                          <SelectItem value="lo-fi" className="text-white hover:bg-white/[0.05]">Lo-Fi</SelectItem>
                          <SelectItem value="cinematic" className="text-white hover:bg-white/[0.05]">Cinematic / Film Score</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-white/60 text-sm font-medium mb-2 block">Mood</Label>
                      <Select value={musicMood} onValueChange={setMusicMood}>
                        <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0f0b1e] border-white/[0.1]">
                          <SelectItem value="any" className="text-white hover:bg-white/[0.05]">Any Mood</SelectItem>
                          <SelectItem value="upbeat" className="text-white hover:bg-white/[0.05]">Upbeat / Happy</SelectItem>
                          <SelectItem value="sad" className="text-white hover:bg-white/[0.05]">Sad / Melancholic</SelectItem>
                          <SelectItem value="energetic" className="text-white hover:bg-white/[0.05]">Energetic / Hype</SelectItem>
                          <SelectItem value="calm" className="text-white hover:bg-white/[0.05]">Calm / Relaxing</SelectItem>
                          <SelectItem value="dark" className="text-white hover:bg-white/[0.05]">Dark / Moody</SelectItem>
                          <SelectItem value="romantic" className="text-white hover:bg-white/[0.05]">Romantic</SelectItem>
                          <SelectItem value="epic" className="text-white hover:bg-white/[0.05]">Epic / Cinematic</SelectItem>
                          <SelectItem value="mysterious" className="text-white hover:bg-white/[0.05]">Mysterious</SelectItem>
                          <SelectItem value="aggressive" className="text-white hover:bg-white/[0.05]">Aggressive</SelectItem>
                          <SelectItem value="dreamy" className="text-white hover:bg-white/[0.05]">Dreamy</SelectItem>
                          <SelectItem value="nostalgic" className="text-white hover:bg-white/[0.05]">Nostalgic</SelectItem>
                          <SelectItem value="playful" className="text-white hover:bg-white/[0.05]">Playful / Fun</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-white/60 text-sm font-medium mb-2 block">Tempo</Label>
                      <Select value={musicTempo} onValueChange={setMusicTempo}>
                        <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0f0b1e] border-white/[0.1]">
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
                      <Label className="text-white/60 text-sm font-medium">Lyrics (optional)</Label>
                      <div className="flex items-center gap-2">
                        <Label className="text-white/40 text-xs">Instrumental only</Label>
                        <Switch checked={musicInstrumental} onCheckedChange={setMusicInstrumental} />
                      </div>
                    </div>
                    {!musicInstrumental && (
                      <Textarea
                        value={musicLyrics}
                        onChange={(e) => setMusicLyrics(e.target.value)}
                        placeholder={"[Verse 1]\nWrite your lyrics here...\n\n[Chorus]\nThe catchy part goes here..."}
                        className="min-h-[120px] bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/25 resize-none focus:border-pink-500/40 font-mono text-sm"
                      />
                    )}
                  </div>

                  <div>
                    <Label className="text-white/60 text-sm font-medium mb-2 block">Duration (seconds)</Label>
                    <div className="flex gap-2">
                      {['10', '15', '22', '30'].map((d) => (
                        <Button
                          key={d}
                          variant={musicDuration === d ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setMusicDuration(d)}
                          className={musicDuration === d ? 'bg-pink-500/20 text-pink-300 border-pink-500/30' : 'bg-white/[0.03] border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.05]'}
                        >
                          {d}s
                        </Button>
                      ))}
                      <Input
                        type="number"
                        value={musicDuration}
                        onChange={(e) => setMusicDuration(e.target.value)}
                        className="w-20 bg-white/[0.03] border-white/[0.08] text-white text-sm"
                        min="1"
                        max="60"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={generateMusic}
                    disabled={isGeneratingMusic || (!musicPrompt.trim() && !musicLyrics.trim())}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-3"
                  >
                    {isGeneratingMusic ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating Music...</>
                    ) : (
                      <><Music className="w-4 h-4 mr-2" />Generate Music</>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* SOUND EFFECTS */}
            <TabsContent value="sfx" className="space-y-6">
              <div className="max-w-2xl mx-auto">
                <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-5">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-purple-500/15 flex items-center justify-center mx-auto mb-3">
                      <Radio className="w-8 h-8 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold" style={{ fontFamily: 'Fredoka' }}>AI Sound Effects</h3>
                    <p className="text-white/35 text-sm mt-1">Describe any sound and AI will generate it</p>
                  </div>

                  <div>
                    <Label className="text-white/60 text-sm font-medium mb-2 block">Describe the Sound</Label>
                    <Textarea
                      value={sfxText}
                      onChange={(e) => setSfxText(e.target.value)}
                      placeholder="e.g., A thunderstorm with heavy rain and distant thunder rumbling, footsteps on gravel, sci-fi laser blast..."
                      className="min-h-[120px] bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/25 resize-none focus:border-purple-500/40"
                    />
                  </div>

                  <div>
                    <Label className="text-white/60 text-sm font-medium mb-2 block">Duration (seconds, optional)</Label>
                    <div className="flex gap-2">
                      {['2', '5', '10', '15', '22'].map((d) => (
                        <Button
                          key={d}
                          variant={sfxDuration === d ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSfxDuration(d)}
                          className={sfxDuration === d ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-white/[0.03] border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.05]'}
                        >
                          {d}s
                        </Button>
                      ))}
                      <Button
                        variant={sfxDuration === '' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSfxDuration('')}
                        className={sfxDuration === '' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-white/[0.03] border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.05]'}
                      >
                        Auto
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={generateSoundEffect}
                    disabled={isGeneratingSfx || !sfxText.trim()}
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold"
                  >
                    {isGeneratingSfx ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating Sound...</>
                    ) : (
                      <><Sparkles className="w-4 h-4 mr-2" />Generate Sound Effect</>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* VOICE CLONING */}
            <TabsContent value="clone" className="space-y-6">
              <div className="max-w-2xl mx-auto">
                <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-5">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center mx-auto mb-3">
                      <Users className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold" style={{ fontFamily: 'Fredoka' }}>Instant Voice Cloning</h3>
                    <p className="text-white/35 text-sm mt-1">Upload audio samples to create a custom voice clone</p>
                  </div>

                  <div>
                    <Label className="text-white/60 text-sm font-medium mb-2 block">Voice Name</Label>
                    <Input
                      value={cloneName}
                      onChange={(e) => setCloneName(e.target.value)}
                      placeholder="e.g., My Custom Voice"
                      className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/25 focus:border-emerald-500/40"
                    />
                  </div>

                  <div>
                    <Label className="text-white/60 text-sm font-medium mb-2 block">Description (optional)</Label>
                    <Input
                      value={cloneDescription}
                      onChange={(e) => setCloneDescription(e.target.value)}
                      placeholder="Describe the voice characteristics..."
                      className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/25 focus:border-emerald-500/40"
                    />
                  </div>

                  <div>
                    <Label className="text-white/60 text-sm font-medium mb-2 block">Audio Samples</Label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-white/[0.1] rounded-xl p-6 text-center cursor-pointer hover:border-emerald-500/30 transition-colors"
                    >
                      <Upload className="w-8 h-8 text-white/30 mx-auto mb-2" />
                      <p className="text-white/40 text-sm">Click to upload audio files</p>
                      <p className="text-white/20 text-xs mt-1">MP3, WAV, M4A • Min 1 sample • Best with 3+ samples of 1-2 min each</p>
                      {cloneFiles.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {cloneFiles.map((f, i) => (
                            <p key={i} className="text-emerald-400 text-xs">{f.name}</p>
                          ))}
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*"
                      multiple
                      className="hidden"
                      onChange={(e) => { if (e.target.files) setCloneFiles(Array.from(e.target.files)); }}
                    />
                  </div>

                  <Button
                    onClick={cloneVoice}
                    disabled={isCloning || !cloneName.trim() || cloneFiles.length === 0}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold"
                  >
                    {isCloning ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Cloning Voice...</>
                    ) : (
                      <><Wand2 className="w-4 h-4 mr-2" />Clone Voice</>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* VOICE DESIGN */}
            <TabsContent value="design" className="space-y-6">
              <div className="max-w-2xl mx-auto">
                <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-5">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/15 flex items-center justify-center mx-auto mb-3">
                      <Wand2 className="w-8 h-8 text-amber-400" />
                    </div>
                    <h3 className="text-xl font-bold" style={{ fontFamily: 'Fredoka' }}>Voice Design Lab</h3>
                    <p className="text-white/35 text-sm mt-1">Create entirely new synthetic voices from scratch</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-white/60 text-sm font-medium mb-2 block">Gender</Label>
                      <Select value={vdGender} onValueChange={setVdGender}>
                        <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0f0b1e] border-white/[0.1]">
                          <SelectItem value="female" className="text-white hover:bg-white/[0.05]">Female</SelectItem>
                          <SelectItem value="male" className="text-white hover:bg-white/[0.05]">Male</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-white/60 text-sm font-medium mb-2 block">Age</Label>
                      <Select value={vdAge} onValueChange={setVdAge}>
                        <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0f0b1e] border-white/[0.1]">
                          <SelectItem value="young" className="text-white hover:bg-white/[0.05]">Young</SelectItem>
                          <SelectItem value="middle_aged" className="text-white hover:bg-white/[0.05]">Middle Aged</SelectItem>
                          <SelectItem value="old" className="text-white hover:bg-white/[0.05]">Old</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-white/60 text-sm font-medium mb-2 block">Accent</Label>
                      <Select value={vdAccent} onValueChange={setVdAccent}>
                        <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0f0b1e] border-white/[0.1]">
                          <SelectItem value="american" className="text-white hover:bg-white/[0.05]">American</SelectItem>
                          <SelectItem value="british" className="text-white hover:bg-white/[0.05]">British</SelectItem>
                          <SelectItem value="australian" className="text-white hover:bg-white/[0.05]">Australian</SelectItem>
                          <SelectItem value="indian" className="text-white hover:bg-white/[0.05]">Indian</SelectItem>
                          <SelectItem value="african" className="text-white hover:bg-white/[0.05]">African</SelectItem>
                          <SelectItem value="irish" className="text-white hover:bg-white/[0.05]">Irish</SelectItem>
                          <SelectItem value="italian" className="text-white hover:bg-white/[0.05]">Italian</SelectItem>
                          <SelectItem value="swedish" className="text-white hover:bg-white/[0.05]">Swedish</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-white/60 text-sm font-medium mb-1.5 block">Accent Strength: {vdAccentStrength[0].toFixed(1)}</Label>
                    <Slider value={vdAccentStrength} onValueChange={setVdAccentStrength} min={0.3} max={2.0} step={0.1} className="[&_[role=slider]]:bg-amber-400" />
                    <p className="text-[10px] text-white/20 mt-0.5">Higher = stronger accent</p>
                  </div>

                  <div>
                    <Label className="text-white/60 text-sm font-medium mb-2 block">Preview Text</Label>
                    <Textarea
                      value={vdText}
                      onChange={(e) => setVdText(e.target.value)}
                      placeholder="Enter text to preview the designed voice..."
                      className="min-h-[80px] bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/25 resize-none focus:border-amber-500/40"
                    />
                  </div>

                  <Button
                    onClick={designVoice}
                    disabled={isDesigning || !vdText.trim()}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold"
                  >
                    {isDesigning ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Designing Voice...</>
                    ) : (
                      <><Sparkles className="w-4 h-4 mr-2" />Generate Voice Preview</>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* SPEECH TO TEXT */}
            <TabsContent value="stt" className="space-y-6">
              <div className="max-w-2xl mx-auto">
                <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-5">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-orange-500/15 flex items-center justify-center mx-auto mb-3">
                      <Mic className="w-8 h-8 text-orange-400" />
                    </div>
                    <h3 className="text-xl font-bold" style={{ fontFamily: 'Fredoka' }}>Speech to Text</h3>
                    <p className="text-white/35 text-sm mt-1">Transcribe audio files with high accuracy in 90+ languages</p>
                  </div>

                  <div>
                    <Label className="text-white/60 text-sm font-medium mb-2 block">Upload Audio File</Label>
                    <div
                      onClick={() => sttFileInputRef.current?.click()}
                      className="border-2 border-dashed border-white/[0.1] rounded-xl p-6 text-center cursor-pointer hover:border-orange-500/30 transition-colors"
                    >
                      <Upload className="w-8 h-8 text-white/30 mx-auto mb-2" />
                      <p className="text-white/40 text-sm">Click to upload an audio file</p>
                      <p className="text-white/20 text-xs mt-1">MP3, WAV, M4A, FLAC, OGG, WEBM</p>
                      {sttFile && <p className="text-orange-400 text-xs mt-3">{sttFile.name}</p>}
                    </div>
                    <input
                      ref={sttFileInputRef}
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => { if (e.target.files?.[0]) setSttFile(e.target.files[0]); }}
                    />
                  </div>

                  <Button
                    onClick={transcribeAudio}
                    disabled={isTranscribing || !sttFile}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold"
                  >
                    {isTranscribing ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Transcribing...</>
                    ) : (
                      <><Languages className="w-4 h-4 mr-2" />Transcribe Audio</>
                    )}
                  </Button>

                  {sttResult && (
                    <div className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <Label className="text-white/60 text-sm font-medium mb-2 block">Transcription Result</Label>
                      <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{sttResult}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { navigator.clipboard.writeText(sttResult); toast.success('Copied to clipboard!'); }}
                        className="mt-3 text-white/40 hover:text-white text-xs"
                      >
                        Copy to clipboard
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* AUDIO ISOLATION */}
            <TabsContent value="isolation" className="space-y-6">
              <div className="max-w-2xl mx-auto">
                <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-5">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-sky-500/15 flex items-center justify-center mx-auto mb-3">
                      <Headphones className="w-8 h-8 text-sky-400" />
                    </div>
                    <h3 className="text-xl font-bold" style={{ fontFamily: 'Fredoka' }}>Audio Isolation</h3>
                    <p className="text-white/35 text-sm mt-1">Remove background noise and isolate vocals from any audio</p>
                  </div>

                  <div>
                    <Label className="text-white/60 text-sm font-medium mb-2 block">Upload Audio File</Label>
                    <div
                      onClick={() => isolationFileInputRef.current?.click()}
                      className="border-2 border-dashed border-white/[0.1] rounded-xl p-6 text-center cursor-pointer hover:border-sky-500/30 transition-colors"
                    >
                      <Upload className="w-8 h-8 text-white/30 mx-auto mb-2" />
                      <p className="text-white/40 text-sm">Click to upload audio with background noise</p>
                      <p className="text-white/20 text-xs mt-1">MP3, WAV, M4A • Isolates voice from music/noise</p>
                      {isolationFile && <p className="text-sky-400 text-xs mt-3">{isolationFile.name}</p>}
                    </div>
                    <input
                      ref={isolationFileInputRef}
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => { if (e.target.files?.[0]) setIsolationFile(e.target.files[0]); }}
                    />
                  </div>

                  <Button
                    onClick={isolateAudio}
                    disabled={isIsolating || !isolationFile}
                    className="w-full bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white font-bold"
                  >
                    {isIsolating ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Isolating Audio...</>
                    ) : (
                      <><Headphones className="w-4 h-4 mr-2" />Isolate Vocals</>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* DUBBING */}
            <TabsContent value="dubbing" className="space-y-6">
              <div className="max-w-2xl mx-auto">
                <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-5">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-rose-500/15 flex items-center justify-center mx-auto mb-3">
                      <Globe className="w-8 h-8 text-rose-400" />
                    </div>
                    <h3 className="text-xl font-bold" style={{ fontFamily: 'Fredoka' }}>AI Dubbing</h3>
                    <p className="text-white/35 text-sm mt-1">Automatically dub audio/video content into other languages</p>
                  </div>

                  <div>
                    <Label className="text-white/60 text-sm font-medium mb-2 block">Upload Audio/Video File</Label>
                    <div
                      onClick={() => dubbingFileInputRef.current?.click()}
                      className="border-2 border-dashed border-white/[0.1] rounded-xl p-6 text-center cursor-pointer hover:border-rose-500/30 transition-colors"
                    >
                      <Upload className="w-8 h-8 text-white/30 mx-auto mb-2" />
                      <p className="text-white/40 text-sm">Click to upload audio or video file</p>
                      <p className="text-white/20 text-xs mt-1">MP3, WAV, MP4, MOV, MKV</p>
                      {dubbingFile && <p className="text-rose-400 text-xs mt-3">{dubbingFile.name}</p>}
                    </div>
                    <input
                      ref={dubbingFileInputRef}
                      type="file"
                      accept="audio/*,video/*"
                      className="hidden"
                      onChange={(e) => { if (e.target.files?.[0]) setDubbingFile(e.target.files[0]); }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white/60 text-sm font-medium mb-2 block">Source Language</Label>
                      <Select value={dubbingSourceLang} onValueChange={setDubbingSourceLang}>
                        <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0f0b1e] border-white/[0.1]">
                          <SelectItem value="en" className="text-white hover:bg-white/[0.05]">English</SelectItem>
                          <SelectItem value="es" className="text-white hover:bg-white/[0.05]">Spanish</SelectItem>
                          <SelectItem value="fr" className="text-white hover:bg-white/[0.05]">French</SelectItem>
                          <SelectItem value="de" className="text-white hover:bg-white/[0.05]">German</SelectItem>
                          <SelectItem value="it" className="text-white hover:bg-white/[0.05]">Italian</SelectItem>
                          <SelectItem value="pt" className="text-white hover:bg-white/[0.05]">Portuguese</SelectItem>
                          <SelectItem value="ja" className="text-white hover:bg-white/[0.05]">Japanese</SelectItem>
                          <SelectItem value="ko" className="text-white hover:bg-white/[0.05]">Korean</SelectItem>
                          <SelectItem value="zh" className="text-white hover:bg-white/[0.05]">Chinese</SelectItem>
                          <SelectItem value="hi" className="text-white hover:bg-white/[0.05]">Hindi</SelectItem>
                          <SelectItem value="ar" className="text-white hover:bg-white/[0.05]">Arabic</SelectItem>
                          <SelectItem value="ru" className="text-white hover:bg-white/[0.05]">Russian</SelectItem>
                          <SelectItem value="pl" className="text-white hover:bg-white/[0.05]">Polish</SelectItem>
                          <SelectItem value="tr" className="text-white hover:bg-white/[0.05]">Turkish</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-white/60 text-sm font-medium mb-2 block">Target Language</Label>
                      <Select value={dubbingTargetLang} onValueChange={setDubbingTargetLang}>
                        <SelectTrigger className="bg-white/[0.03] border-white/[0.08] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0f0b1e] border-white/[0.1]">
                          <SelectItem value="en" className="text-white hover:bg-white/[0.05]">English</SelectItem>
                          <SelectItem value="es" className="text-white hover:bg-white/[0.05]">Spanish</SelectItem>
                          <SelectItem value="fr" className="text-white hover:bg-white/[0.05]">French</SelectItem>
                          <SelectItem value="de" className="text-white hover:bg-white/[0.05]">German</SelectItem>
                          <SelectItem value="it" className="text-white hover:bg-white/[0.05]">Italian</SelectItem>
                          <SelectItem value="pt" className="text-white hover:bg-white/[0.05]">Portuguese</SelectItem>
                          <SelectItem value="ja" className="text-white hover:bg-white/[0.05]">Japanese</SelectItem>
                          <SelectItem value="ko" className="text-white hover:bg-white/[0.05]">Korean</SelectItem>
                          <SelectItem value="zh" className="text-white hover:bg-white/[0.05]">Chinese</SelectItem>
                          <SelectItem value="hi" className="text-white hover:bg-white/[0.05]">Hindi</SelectItem>
                          <SelectItem value="ar" className="text-white hover:bg-white/[0.05]">Arabic</SelectItem>
                          <SelectItem value="ru" className="text-white hover:bg-white/[0.05]">Russian</SelectItem>
                          <SelectItem value="pl" className="text-white hover:bg-white/[0.05]">Polish</SelectItem>
                          <SelectItem value="tr" className="text-white hover:bg-white/[0.05]">Turkish</SelectItem>
                          <SelectItem value="nl" className="text-white hover:bg-white/[0.05]">Dutch</SelectItem>
                          <SelectItem value="sv" className="text-white hover:bg-white/[0.05]">Swedish</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={dubAudio}
                    disabled={isDubbing || !dubbingFile}
                    className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold"
                  >
                    {isDubbing ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Starting Dubbing...</>
                    ) : (
                      <><Globe className="w-4 h-4 mr-2" />Start Dubbing</>
                    )}
                  </Button>

                  {dubbingResult && (
                    <div className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <Label className="text-white/60 text-sm font-medium mb-2 block">Dubbing Status</Label>
                      <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{dubbingResult}</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Generated Audio History */}
          {generatedAudios.length > 0 && (
            <div className="mt-10">
              <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'Fredoka' }}>
                <span className="text-white/60">Generated Audio</span>
                <span className="text-white/20 text-sm font-normal ml-2">({generatedAudios.length} items)</span>
              </h3>
              <div className="space-y-3">
                {generatedAudios.map((audio) => (
                  <div
                    key={audio.timestamp}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => playAudio(audio.url)}
                      className="w-10 h-10 rounded-full bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 shrink-0"
                    >
                      {playingUrl === audio.url ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/70 font-medium truncate">{audio.filename}</p>
                      <p className="text-xs text-white/30">
                        <span className="text-blue-400/60">{audio.type}</span> • {new Date(audio.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => downloadAudio(audio.url, audio.filename)}
                      className="w-9 h-9 text-white/40 hover:text-white hover:bg-white/[0.05] shrink-0"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Overview */}
      <section className="relative z-10 py-10 px-6">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-6" style={{ fontFamily: 'Fredoka' }}>
            <span className="text-white/60">All </span>
            <span className="text-blue-400">ElevenLabs</span>
            <span className="text-white/60"> Features</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Volume2, title: 'Text to Speech', desc: '29+ languages, multiple models', color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { icon: Music, title: 'Music Generation', desc: 'Create music with lyrics & genres', color: 'text-pink-400', bg: 'bg-pink-500/10' },
              { icon: Radio, title: 'Sound Effects', desc: 'Any sound from description', color: 'text-purple-400', bg: 'bg-purple-500/10' },
              { icon: Users, title: 'Voice Cloning', desc: 'Clone any voice instantly', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { icon: Wand2, title: 'Voice Design', desc: 'Create new voices from scratch', color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { icon: Mic, title: 'Speech to Text', desc: 'Transcribe in 90+ languages', color: 'text-orange-400', bg: 'bg-orange-500/10' },
              { icon: Headphones, title: 'Audio Isolation', desc: 'Remove background noise', color: 'text-sky-400', bg: 'bg-sky-500/10' },
              { icon: Globe, title: 'AI Dubbing', desc: 'Dub content to any language', color: 'text-rose-400', bg: 'bg-rose-500/10' },
            ].map((feature, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
                <div className={`w-10 h-10 rounded-xl ${feature.bg} flex items-center justify-center mx-auto mb-2`}>
                  <feature.icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <h4 className="text-xs font-bold text-white/80 mb-0.5">{feature.title}</h4>
                <p className="text-[10px] text-white/30 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-8 px-6 relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/ai" className="text-xs text-white/30 hover:text-blue-400 transition-colors font-medium">
            ← Back to AI Tools
          </Link>
          <p className="text-[11px] text-white/20">Powered by ElevenLabs API</p>
        </div>
      </footer>
    </div>
  );
};

export default ElevenLabs;