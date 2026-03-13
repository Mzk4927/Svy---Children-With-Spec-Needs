const { body, validationResult } = require('express-validator');

// Validation rules for user registration
const validateRegister = [
  body('name').notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'doctor', 'viewer', 'data_entry']).withMessage('Invalid role'),
];

// Validation rules for login
const validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// Validation rules for creating/updating a record
const validateRecord = [
  body('name').notEmpty().withMessage('Child name is required'),
  body('fatherName').notEmpty().withMessage('Father name is required'),
  body('district').notEmpty().withMessage('District is required'),
  body('age').isInt({ min: 0, max: 120 }).withMessage('Age must be a number between 0 and 120'),
  body('contact').optional().matches(/^[0-9+\-\s]{10,15}$/).withMessage('Invalid contact number'),
  body('disability').optional(),
  body('advice').optional(),
  body('remarks').optional(),
];

// Middleware to check validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation failed', 
      errors: errors.array() 
    });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateRecord,
  handleValidationErrors
};