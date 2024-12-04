export function isWindowAvailable() {
  return typeof window != 'undefined' && typeof window?.location != 'undefined';
}
