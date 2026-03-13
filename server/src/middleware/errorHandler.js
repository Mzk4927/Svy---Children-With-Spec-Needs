// Global error handling middleware
module.exports = (err, req, res, next) => {
  console.error(err.stack);

  // Prisma unique constraint error
  if (err.code === 'P2002') {
    return res.status(400).json({
      message: 'Duplicate field value entered',
      field: err.meta?.target?.[0]
    });
  }

  // Prisma validation error
  if (err.name === 'PrismaClientValidationError') {
    return res.status(400).json({ message: 'Invalid database operation payload' });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired' });
  }

  // Default error
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};