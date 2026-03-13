const rawApiUrl = process.env.REACT_APP_API_URL?.trim();

const normalizedOrigin = rawApiUrl
  ? rawApiUrl.replace(/\/+$/, '').replace(/\/api$/i, '')
  : '';

export const API_ORIGIN = normalizedOrigin;
export const API_BASE_URL = normalizedOrigin ? `${normalizedOrigin}/api` : '/api';
