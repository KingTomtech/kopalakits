import { useState } from 'react';

const KEY = 'kopala_device_id';

function uuid() {
  // Modern browsers expose crypto.randomUUID; this is the fallback.
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  let s = '';
  const hex = '0123456789abcdef';
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) s += '-';
    else if (i === 14) s += '4';
    else if (i === 19) s += hex[(Math.random() * 4) | 8];
    else s += hex[(Math.random() * 16) | 0];
  }
  return s;
}

export function useDeviceId() {
  const [id] = useState(() => {
    try {
      let v = localStorage.getItem(KEY);
      if (!v) { v = uuid(); localStorage.setItem(KEY, v); }
      return v;
    } catch { return ''; }
  });
  return id;
}
