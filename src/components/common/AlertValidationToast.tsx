import { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, AlertCircle, FileWarning } from 'lucide-react';
import { useAppStore } from '@/store';
import { formatTime } from '@/utils/formatters';

export default function AlertValidationToast() {
  const validationError = useAppStore((state) => state.alertValidationError);
  const clearError = useAppStore((state) => state.clearAlertValidationError);
  const [visible, setVisible] = useState(false);
  const lastTsRef = useRef<number | null>(null);

  useEffect(() => {
    if (validationError && validationError.timestamp !== lastTsRef.current) {
      lastTsRef.current = validationError.timestamp;
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [validationError]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      clearError();
      lastTsRef.current = null;
    }, 300);
  };

  if (!validationError) return null;

  const errList = Object.values(validationError.errors);
  const detailList = validationError.details ?? [];

  return (
    <div className="fixed top-24 right-4 z-50 pointer-events-none">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="pointer-events-auto w-96 backdrop-blur-md rounded-xl border border-orange-500/60 bg-orange-500/15 shadow-xl shadow-orange-500/20 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
            <div className="flex items-start justify-between gap-3 pl-3 p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <FileWarning className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <div className="font-orbitron font-bold text-sm text-orange-300">
                      预警发布校验失败
                    </div>
                    <div className="text-[11px] text-white/50 mt-0.5">
                      {validationError.stationName} · {formatTime(validationError.timestamp)}
                    </div>
                  </div>
                </div>

                {errList.length > 0 && (
                  <div className="mb-2">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <AlertCircle className="w-3 h-3 text-orange-400" />
                      <span className="text-[11px] font-semibold text-orange-300">校验错误</span>
                    </div>
                    <ul className="space-y-1 ml-4.5">
                      {errList.slice(0, 5).map((msg, idx) => (
                        <li key={idx} className="text-[11px] text-white/75 leading-relaxed list-disc marker:text-orange-400">
                          {msg}
                        </li>
                      ))}
                      {errList.length > 5 && (
                        <li className="text-[11px] text-white/40 italic">
                          还有 {errList.length - 5} 项错误未展示...
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {detailList.length > 0 && (
                  <div className="pt-2 border-t border-white/5">
                    <div className="text-[10px] text-white/40 mb-1">详细信息：</div>
                    <div className="text-[10px] text-white/35 leading-relaxed line-clamp-3">
                      {detailList.join('；')}
                    </div>
                  </div>
                )}

                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-white/30">
                    已阻止本次预警推送与工单生成
                  </span>
                  <button
                    onClick={handleClose}
                    className="px-2.5 py-1 text-[10px] rounded-md bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 transition-colors font-medium"
                  >
                    我知道了
                  </button>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-white/40 hover:text-white/80 transition-colors p-1 rounded hover:bg-white/5 flex-shrink-0 -mr-1"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
