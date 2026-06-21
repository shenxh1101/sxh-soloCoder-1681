import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GlassCard from '@/components/common/GlassCard';
import GlowButton from '@/components/common/GlowButton';
import FaceScan from '@/components/auth/FaceScan';
import RoleSelector from '@/components/auth/RoleSelector';
import AlertToast from '@/components/common/AlertToast';
import { useAppStore } from '@/store';
import type { UserRole } from '@/types';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAppStore((state) => state.login);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [progress, setProgress] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!scanning || progress >= 100) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 4 + 1;
        if (next >= 100) {
          clearInterval(interval);
          setScanning(false);
          return 100;
        }
        return next;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [scanning, progress]);

  useEffect(() => {
    if (progress >= 100 && selectedRole && !isLoggingIn) {
      handleLoginComplete();
    }
  }, [progress, selectedRole, isLoggingIn]);

  const handleStartScan = () => {
    if (!selectedRole || scanning || isLoggingIn) return;
    setProgress(0);
    setScanning(true);
  };

  const handleLoginComplete = async () => {
    if (!selectedRole || isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await login(selectedRole);
      setTimeout(() => navigate('/'), 300);
    } catch {
      setProgress(0);
      setScanning(false);
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-space-900 bg-grid-pattern bg-grid-size relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-space-900 via-space-800/50 to-space-900 pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-cyber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-radar-500/10 blur-3xl pointer-events-none" />

      <AlertToast />

      <div className="relative z-10 min-h-screen grid grid-cols-1 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex flex-col justify-center px-8 lg:px-16 py-12"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyber-500/30 bg-cyber-500/10 mb-8">
              <span className="w-2 h-2 rounded-full bg-cyber-400 animate-pulse" />
              <span className="text-cyber-300 text-xs font-orbitron font-medium tracking-wider">
                SYSTEM ONLINE
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
            className="font-orbitron font-bold text-5xl lg:text-6xl text-white mb-4 leading-tight"
          >
            <span className="text-cyber-400">气象</span>监测
            <br />
            指挥平台
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
            className="text-white/60 text-lg mb-8 font-noto"
          >
            Weather Monitoring &amp; Command Platform
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65, ease: 'easeOut' }}
            className="space-y-4 text-white/70 text-sm font-noto max-w-md"
          >
            <p className="flex items-start gap-3">
              <span className="w-1 h-6 rounded-full bg-cyber-400 flex-shrink-0 mt-1" />
              <span>
                集成多站点实时气象数据采集与监控，支持温度、湿度、气压、风速风向等全要素监测
              </span>
            </p>
            <p className="flex items-start gap-3">
              <span className="w-1 h-6 rounded-full bg-radar-500 flex-shrink-0 mt-1" />
              <span>智能预警系统，基于多源数据融合分析，提前识别极端天气并推送预警通知</span>
            </p>
            <p className="flex items-start gap-3">
              <span className="w-1 h-6 rounded-full bg-success-500 flex-shrink-0 mt-1" />
              <span>提供可视化预报分析工具，辅助指挥决策，保障气象业务高效运转</span>
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex items-center justify-center px-8 py-12"
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
          >
            <GlassCard className="w-full max-w-md p-8">
              <div className="text-center mb-6">
                <h2 className="font-orbitron font-bold text-2xl text-white mb-1">
                  欢迎登录
                </h2>
                <p className="text-white/50 text-sm">请选择您的角色并完成身份验证</p>
              </div>

              <div className="mb-6">
                <label className="text-white/60 text-xs font-orbitron font-medium mb-2 block tracking-wider">
                  选择身份角色
                </label>
                <RoleSelector selectedRole={selectedRole} onChange={setSelectedRole} />
              </div>

              <div className="flex justify-center mb-6">
                <FaceScan progress={progress} scanning={scanning} />
              </div>

              <GlowButton
                variant="primary"
                size="lg"
                className="w-full"
                disabled={!selectedRole || scanning || isLoggingIn}
                onClick={handleStartScan}
              >
                {progress >= 100
                  ? '登录成功'
                  : scanning
                  ? '识别中...'
                  : selectedRole
                  ? '开始识别'
                  : '请先选择角色'}
              </GlowButton>
            </GlassCard>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.9 }}
        className="absolute bottom-6 left-0 right-0 text-center text-white/30 text-xs font-orbitron tracking-wider z-10"
      >
        © 2025 气象监测指挥平台 · Weather Command System v2.0 · All Rights Reserved
      </motion.div>
    </div>
  );
}
