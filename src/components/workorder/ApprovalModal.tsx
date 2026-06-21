import { useState } from 'react';
import GlassCard from '@/components/common/GlassCard';
import GlowButton from '@/components/common/GlowButton';
import { useAppStore } from '@/store';
import { validateWorkOrderApproval } from '@/utils/validation';
import { X, FileCheck, XCircle } from 'lucide-react';
import type { FormValidationResult } from '@/types';

interface ApprovalModalProps {
  open: boolean;
  onClose: () => void;
  orderId: string;
  orderTitle: string;
}

type ActionType = 'approve' | 'reject' | null;

export default function ApprovalModal({ open, onClose, orderId, orderTitle }: ApprovalModalProps) {
  const { approveWorkOrder, rejectWorkOrder } = useAppStore();
  const [opinion, setOpinion] = useState('');
  const [error, setError] = useState('');
  const [resultMsg, setResultMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const resetState = () => {
    setOpinion('');
    setError('');
    setResultMsg(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSubmit = async (action: NonNullable<ActionType>) => {
    setError('');
    setResultMsg(null);

    const validation = validateWorkOrderApproval(opinion);
    if (!validation.valid) {
      setError(validation.errors.opinion || '审批意见至少5个字符');
      return;
    }

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));

    let result: FormValidationResult;
    let actionText: string;

    if (action === 'approve') {
      result = approveWorkOrder(orderId, opinion);
      actionText = '审批通过';
    } else {
      result = rejectWorkOrder(orderId, opinion);
      actionText = '已驳回';
    }

    setSubmitting(false);

    if (result.valid) {
      setResultMsg({ type: 'success', text: `${actionText}成功！` });
      setTimeout(() => {
        handleClose();
      }, 1200);
    } else {
      const firstError = Object.values(result.errors)[0];
      setResultMsg({ type: 'error', text: firstError || '操作失败，请重试' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <GlassCard className="w-full max-w-md p-6 relative">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition-colors"
          disabled={submitting}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <h2 className="text-xl font-bold text-white/90 font-orbitron mb-2 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-cyber-400" />
            工单审批
          </h2>
          <p className="text-sm text-white/60 line-clamp-2">{orderTitle}</p>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-white/70 mb-2">
            审批意见 <span className="text-alert-400">*</span>
          </label>
          <textarea
            value={opinion}
            onChange={(e) => {
              setOpinion(e.target.value);
              if (error) setError('');
              if (resultMsg) setResultMsg(null);
            }}
            placeholder="请输入审批意见（至少5个字符）..."
            rows={4}
            disabled={submitting}
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white/90 text-sm placeholder-white/30 focus:outline-none focus:border-cyber-500/50 focus:ring-1 focus:ring-cyber-500/30 transition-all resize-none disabled:opacity-50"
          />
          {error && (
            <p className="mt-2 text-xs text-alert-400 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" />
              {error}
            </p>
          )}
          {resultMsg && (
            <p
              className={`mt-2 text-xs flex items-center gap-1 ${
                resultMsg.type === 'success' ? 'text-success-400' : 'text-alert-400'
              }`}
            >
              {resultMsg.type === 'success' ? (
                <FileCheck className="w-3.5 h-3.5" />
              ) : (
                <XCircle className="w-3.5 h-3.5" />
              )}
              {resultMsg.text}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <GlowButton
            variant="danger"
            className="flex-1"
            onClick={() => handleSubmit('reject')}
            disabled={submitting}
          >
            <XCircle className="w-4 h-4 mr-1.5" />
            驳回
          </GlowButton>
          <GlowButton
            variant="success"
            className="flex-1"
            onClick={() => handleSubmit('approve')}
            disabled={submitting}
          >
            <FileCheck className="w-4 h-4 mr-1.5" />
            通过
          </GlowButton>
        </div>
      </GlassCard>
    </div>
  );
}
