import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.model.js";

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
        scope: ["user:email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ githubId: profile.id });
          if (!user) {
            const email = profile.emails?.[0]?.value;
            user = await User.create({
              username: profile.username,
              email,
              githubId: profile.id,
              avatar: profile.photos?.[0]?.value,
            });
          }
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      },
    ),
  );
} else {
  console.warn('GitHub OAuth not configured — GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET missing');
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error("Email is required but not provided by Google."), null);
          }

          let user = await User.findOne({ googleId: profile.id });
          if (!user) {
            // Check if email already exists
            user = await User.findOne({ email: email.toLowerCase() });
            if (user) {
              // Link account
              user.googleId = profile.id;
              if (!user.avatar) {
                user.avatar = profile.photos?.[0]?.value;
              }
              // Repair legacy user records with missing or "undefined" usernames
              if (!user.username || user.username === "undefined") {
                const emailPrefix = email.split("@")[0];
                const baseUsername = emailPrefix.replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase() || "user";
                let username = baseUsername;
                let userExists = await User.findOne({ username });
                let count = 1;
                while (userExists) {
                  username = `${baseUsername}${count}`;
                  userExists = await User.findOne({ username });
                  count++;
                }
                user.username = username;
              }
              await user.save();
            } else {
              // Create new account
              const emailPrefix = email.split("@")[0];
              const baseUsername = emailPrefix.replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase() || "user";
              
              let username = baseUsername;
              let userExists = await User.findOne({ username });
              let count = 1;
              while (userExists) {
                username = `${baseUsername}${count}`;
                userExists = await User.findOne({ username });
                count++;
              }

              user = await User.create({
                username,
                email: email.toLowerCase(),
                googleId: profile.id,
                avatar: profile.photos?.[0]?.value,
                displayName: profile.displayName || "",
              });
            }
          }
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      },
    ),
  );
} else {
  console.warn('Google OAuth not configured — GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing');
}

export default passport;