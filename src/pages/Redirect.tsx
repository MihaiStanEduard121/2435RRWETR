import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Loader2, Sparkles, Heart } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import Logo from '../components/Logo';

export default function Redirect() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUrl() {
      if (!id) return;
      try {
        const docRef = doc(db, 'qr_mappings', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const destination = data.destinationUrl;

          // Start the redirect countdown
          let current = 3;
          const interval = setInterval(() => {
            current -= 1;
            setCountdown(current);
            if (current <= 0) {
              clearInterval(interval);
              window.location.href = destination;
            }
          }, 1000);
          
          setLoading(false);
        } else {
          setError('Oops! This QR magic link doesn\'t exist anymore.');
          setLoading(false);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `qr_mappings/${id}`);
        setError('Something went wrong with the magic...');
        setLoading(false);
      }
    }

    fetchUrl();
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-cute-pink/5">
        <Logo size="md" />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-8 bg-white p-8 rounded-[32px] bubble-shadow text-center"
        >
          <div className="bg-red-50 text-red-400 p-4 rounded-2xl mb-6">
            <Heart className="mx-auto mb-2 fill-red-100" />
            <p className="font-bold">{error}</p>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-cute-pink text-white font-bold py-3 rounded-2xl transition-all hover:bg-cute-pink-dark"
          >
            Go back Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#FFF9FB]">
      {/* Background Bubbles */}
      <div className="absolute top-20 -left-10 w-64 h-64 bg-cute-pink/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 -right-10 w-64 h-64 bg-cute-blue/10 rounded-full blur-3xl animate-pulse delay-700" />

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="z-10 text-center space-y-12"
      >
        <div className="flex justify-center flex-col items-center gap-2">
          <Logo size="lg" />
          <p className="text-neutral-400 font-medium italic">Cute Magic Redirect</p>
        </div>

        <div className="bg-white p-12 rounded-[50px] bubble-shadow border-4 border-white flex flex-col items-center">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-4 border-2 border-dashed border-cute-pink rounded-full opacity-50"
            />
            <div className="bg-cute-pink/10 w-24 h-24 rounded-full flex items-center justify-center relative">
              <span className="text-5xl font-black text-cute-pink-dark">{countdown}</span>
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }} 
                transition={{ repeat: Infinity, duration: 1 }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles className="text-cute-pink fill-cute-pink/20" size={32} />
              </motion.div>
            </div>
          </div>

          <div className="mt-8 space-y-2">
            <h2 className="text-2xl font-black text-neutral-800">Hang on, Cutie!</h2>
            <p className="text-neutral-500 font-semibold">You're being redirected in {countdown}...</p>
          </div>
          
          <div className="mt-8 flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1, 
                  delay: i * 0.2 
                }}
                className="w-3 h-3 rounded-full bg-cute-pink"
              />
            ))}
          </div>
        </div>

        <p className="text-sm font-medium text-neutral-400">
          Stay sweet! <Heart className="inline-block w-4 h-4 fill-cute-pink text-cute-pink" />
        </p>
      </motion.div>
    </div>
  );
}
