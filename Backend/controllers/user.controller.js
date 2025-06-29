const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const sendEmail = require('../utils/sendEmail');


// Register new user
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ msg: 'Email already registered.' });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(4).toString('hex');
    const verificationTokenExpires = Date.now() + 3600000;

    // Create a new user
    const newUser = new User({
      name,
      email,
      passwordHash,
      verificationToken,
      verificationTokenExpires,
      isVerified: false
    });
    await newUser.save(); // Save the new user to the database

    // Send verification email
    await sendEmail(
      email,
      'HealthyEats: Verify Your Email',
      `<p>Use the following code to verify your email address:</p>
       <h2 style="color: #059669;">${verificationToken}</h2>
       <p>This code will expire in 1 hour.</p>`
    );

    res.status(201).json({
      msg: 'Verification code sent to email. Please verify to complete signup.',
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ msg: 'Server error during registration.' });
  }
};


// Verify signup OTP
exports.verifySignupOtp = async (req, res) => {
  const { email, token } = req.body;

  try {
    console.log('Incoming request for verifySignupOtp:', { email, token });
    const user = await User.findOne({
      email,
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      console.log('User not found or token expired');
      return res.status(400).json({ msg: 'Invalid or expired verification code.' });
    }

    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    user.isVerified = true;

    await user.save();

    // --- NEW: Generate JWT token for the newly registered user ---
    const jwtToken = jwt.sign(
      { userId: user._id }, // Payload: contains the user's ID
      process.env.JWT_SECRET, // Your secret key from environment variables
      { expiresIn: '7d' } // Token expiration time, e.g., 7 days
    );

    // --- NEW: Send success response with token and user ID ---
    res.status(201).json({
      msg: 'Registration successful!',
      token, // Send the generated token
      userId: user._id, // Send the new user's ID
      user: { // Optional: send back basic user info, consistent with login
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    console.error('Error in verifySignupOtp:', err); // Log the full error for debugging
    res.status(500).json({ msg: 'Server error during registration.' }); // Generic error message for client
  }
};


// Login (No changes needed here, it already returns token and user info)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ msg: 'Invalid email or password.' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ msg: 'Invalid email or password.' });

    // Generate JWT token (set your JWT_SECRET in .env)
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    user.lastLogin = new Date();
    await user.save();
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error during login.' });
  }
};


// Get user by ID (No changes needed here)
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) return res.status(404).json({ msg: 'User not found.' });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server error when fetching user.' });
  }
};


// Send recovery code for Forgot password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'No account with that email found.' });

    // Generate token and set expiry (1 hour)
    const token = crypto.randomBytes(4).toString('hex'); // Ex: "a8f1c2b3"
    const expires = Date.now() + 3600000;

    user.verificationToken = token;
    user.verificationTokenExpires = expires;
    await user.save();

    await sendEmail(
      email,
      'HealthyEats: Your Password Reset Code',
      `<p>Use the following code to reset your password:</p>
       <h2 style="color: #059669;">${token}</h2>
       <p>This code is valid for 1 hour.</p>`
    );

    res.json({ msg: 'Password reset code sent to your email address.' });
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({ msg: 'Server error during forgot password.' });
  }
};


// Verify Token (used for both reset and signup)
exports.verifyResetToken = async (req, res) => {
  const { email, token } = req.body;

  try {
    const user = await User.findOne({
      email,
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid or expired token.' });
    }

    res.json({ msg: 'Token is valid.' }); // You could also send user ID if needed
  } catch (err) {
    console.error('Verify token error:', err.message);
    res.status(500).json({ msg: 'Server error during token verification.' });
  }
};


// Reset Password
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({
      email,
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });


    if (!user) return res.status(400).json({ msg: 'Invalid or expired token.'});

    // Hash and update password
    const hashed = await bcrypt.hash(newPassword, 10);
    user.passwordHash = hashed;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;


    await user.save();
    res.json({ msg: 'Password has been reset successfully.' });
  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(500).json({ msg: 'Server error during password reset.' });
  }
};

