import User from "../models/User.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { sendSuccess } from "../utils/responseHandlers.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import generateToken from "../utils/generateToken.js";
import eventEmitter from '../events/eventEmitter.js';
// const generateToken = (id) => {
//   if (!process.env.JWT_SECRET) {
//     throw new Error('JWT_SECRET is not configured in environment');
//   }
//   return jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: process.env.JWT_EXPIRE || '30d',
//   });
// };

export const register = asyncHandler(async (req, res, next) => {
  const { username, email, password } = req.body;

  const userExists = await User.findOne({ $or: [{ email }, { username }] });
  if (userExists) {
    return next(new AppError("User already exists", 400));
  }

  const user = await User.create({
    username,
    email,
    password,
  });

  const token = generateToken(user._id);

  sendSuccess(
    res,
    201,
    {
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      token,
    },
    "User registered successfully",
  );
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    return next(new AppError("Invalid credentials", 401));
  }

  const token = generateToken(user._id);

  eventEmitter.emit('USER_LOGGED_IN', {
    actorId: user._id,
    email: user.email,
    ipAddress: req.ip,
  });

  sendSuccess(
    res,
    200,
    {
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      token,
    },
    "Logged in successfully",
  );
});

export const getMe = asyncHandler(async (req, res, next) => {
  sendSuccess(res, 200, req.user, "User profile fetched successfully");
});

/**
 * Forgot Password — POST /api/v1/auth/forgot-password
 *
 * Accepts an email address and generates a password reset token.
 * The raw token is returned in the response so the frontend can
 * build a reset URL (e.g. /reset-password?token=<raw>).
 *
 * In production the token would be delivered via a transactional
 * email service (SendGrid, AWS SES, etc.).  The endpoint always
 * returns 200 regardless of whether the email exists in the
 * database to prevent user enumeration.
 *
 * Rate limited at the route level to prevent email-based DoS —
 * see forgotPasswordLimiter in auth.routes.js.
 */
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    // Return the same success response to prevent email enumeration.
    return sendSuccess(
      res,
      200,
      null,
      "If an account with that email exists, a password reset link has been sent.",
    );
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  eventEmitter.emit('PASSWORD_RESET_REQUESTED', {
    userId: user._id,
    email: user.email,
    ipAddress: req.ip,
  });

  // In a production environment the resetToken would be embedded in an
  // email link.  For now, include it in the response so the frontend
  // can use it directly during development / testing.
  sendSuccess(
    res,
    200,
    {
      resetToken,
      expiresIn: `${Number(process.env.PASSWORD_RESET_EXPIRES_MIN) || 10} minutes`,
    },
    "If an account with that email exists, a password reset link has been sent.",
  );
});

/**
 * Reset Password — POST /api/v1/auth/reset-password/:token
 *
 * Accepts a raw reset token (from the URL / email link) and a new
 * password.  The token is hashed with SHA-256 and compared against
 * the stored hash.  If the token is valid and not expired the
 * password is updated and all reset fields are cleared.
 */
export const resetPassword = asyncHandler(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new AppError("Reset token is invalid or has expired", 400),
    );
  }

  user.password = req.body.password;
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  await user.save();

  const token = generateToken(user._id);

  eventEmitter.emit('PASSWORD_RESET_COMPLETED', {
    userId: user._id,
    email: user.email,
    ipAddress: req.ip,
  });

  sendSuccess(
    res,
    200,
    {
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      token,
    },
    "Password has been reset successfully",
  );
});
