export const safeWindow =
  typeof window !== 'undefined' ? window : ({} as Window);
