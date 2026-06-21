import type { FormValidationResult, RealtimeWeather, WeatherStation } from '@/types';
import { ALERT_THRESHOLDS } from './constants';

export function validateRealtimeAlertData(
  data: RealtimeWeather | undefined | null,
  station: WeatherStation | undefined | null,
): FormValidationResult & { details?: string[] } {
  const errors: Record<string, string> = {};
  const details: string[] = [];

  if (!station) {
    errors.station = '关联站点信息缺失';
    details.push('关联站点信息缺失');
  } else {
    if (!station.id || !String(station.id).trim()) {
      errors.stationId = '站点ID不能为空';
      details.push('站点ID不能为空');
    }
    if (!station.name || !String(station.name).trim()) {
      errors.stationName = '站点名称不能为空';
      details.push('站点名称不能为空');
    }
  }

  if (!data) {
    errors.data = '实时气象数据缺失';
    details.push('实时气象数据缺失，无法进行预警判定');
    return { valid: false, errors, details };
  }

  if (typeof data.temperature !== 'number' || isNaN(data.temperature)) {
    errors.temperature = '温度数据格式错误，必须是有效数字';
    details.push('温度数据格式错误');
  } else if (data.temperature < -60 || data.temperature > 60) {
    errors.temperature = `温度数据超出合理范围（-60°C ~ 60°C），当前值：${data.temperature}°C`;
    details.push(`温度 ${data.temperature}°C 超出合理范围`);
  }

  if (typeof data.humidity !== 'number' || isNaN(data.humidity)) {
    errors.humidity = '湿度数据格式错误，必须是有效数字';
    details.push('湿度数据格式错误');
  } else if (data.humidity < 0 || data.humidity > 100) {
    errors.humidity = `湿度数据超出合理范围（0% ~ 100%），当前值：${data.humidity}%`;
    details.push(`湿度 ${data.humidity}% 超出合理范围`);
  }

  if (typeof data.pressure !== 'number' || isNaN(data.pressure)) {
    errors.pressure = '气压数据格式错误，必须是有效数字';
    details.push('气压数据格式错误');
  } else if (data.pressure < 900 || data.pressure > 1100) {
    errors.pressure = `气压数据超出合理范围（900hPa ~ 1100hPa），当前值：${data.pressure}hPa`;
    details.push(`气压 ${data.pressure}hPa 超出合理范围`);
  }

  if (typeof data.windSpeed !== 'number' || isNaN(data.windSpeed)) {
    errors.windSpeed = '风速数据格式错误，必须是有效数字';
    details.push('风速数据格式错误');
  } else if (data.windSpeed < 0 || data.windSpeed > 100) {
    errors.windSpeed = `风速数据超出合理范围（0 ~ 100 m/s），当前值：${data.windSpeed}m/s`;
    details.push(`风速 ${data.windSpeed}m/s 超出合理范围`);
  }

  if (typeof data.windDirection !== 'number' || isNaN(data.windDirection)) {
    errors.windDirection = '风向数据格式错误，必须是有效数字';
    details.push('风向数据格式错误');
  } else if (data.windDirection < 0 || data.windDirection > 360) {
    errors.windDirection = `风向数据超出合理范围（0° ~ 360°），当前值：${data.windDirection}°`;
    details.push(`风向 ${data.windDirection}° 超出合理范围`);
  }

  if (typeof data.visibility !== 'number' || isNaN(data.visibility)) {
    errors.visibility = '能见度数据格式错误，必须是有效数字';
    details.push('能见度数据格式错误');
  } else if (data.visibility < 0 || data.visibility > 50000) {
    errors.visibility = `能见度数据超出合理范围（0 ~ 50000 m），当前值：${data.visibility}m`;
    details.push(`能见度 ${data.visibility}m 超出合理范围`);
  }

  const isWindAlert = typeof data.windSpeed === 'number' && data.windSpeed >= ALERT_THRESHOLDS.WIND_LEVEL_6;
  const isVisAlert = typeof data.visibility === 'number' && data.visibility <= ALERT_THRESHOLDS.VISIBILITY_LOW;
  if (!isWindAlert && !isVisAlert) {
    details.push('数据未达到预警阈值（风速≥10.8m/s 或 能见度≤500m）');
  }

  return { valid: Object.keys(errors).length === 0, errors, details };
}

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
