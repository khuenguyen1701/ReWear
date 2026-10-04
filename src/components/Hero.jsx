import { Link } from "react-router-dom";
import "../styles/hero.css";

export default function Hero() {
  return (
    <section className="hero" id="home">

      <p className="hero-label">
        REWEAR 
      </p>

      <h1>
        Your wardrobe,
        <br />
        <span>reworn differently.</span>
      </h1>

      <p className="hero-description">
        Rediscover the clothes you already own.
      </p>

      <div className="hero-buttons">

        <Link to="/wardrobe" className="hero-primary">
          Explore My Wardrobe
        </Link>

        <a href="#features" className="hero-secondary">
          How to use ReWear
        </a>

      </div>

    </section>
  );
}