import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useToastStore } from "../../store/useToastStore";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { ArrowLeft } from "lucide-react";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const { login, loading, error, clearError } = useAuthStore();
  const addToast = useToastStore((s) => s.addToast);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const errorParam = searchParams.get("error");

  const [urlError, setUrlError] = useState(
    errorParam ? decodeURIComponent(errorParam) : null,
  );

  useEffect(() => {
    if (errorParam) {
      navigate("/login", { replace: true });
    }
  }, [errorParam, navigate]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const validate = (values) => {
    const errors = {};

    if (!values.email.trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(values.email.trim())) {
      errors.email = "Enter a valid email address";
    }

    if (!values.password.trim()) {
      errors.password = "Password is required";
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    const newValue = type === "checkbox" ? checked : value;

    const updated = {
      ...formData,
      [name]: newValue,
    };

    setFormData(updated);

    setTouched((prev) => ({ ...prev, [name]: true }));
    setValidationErrors(validate(updated));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setValidationErrors(validate(formData));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    const errors = validate(formData);
    setValidationErrors(errors);
    setTouched({ email: true, password: true });

    if (Object.keys(errors).length > 0) return;

    try {
      await login(formData.email.trim(), formData.password.trim());

      addToast({
        message: "Signed in successfully!",
        type: "success",
      });

      navigate("/");
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

  const isFormValid =
    emailRegex.test(formData.email.trim()) &&
    formData.password.trim().length > 0;

  return (
    <div className="min-h-screen relative overflow-hidden bg-white dark:bg-[#06070a] text-zinc-900 dark:text-white transition-colors">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-500/5 blur-[120px] rounded-full" />
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

      {/* Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-10 items-center animate-fadeIn">
          <div className="hidden lg:flex flex-col">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 text-emerald-300 text-sm mb-8 w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Welcome Back
            </div>

            <h1 className="text-5xl font-black leading-tight tracking-tight mb-6">
              Continue building with
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-400">
                GitNest
              </span>
            </h1>

            <p className="text-zinc-500 dark:text-zinc-400 text-lg leading-8 max-w-xl mb-10">
              Collaborate with contributors, manage repositories, review pull
              requests, and build modern open-source workflows in one unified
              platform.
            </p>

            <div className="flex flex-wrap gap-4">
              {[
                "AI Workflows",
                "Open Source",
                "Pull Requests",
                "Collaboration",
              ].map((chip) => (
                <div
                  key={chip}
                  className="px-4 py-2 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/[0.03] text-sm text-zinc-700 dark:text-zinc-300"
                >
                  {chip}
                </div>
              ))}
            </div>
          </div>
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 text-emerald-400 text-sm mb-5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Welcome Back
            </div>

            <h1 className="text-4xl font-black leading-tight tracking-tight mb-4">
              Continue building with
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-400">
                GitNest
              </span>
            </h1>

            <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-7 mb-6 px-4">
              Collaborate with contributors and build modern open-source
              workflows.
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              {[
                "AI Workflows",
                "Open Source",
                "Pull Requests",
                "Collaboration",
              ].map((chip) => (
                <div
                  key={chip}
                  className="px-3 py-1.5 rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/[0.03] text-xs text-zinc-700 dark:text-zinc-300"
                >
                  {chip}
                </div>
              ))}
            </div>
          </div>
          {/* Card */}
          <div className="relative rounded-[2rem] border border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-[#0d1016]/80 backdrop-blur-xl p-8 md:p-10 shadow-2xl shadow-black/10 dark:shadow-black/40 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-cyan-500/5 pointer-events-none" />
            {/* Header */}
            <div className="relative z-10 space-y-6">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Sign in
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Welcome back! Please enter your details.
                </p>
              </div>

              {/* Server error */}
              {(error || urlError) && (
                <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/30 p-3 rounded-md">
                  {error || urlError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Email Address
                  </label>

                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    aria-invalid={!!validationErrors.email}
                    aria-describedby="email-error"
                    placeholder="Enter your email"
                    className={`w-full px-3 py-2 pr-11 rounded-md border outline-none transition focus:ring-2 focus:ring-indigo-500 ${
                      validationErrors.email
                        ? "border-red-500"
                        : "border-zinc-200 dark:border-white/10"
                    } bg-zinc-50 dark:bg-white/[0.04] text-gray-900 dark:text-white placeholder-gray-400`}
                  />

                  {validationErrors.email && touched.email && (
                    <p id="email-error" className="text-xs text-red-500 mt-1">
                      {validationErrors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Password
                  </label>

                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      aria-invalid={!!validationErrors.password}
                      aria-describedby="password-error"
                      placeholder="Enter your password"
                      className={`w-full px-3 py-2 rounded-md border outline-none transition focus:ring-2 focus:ring-indigo-500 ${
                        validationErrors.password
                          ? "border-red-500"
                          : "border-zinc-200 dark:border-white/10"
                      } bg-zinc-50 dark:bg-white/[0.04] text-gray-900 dark:text-white placeholder-gray-400`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {validationErrors.password && touched.password && (
                    <p
                      id="password-error"
                      className="text-xs text-red-500 mt-1"
                    >
                      {validationErrors.password}
                    </p>
                  )}
                </div>

                {/* Remember + Forgot */}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <input
                      type="checkbox"
                      name="remember"
                      checked={formData.remember}
                      onChange={handleChange}
                      className="accent-indigo-600"
                    />
                    Remember me
                  </label>

                  <Link
                    to="/ForgotPassword"
                    className="text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!isFormValid || loading}
                  className="w-full py-3 rounded-2xl text-black font-semibold bg-emerald-400 hover:scale-[1.01] hover:bg-emerald-300 active:scale-[0.99] transition-all duration-300 shadow-xl shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>
              </form>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-zinc-200 dark:border-white/10"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase">Or continue with</span>
                <div className="flex-grow border-t border-zinc-200 dark:border-white/10"></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setUrlError(null);
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
                    setUrlError(null);
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

              {/* Sign up */}
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Don’t have an account?{" "}
                <Link
                  to="/register"
                  className="text-indigo-600 hover:underline dark:text-indigo-400 font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>

          {/* Animation */}
          <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.35s ease-in-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
        </div>
      </div>
    </div>
  );
};

export default Login;
