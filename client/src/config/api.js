// client/src/config/api.js

// PRO STRATEGY: 
// 1. Agar production (Railway) par hai, toh hamesha live backend URL use karo.
// 2. Agar local machine par hai, tabhi localhost use karo.

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const LIVE_BACKEND_URL = 'https://svy-children-with-spec-needs-production.up.railway.app/api'; 
const LOCAL_BACKEND_URL = 'http://localhost:5000/api';

export const API_BASE_URL = IS_PRODUCTION ? LIVE_BACKEND_URL : LOCAL_BACKEND_URL;

// Derived origin (no trailing /api) — used for building image URLs
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

console.log("Current Environment:", process.env.NODE_ENV);
console.log("Using API Base URL:", API_BASE_URL);
