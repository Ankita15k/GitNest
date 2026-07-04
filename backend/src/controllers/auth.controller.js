import User from "../models/User.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import { sendSuccess } from "../utils/responseHandlers.js";
import crypto from "crypto";
import generateToken from "../utils/generateToken.js";
import eventEmitter from '../events/eventEmitter.js';

export const register = asyncHandler(async (req, res, next) => {
  // Prevent Mass Assignment Privilege Escalation (Issue #427)
  delete req.body.role;
  delete req.body.isAdmin;
  delete req.body.permissions;

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
