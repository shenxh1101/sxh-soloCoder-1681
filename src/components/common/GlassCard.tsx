import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function GlassCard({ children, className, onClick }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-glass backdrop-blur-md border border-white/10 rounded-xl shadow-lg transition-all duration-300',
        onClick && 'cursor-pointer hover:shadow-xl hover:border-white/20',
        className
      )}
    >
      {children}
    </div>
  );
}
