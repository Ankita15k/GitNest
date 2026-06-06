import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please add a username"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
      lowercase: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.githubId;
      },
      minlength: 6,
      select: false,
    },
    githubId: {
      type: String,
      default: null,
    },
    passwordResetToken: {
      type: String,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
    },

    avatar: {
      type: String,
      default: "",
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    website: {
      type: String,
      default: "",
    },
    displayName: {
      type: String,
      default: "",
    },
    company: {
      type: String,
      default: "",
    },
    twitterHandle: {
      type: String,
      default: "",
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Generate a password reset token.
 *
 * Returns the raw (unhashed) token to be sent to the user via email.
 * The hashed version is stored in the database so that a database
 * compromise does not leak usable tokens.  The token expires after
 * 10 minutes by default (configurable via PASSWORD_RESET_EXPIRES_MIN).
 */
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const expiresMin = Number(process.env.PASSWORD_RESET_EXPIRES_MIN) || 10;
  this.passwordResetExpires = Date.now() + expiresMin * 60 * 1000;

  return resetToken;
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
