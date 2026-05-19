import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, X, Sparkles, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [isScannerReady, setIsScannerReady] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      false
    );

    scannerRef.current.render(
      (decodedText) => {
        onScan(decodedText);
        if (scannerRef.current) {
          scannerRef.current.clear().catch(console.error);
        }
      },
      (error) => {
        // Silently ignore errors
      }
    );

    setIsScannerReady(true);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => {
          console.warn("Scanner clear failed", err);
        });
      }
    };
  }, [onScan]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-cute-pink-dark/40 backdrop-blur-xl"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-8 relative overflow-hidden"
      >
        {/* Decorations */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-cute-pink/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-cute-blue/10 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="flex justify-between items-center w-full mb-4">
            <h2 className="text-2xl font-black text-neutral-800 flex items-center gap-2">
              <Camera className="text-cute-pink" /> Magic Scanner
            </h2>
            <button 
              onClick={onClose}
              className="p-3 hover:bg-neutral-100 rounded-2xl transition-colors text-neutral-400"
            >
              <X size={24} />
            </button>
          </div>

          <div className="w-full bg-neutral-50 rounded-[32px] border-4 border-cute-pink/20 overflow-hidden relative shadow-inner aspect-square">
            <div id="reader" className="w-full h-full" />
            {!isScannerReady && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-cute-pink/20 border-t-cute-pink rounded-full animate-spin" />
              </div>
            )}
          </div>

          <p className="text-center text-neutral-500 font-bold px-4">
            Point your camera at a QR code to unlock its secrets! ✨
          </p>

          <div className="flex gap-2">
            <Sparkles className="text-cute-yellow animate-pulse" size={20} />
            <Heart className="text-cute-pink animate-bounce" size={20} />
            <Sparkles className="text-cute-yellow animate-pulse" size={20} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
