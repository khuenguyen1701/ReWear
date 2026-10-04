import "../styles/stats.css";

export default function Stats() {
  return (
    <section className="how-section" id="how-it-works">

      <div className="how-header">


        <h2 id="how-to">How to use ReWear</h2>

      </div>

      <div className="steps-container">

        <div className="step">
          <span className="step-number">01</span>

          <h3>Add your clothes</h3>

          <p>
            Upload photos of your clothes and add details like
            category, color, season, and occasion.
          </p>

        </div>


        <div className="step featured-step">
          <span className="step-number">02</span>

          <h3>Choose what you want</h3>

          <p>
            Select your occasion, season, preferred fit, and color
            for the outfit.
          </p>

        </div>


        <div className="step">
          <span className="step-number">03</span>

          <h3>Get an outfit</h3>

          <p>
            ReWear suggests an outfit using clothes that are already
            in your wardrobe.
          </p>

        </div>

      </div>

    </section>
  );
}