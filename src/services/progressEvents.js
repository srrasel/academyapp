export const LOCAL_GUEST_ID = 'local-guest';

const listeners = new Set();

export function subscribeProgressUpdates(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifyProgressUpdate(data) {
  listeners.forEach((listener) => listener(data));
}

export function getProgressUserId(user) {
  return user?.uid || LOCAL_GUEST_ID;
}
