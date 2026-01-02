
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage, Blob } from '@google/genai';

interface LiveChannelProps {
  onClose: () => void;
}

const LiveChannel: React.FC<LiveChannelProps> = ({ onClose }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [transcriptions, setTranscriptions] = useState<{ role: 'user' | 'model', text: string }[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const transcriptionRef = useRef({ user: '', model: '' });

  // Audio utility functions
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const createBlob = (data: Float32Array): Blob => {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  useEffect(() => {
    const startLiveSession = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        audioContextRef.current = outputCtx;

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true }).catch(() => {
          setHasCamera(false);
          return navigator.mediaDevices.getUserMedia({ audio: true });
        });

        if (videoRef.current && hasCamera) {
          videoRef.current.srcObject = stream;
        }

        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            systemInstruction: 'You are an expert news correspondent for SWAN NEWS, an Urdu-focused news outlet. Speak in a professional, engaging, and authoritative manner. Help the user understand current events or discuss news topics they are interested in. Keep your responses concise and naturally conversational.',
            inputAudioTranscription: {},
            outputAudioTranscription: {},
          },
          callbacks: {
            onopen: () => {
              setIsConnected(true);
              const source = inputCtx.createMediaStreamSource(stream);
              const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
              scriptProcessor.onaudioprocess = (e) => {
                if (isMuted) return;
                const inputData = e.inputBuffer.getChannelData(0);
                const pcmBlob = createBlob(inputData);
                sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
              };
              source.connect(scriptProcessor);
              scriptProcessor.connect(inputCtx.destination);

              // Video frame streaming
              if (hasCamera) {
                const interval = setInterval(() => {
                  if (videoRef.current && canvasRef.current) {
                    const ctx = canvasRef.current.getContext('2d');
                    if (ctx) {
                      canvasRef.current.width = 320;
                      canvasRef.current.height = 240;
                      ctx.drawImage(videoRef.current, 0, 0, 320, 240);
                      canvasRef.current.toBlob(async (blob) => {
                        if (blob) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const base64 = (reader.result as string).split(',')[1];
                            sessionPromise.then(s => s.sendRealtimeInput({ media: { data: base64, mimeType: 'image/jpeg' } }));
                          };
                          reader.readAsDataURL(blob);
                        }
                      }, 'image/jpeg', 0.5);
                    }
                  }
                }, 1000);
                return () => clearInterval(interval);
              }
            },
            onmessage: async (message: LiveServerMessage) => {
              // Handle Transcriptions
              if (message.serverContent?.inputTranscription) {
                transcriptionRef.current.user += message.serverContent.inputTranscription.text;
                setTranscriptions(prev => {
                  const last = prev[prev.length - 1];
                  if (last && last.role === 'user') {
                    return [...prev.slice(0, -1), { role: 'user', text: transcriptionRef.current.user }];
                  }
                  return [...prev, { role: 'user', text: transcriptionRef.current.user }];
                });
              }
              if (message.serverContent?.outputTranscription) {
                transcriptionRef.current.model += message.serverContent.outputTranscription.text;
                setTranscriptions(prev => {
                  const last = prev[prev.length - 1];
                  if (last && last.role === 'model') {
                    return [...prev.slice(0, -1), { role: 'model', text: transcriptionRef.current.model }];
                  }
                  return [...prev, { role: 'model', text: transcriptionRef.current.model }];
                });
              }
              if (message.serverContent?.turnComplete) {
                transcriptionRef.current = { user: '', model: '' };
              }

              // Handle Audio
              const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
              if (audioData) {
                const buffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
                const source = outputCtx.createBufferSource();
                source.buffer = buffer;
                source.connect(outputCtx.destination);
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += buffer.duration;
                sourcesRef.current.add(source);
                source.onended = () => sourcesRef.current.delete(source);
              }

              if (message.serverContent?.interrupted) {
                sourcesRef.current.forEach(s => s.stop());
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
              }
            },
            onclose: () => setIsConnected(false),
            onerror: (e) => console.error('Live API Error:', e),
          },
        });
        sessionRef.current = await sessionPromise;
      } catch (err) {
        console.error('Failed to start Live Channel:', err);
      }
    };

    startLiveSession();

    return () => {
      if (sessionRef.current) sessionRef.current.close();
      sourcesRef.current.forEach(s => s.stop());
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[150] bg-zinc-950 flex flex-col font-sans overflow-hidden animate-in fade-in duration-500">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-6 bg-zinc-900 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex gap-0.5">
            {['S', 'W', 'A', 'N'].map((char, i) => (
              <div key={i} className="w-8 h-8 bg-brand-red flex items-center justify-center">
                <span className="text-white font-black text-lg pt-0.5">{char}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-red-600 rounded text-[10px] font-black text-white animate-pulse">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              ON AIR
            </div>
            <span className="text-white/40 text-xs font-bold tracking-widest uppercase">LIVE CORRESPONDENT</span>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 text-white/40 hover:text-white transition-colors"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row p-4 gap-4 overflow-hidden">
        {/* Main Visualizer/Camera Area */}
        <div className="flex-[2] relative rounded-3xl overflow-hidden bg-zinc-900 border border-white/5 shadow-2xl flex flex-col items-center justify-center">
          {hasCamera ? (
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-1000"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-brand-red/10 to-zinc-900 opacity-30"></div>
          )}
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="relative z-10 flex flex-col items-center">
            {/* Pulsing Visualizer for AI Voice */}
            <div className="w-48 h-48 rounded-full border-4 border-brand-red flex items-center justify-center animate-[pulse_3s_infinite] shadow-[0_0_50px_rgba(187,25,25,0.3)]">
              <div className="flex gap-1.5 items-end h-12">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="w-1.5 bg-white rounded-full animate-bounce" style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 0.1}s` }}></div>
                ))}
              </div>
            </div>
            <h3 className="mt-8 text-white font-black text-2xl tracking-tighter uppercase font-urdu">SWAN AI News Correspondent</h3>
            <p className="text-white/40 text-sm font-urdu mt-2">براہ راست گفتگو کریں</p>
          </div>

          <div className="absolute bottom-6 flex gap-4">
             <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
             >
                {isMuted ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                )}
             </button>
          </div>
        </div>

        {/* Transcription Area */}
        <div className="flex-1 bg-zinc-900/50 rounded-3xl border border-white/5 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h4 className="text-white/60 font-black text-xs uppercase tracking-widest font-urdu">ریئل ٹائم ٹرانسکرپشن</h4>
            {!isConnected && <span className="text-brand-red text-[10px] font-black uppercase animate-pulse font-urdu">منسلک ہو رہا ہے...</span>}
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
            {transcriptions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                 <svg className="w-12 h-12 text-white mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                 <p className="text-white text-sm font-urdu">بات چیت شروع کریں</p>
              </div>
            ) : (
              transcriptions.map((t, i) => (
                <div key={i} className={`flex flex-col ${t.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                  <span className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1 font-urdu">
                    {t.role === 'user' ? 'آپ' : 'نیوز ڈیسک'}
                  </span>
                  <div className={`max-w-[85%] p-4 rounded-2xl font-urdu text-sm leading-relaxed ${t.role === 'user' ? 'bg-brand-red text-white rounded-tr-none' : 'bg-zinc-800 text-zinc-200 rounded-tl-none'}`}>
                    {t.text}
                  </div>
                </div>
              ))
            )}
            <div id="anchor" className="h-4"></div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="h-12 bg-brand-red flex items-center px-6 overflow-hidden">
        <div className="flex items-center gap-12 whitespace-nowrap animate-[marquee_30s_linear_infinite]">
          {[1,2,3,4].map(i => (
            <span key={i} className="text-white text-xs font-black tracking-widest uppercase flex items-center gap-4">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              SWAN NEWS LIVE: BREAKING UPDATES IN REAL-TIME POWERED BY GEMINI 2.5 FLASH NATIVE AUDIO
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default LiveChannel;
