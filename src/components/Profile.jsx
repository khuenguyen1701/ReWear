
import { getAuth, signOut } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { app } from "./firebase";

import "../styles/profile.css";

export default function Profile() {
  const auth = getAuth(app);
  const navigate = useNavigate();

  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="profile-page">

      {/* Back to Home */}
      <Link to="/" className="back-home-button">
        ← Back to Home
      </Link>

      {/* Profile Header */}
      <div className="profile-header">
        <p>MY ACCOUNT</p>

        <h1>
          Welcome, {user?.displayName || "there"}!
        </h1>

        <p className="profile-email">
          {user?.email}
        </p>
      </div>

      {/* Profile Options */}
      <div className="profile-options">

        {/* My Wardrobe */}
        <Link to="/wardrobe" className="profile-card">
          <h2>My Wardrobe</h2>

          <p>
            View, add, and organize the clothes in your digital wardrobe.
          </p>

          <span className="card-button">
            Open Wardrobe →
          </span>
        </Link>

        {/* Suggest Outfit */}
        <Link to="/suggest-outfit" className="profile-card">
          <h2>Suggest Outfit</h2>

          <p>
            Find outfit ideas using clothes you already own.
          </p>

          <span className="card-button">
            Find an Outfit →
          </span>
        </Link>

      </div>

      {/* Logout */}
      <button
        type="button"
        className="logout-button"
        onClick={handleLogout}
      >
        Log Out
      </button>

    </div>
  );
}
