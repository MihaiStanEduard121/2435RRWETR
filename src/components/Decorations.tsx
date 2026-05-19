import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Star, Cloud } from 'lucide-react';

export default function Decorations() {
  const [elements, setElements] = useState<{ id: number; x: number; delay: number; size: number; icon: string; duration: number }[]>([]);

  useEffect(() => {
    const icons = ['💖', '✨', '☁️', '🌸', '🎀', '⭐'];
    const newElements = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 10,
      size: Math.random() * 20 + 20,
      icon: icons[Math.floor(Math.random() * icons.length)],
      duration: Math.random() * 10 + 10,
    }));
    setElements(newElements);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {elements.map((el) => (
        <div
          key={el.id}
          className="absolute bottom-[-50px] floating-heart opacity-0"
          style={{
            left: `${el.x}%`,
            animationDelay: `${el.delay}s`,
            animationDuration: `${el.duration}s`,
            fontSize: `${el.size}px`,
          }}
        >
          {el.icon}
        </div>
      ))}

      {/* Static larger clouds */}
      <motion.div
        animate={{ x: [0, 50, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute top-20 left-[10%] opacity-20"
      >
        <Cloud size={100} className="text-cute-pink" />
      </motion.div>
      <motion.div
        animate={{ x: [0, -40, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        className="absolute top-60 right-[15%] opacity-20"
      >
        <Cloud size={120} className="text-cute-blue" />
      </motion.div>
      <motion.div
        animate={{ x: [0, 30, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-40 left-[20%] opacity-20"
      >
        <Cloud size={80} className="text-cute-lila" />
      </motion.div>
    </div>
  );
}
