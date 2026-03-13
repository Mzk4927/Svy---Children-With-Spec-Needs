const parseAllowedOrigins = () => {
  const clientUrl = process.env.CLIENT_URL || '';

  return clientUrl
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);
};

const allowedOrigins = parseAllowedOrigins();

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  const normalizedOrigin = origin.replace(/\/+$/, '');
  return allowedOrigins.includes(normalizedOrigin);
};

const corsOriginHandler = (origin, callback) => {
  if (allowedOrigins.length === 0 || isAllowedOrigin(origin)) {
    callback(null, true);
    return;
  }

  callback(new Error(`CORS blocked for origin: ${origin}`));
};

const socketCorsOrigin = allowedOrigins.length === 0 ? true : allowedOrigins;

module.exports = {
  allowedOrigins,
  corsOptions: {
    origin: corsOriginHandler,
    credentials: true,
  },
  socketCorsOptions: {
    origin: socketCorsOrigin,
    credentials: true,
  },
};
