import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "./firebase";

import "../styles/navbar.css";

export default function Navbar() {
  const auth = getAuth(app);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, [auth]);

  return (
    <nav className="navbar">

      <Link to="/" className="logo">
        ReWear
      </Link>

      <ul className="nav-links">
        <li>
          <a href="#features">About Us</a>
        </li>

        <li>
          <a href="#how-it-works">How It Works</a>
        </li>

        <li>
          <a href="#contact">Contact</a>
        </li>
      </ul>

      {user ? (
        <Link to="/profile" className="nav-btn">
          {user.displayName || "My Account"}
        </Link>
      ) : (
        <Link to="/login" className="nav-btn">
          Log In
        </Link>
      )}

    </nav>
  );
}