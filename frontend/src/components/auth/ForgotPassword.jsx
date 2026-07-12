import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useToastStore } from "../../store/useToastStore";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [validationError, setValidationError] = useState("");
  const [touched, setTouched] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { forgotPassword, loading, error, clearError } = useAuthStore();
  const addToast = useToastStore((s) => s.addToast);
  const navigate = useNavigate();

  // Clear previous errors on mount
  useEffect(() => {
    clearError();
  }, [clearError]);

  const validateEmail = (emailValue) => {
    if (!emailValue.trim()) {
      return "Email is required";
    } else if (!emailRegex.test(emailValue.trim())) {
      return "Enter a valid email address";
    }
    return "";
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (touched) {
      setValidationError(validateEmail(e.target.value));
    }
  };

  const handleBlur = () => {
    setTouched(true);
    setValidationError(validateEmail(email));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    const errorMsg = validateEmail(email);
    setValidationError(errorMsg);
    setTouched(true);

    if (errorMsg) return;

    try {
      await forgotPassword(email.trim());

      setIsSubmitted(true);
      addToast({
        message: "Password reset link sent to your email!",
        type: "success",
      });
    } catch (err) {
      // Handle API errors if needed
      console.error(err);
    }
  };

  // If successfully submitted, show success screen
  if (isSubmitted) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-white dark:bg-[#06070a] text-zinc-900 dark:text-white transition-colors">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px] rounded-full" />
        </div>

        <div className="absolute top-4 left-4 md:top-6 md:left-6 z-20">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
              <span className="text-4xl">📧</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Check your email</h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-8">
              We have sent a password reset link to <br />
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                {email}
              </span>
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full py-3 rounded-2xl text-black font-semibold bg-emerald-400 hover:bg-emerald-300 transition-all duration-300"
            >
              Return to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-white dark:bg-[#06070a] text-zinc-900 dark:text-white transition-colors">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="absolute top-4 left-4 md:top-6 md:left-6 z-20">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>

      {/* Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-10 items-center animate-fadeIn">
          {/* Left Side - Same as Login */}
          <div className="hidden lg:flex flex-col">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 text-emerald-300 text-sm mb-8 w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Reset Password
            </div>

            <h1 className="text-5xl font-black leading-tight tracking-tight mb-6">
              Recover your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-400">
                GitNest
              </span>
              account
            </h1>

            <p className="text-zinc-500 dark:text-zinc-400 text-lg leading-8 max-w-xl mb-10">
              Enter your email address and we'll send you a link to reset your
              password.
            </p>
          </div>

          {/* Mobile Header */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 text-emerald-400 text-sm mb-5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Reset Password
            </div>
            <h1 className="text-4xl font-black leading-tight tracking-tight mb-4">
              Recover your account
            </h1>
          </div>

          {/* Form Card */}
          <div className="relative rounded-[2rem] border border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-[#0d1016]/80 backdrop-blur-xl p-8 md:p-10 shadow-2xl shadow-black/10 dark:shadow-black/40 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-cyan-500/5 pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Forgot Password?
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No worries! We'll send you reset instructions.
                </p>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/30 p-3 rounded-md">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your email"
                    className={`w-full px-3 py-2 rounded-md border outline-none transition focus:ring-2 focus:ring-indigo-500 ${
                      validationError
                        ? "border-red-500"
                        : "border-zinc-200 dark:border-white/10"
                    } bg-zinc-50 dark:bg-white/[0.04] text-gray-900 dark:text-white placeholder-gray-400`}
                  />
                  {validationError && touched && (
                    <p className="text-xs text-red-500 mt-1">
                      {validationError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full py-3 rounded-2xl text-black font-semibold bg-emerald-400 hover:scale-[1.01] hover:bg-emerald-300 active:scale-[0.99] transition-all duration-300 shadow-xl shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending Reset Link..." : "Send Reset Link"}
                </button>
              </form>

              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Remember your password?{" "}
                <Link
                  to="/login"
                  className="text-indigo-600 hover:underline dark:text-indigo-400 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.35s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
