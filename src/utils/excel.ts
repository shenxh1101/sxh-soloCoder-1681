import * as XLSX from 'xlsx';
import type { DailyReport } from '@/types';
import { formatDateTime } from './formatters';

export function generateDailyReportExcel(report: DailyReport): Blob {
  const wb = XLSX.utils.book_new();

  const extremesData = report.stations.map((s) => ({
    气象站: s.stationName,
    最高温度: s.maxTemp,
    最低温度: s.minTemp,
    平均温度: Number(((s.maxTemp + s.minTemp) / 2).toFixed(1)),
    最高湿度: s.maxHumidity,
    最低湿度: s.minHumidity,
    最大风速: s.maxWind,
    最低能见度: s.minVisibility,
  }));
  const ws1 = XLSX.utils.json_to_sheet(extremesData);
  XLSX.utils.book_append_sheet(wb, ws1, '各站极值');

  const alertData = report.alertDetails.map((a) => ({
    气象站: a.station,
    预警类型: a.type,
    预警级别: a.level,
    触发时间: a.time,
    预警信息: `${a.type}${a.level}`,
  }));
  if (alertData.length === 0) {
    alertData.push({ 气象站: '-', 预警类型: '-', 预警级别: '-', 触发时间: '-', 预警信息: '当日无预警' });
  }
  const ws2 = XLSX.utils.json_to_sheet(alertData);
  XLSX.utils.book_append_sheet(wb, ws2, '预警次数');

  const accuracyData = [
    { 日期: report.date, 预警总次数: report.alertCount, 预报准确率: `${report.forecastAccuracy}%` },
  ];
  const ws3 = XLSX.utils.json_to_sheet(accuracyData);
  XLSX.utils.book_append_sheet(wb, ws3, '准确率');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

export function exportDailyReportBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadBlob(blob: Blob, filename: string) {
  exportDailyReportBlob(blob, filename);
}
