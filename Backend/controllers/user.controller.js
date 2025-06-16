const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

    // Create a new user
    const newUser = new User({ name, email, passwordHash });
    await newUser.save(); // Save the new user to the database

    // --- NEW: Generate JWT token for the newly registered user ---
    const token = jwt.sign(
      { userId: newUser._id }, // Payload: contains the user's ID
      process.env.JWT_SECRET, // Your secret key from environment variables
      { expiresIn: '7d' } // Token expiration time, e.g., 7 days
    );

    // --- NEW: Send success response with token and user ID ---
    res.status(201).json({
      msg: 'Registration successful!',
      token, // Send the generated token
      userId: newUser._id, // Send the new user's ID
      user: { // Optional: send back basic user info, consistent with login
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });

  } catch (err) {
    console.error(err.message); // Log the full error for debugging
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