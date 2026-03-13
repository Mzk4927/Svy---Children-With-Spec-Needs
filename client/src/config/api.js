const fallbackApiUrl = 'https://svy-children-with-spec-needs-production.up.railway.app/api';
const rawApiUrl = process.env.REACT_APP_API_URL?.trim() || fallbackApiUrl;

const normalizedOrigin = rawApiUrl
  ? rawApiUrl.replace(/\/+$/, '').replace(/\/api$/i, '')
  : '';

export const API_ORIGIN = normalizedOrigin;
export const API_BASE_URL = normalizedOrigin ? `${normalizedOrigin}/api` : '/api';
