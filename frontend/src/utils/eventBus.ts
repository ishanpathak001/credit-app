type Callback = (payload?: any) => void;

const listeners: Record<string, Set<Callback>> = {};

export const on = (event: string, cb: Callback) => {
  if (!listeners[event]) listeners[event] = new Set();
  listeners[event].add(cb);
  return () => listeners[event].delete(cb);
};

export const off = (event: string, cb: Callback) => {
  listeners[event]?.delete(cb);
};

export const emit = (event: string, payload?: any) => {
  listeners[event] && Array.from(listeners[event]).forEach(cb => cb(payload));
};

export default { on, off, emit };
