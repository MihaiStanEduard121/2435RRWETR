import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { nanoid } from 'nanoid';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { 
  Link2, Download, Copy, Check, Sparkles, Wand2, Palette, Layout, 
  Settings2, GripVertical, Trash2, Plus, Heart, Star, 
  ArrowRight, MousePointer2, Zap, ShieldCheck, Share2, History, RotateCcw,
  Instagram, Smartphone
} from 'lucide-react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import Logo from '../components/Logo';
import Decorations from '../components/Decorations';
import { toast, Toaster } from 'sonner';
import { generateStoryImage } from '../lib/imageUtils';
import QRScanner from '../components/QRScanner';

interface PageBlock {
  id: string;
  type: 'text' | 'logo' | 'countdown' | 'image';
  content: string;
}

export default function Home() {
  const [url, setUrl] = useState(() => localStorage.getItem('cuteqr_last_url') || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [isSharingStory, setIsSharingStory] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [qrId, setQrId] = useState<string | null>(null);
  const [history, setHistory] = useState<{ id: string, url: string, date: number }[]>(() => {
    const saved = localStorage.getItem('cuteqr_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Customization State
  const [fgColor, setFgColor] = useState('#FF6B6B');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  
  // Page Builder State
  const [blocks, setBlocks] = useState<PageBlock[]>(() => {
    const saved = localStorage.getItem('cuteqr_last_blocks');
    return saved ? JSON.parse(saved) : [
      { id: '1', type: 'logo', content: 'CuteQR' },
      { id: '2', type: 'text', content: 'You are being redirected...' },
      { id: '3', type: 'countdown', content: '3' },
    ];
  });

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('cuteqr_last_url', url);
  }, [url]);

  useEffect(() => {
    localStorage.setItem('cuteqr_last_blocks', JSON.stringify(blocks));
  }, [blocks]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const playSuccessSound = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
    audio.volume = 0.2;
    audio.play().catch(() => {});
  };

  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const handleImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 200 * 1024) { 
      toast.error('Logo is too big! Max 200KB please 😿', {
        style: { background: '#FFF0F3', border: '2px solid #FFD1DC', color: '#FF6B6B' }
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      updateBlock(id, reader.result as string);
      toast.success('Image added! ✨');
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url || isGenerating) return;

    if (!url.includes('.') || url.length < 3) {
      toast.error('Oops! That link doesn\'t look right... 😿');
      return;
    }

    let formattedUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      formattedUrl = 'https://' + url;
    }

    setIsGenerating(true);
    setGenProgress(0);
    const progressInterval = setInterval(() => {
      setGenProgress(prev => Math.min(prev + (Math.random() * 15), 90));
    }, 100);

    const id = nanoid(8);

    try {
      await setDoc(doc(db, 'qr_mappings', id), {
        id,
        destinationUrl: formattedUrl,
        createdAt: serverTimestamp(),
        qrStyle: { fgColor, bgColor },
        pageConfig: { blocks }
      });
      setQrId(id);
      
      const newHistoryItem = { id, url: formattedUrl, date: Date.now() };
      const updatedHistory = [newHistoryItem, ...history.slice(0, 9)];
      setHistory(updatedHistory);
      localStorage.setItem('cuteqr_history', JSON.stringify(updatedHistory));

      clearInterval(progressInterval);
      setGenProgress(100);
      
      playSuccessSound();
      triggerHaptic();
      
      toast.success('Magic happened! QR Code Ready! 💖', {
        description: 'Your link is now adorable.',
      });

      setTimeout(() => {
        const resultSection = document.getElementById('qr-result-section');
        resultSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);

    } catch (error) {
      clearInterval(progressInterval);
      handleFirestoreError(error, OperationType.WRITE, `qr_mappings/${id}`);
      toast.error('The magic failed... try again! 😿');
    } finally {
      setIsGenerating(false);
    }
  };

  const addBlock = (type: PageBlock['type']) => {
    setBlocks([...blocks, { id: nanoid(), type, content: type === 'text' ? 'New Message' : '' }]);
    toast('New block added! ✨');
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
    toast('Block removed! 🗑️');
  };

  const updateBlock = (id: string, content: string) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, content } : b));
  };

  const handleDownload = () => {
    const svg = document.getElementById('qr-main');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = 1000;
      canvas.height = 1000;
      if (ctx) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, 1000, 1000);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `CuteQR-${qrId}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
        toast.success('Downloaded! Check your uploads 💖');
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const redirectUrl = `${window.location.origin}/qr/${qrId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(redirectUrl);
    setCopied(true);
    triggerHaptic();
    toast.success('Copied to clipboard! 🎀', {
      position: 'bottom-center'
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CuteQR Magic Link',
          text: 'Check out my adorable QR code link! 💖',
          url: redirectUrl,
        });
        toast.success('Shared successfully! ✨');
      } catch (err) {
        // ignore
      }
    } else {
      handleCopy();
    }
  };

  const handlePostToStory = async () => {
    const svg = document.getElementById('qr-main') as unknown as SVGElement;
    if (!svg) return;

    setIsSharingStory(true);
    const toastId = toast.loading('Creating your story ✨', {
      description: 'Generating optimized social media image...'
    });

    try {
      const blob = await generateStoryImage(svg, fgColor, bgColor);
      const file = new File([blob], `CuteQR-Story-${qrId}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'CuteQR Story',
          text: 'Check out my cute QR code! 💖',
        });
        toast.success('Ready to post! 🎀', { id: toastId });
      } else {
        // Fallback to download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CuteQR-Story-${qrId}.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Story image downloaded! 💖', { 
          id: toastId,
          description: 'Share it on Instagram or TikTok!'
        });
      }
      triggerHaptic();
    } catch (err) {
      console.error(err);
      toast.error('The magic sparkle faded... try again! 😿', { id: toastId });
    } finally {
      setIsSharingStory(false);
    }
  };

  const handleScanFinish = (decodedText: string) => {
    setShowScanner(false);
    playSuccessSound();
    triggerHaptic();
    
    // Check if it's our own link format
    const match = decodedText.match(/\/qr\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      setQrId(match[1]);
      toast.success('Magic link recognized! ✨');
      setTimeout(() => {
        const resultSection = document.getElementById('qr-result-section');
        resultSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    } else {
      setUrl(decodedText);
      toast.success('URL scanned! 🪄');
      setTimeout(() => {
        const genPanel = document.getElementById('generator-panel');
        genPanel?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  };

  return (
    <div className="min-h-screen selection:bg-cute-pink selection:text-white relative overflow-hidden">
      <Toaster position="top-right" richColors toastOptions={{
        style: { borderRadius: '24px', border: '2px solid #FFD1DC', fontFamily: 'Quicksand, sans-serif', fontWeight: 700 }
      }} />
      <Decorations />

      <AnimatePresence>
        {showScanner && (
          <QRScanner 
            onScan={handleScanFinish} 
            onClose={() => setShowScanner(false)} 
          />
        )}
      </AnimatePresence>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center h-24">
        <div className="glass-card px-6 py-2 flex items-center shadow-lg border-2">
          <Logo size="sm" />
        </div>
        <div className="hidden sm:flex gap-4">
          <button onClick={() => {
            localStorage.clear();
            window.location.reload();
          }} className="bg-white/50 backdrop-blur-md px-6 py-3 rounded-2xl bubble-shadow hover:scale-110 transition-transform font-bold text-cute-pink-dark flex items-center gap-2">
            <RotateCcw size={18} /> Reset
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8 max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-cute-pink-light px-6 py-2 rounded-full border-2 border-cute-pink/20 text-cute-pink-dark font-black text-sm uppercase tracking-widest kawaii-bounce">
            <Sparkles size={16} /> New: Ultra Cute UI ✨
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-neutral-800 leading-tight">
            Create the <span className="text-cute-pink underline decoration-cute-pink/30 decoration-8 underline-offset-8">Cutest</span> QR <br />
            Codes Ever! <Heart className="inline fill-cute-pink text-cute-pink animate-pulse" size={48} />
          </h1>
          <p className="text-xl md:text-2xl text-neutral-500 font-medium max-w-2xl mx-auto">
            Transform boring links into adorable magic portals. Customize colors, add stickers, and create unique experiences. 🎀
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button 
              onClick={() => document.getElementById('generator-panel')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-12 py-6 bg-cute-pink text-white rounded-[30px] text-xl font-black shadow-2xl hover:bg-cute-pink-dark transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 sparkle-shine"
            >
              Start Creating 💖 <ArrowRight />
            </button>
            <button 
              onClick={() => setShowScanner(true)}
              className="px-12 py-6 bg-white text-cute-pink rounded-[30px] text-xl font-black shadow-2xl hover:bg-neutral-50 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 border-2 border-cute-pink/20"
            >
              Scan Magic QR 📷
            </button>
          </div>
        </motion.div>
      </section>

      {/* Generator Panel */}
      <section id="generator-panel" className="relative py-20 px-6 z-10 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Column: Editor */}
          <motion.div 
            whileInView={{ opacity: 1, x: 0 }}
            initial={{ opacity: 0, x: -30 }}
            viewport={{ once: true }}
            className="flex-1 space-y-8"
          >
            <div className="glass-card p-10 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 rotate-12 opacity-10">
                <Wand2 size={100} />
              </div>
              <h2 className="text-3xl font-black mb-8 flex items-center gap-3">
                <div className="bg-cute-pink p-2 rounded-2xl"><Settings2 className="text-white" /></div>
                1. Link Magic 🪄
              </h2>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                    <Link2 className="text-cute-pink-dark" size={24} />
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleGenerate(); }}
                    placeholder="Enter URL (e.g. google.com)"
                    className={`w-full pl-16 pr-6 py-6 bg-neutral-50 border-4 border-transparent focus:border-cute-pink rounded-3xl outline-none font-black text-xl placeholder:text-neutral-300 transition-all shadow-inner ${url && !url.includes('.') ? 'focus:border-red-300 shake-anim' : ''}`}
                  />
                </div>
              </form>

              {isGenerating && (
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between items-center text-xs font-black text-cute-pink uppercase tracking-widest">
                    <span>Processing Magic...</span>
                    <span>{Math.round(genProgress)}%</span>
                  </div>
                  <div className="h-3 w-full bg-neutral-50 rounded-full overflow-hidden shadow-inner border border-neutral-100">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${genProgress}%` }}
                      className="h-full bg-gradient-to-r from-cute-pink to-cute-peach"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="glass-card p-10">
                <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                  <div className="bg-cute-blue p-2 rounded-2xl"><Palette className="text-white" /></div>
                  2. QR Style 💅
                </h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-neutral-50 p-4 rounded-2xl border-2 border-dashed border-cute-blue/30">
                    <span className="font-black text-neutral-500">Dots Color</span>
                    <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-14 h-14 rounded-2xl cursor-pointer border-4 border-white shadow-md bg-transparent" />
                  </div>
                  <div className="flex items-center justify-between bg-neutral-50 p-4 rounded-2xl border-2 border-dashed border-cute-blue/30">
                    <span className="font-black text-neutral-500">Background</span>
                    <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-14 h-14 rounded-2xl cursor-pointer border-4 border-white shadow-md bg-transparent" />
                  </div>
                </div>
              </div>

              <div className="glass-card p-10">
                <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
                  <div className="bg-cute-lila p-2 rounded-2xl"><Layout className="text-white" /></div>
                  3. Redirect 🚀
                </h2>
                <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                  <Reorder.Group axis="y" values={blocks} onReorder={setBlocks} className="space-y-3">
                    {blocks.map((block) => (
                      <Reorder.Item key={block.id} value={block} className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100 flex items-center gap-4 hover:border-cute-lila transition-colors cursor-grab">
                        <GripVertical className="text-neutral-300" size={20} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-black uppercase text-cute-lila px-2 py-0.5 bg-cute-lila/10 rounded-full">{block.type}</span>
                            <button onClick={() => removeBlock(block.id)} className="text-neutral-300 hover:text-red-400"><Trash2 size={14} /></button>
                          </div>
                          {block.type === 'text' && (
                            <input 
                              type="text" 
                              value={block.content} 
                              onChange={(e) => updateBlock(block.id, e.target.value)}
                              className="w-full bg-transparent font-bold text-neutral-700 outline-none text-sm"
                            />
                          )}
                          {block.type === 'logo' && <div className="text-xs font-bold text-cute-pink">CuteQR Default Logo</div>}
                          {block.type === 'countdown' && <div className="text-xs font-bold text-cute-blue-dark">Redirect Timer (3s)</div>}
                          {block.type === 'image' && (
                            <div className="flex items-center gap-2 mt-1">
                               <input type="file" accept="image/*" onChange={(e) => handleImageUpload(block.id, e)} className="hidden" id={`file-${block.id}`} />
                               <label htmlFor={`file-${block.id}`} className="text-[10px] font-black bg-white border border-neutral-200 p-2 rounded-lg cursor-pointer hover:bg-neutral-100">Upload</label>
                               {block.content && <img src={block.content} className="w-6 h-6 rounded object-cover border" alt="preview" />}
                            </div>
                          )}
                        </div>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button onClick={() => addBlock('text')} className="bg-white border-2 border-dashed border-cute-lila/30 hover:bg-cute-lila/5 p-3 rounded-2xl text-[10px] font-black text-cute-lila flex items-center justify-center gap-1 transition-all"><Plus size={14} /> TEXT</button>
                  <button onClick={() => addBlock('image')} className="bg-white border-2 border-dashed border-cute-lila/30 hover:bg-cute-lila/5 p-3 rounded-2xl text-[10px] font-black text-cute-lila flex items-center justify-center gap-1 transition-all"><Plus size={14} /> IMAGE</button>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleGenerate()}
              disabled={!url || isGenerating}
              className="w-full bg-cute-pink p-8 rounded-[40px] text-3xl font-black text-white shadow-2xl hover:bg-cute-pink-dark transition-all sparkle-shine hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-4 group disabled:opacity-50 relative"
            >
               {isGenerating && (
                 <div className="absolute inset-0 bg-white/20 animate-pulse rounded-[40px]" />
               )}
               {isGenerating ? (
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 border-8 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-xl">Processing...</span>
                </div>
              ) : (
                <>POOOF! GENERATE ✨ <Wand2 className="group-hover:rotate-45 transition-transform" size={40} /></>
              )}
            </button>
          </motion.div>

          {/* Right Column: Preview */}
          <div className="w-full lg:w-[450px]" id="qr-result-section">
            <div className="sticky top-32 space-y-8">
              <h3 className="text-sm font-black text-neutral-400 uppercase tracking-widest text-center">Live Magic Preview</h3>
              
              <div className={`glass-card p-12 flex flex-col items-center relative group transition-all duration-700 ${qrId ? 'ring-8 ring-cute-pink/20 shadow-[0_0_50px_rgba(255,209,220,0.5)]' : ''}`}>
                 {/* Decorative Stickers */}
                <div className="absolute -top-6 -right-6 w-24 h-24 rotate-12 kawaii-bounce">
                  <div className="bg-cute-yellow p-4 rounded-3xl shadow-lg border-4 border-white text-center">
                     <span className="text-3xl">🐱</span>
                  </div>
                </div>
                <div className="absolute -bottom-6 -left-6 w-24 h-24 -rotate-12 kawaii-bounce" style={{ animationDelay: '1s' }}>
                  <div className="bg-cute-mint p-4 rounded-3xl shadow-lg border-4 border-white text-center">
                     <span className="text-3xl">🐰</span>
                  </div>
                </div>

                <div className="bg-neutral-100 p-8 rounded-[48px] border-8 border-white shadow-inner transition-transform group-hover:scale-105 relative overflow-hidden" style={{ backgroundColor: bgColor }}>
                  {isGenerating && (
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center z-20">
                      <div className="w-full h-full bg-neutral-200 animate-pulse flex flex-col items-center justify-center gap-4">
                        <div className="w-24 h-24 bg-neutral-300 rounded-3xl" />
                        <div className="w-32 h-4 bg-neutral-300 rounded-full" />
                        <div className="w-20 h-3 bg-neutral-300 rounded-full" />
                      </div>
                    </div>
                  )}
                  <QRCodeSVG
                    id="qr-main"
                    value={qrId ? redirectUrl : 'https://cuteqr.example'}
                    size={280}
                    level="H"
                    fgColor={fgColor}
                    bgColor={bgColor}
                    marginSize={1}
                  />
                </div>
                <div className="mt-10 space-y-2 text-center">
                  <p className="text-2xl font-black text-neutral-800 tracking-tighter uppercase">Magic Preview</p>
                  <p className="text-neutral-400 font-bold italic">Scan for a cute surprise! 💖</p>
                </div>
              </div>

              <AnimatePresence>
                {qrId && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="glass-card p-8 bg-gradient-to-br from-cute-mint/20 to-cute-blue/20 border-4 border-cute-mint/30"
                  >
                    <h3 className="text-xl font-black mb-4 flex items-center gap-2">
                       <Check className="text-cute-mint bg-white rounded-full p-1" /> Magic is Ready! 🎉
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-white/80 p-4 rounded-2xl border-2 border-white font-mono text-sm truncate flex justify-between items-center group shadow-sm">
                        <span className="opacity-50">{redirectUrl}</span>
                        <button onClick={handleCopy} className="bg-cute-blue text-white p-2 rounded-xl active:scale-90 transition-all hover:bg-cute-blue-dark shadow-sm">
                          {copied ? <Check size={16} /> : <Copy size={16} />}
                        </button>
                      </div>
                      <div className="flex flex-col gap-3">
                        <div className="flex gap-4">
                          <button onClick={handleDownload} className="flex-1 bg-cute-pink py-4 rounded-2xl text-white font-black shadow-lg hover:animate-pulse transition-all flex items-center justify-center gap-2 active:scale-95">
                            <Download size={20} /> PNG
                          </button>
                          <button onClick={handleShare} className="flex-1 bg-white py-4 rounded-2xl text-neutral-600 font-black shadow-md border border-neutral-100 flex items-center justify-center gap-2 active:scale-95">
                            <Share2 size={20} /> Share
                          </button>
                        </div>
                        <button 
                          onClick={handlePostToStory} 
                          disabled={isSharingStory}
                          className="w-full bg-gradient-to-r from-cute-pink to-cute-lila py-4 rounded-2xl text-white font-black shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                        >
                          {isSharingStory ? (
                             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>
                              <Smartphone size={20} /> Story Design ✨
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* History Section */}
      {history.length > 0 && (
        <section className="relative pb-20 px-6 z-10 max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-neutral-800 flex items-center justify-center gap-3">
              <div className="bg-cute-peach p-2 rounded-2xl"><History className="text-white" /></div>
              Recent Magic ✨
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {history.map((item) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-6 flex flex-col items-center text-center space-y-4 group hover:ring-4 ring-cute-peach/30 transition-all cursor-pointer"
                onClick={() => {
                  setQrId(item.id);
                  setUrl(item.url);
                  const resultSection = document.getElementById('qr-result-section');
                  resultSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
              >
                <div className="bg-neutral-50 p-3 rounded-2xl border-2 border-white shadow-inner group-hover:scale-110 transition-transform">
                   <QRCodeSVG
                    value={`${window.location.origin}/qr/${item.id}`}
                    size={100}
                    level="L"
                    fgColor="#FF6B6B"
                  />
                </div>
                <div className="w-full">
                  <p className="text-xs font-black text-neutral-800 truncate">{item.url}</p>
                  <p className="text-[10px] font-bold text-neutral-400">{new Date(item.date).toLocaleDateString()}</p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const updated = history.filter(h => h.id !== item.id);
                    setHistory(updated);
                    localStorage.setItem('cuteqr_history', JSON.stringify(updated));
                    toast('Forgotten! 🪄');
                  }}
                  className="text-neutral-300 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center mt-10">
            <button 
              onClick={() => {
                setHistory([]);
                localStorage.removeItem('cuteqr_history');
                toast.success('Clean Slate! 🧼');
              }}
              className="text-sm font-black text-neutral-400 px-6 py-2 rounded-full border-2 border-dashed border-neutral-200 hover:border-cute-peach hover:text-cute-peach transition-all"
            >
              Clear Everything 🧹
            </button>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="relative py-32 px-6 z-10 bg-white/30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
             <h2 className="text-4xl md:text-5xl font-black text-neutral-800">Packed with Sparkle ✨</h2>
             <p className="text-xl text-neutral-500 font-medium">Everything you need for a kawaii online presence.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Zap className="text-cute-yellow" />, title: 'Insta-Magic', desc: 'Generate high-quality QR codes in seconds with just one click.' },
              { icon: <Palette className="text-cute-pink" />, title: 'Full Design Controls', desc: 'Pick any pastel color and customize the shapes to fit your vibe.' },
              { icon: <Layout className="text-cute-blue" />, title: 'Custom Pages', desc: 'Build your own redirect landing page with our cute block builder.' },
              { icon: <ShieldCheck className="text-cute-mint" />, title: 'Safe & Secure', desc: 'Your data is handled with lots of love and maximum security.' },
              { icon: <Heart className="text-cute-peach" />, title: 'Free Forever', desc: 'Magic should be shared with everyone! No hidden fees here.' },
              { icon: <MousePointer2 className="text-cute-lila" />, title: 'Drag & Drop', desc: 'Easily rearrange elements on your redirect page with ease.' }
            ].map((f, i) => (
              <motion.div 
                whileHover={{ y: -10 }}
                key={i} 
                className="glass-card p-10 group"
              >
                <div className="w-16 h-16 bg-neutral-50 rounded-[20px] mb-8 flex items-center justify-center border-4 border-white shadow-inner group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-2xl font-black text-neutral-800 mb-4">{f.title}</h3>
                <p className="text-neutral-500 font-medium leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-20 px-6 z-10 bg-neutral-900 overflow-hidden">
        {/* Animated stars in dark bg */}
        <div className="absolute inset-0 opacity-20">
           {Array.from({ length: 50 }).map((_, i) => (
             <motion.div 
               key={i}
               animate={{ opacity: [0.2, 1, 0.2] }}
               transition={{ duration: Math.random() * 3 + 2, repeat: Infinity }}
               className="absolute w-1 h-1 bg-white rounded-full"
               style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
             />
           ))}
        </div>

        <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-10 relative z-10">
          <Logo size="md" />
          <div className="flex gap-8 text-neutral-400 font-black text-lg">
            <a href="#" className="hover:text-cute-pink transition-colors">Twitter</a>
            <a href="#" className="hover:text-cute-blue transition-colors">Discord</a>
            <a href="#" className="hover:text-cute-lila transition-colors">TikTok</a>
            <a href="#" className="hover:text-cute-peach transition-colors">Instagram</a>
          </div>
          <div className="h-px w-full max-w-xl bg-neutral-800" />
          <p className="text-neutral-500 font-bold italic">
            Made with 💖 and lots of sparkle by CuteQR Team. <br />
            © 2026 CuteQR Startup. All magical rights reserved. ✨
          </p>
        </div>
      </footer>
    </div>
  );
}
