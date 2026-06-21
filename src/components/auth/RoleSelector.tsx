import { Eye, CloudRain, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';
import { USER_ROLE_LABELS } from '@/utils/constants';

interface RoleSelectorProps {
  selectedRole: UserRole | null;
  onChange: (role: UserRole) => void;
}

const roleConfig: { key: UserRole; Icon: typeof Eye; description: string }[] = [
  { key: 'observer', Icon: Eye, description: '实时数据监控' },
  { key: 'forecaster', Icon: CloudRain, description: '气象预报分析' },
  { key: 'director', Icon: Crown, description: '全局指挥调度' },
];

export default function RoleSelector({ selectedRole, onChange }: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {roleConfig.map(({ key, Icon, description }) => {
        const isSelected = selectedRole === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={cn(
              'group relative p-4 rounded-xl border transition-all duration-300 text-center',
              isSelected
                ? 'bg-cyber-500/15 border-cyber-500/60 shadow-[0_0_25px_rgba(0,212,255,0.25)]'
                : 'bg-white/5 border-white/10 hover:border-cyber-500/30 hover:bg-white/10'
            )}
          >
            {isSelected && (
              <div className="absolute inset-0 rounded-xl animate-pulse-glow pointer-events-none opacity-60" />
            )}
            <div
              className={cn(
                'w-10 h-10 mx-auto mb-2 rounded-lg flex items-center justify-center transition-all duration-300',
                isSelected ? 'bg-cyber-500/30 text-cyber-300' : 'bg-white/5 text-white/60 group-hover:text-cyber-400'
              )}
            >
              <Icon size={20} strokeWidth={2} />
            </div>
            <div
              className={cn(
                'font-orbitron font-semibold text-sm mb-0.5 transition-colors duration-300',
                isSelected ? 'text-cyber-300' : 'text-white/80'
              )}
            >
              {USER_ROLE_LABELS[key]}
            </div>
            <div
              className={cn(
                'text-[10px] transition-colors duration-300',
                isSelected ? 'text-cyber-400/80' : 'text-white/40'
              )}
            >
              {description}
            </div>
          </button>
        );
      })}
    </div>
  );
}
