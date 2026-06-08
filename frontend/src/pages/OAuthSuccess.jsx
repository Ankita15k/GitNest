import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { exchangeOAuthCode } from "../api/authApi";

function OAuthSuccess() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
      setError("OAuth sign-in failed. No code received.");
      return;
    }

    // Remove the code from the URL immediately so it doesn't linger in history
    window.history.replaceState({}, document.title, window.location.pathname);

    const exchangeCode = async () => {
      try {
        const { token } = await exchangeOAuthCode(code);

        // Let Zustand own all state + localStorage sync.
        // checkAuth fetches /me with the token and populates the user object,
        // matching exactly what the normal login flow does.
        useAuthStore.setState({ token, isAuthenticated: true });
        await useAuthStore.getState().checkAuth();

        navigate("/");
      } catch {
        setError("Sign-in failed. Please try again.");
      }
    };

    exchangeCode();
  }, [navigate]);

  if (error) {
    return (
      <div style={{ textAlign: "center", marginTop: "4rem" }}>
        <p>{error}</p>
        <a href="/login">Back to login</a>
      </div>
    );
  }

  return <div>Signing in…</div>;
}

export default OAuthSuccess;
