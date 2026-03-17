const RAW_API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, '');
export const API_ORIGIN = API_BASE_URL.replace(/\/api$/, '');
