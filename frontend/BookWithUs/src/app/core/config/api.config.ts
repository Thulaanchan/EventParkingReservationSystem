import { environment } from '../../../environments/environment';

const cleanBaseUrl = environment.apiUrl.replace(/\/+$/, '');

export const API_CONFIG = {
  baseUrl: cleanBaseUrl
} as const;

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_CONFIG.baseUrl}${normalizedPath}`;
}
