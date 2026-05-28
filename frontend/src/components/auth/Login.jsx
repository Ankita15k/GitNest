import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useToastStore } from "../../store/useToastStore";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

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
              Collaborate with contributors, manage repositories, review pull requests,
              and build modern open-source workflows in one unified platform.
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
              Collaborate with contributors and build modern open-source workflows.
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
              {error && (
                <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/30 p-3 rounded-md">
                  {error}
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
                    className={`w-full px-3 py-2 pr-11 rounded-md border outline-none transition focus:ring-2 focus:ring-indigo-500 ${validationErrors.email
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
                      className={`w-full px-3 py-2 rounded-md border outline-none transition focus:ring-2 focus:ring-indigo-500 ${validationErrors.password
                        ? "border-red-500"
                        : "border-zinc-200 dark:border-white/10"
                        } bg-zinc-50 dark:bg-white/[0.04] text-gray-900 dark:text-white placeholder-gray-400`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  {validationErrors.password && touched.password && (
                    <p id="password-error" className="text-xs text-red-500 mt-1">
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
                    to="/forgot-password"
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
