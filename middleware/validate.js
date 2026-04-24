const { body, validationResult } = require('express-validator');

// Validate lead creation/update payload
exports.validateLead = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('phone').trim().notEmpty().withMessage('Phone is required')
    .matches(/^[0-9+\-\s()]{7,20}$/).withMessage('Invalid phone number'),
  body('email').trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address'),
  body('budget').notEmpty().withMessage('Budget is required')
    .isNumeric().withMessage('Budget must be a number')
    .custom((value) => value >= 0).withMessage('Budget cannot be negative'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('propertyType').notEmpty().withMessage('Property type is required')
    .isIn(['1 BHK', '2 BHK', '3 BHK', '4 BHK', 'Plot', 'Villa', 'Commercial'])
    .withMessage('Invalid property type'),
  body('source').notEmpty().withMessage('Source is required')
    .isIn(['Facebook', 'Google', 'Referral', 'Walk-in', 'Website', 'Other'])
    .withMessage('Invalid source'),
  body('status').optional()
    .isIn(['New', 'Contacted', 'Site Visit', 'Closed'])
    .withMessage('Invalid status'),
];

// Middleware to check validation results
exports.handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};
