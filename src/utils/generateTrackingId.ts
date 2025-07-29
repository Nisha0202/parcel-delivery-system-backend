export function generateTrackingId() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0,10).replace(/-/g,'');
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TRK-${dateStr}-${randomStr}`;
}