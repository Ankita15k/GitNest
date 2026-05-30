import { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "../../store/authStore";
import { useToastStore } from "../../store/useToastStore";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

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

  const isFormValid =
    formData.username.trim() &&
    formData.email.trim() &&
    formData.password.trim() &&
    isEmailValid &&
    isPasswordValid;

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
      const result = await register({ username, email, password });

      addToast({
        message: "Account created successfully!",
        type: "success",
      });

      navigate(`/user/${result.username}`);
    } catch (err) {
      if (err.response?.data?.errors) {
        const fieldErrors = {};
        err.response.data.errors.forEach((e) => {
          fieldErrors[e.field] = e.message;
        });
        setValidationErrors(fieldErrors);
      }
    }
  };

  const Rule = ({ ok, label }) => (
    <div className="flex items-center gap-2 text-xs">
      <span
        className={`w-2 h-2 rounded-full ${ok ? "bg-green-500" : "bg-gray-400 dark:bg-gray-600"
          }`}
      />
      <span
        className={
          ok
            ? "text-green-600 dark:text-green-400"
            : "text-gray-500 dark:text-gray-400"
        }
      >
        {label}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-white dark:bg-[#06070a] text-zinc-900 dark:text-white transition-colors">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-500/5 blur-[120px] rounded-full" />
      </div>
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-10 items-center animate-fadeIn">
          <div className="hidden lg:flex flex-col">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 text-emerald-300 text-sm mb-8 w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Join GitNest
            </div>

            <h1 className="text-5xl font-black leading-tight tracking-tight mb-6">
              Start collaborating with
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-400">
                GitNest
              </span>
            </h1>

            <p className="text-zinc-500 dark:text-zinc-400 text-lg leading-8 max-w-xl mb-10">
              Create repositories, collaborate with contributors, review pull requests,
              and build modern open-source workflows in one powerful platform.
            </p>

            <div className="flex flex-wrap gap-4">
              {[
                "AI Workflows",
                "Open Source",
                "Repositories",
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
              Join GitNest
            </div>

            <h1 className="text-4xl font-black leading-tight tracking-tight mb-4">
              Start collaborating with
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-400">
                GitNest
              </span>
            </h1>

            <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-7 mb-6 px-4">
              Create repositories and build modern open-source workflows.
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              {[
                "AI Workflows",
                "Open Source",
                "Repositories",
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
            <div className="relative z-10 space-y-6">
              {/* Heading */}
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  Create Account
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Sign up to get started
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
                  <input
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    aria-invalid={!!validationErrors.username}
                    aria-describedby="username-error"
                    className={`mt-1 w-full px-3 py-2 rounded-md border transition focus:ring-2 focus:ring-indigo-500 focus:shadow-md outline-none bg-zinc-50 dark:bg-white/[0.04] text-gray-900 dark:text-white ${validationErrors.username
                      ? "border-red-500"
                      : "border-zinc-200 dark:border-white/10"
                      }`}
                  />
                  {validationErrors.username && (
                    <p id="username-error" className="text-xs text-red-500 mt-1">
                      {validationErrors.username}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    aria-invalid={!!validationErrors.email}
                    aria-describedby="email-error"
                    className={`mt-1 w-full px-3 py-2 rounded-md border transition focus:ring-2 focus:ring-indigo-500 focus:shadow-md outline-none bg-zinc-50 dark:bg-white/[0.04] ${validationErrors.email
                      ? "border-red-500"
                      : "border-zinc-200 dark:border-white/10"
                      }`}
                  />
                  {validationErrors.email && (
                    <p id="email-error" className="text-xs text-red-500 mt-1">
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
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      aria-invalid={!!validationErrors.password}
                      aria-describedby="password-error"
                      className={`w-full px-3 py-2 pr-11 rounded-md border pr-10 transition focus:ring-2 focus:ring-indigo-500 focus:shadow-md outline-none bg-zinc-50 dark:bg-white/[0.04] ${validationErrors.password
                        ? "border-red-500"
                        : "border-zinc-200 dark:border-white/10"
                        }`}
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  {/* Password Rules */}
                  <div className="mt-2 space-y-1">
                    <Rule ok={passwordRules.length} label="At least 8 characters" />
                    <Rule ok={passwordRules.upper} label="One uppercase letter" />
                    <Rule ok={passwordRules.lower} label="One lowercase letter" />
                    <Rule ok={passwordRules.number} label="One number" />
                  </div>

                  {validationErrors.password && (
                    <p id="password-error" className="text-xs text-red-500 mt-1">
                      {validationErrors.password}
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
