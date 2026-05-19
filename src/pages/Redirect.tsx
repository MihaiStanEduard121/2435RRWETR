import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, ExternalLink, Sparkles, Heart } from 'lucide-react';
import Logo from '../components/Logo';
import Decorations from '../components/Decorations';

interface PageBlock {
  id: string;
  type: 'text' | 'logo' | 'countdown' | 'image';
  content: string;
}

interface QRMapping {
  destinationUrl: string;
  pageConfig?: {
    blocks: PageBlock[];
  };
}

export default function Redirect() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [mapping, setMapping] = useState<QRMapping | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMapping() {
      if (!id) return;
      try {
        const docRef = doc(db, 'qr_mappings', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setMapping(docSnap.data() as QRMapping);
        } else {
          setError('Oops! This magic portal has vanished. 😿');
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `qr_mappings/${id}`);
        setError('Something went wrong with the magic... ✨');
      } finally {
        setLoading(false);
      }
    }
    fetchMapping();
  }, [id]);

  useEffect(() => {
    if (!loading && mapping) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            window.location.href = mapping.destinationUrl;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [loading, mapping]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-cute-pink-light">
        <Decorations />
        <div className="relative">
          <div className="absolute inset-0 bg-cute-pink blur-2xl opacity-20 animate-pulse" />
          <Loader2 className="w-20 h-20 text-cute-pink animate-spin relative z-10" />
        </div>
        <motion.p 
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="mt-6 text-2xl font-black text-cute-pink-dark"
        >
          Opening Magic Portal... ✨
        </motion.p>
      </div>
    );
  }

  if (error || !mapping) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-cute-pink-light text-center">
        <Decorations />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-12 max-w-md space-y-6"
        >
           <span className="text-6xl">😿</span>
           <h1 className="text-3xl font-black text-neutral-800">Oopsie Daisy!</h1>
           <p className="text-neutral-500 font-bold">{error || "Magic Link Not Found"}</p>
           <button onClick={() => window.location.href = '/'} className="w-full bg-cute-pink text-white font-black py-5 rounded-[24px] shadow-lg hover:scale-105 transition-transform">Go Home 🏠</button>
        </motion.div>
      </div>
    );
  }

  const blocks = mapping.pageConfig?.blocks || [
    { id: '1', type: 'logo', content: '' },
    { id: '2', type: 'text', content: 'Redirecting you to your destination...' },
    { id: '3', type: 'countdown', content: '' }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-cute-pink-light">
      <Decorations />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-card p-12 w-full max-w-2xl relative z-10 text-center space-y-10"
      >
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 kawaii-bounce">
            <div className="bg-white p-4 rounded-3xl shadow-xl border-4 border-cute-pink">
               <Sparkles className="text-cute-pink w-10 h-10" />
            </div>
        </div>

        <div className="space-y-12">
          {blocks.map((block, index) => (
            <motion.div 
              key={block.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center w-full"
            >
              {block.type === 'logo' && (
                <div className="mb-4">
                  <Logo size="lg" />
                </div>
              )}

              {block.type === 'text' && (
                <h2 className="text-3xl md:text-4xl font-black text-neutral-800 tracking-tight leading-tight max-w-lg mx-auto">
                  {block.content}
                </h2>
              )}

              {block.type === 'image' && block.content && (
                <div className="relative group">
                  <div className="absolute inset-0 bg-cute-blue blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                  <img 
                    src={block.content} 
                    alt="Custom Logo" 
                    className="max-w-[280px] max-h-[280px] rounded-[48px] object-contain shadow-2xl border-8 border-white relative z-10 hover:scale-105 transition-transform" 
                  />
                </div>
              )}

              {block.type === 'countdown' && (
                <div className="relative scale-125 py-8">
                  <div className="absolute inset-0 bg-cute-pink blur-2xl opacity-20 rounded-full" />
                  <div className="w-32 h-32 rounded-full border-8 border-cute-pink/10 flex items-center justify-center relative">
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-cute-pink"
                        style={{
                          strokeDasharray: '351.85',
                          strokeDashoffset: (351.85 * (3 - countdown)) / 3,
                          transition: 'stroke-dashoffset 1s linear'
                        }}
                      />
                    </svg>
                    <span className="text-5xl font-black text-cute-pink">{countdown}</span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="pt-6 space-y-4">
          <div className="flex items-center justify-center gap-2 text-neutral-400 font-extrabold uppercase text-xs tracking-[0.2em]">
            <Heart size={14} className="fill-cute-pink text-cute-pink animate-pulse" /> 
            Magic in progress
            <Heart size={14} className="fill-cute-pink text-cute-pink animate-pulse" />
          </div>
          
          <a 
            href={mapping.destinationUrl}
            className="inline-flex items-center gap-2 text-cute-blue-dark font-black hover:underline group text-lg"
          >
            Direct link <ExternalLink size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </a>
        </div>
      </motion.div>

      {/* Decorative Stickers */}
      <div className="fixed bottom-10 left-10 hidden lg:block kawaii-bounce">
         <div className="bg-white p-8 rounded-[40px] shadow-2xl border-4 border-white rotate-[-15deg] glass-card">
            <span className="text-6xl">🎀</span>
         </div>
      </div>
      <div className="fixed top-20 right-10 hidden lg:block kawaii-bounce" style={{ animationDelay: '1.5s' }}>
         <div className="bg-white p-8 rounded-[40px] shadow-2xl border-4 border-white rotate-[15deg] glass-card">
            <span className="text-6xl">✨</span>
         </div>
      </div>
      <div className="fixed bottom-10 right-10 hidden lg:block kawaii-bounce" style={{ animationDelay: '2s' }}>
         <div className="bg-white p-8 rounded-[40px] shadow-2xl border-4 border-white glass-card">
            <span className="text-6xl">🍭</span>
         </div>
      </div>
    </div>
  );
}
