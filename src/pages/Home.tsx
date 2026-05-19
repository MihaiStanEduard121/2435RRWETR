import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { nanoid } from 'nanoid';
import { motion, AnimatePresence } from 'motion/react';
import { Link2, Download, Copy, Check, Sparkles, Wand2 } from 'lucide-react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import Logo from '../components/Logo';

export default function Home() {
  const [url, setUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrId, setQrId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || isGenerating) return;

    // Validate URL
    let formattedUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      formattedUrl = 'https://' + url;
    }

    setIsGenerating(true);
    const id = nanoid(8); // Alphanumeric hash

    try {
      await setDoc(doc(db, 'qr_mappings', id), {
        id,
        destinationUrl: formattedUrl,
        createdAt: serverTimestamp(),
      });
      setQrId(id);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `qr_mappings/${id}`);
    } finally {
      setIsGenerating(false);
    }
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
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, 1000, 1000);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `CuteQR-${qrId}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const redirectUrl = `${window.location.origin}/qr/${qrId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(redirectUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 overflow-x-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl"
      >
        <div className="flex justify-center mb-12">
          <Logo size="lg" />
        </div>

        <div className="bg-white rounded-[40px] p-8 sm:p-10 bubble-shadow border-4 border-cute-pink/20 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-cute-blue/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-cute-lila/10 rounded-full blur-3xl" />
          
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-800 mb-2 flex items-center gap-2">
            Create Magic <Wand2 className="text-cute-pink w-6 h-6" />
          </h1>
          <p className="text-neutral-500 mb-8 font-medium italic">
            Turn your links into adorable QR codes!
          </p>

          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Link2 className="text-cute-pink-dark group-focus-within:text-cute-pink transition-colors" size={20} />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste your link here... (e.g. google.com)"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-cute-pink rounded-3xl outline-none transition-all font-semibold placeholder:text-neutral-300"
              />
            </div>

            <button
              type="submit"
              disabled={!url || isGenerating}
              className="w-full bg-cute-pink hover:bg-cute-pink-dark disabled:bg-gray-200 text-white font-bold py-4 rounded-3xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sparkle Now! <Sparkles size={20} /></>
              )}
            </button>
          </form>

          <AnimatePresence>
            {qrId && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-12 space-y-8 pt-8 border-t-2 border-dashed border-cute-pink/30 flex flex-col items-center"
              >
                <div className="text-center space-y-2">
                  <p className="text-xs font-bold text-cute-pink uppercase tracking-widest">Live Preview</p>
                  <div className="bg-white p-6 rounded-[32px] border-4 border-cute-blue relative group shadow-sm inline-block">
                  <div className="absolute -inset-2 bg-gradient-to-tr from-cute-pink to-cute-blue opacity-50 blur-xl group-hover:blur-2xl transition-all -z-10" />
                  <QRCodeSVG
                    id="qr-main"
                    value={redirectUrl}
                    size={220}
                    level="H"
                    includeMargin={false}
                    className="rounded-xl"
                    fgColor="#171717"
                  />
                  <div className="absolute inset-0 border-8 border-white rounded-[24px] pointer-events-none" />
                </div>
              </div>

              <div className="w-full space-y-3">
                  <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest text-center">Your QR Secret Link</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 bg-gray-50 px-5 py-3 rounded-2xl border border-gray-100 text-neutral-600 font-mono text-sm truncate flex items-center">
                      {redirectUrl}
                    </div>
                    <button
                      onClick={handleCopy}
                      className="bg-cute-blue hover:bg-cute-blue-dark text-white p-3 rounded-2xl transition-all active:scale-90 flex items-center justify-center gap-2 shrink-0 font-bold"
                    >
                      {copied ? <Check size={20} /> : <Copy size={20} />}
                      <span className="sm:hidden">{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>

                  <button
                    onClick={handleDownload}
                    className="w-full bg-cute-lila hover:bg-cute-lila-dark text-white font-bold py-4 rounded-3xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Download size={20} /> Download PNG
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 text-center text-neutral-400 font-medium text-sm flex items-center justify-center gap-2">
          Made with a lot of <Sparkles className="text-cute-pink w-4 h-4" /> & Cute Magic
        </div>
      </motion.div>
    </div>
  );
}
