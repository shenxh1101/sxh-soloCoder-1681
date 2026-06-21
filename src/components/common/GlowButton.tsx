import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'danger' | 'success' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface GlowButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-cyber-500/20 border border-cyber-500/50 text-cyber-300 hover:bg-cyber-500/30 hover:shadow-[0_0_20px_rgba(0,212,255,0.4)]',
  danger:
    'bg-alert-500/20 border border-alert-500/50 text-alert-400 hover:bg-alert-500/30 hover:shadow-[0_0_20px_rgba(255,71,87,0.4)]',
  success:
    'bg-success-500/20 border border-success-500/50 text-success-400 hover:bg-success-500/30 hover:shadow-[0_0_20px_rgba(46,213,115,0.4)]',
  ghost:
    'bg-transparent border border-white/20 text-white/70 hover:bg-white/5 hover:border-cyber-500/50 hover:text-cyber-300',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-7 py-3.5 text-lg',
};

export default function GlowButton({
  variant = 'primary',
  size = 'md',
  disabled = false,
  className,
  children,
  onClick,
  ...rest
}: GlowButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'font-orbitron font-medium rounded-lg transition-all duration-300 border inline-flex items-center justify-center',
        variantStyles[variant],
        sizeStyles[size],
        disabled && 'opacity-50 cursor-not-allowed hover:shadow-none',
        !disabled && 'active:scale-95',
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
