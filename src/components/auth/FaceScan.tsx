import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FaceScanProps {
  progress: number;
  scanning: boolean;
}

export default function FaceScan({ progress, scanning }: FaceScanProps) {
  const [radius, setRadius] = useState(0);
  const [circumference, setCircumference] = useState(0);

  useEffect(() => {
    const size = 256;
    const strokeWidth = 4;
    const r = (size - strokeWidth) / 2 - 8;
    setRadius(r);
    setCircumference(2 * Math.PI * r);
  }, []);

  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      <svg
        className="absolute inset-0 w-full h-full -rotate-90"
        viewBox="0 0 256 256"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="128"
          cy="128"
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="4"
        />
        <circle
          cx="128"
          cy="128"
          r={radius}
          stroke="url(#progressGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-300 ease-out"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00D4FF" />
            <stop offset="100%" stopColor="#7B68EE" />
          </linearGradient>
        </defs>
      </svg>

      <div className="absolute inset-4 rounded-full border-2 border-cyber-500/30">
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyber-400 rounded-tl-xl -mt-0.5 -ml-0.5" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyber-400 rounded-tr-xl -mt-0.5 -mr-0.5" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyber-400 rounded-bl-xl -mb-0.5 -ml-0.5" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyber-400 rounded-br-xl -mb-0.5 -mr-0.5" />

        <div className="absolute inset-0 rounded-full overflow-hidden">
          <AnimatePresence>
            {scanning && (
              <motion.div
                key="scanline"
                initial={{ y: '-100%' }}
                animate={{ y: '100%' }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute left-0 right-0 h-16 bg-gradient-to-b from-transparent via-cyber-400/40 to-transparent"
                style={{
                  boxShadow: '0 0 20px rgba(0, 212, 255, 0.6), 0 0 40px rgba(0, 212, 255, 0.3)',
                }}
              />
            )}
          </AnimatePresence>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-cyber-300 font-orbitron font-bold text-3xl mb-1">
              {Math.round(progress)}%
            </div>
            <div className={cn('text-xs font-medium', scanning ? 'text-cyber-400' : 'text-white/40')}>
              {progress >= 100 ? '识别完成' : scanning ? '扫描识别中...' : '等待开始'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
