import { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "../../store/authStore";
import { useToastStore } from "../../store/useToastStore";
import { useNavigate, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Check,
  Mail,
  Lock,
  User,
  Sparkles,
  Users,
  Code2,
  Wand2,
  Shield,
  ArrowLeft,
} from "lucide-react";
import logo from "../../assets/logo.png";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PasswordRule = ({ ok, label }) => (
  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
    <span
      className={`flex h-4 w-4 items-center justify-center rounded-full border ${
        ok
          ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
          : "border-zinc-300 text-transparent dark:border-white/15"
      }`}
    >
      <Check size={10} strokeWidth={3} />
    </span>
    <span className={ok ? "text-emerald-600 dark:text-emerald-400" : ""}>
      {label}
    </span>
  </div>
);

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, loading, error, clearError } = useAuthStore();
  const addToast = useToastStore((s) => s.addToast);
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
  }, [clearError]);

  const passwordRules = useMemo(() => {
    const password = formData.password;

    return {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
    };
  }, [formData.password]);

  const isPasswordValid = Object.values(passwordRules).every(Boolean);
  const isEmailValid = emailRegex.test(formData.email.trim());

  const passwordsMatch =
    formData.confirmPassword.trim().length > 0 &&
    formData.password === formData.confirmPassword;

  const isFormValid =
    formData.username.trim() &&
    formData.email.trim() &&
    formData.password.trim() &&
    formData.confirmPassword.trim() &&
    isEmailValid &&
    isPasswordValid &&
    passwordsMatch;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    setValidationErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    const errors = {};
    const username = formData.username.trim();
    const email = formData.email.trim();
    const password = formData.password.trim();

    if (!username) errors.username = "Username is required";
    if (!email) errors.email = "Email is required";
    if (email && !emailRegex.test(email))
      errors.email = "Enter a valid email address";
    if (!password) errors.password = "Password is required";
    if (!formData.confirmPassword.trim())
      errors.confirmPassword = "Confirm password is required";
    if (password && formData.confirmPassword.trim() && !passwordsMatch)
      errors.confirmPassword = "Passwords do not match";

    if (
      !passwordRules.length ||
      !passwordRules.upper ||
      !passwordRules.lower ||
      !passwordRules.number
    ) {
      errors.password = "Password is too weak";
    }

    if (Object.keys(errors).length) {
      setValidationErrors(errors);
      return;
    }

    try {
      const user = await register({ username, email, password });

      addToast({
        message: "Account created successfully!",
        type: "success",
      });

      navigate(`/user/${user.username}`, { replace: true });
    } catch (err) {
      if (err?.errors && Array.isArray(err.errors)) {
        const fieldErrors = {};
        err.errors.forEach((apiError) => {
          fieldErrors[apiError.field] = apiError.message;
        });
        setValidationErrors(fieldErrors);
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-white dark:bg-[#06070a] text-zinc-900 dark:text-white transition-colors">
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 18% 16%, rgba(0,220,130,0.16) 0%, rgba(0,220,130,0.08) 18%, rgba(0,220,130,0.02) 34%, rgba(0,220,130,0) 58%), radial-gradient(circle at 82% 78%, rgba(79,209,255,0.14) 0%, rgba(79,209,255,0.06) 16%, rgba(79,209,255,0.02) 32%, rgba(79,209,255,0) 58%), linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.2) 24%, rgba(255,255,255,0.04) 48%, rgba(255,255,255,0) 72%)",
          }}
        />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[820px] h-[520px] rounded-full bg-white/70 blur-3xl dark:bg-emerald-400/10" />
        <div className="absolute bottom-[-120px] right-[-80px] w-[520px] h-[520px] rounded-full bg-cyan-400/18 blur-3xl dark:bg-cyan-400/12" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(0,0,0,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.18) 1px, transparent 1px)",
            backgroundSize: "84px 84px",
          }}
        />
      </div>

      <div className="absolute top-4 left-4 md:top-6 md:left-6 z-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
          border border-zinc-200 dark:border-white/10
          bg-white/80 dark:bg-zinc-900/80
          backdrop-blur-md
          text-zinc-700 dark:text-zinc-200
          hover:bg-zinc-100 dark:hover:bg-zinc-800
          transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-16 md:py-10">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-10 items-center animate-fadeIn">
          {/* LEFT */}
          <div className="lg:pr-8">
            {/* BADGE */}
            <div className="inline-flex items-center gap-3 px-5 py-0 rounded-full border border-[#00dc82]/10 bg-white/60 dark:bg-white/[0.03] backdrop-blur-xl text-[#1edb8c] shadow-lg mb-10">
              <Sparkles className="w-4 h-4" />

              <span className="text-sm font-medium p-3">• Join GitNest</span>
            </div>

            {/* TITLE */}
            <h1 className="text-[42px] md:text-[48px] lg:text-[52px] leading-[1.05] font-black tracking-tighter">
              <span className="block">Start Collaborating</span>

              <span className="block">with</span>

              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#00dc82] via-[#36e4da] to-[#4fd1ff] drop-shadow-[0_10px_30px_rgba(0,220,130,0.25)]">
                GitNest
              </span>
            </h1>

            {/* DESCRIPTION */}
            <p className="text-[16px] leading-7 text-zinc-950 dark:text-zinc-400 max-w-2xl mb-5 mt-2">
              GitNest is a full-featured GitHub-inspired platform built with the
              MERN stack. Create repositories, browse code, manage issues,
              review pull requests, and collaborate — all in one open-source
              developer ecosystem.
            </p>

            {/* TRACKS */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-6 mt-8">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 flex items-center justify-center shadow-lg flex-shrink-0">
                  <Wand2 className="w-5 h-5 text-[#00dc82]" />
                </div>

                <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                  AI <br />
                  Workflows
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 flex items-center justify-center shadow-lg flex-shrink-0">
                  <Code2 className="w-5 h-5 text-[#00dc82]" />
                </div>

                <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                  Repositories
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 flex items-center justify-center shadow-lg flex-shrink-0">
                  <Users className="w-5 h-5 text-[#00dc82]" />
                </div>

                <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                  Open
                  <br />
                  Source
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 flex items-center justify-center shadow-lg flex-shrink-0">
                  <Shield className="w-5 h-5 text-[#00dc82]" />
                </div>

                <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                  Secure & Reliable
                </span>
              </div>
            </div>

            <div className="mt-10 flex items-center gap-4 rounded-[28px] border border-white/50 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] backdrop-blur-2xl px-5 py-4 shadow-xl max-w-xs">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-[#00dc82] to-[#4fd1ff]"
                  />
                ))}
              </div>

              <div>
                <p className="font-semibold text-zinc-800 dark:text-white text-sm">
                  Trusted by developers worldwide
                </p>

                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Open source • Community driven • Secure
                </p>
              </div>
            </div>
          </div>

          {/* Card */}
          <div className="relative rounded-[2rem] border border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-[#0d1016]/80 backdrop-blur-xl p-8 md:p-9 shadow-2xl shadow-black/10 dark:shadow-black/40 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-white/18 to-transparent dark:from-white/8 dark:via-white/0 pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/70 to-transparent pointer-events-none" />
            <div className="relative z-10 space-y-6">
              {/* Heading */}
              <div className="text-center space-y-2">
                <div>
                  <img
                    src={logo}
                    alt="GitNest"
                    className="block mx-auto w-8 h-8 object-contain dark:bg-white rounded-2xl"
                  />
                </div>

                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  Create Account
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Sign up to get started with GitNest
                </p>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/30 p-3 rounded-md">
                  {error}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                {/* Username */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Username
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                      <User size={18} />
                    </div>
                    <input
                      name="username"
                      type="text"
                      placeholder="Enter your username"
                      value={formData.username}
                      onChange={handleChange}
                      aria-invalid={!!validationErrors.username}
                      aria-describedby="username-error"
                      className={`w-full rounded-xl border bg-zinc-50/90 py-3 pl-11 pr-11 text-gray-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 dark:bg-white/[0.04] dark:text-white ${
                        validationErrors.username
                          ? "border-red-500"
                          : "border-zinc-200 dark:border-white/10"
                      }`}
                    />
                    {!validationErrors.username && formData.username.trim() && (
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-emerald-500">
                        <Check size={18} strokeWidth={2.5} />
                      </div>
                    )}
                  </div>
                  {validationErrors.username && (
                    <p
                      id="username-error"
                      className="mt-1 text-xs text-red-500"
                    >
                      {validationErrors.username}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                      <Mail size={18} />
                    </div>
                    <input
                      name="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={handleChange}
                      aria-invalid={!!validationErrors.email}
                      aria-describedby="email-error"
                      className={`w-full rounded-xl border bg-zinc-50/90 py-3 pl-11 pr-11 text-gray-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 dark:bg-white/[0.04] dark:text-white ${
                        validationErrors.email
                          ? "border-red-500"
                          : "border-zinc-200 dark:border-white/10"
                      }`}
                    />
                    {!validationErrors.email &&
                      isEmailValid &&
                      formData.email.trim() && (
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-emerald-500">
                          <Check size={18} strokeWidth={2.5} />
                        </div>
                      )}
                  </div>
                  {validationErrors.email && (
                    <p id="email-error" className="mt-1 text-xs text-red-500">
                      {validationErrors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password
                  </label>

                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                      <Lock size={18} />
                    </div>
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={handleChange}
                      aria-invalid={!!validationErrors.password}
                      aria-describedby="password-error password-rules"
                      className={`w-full rounded-xl border bg-zinc-50/90 py-3 pl-11 pr-11 text-gray-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 dark:bg-white/[0.04] dark:text-white ${
                        validationErrors.password
                          ? "border-red-500"
                          : "border-zinc-200 dark:border-white/10"
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p
                      id="password-error"
                      className="mt-1 text-xs text-red-500"
                    >
                      {validationErrors.password}
                    </p>
                  )}
                  <div
                    id="password-rules"
                    className="mt-3 grid grid-cols-2 gap-2"
                  >
                    <PasswordRule
                      ok={passwordRules.length}
                      label="At least 8 characters"
                    />
                    <PasswordRule
                      ok={passwordRules.upper}
                      label="One uppercase letter"
                    />
                    <PasswordRule
                      ok={passwordRules.lower}
                      label="One lowercase letter"
                    />
                    <PasswordRule
                      ok={passwordRules.number}
                      label="One number"
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm Password
                  </label>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                      <Lock size={18} />
                    </div>
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      aria-invalid={!!validationErrors.confirmPassword}
                      aria-describedby="confirmPassword-error"
                      className={`w-full rounded-xl border bg-zinc-50/90 py-3 pl-11 pr-11 text-gray-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 dark:bg-white/[0.04] dark:text-white ${
                        validationErrors.confirmPassword
                          ? "border-red-500"
                          : passwordsMatch
                            ? "border-emerald-500"
                            : "border-zinc-200 dark:border-white/10"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                  {validationErrors.confirmPassword && (
                    <p
                      id="confirmPassword-error"
                      className="mt-1 text-xs text-red-500"
                    >
                      {validationErrors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Button */}
                <button
                  type="submit"
                  disabled={!isFormValid || loading}
                  className="w-full py-3 rounded-2xl text-black font-semibold bg-emerald-400 hover:scale-[1.01] hover:bg-emerald-300 active:scale-[0.99] transition-all duration-300 shadow-xl shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating Account..." : "Register"}
                </button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-zinc-200 dark:border-white/10"></div>
                  <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase">Or continue with</span>
                  <div className="flex-grow border-t border-zinc-200 dark:border-white/10"></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/v1/auth/google`;
                    }}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-zinc-200 dark:border-white/10 text-gray-700 dark:text-gray-200 font-medium hover:bg-zinc-50 dark:hover:bg-white/[0.04] transition-all duration-200 cursor-pointer"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.842 1.093 15.115 0 12 0 7.354 0 3.393 2.677 1.51 6.58l3.756 3.185Z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.49 12.275c0-.825-.075-1.62-.21-2.385H12v4.515h6.48a5.54 5.54 0 0 1-2.4 3.63v3.015h3.87c2.265-2.085 3.54-5.145 3.54-8.775Z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.266 14.235A7.17 7.17 0 0 1 4.91 12c0-.79.13-1.55.356-2.265L1.51 6.55A11.95 11.95 0 0 0 0 12c0 1.92.455 3.73 1.256 5.34l4.01-3.105Z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.955-1.08 7.935-2.91l-3.87-3.015c-1.08.72-2.46 1.155-4.065 1.155-3.135 0-5.78-2.115-6.73-4.965L1.256 17.37A11.97 11.97 0 0 0 12 24Z"
                      />
                    </svg>
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/v1/auth/github`;
                    }}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-zinc-200 dark:border-white/10 text-gray-700 dark:text-gray-200 font-medium hover:bg-zinc-50 dark:hover:bg-white/[0.04] transition-all duration-200 cursor-pointer"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                    </svg>
                    GitHub
                  </button>
                </div>

                {/* Sign in */}
                <p className="text-center text-sm text-gray-500 mt-4">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-indigo-600 hover:underline font-medium"
                  >
                    Sign in
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
