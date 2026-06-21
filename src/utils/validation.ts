import type { FormValidationResult } from '@/types';

export function validateWorkOrderSubmission(data: {
  title?: string;
  description?: string;
  opinion?: string;
}): FormValidationResult {
  const errors: Record<string, string> = {};
  if (data.title !== undefined) {
    if (!data.title.trim()) errors.title = '预警标题不能为空';
    else if (data.title.length > 100) errors.title = '标题长度不能超过100字符';
  }
  if (data.description !== undefined) {
    if (!data.description.trim()) errors.description = '预警描述不能为空';
  }
  if (data.opinion !== undefined) {
    if (!data.opinion.trim()) errors.opinion = '审批意见不能为空';
    else if (data.opinion.length < 5) errors.opinion = '审批意见至少5个字符';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateWorkOrderApproval(opinion: string): FormValidationResult {
  const errors: Record<string, string> = {};
  const trimmed = opinion?.trim() ?? '';
  if (!trimmed) {
    errors.opinion = '审批意见不能为空';
  } else if (trimmed.length < 5) {
    errors.opinion = '审批意见至少需要5个字符';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateAlertPublish(data: { title: string; description: string }): FormValidationResult {
  const errors: Record<string, string> = {};
  const title = data?.title?.trim() ?? '';
  const description = data?.description?.trim() ?? '';
  if (!title) {
    errors.title = '标题不能为空';
  } else if (title.length > 100) {
    errors.title = '标题不能超过100个字符';
  }
  if (!description) {
    errors.description = '描述不能为空';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateLogin(data: { faceId?: string; role?: string }): FormValidationResult {
  const errors: Record<string, string> = {};
  if (!data.role) errors.role = '请选择用户角色';
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateDateRange(start: string | number | Date, end: string | number | Date): FormValidationResult {
  const errors: Record<string, string> = {};
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (isNaN(startDate.getTime())) {
    errors.start = '开始日期格式不正确';
  }
  if (isNaN(endDate.getTime())) {
    errors.end = '结束日期格式不正确';
  }
  if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate > endDate) {
    errors.range = '开始日期不能晚于结束日期';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}
