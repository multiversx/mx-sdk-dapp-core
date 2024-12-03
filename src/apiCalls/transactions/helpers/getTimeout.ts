export function getTimeout(apiTimeout?: string | number) {
  return apiTimeout ? { timeout: parseInt(String(apiTimeout)) } : {};
}
