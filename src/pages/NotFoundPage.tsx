import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import GlowButton from '@/components/common/GlowButton';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-space-900 bg-grid-pattern bg-grid-size flex items-center justify-center px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-space-900 via-space-800/50 to-space-900 pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full bg-alert-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 w-96 h-96 rounded-full bg-cyber-500/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="mb-6"
        >
          <h1
            className="font-orbitron font-black text-[12rem] lg:text-[14rem] leading-none bg-clip-text text-transparent bg-gradient-to-b from-cyber-400 via-cyber-300/80 to-radar-500/60"
            style={{
              textShadow:
                '0 0 60px rgba(0, 212, 255, 0.35), 0 0 120px rgba(0, 212, 255, 0.15)',
            }}
          >
            404
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
        >
          <h2 className="font-orbitron font-bold text-2xl lg:text-3xl text-white mb-3">
            页面未找到
          </h2>
          <p className="text-white/50 text-sm lg:text-base mb-10 max-w-md mx-auto font-noto">
            您访问的页面不存在，或者已被移动、删除。请检查网址是否正确，或返回首页继续操作。
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: 'easeOut' }}
        >
          <GlowButton
            variant="primary"
            size="lg"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2"
        >
            <Home size={18} />
            返回首页
          </GlowButton>
        </motion.div>
      </div>
    </div>
  );
}
