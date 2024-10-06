const express = require('express');
const { register, login, logout} = require('../controllers/userController');
const { forgotPassword, resetPassword } = require('../controllers/userController');
const { validateRegistration, validateLogin } = require('../middleware/validators');
const passport = require('passport');
const router = express.Router();

// Registration Routes
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.get('/logout', logout);

// Forgot Password
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Google OAuth Login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    (req, res) => {
      const { token } = req.user; // Token generated in Google strategy
      res.redirect(`http://localhost:3000/dashboard?token=${token}`); // Redirect to frontend with token
    }
  );

module.exports = router;
