import { Link } from "react-router-dom";
import "../styles/wardrobe.css";

export default function Wardrobe() {
  return (
    <div className="wardrobe-page">

      <Link to="/profile" className="back-link">
        ← Back to Profile
      </Link>

      <div className="wardrobe-header">
        <div>
          <h1>My Wardrobe</h1>
          <p>View and manage your clothes.</p>
        </div>

        <button className="add-button">
          + Add Clothing
        </button>
      </div>

      <div className="wardrobe-grid">

        <div className="clothing-card">
          <div className="image-placeholder">
            Image
          </div>

          <h3>White T-Shirt</h3>
          <p>Top · White · Summer</p>
        </div>

        <div className="clothing-card">
          <div className="image-placeholder">
            Image
          </div>

          <h3>Blue Jeans</h3>
          <p>Bottom · Blue · All Season</p>
        </div>

        <div className="clothing-card">
          <div className="image-placeholder">
            Image
          </div>

          <h3>Beige Cardigan</h3>
          <p>Top · Beige · Autumn</p>
        </div>

      </div>

    </div>
  );
}