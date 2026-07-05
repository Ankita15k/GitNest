import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { API_BASE_URL } from "../utils/apiConfig";

function OAuthSuccess() {
  const navigate = useNavigate();

  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");

  const [error, setError] = useState(
    code ? null : "OAuth sign-in failed. No code received.",
  );

  useEffect(() => {
   if (!code) {
     return;
   }

    // Remove the code from the URL immediately so it doesn't linger in history
    window.history.replaceState({}, document.title, window.location.pathname);

    const exchangeCode = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/auth/exchange`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        if (!res.ok) {
          throw new Error(`Exchange failed: ${res.status}`);
        }

        const { token } = await res.json();

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
  }, [code, navigate]);
  
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
