const User = require('../models/User');
const generateToken = require('../utils/generateToken');

exports.register = async (req, res, next) => {
  try {
    const { username, password, role } = req.body;

    // Validation
    if (!username || username.trim() === "") {
      return res.status(400).json({ 
        success: false,
        errorType: "VALIDATION_ERROR",
        message: "Username is required" 
      });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ 
        success: false,
        errorType: "VALIDATION_ERROR",
        message: "Password must be at least 6 characters" 
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(409).json({ 
        success: false,
        errorType: "USER_EXISTS",
        message: "Username already taken" 
      });
    }

    // Create user
    const user = await User.create({ 
      username, 
      password, 
      role: role || 'User' 
    });

    if (!user) {
      return res.status(500).json({
        success: false,
        errorType: "DATABASE_ERROR",
        message: "Failed to create user"
      });
    }

    res.status(201).json({ 
      success: true,
      message: "User registered successfully",
      token: generateToken(user._id),
      user: { id: user._id, username: user.username, role: user.role }
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({ 
        success: false,
        errorType: "VALIDATION_ERROR",
        message: "Username and password are required" 
      });
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        errorType: "INVALID_CREDENTIALS",
        message: "Invalid username or password" 
      });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        errorType: "INVALID_CREDENTIALS",
        message: "Invalid username or password" 
      });
    }

    // Generate token
    const token = generateToken(user._id);
    if (!token) {
      return res.status(500).json({
        success: false,
        errorType: "TOKEN_ERROR",
        message: "Failed to generate authentication token"
      });
    }

    res.status(200).json({ 
      success: true,
      message: "Login successful",
      token,
      user: { id: user._id, username: user.username, role: user.role }
    });

  } catch (err) {
    next(err);
  }
};