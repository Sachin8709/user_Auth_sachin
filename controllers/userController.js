const User = require('../models/User');
const passport = require('passport');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { sendOTPEmail } = require('../services/emailService');

const generateToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
};
exports.register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const { name, email, password, phone } = req.body;
  
    try {
      let userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: "User already exists with this email" });
      }
      let phoneExists = await User.findOne({ phone });
      if (phoneExists) {
        return res.status(400).json({ message: "User already exists with this phone number" });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ name, email, password: hashedPassword, phone });
      await user.save();
      const token = generateToken(user);
  
      res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone
        }
      });
    } catch (err) {
      res.status(500).json({ message: "Error registering user", error: err.message });
    }
  };
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Error logging in", error: err.message });
  }
};

exports.logout = (req, res) => {
  
  req.logout(); 
  res.status(200).json({ message: "Logout successful" });
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
     console.log(req.body)
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const OTP = generateOTP();
  
      await sendOTPEmail(email, OTP);
  
      user.resetOTP = OTP;
      await user.save();
  
      res.status(200).json({ message: "OTP sent successfully" });
    } catch (err) {
      res.status(500).json({ message: "Error sending OTP", error: err.message });
    }
  };

  exports.resetPassword = async (req, res) => {
    const { otp, newPassword } = req.body;
  
    try {
      const user = await User.findOne({ resetOTP: otp });
      if (!user) {
        return res.status(400).json({ message: "Invalid OTP" });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      user.resetOTP = undefined; 
      await user.save();
  
      res.status(200).json({ message: "Password reset successful" });
    } catch (err) {
      res.status(500).json({ message: "Error resetting password", error: err.message });
    }
  };
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/users/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  const email = profile.emails[0].value;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name: profile.displayName,
        email: email,
        googleId: profile.id
      });
      await user.save();
    }

    const token = generateToken(user);

    done(null, { user, jwtToken: token });
  } catch (err) {
    done(err, false);
  }
}));

exports.googleLogin = passport.authenticate('google', {
  scope: ['profile', 'email']
});

exports.googleCallback = (req, res) => {
  const { jwtToken } = req.user;
  res.redirect(`/success?token=${jwtToken}`); 
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); 
};
