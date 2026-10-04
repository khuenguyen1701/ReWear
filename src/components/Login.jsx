import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "./firebase";

import "../styles/login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const auth = getAuth(app);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");

    try {
      await signInWithEmailAndPassword(auth, email, password);

      navigate("/");

    } catch (error) {
      console.error(error.code);

  if (error.code === "auth/invalid-credential") {
    setMessage("Incorrect email or password.");
  } else if (error.code === "auth/invalid-email") {
    setMessage("Please enter a valid email.");
  } else {
    setMessage("Login failed. Please try again.");
  }
    }
  };

  return (
    <div className="login-container">

      <form className="login-form" onSubmit={handleLogin}>

        <h2>Log In</h2>

        <div>
          <label>Email</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit">
          Log In
        </button>

        {message && <p>{message}</p>}

        <p>
          Don't have an account?{" "}
          <Link to="/signup">Sign Up</Link>
        </p>

      </form>

    </div>
  );
}