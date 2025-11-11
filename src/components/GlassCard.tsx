import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className = '', hover = false }: GlassCardProps) {
  return (
    <div
      className={`
        relative backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/[0.02]
        rounded-2xl border border-amber-500/20 shadow-2xl
        ${hover ? 'transition-all duration-500 hover:scale-105 hover:border-amber-500/60 hover:shadow-amber-500/20' : ''}
        ${className}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent rounded-2xl" />
      <div className="relative">{children}</div>
    </div>
  );
}
