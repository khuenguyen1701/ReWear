import { Link } from "react-router-dom";
import "../styles/loginRequired.css";

export default function LoginRequired() {
  return (
    <div className="login-required-page">
      <div className="login-required-card">

        <h2>You need to log in first.</h2>

        <p>
          Log in or create an account to access your wardrobe,
          get outfit suggestions, and view your profile.
        </p>

        <div className="login-required-buttons">
          <Link to="/login" className="login-required-primary">
            Log In
          </Link>

          <Link to="/signup" className="login-required-secondary">
            Create Account
          </Link>
        </div>

        <Link to="/" className="guest-link">
          Continue as Guest
        </Link>
      </div>
    </div>
  );
}