import { cn } from '@/lib/utils';
import type { WorkOrderStatus } from '@/types';

interface StepIndicatorProps {
  currentStep: number;
  status: WorkOrderStatus;
}

const STEPS = [
  { id: 1, label: '观测员审核' },
  { id: 2, label: '预报员复核' },
  { id: 3, label: '局长终审' },
];

export default function StepIndicator({ currentStep, status }: StepIndicatorProps) {
  const isRejected = status === 'rejected';
  const isApproved = status === 'approved';
  const effectiveStep = isApproved ? 4 : isRejected ? 0 : currentStep;

  const getStepState = (stepId: number) => {
    if (isRejected) return 'rejected';
    if (effectiveStep > stepId || isApproved) return 'completed';
    if (effectiveStep === stepId) return 'current';
    return 'pending';
  };

  return (
    <div className="w-full py-2">
      <div className="relative flex items-center justify-between">
        {STEPS.map((step, idx) => {
          const state = getStepState(step.id);
          const isLast = idx === STEPS.length - 1;
          return (
            <div key={step.id} className="flex flex-col items-center relative z-10 flex-1">
              {!isLast && (
                <div className="absolute top-4 left-1/2 w-full h-0.5 -translate-y-1/2 z-0">
                  <div
                    className={cn(
                      'h-full transition-all duration-700',
                      state === 'completed' || (state === 'current' && idx === 0) ? 'bg-success-500' : 'bg-white/15',
                    )}
                    style={{
                      width:
                        state === 'completed'
                          ? '100%'
                          : state === 'current'
                            ? '0%'
                            : '0%',
                      animation:
                        state === 'current' && idx < 2
                          ? 'line-fill 1.5s ease-in-out forwards'
                          : undefined,
                    }}
                  />
                </div>
              )}
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-500 relative z-10',
                  state === 'completed' &&
                    'bg-success-500/20 border-success-500 text-success-400 shadow-[0_0_15px_rgba(46,213,115,0.3)]',
                  state === 'current' &&
                    'bg-cyber-500/30 border-cyber-400 text-cyber-300 shadow-[0_0_25px_rgba(0,212,255,0.6)] animate-pulse-glow',
                  state === 'pending' &&
                    'bg-white/5 border-white/20 text-white/40',
                  state === 'rejected' &&
                    'bg-alert-500/20 border-alert-500 text-alert-400 shadow-[0_0_15px_rgba(255,71,87,0.3)]',
                )}
              >
                {state === 'completed' ? '✓' : state === 'rejected' ? '✕' : step.id}
              </div>
              <span
                className={cn(
                  'mt-2 text-xs font-medium whitespace-nowrap transition-colors duration-300',
                  state === 'completed' && 'text-success-400',
                  state === 'current' && 'text-cyber-300',
                  state === 'pending' && 'text-white/40',
                  state === 'rejected' && 'text-alert-400',
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes line-fill {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
