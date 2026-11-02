
import { useState } from "react";
import "../styles/signup.css";
import { Link, useNavigate } from "react-router-dom";

import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  updateProfile
} from "firebase/auth";

import { app } from "./firebase";

const SignUpForm = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const auth = getAuth(app);

  // Password must have:
  // - At least 8 characters
  // - At least 1 number
  // - At least 1 special character
  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long.";
    }

    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number.";
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      return "Password must contain at least one special character.";
    }

    return "";
  };

  // Firebase error messages
  const getErrorMessage = (err) => {
    switch (err.code) {
      case "auth/email-already-in-use":
        return "An account with this email already exists.";

      case "auth/invalid-email":
        return "Please enter a valid email address.";

      case "auth/weak-password":
        return "Password does not meet the security requirements.";

      case "auth/popup-closed-by-user":
        return "Google sign-in was canceled.";

      case "auth/popup-blocked":
        return "Your browser blocked the Google sign-in popup.";

      case "auth/account-exists-with-different-credential":
        return "An account already exists with this email using another sign-in method.";

      case "auth/unauthorized-domain":
        return "This website is not authorized for Google sign-in.";

      case "auth/operation-not-allowed":
        return "This sign-in method is not enabled in Firebase.";

      case "auth/network-request-failed":
        return "Network error. Please check your connection.";

      default:
        return "Authentication failed. Please try again.";
    }
  };

  // Normal email/password registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!username.trim()) {
      setMessage("Please enter your username.");
      return;
    }

    const passwordError = validatePassword(password);

    if (passwordError) {
      setMessage(passwordError);
      return;
    }

    setLoading(true);

    try {
      // Create account
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      // Save username
      await updateProfile(userCredential.user, {
        displayName: username.trim()
      });

      // Send verification email
      await sendEmailVerification(userCredential.user);

      // Prevent immediate access before verification
      await signOut(auth);

      // Redirect to login
      navigate("/login", {
        state: {
          message:
            "Account created! Check your inbox and verify your email before logging in."
        }
      });

    } catch (err) {
      console.error("Sign-up error:", err);
      setMessage(getErrorMessage(err));

    } finally {
      setLoading(false);
    }
  };

  // Google authentication
  const handleGoogleSignUp = async () => {
    setMessage("");
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(
        auth,
        provider
      );

      console.log(
        "Google sign-in successful:",
        result.user.displayName
      );

      // Google authentication also works for
      // users who already have an account
      navigate("/profile");

    } catch (err) {
      console.error("Google sign-in error:", err);
      setMessage(getErrorMessage(err));

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <form
        className="signup-form"
        onSubmit={handleSubmit}
      >
        <h2>Sign Up</h2>

        {/* Username */}
        <label htmlFor="username">
          Username:
          <input
            id="username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            autoComplete="username"
            required
          />
        </label>

        {/* Email */}
        <label htmlFor="email">
          Email:
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            autoComplete="email"
            required
          />
        </label>

        {/* Password */}
        <label htmlFor="password">
          Password:
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>

        <p className="password-requirements">
          Password must contain:
          <br />
          • At least 8 characters
          <br />
          • At least one number (0–9)
          <br />
          • At least one special character (!@#$...)
        </p>

        {/* Email sign-up button */}
        <button
          type="submit"
          disabled={loading}
        >
          {loading ? "Please wait..." : "Sign Up"}
        </button>

        {/* Divider */}
        <div className="signup-divider">
          <span>OR</span>
        </div>

        {/* Google sign-up */}
        <button
          type="button"
          className="google-signup-button"
          onClick={handleGoogleSignUp}
          disabled={loading}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fill="#4285F4"
              d="M21.35 12.25c0-.82-.07-1.42-.23-2.05H12v3.71h5.35a4.7 4.7 0 0 1-2 3.07v2.55h3.23c1.89-1.74 2.77-4.3 2.77-7.28Z"
            />
            <path
              fill="#34A853"
              d="M12 21.5c2.69 0 4.95-.89 6.6-2.42l-3.23-2.55c-.9.6-2.05.95-3.37.95a6 6 0 0 1-5.64-4.16H3.03v2.62A9.5 9.5 0 0 0 12 21.5Z"
            />
            <path
              fill="#FBBC05"
              d="M6.36 13.32a5.7 5.7 0 0 1 0-3.64V7.06H3.03a9.5 9.5 0 0 0 0 8.88l3.33-2.62Z"
            />
            <path
              fill="#EA4335"
              d="M12 5.52c1.43 0 2.71.49 3.72 1.46l2.88-2.88A9.3 9.3 0 0 0 12 2.5a9.5 9.5 0 0 0-8.97 5.56l3.33 2.62A6 6 0 0 1 12 5.52Z"
            />
          </svg>

          Continue with Google
        </button>

        {/* Error message */}
        {message && (
          <p
            className="signup-message"
            role="alert"
          >
            {message}
          </p>
        )}

        <p>
          Already Registered?{" "}
          <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default SignUpForm;
