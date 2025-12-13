// the authentication routes for signup, login, profile update, and fetching user info
// it uses JWT for token-based authentication and bcrypt for password hashing
// it also includes middleware to protect routes that require authentication
// it uses the User model to interact with the database

import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// router for auth-related endpoints
const router = express.Router();

// secret key for JWT signing
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key";

// middleware to authenticate requests using JWT
const authenticate = async (req, res, next) => {
  try {
    // Verify the token
    const auth = req.headers.authorization;
    // Check if token is provided
    if (!auth) {
      console.log("[AUTH] No token provided");
      return res.status(401).json({ error: "no token" });
    }
    // Verify the token
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch the full user object from database
    const user = await User.findById(decoded.id).select("-passwordHash");
    // If user not found
    if (!user) {
      console.log("[AUTH] User not found for token");
      return res.status(401).json({ error: "user not found" });
    }

    // Attach user to request object
    req.user = user;
    console.log("[AUTH] Token verified for user:", decoded.email);
    next();
  } catch (err) {
    console.error("[AUTH] Invalid token:", err.message);
    res.status(401).json({ error: "invalid token" });
  }
};

// POST /api/auth/signup
// Signup a new user
router.post("/signup", async (req, res) => {
  try {
    // Extract email and password from request body
    const { email, password } = req.body;
    console.log("[AUTH] Signup attempt for email:", email);
    // Validate input
    if (!email || !password) {
      console.warn("[AUTH] Signup failed: missing email or password");
      return res.status(400).json({ error: "email,password required" });
    }
    // Check if email is already in use
    const existing = await User.findOne({ email });

    // If email already exists
    if (existing) {
      console.warn("[AUTH] Signup failed: email already in use:", email);
      return res.status(409).json({ error: "email already in use" });
    }
    // Hash the password
    // Generate salt for password hashing (10 rounds)
    const salt = await bcrypt.genSalt(10);
    // Hash password with salt
    const hash = await bcrypt.hash(password, salt);
    // Create new user
    const user = await User.create({ email, passwordHash: hash });
    // Generate JWT token
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });
    // Respond with token and user info
    console.log("[AUTH] Signup successful for user:", user.email);
    res.status(201).json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    console.error("[AUTH] Signup error:", err);
    res.status(500).json({ error: "server error" });
  }
});

// POST /api/auth/login
// Login a user
// Returns a JWT token
// Returns user info
router.post("/login", async (req, res) => {
  try {
    // Extract email and password from request body
    const { email, password } = req.body;
    console.log("[AUTH] Login attempt for email:", email);
    // Validate input
    if (!email || !password) {
      console.warn("[AUTH] Login failed: missing email or password");
      return res.status(400).json({ error: "email,password required" });
    }
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.warn("[AUTH] Login failed: user not found:", email);
      return res.status(401).json({ error: "invalid credentials" });
    }
    // Compare password with stored hash
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      console.warn("[AUTH] Login failed: invalid password for:", email);
      return res.status(401).json({ error: "invalid credentials" });
    }
    // Generate JWT token
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });
    console.log("[AUTH] Login successful for user:", user.email);
    res.json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    console.error("[AUTH] Login error:", err);
    res.status(500).json({ error: "server error" });
  }
});

// GET /api/auth/me
// Returns user info
// Requires authentication
// Returns user info
router.get("/me", async (req, res) => {
  try {
    // Verify token
    const auth = req.headers.authorization;
    if (!auth) {
      console.warn("[AUTH] Me request: no token");
      return res.status(401).json({ error: "no token" });
    }
    // Verify token
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("[AUTH] Me request for user:", decoded.email);
    const user = await User.findById(decoded.id).select("-passwordHash");
    if (!user) {
      console.warn("[AUTH] Me request: user not found:", decoded.email);
      return res.status(404).json({ error: "user not found" });
    }
    // Return user info
    console.log("[AUTH] Me request successful for user:", user.email);
    res.json({ user });
  } catch (err) {
    console.error("[AUTH] Me request error:", err);
    res.status(401).json({ error: "invalid token" });
  }
});

// PUT /api/auth/profile
// Update user profile
// Requires authentication
// Returns user info
router.put("/profile", authenticate, async (req, res) => {
  try {
    // Log the profile update attempt
    console.log("[AUTH] Profile update for user:", req.user.email);
    const { displayName, bio, avatar, favoriteGame, username } = req.body;

    // Validate input
    if (
      displayName &&
      (typeof displayName !== "string" || displayName.length > 50)
    ) {
      return res
        .status(400)
        .json({ error: "Display name must be a string under 50 characters" });
    }

    // Validate bio and username
    if (bio && (typeof bio !== "string" || bio.length > 500)) {
      return res
        .status(400)
        .json({ error: "Bio must be a string under 500 characters" });
    }
    // Validate username
    if (
      username &&
      (typeof username !== "string" ||
        username.length < 3 ||
        username.length > 20)
    ) {
      return res
        .status(400)
        .json({ error: "Username must be 3-20 characters" });
    }

    // Check if username is already taken
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({
        username,
        _id: { $ne: req.user._id },
      });
      if (existingUser) {
        return res.status(400).json({ error: "Username is already taken" });
      }
    }

    // Update user profile
    const updateData = {};
    // Only update fields that are provided
    if (displayName !== undefined) updateData.displayName = displayName;
    // Only update fields that are provided
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (favoriteGame !== undefined) updateData.favoriteGame = favoriteGame;
    if (username !== undefined) updateData.username = username;
    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    // If user not found
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Log successful profile update
    console.log(
      "[AUTH] Profile updated successfully for user:",
      req.user.email
    );
    res.json({
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        username: updatedUser.username,
        displayName: updatedUser.displayName,
        bio: updatedUser.bio,
        avatar: updatedUser.avatar,
        favoriteGame: updatedUser.favoriteGame,
        profileCompleted: updatedUser.profileCompleted,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (err) {
    console.error("[AUTH] Profile update error:", err);
    res.status(500).json({ error: "server error" });
  }
});

export default router;
