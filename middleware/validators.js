const { check } = require('express-validator');

// Validate Registration Inputs
exports.validateRegistration = [
    check('name').not().isEmpty().withMessage('Name is required'),
    check('email').isEmail().withMessage('Enter a valid email'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    check('phone').isMobilePhone().withMessage('Enter a valid phone number')
  ];
  

// Validate Login Inputs
exports.validateLogin = [
  check('email').isEmail().withMessage('Enter a valid email'),
  check('password').not().isEmpty().withMessage('Password is required')
];
