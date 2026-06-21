export function formatNumber(n: number, decimals = 1): string {
  return Number(n).toFixed(decimals);
}

export function formatTemperature(t: number): string {
  return `${formatNumber(t)}°C`;
}

export function formatHumidity(h: number): string {
  return `${Math.round(h)}%`;
}

export function formatPressure(p: number): string {
  return `${formatNumber(p)} hPa`;
}

export function formatWindSpeed(ws: number): string {
  return `${formatNumber(ws)} m/s`;
}

export function formatWindDirection(deg: number): string {
  const dirs = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
  const idx = Math.round(deg / 45) % 8;
  return `${dirs[idx]} ${deg}°`;
}

export function formatVisibility(v: number): string {
  if (v >= 1000) return `${formatNumber(v / 1000, 2)} km`;
  return `${v} m`;
}

export function formatDateTime(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function formatTime(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function formatDate(ts: number | string): string {
  const d = typeof ts === 'number' ? new Date(ts) : new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}小时${m % 60}分`;
  if (m > 0) return `${m}分${s % 60}秒`;
  return `${s}秒`;
}

export function todayStr(): string {
  return formatDate(Date.now());
}
