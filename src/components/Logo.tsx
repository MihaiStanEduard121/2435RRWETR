import React from 'react';
import { Sparkles } from 'lucide-react';

export default function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
  };

  return (
    <div className={`flex items-center gap-2 font-extrabold tracking-tight select-none ${sizes[size]}`}>
      <div className="bg-cute-pink p-2 rounded-2xl rotate-3 bubble-shadow">
        <Sparkles className="text-white w-6 h-6 sm:w-8 sm:h-8" />
      </div>
      <span className="bg-gradient-to-r from-cute-pink-dark to-cute-lila-dark bg-clip-text text-transparent">
        CuteQR
      </span>
    </div>
  );
}
