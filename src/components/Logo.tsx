import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'text-xl gap-1',
    md: 'text-3xl gap-2',
    lg: 'text-5xl gap-3',
  };

  return (
    <div className={`flex items-center font-extrabold tracking-tight select-none cursor-pointer hover:scale-105 transition-transform ${sizes[size]}`}>
      <div className="bg-white p-2 rounded-2xl rotate-3 bubble-shadow relative group">
        <div className="absolute -top-1 -right-1 group-hover:animate-ping opacity-75">
          <Heart className="fill-cute-pink text-cute-pink w-4 h-4" />
        </div>
        <div className="bg-cute-pink p-1.5 rounded-xl">
          <Sparkles className="text-white w-6 h-6 sm:w-8 sm:h-8" />
        </div>
      </div>
      <span className="bg-gradient-to-r from-cute-pink-dark via-cute-lila-dark to-cute-blue-dark bg-clip-text text-transparent flex items-center">
        CuteQR
        <Heart className="fill-cute-pink text-cute-pink w-6 h-6 ml-1 animate-pulse" />
      </span>
    </div>
  );
}
