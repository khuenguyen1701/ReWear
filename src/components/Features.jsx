import "../styles/features.css";

export default function Features() {
  return (
    <section className="about-section" id="features">

      <div className="about-heading">
        <p>ABOUT US</p>

        <h2 id="about-us">What is ReWear?</h2>

        <p className="about-description">
          ReWear is a digital wardrobe that helps you keep track of
          your clothes and find new outfit ideas using items you
          already own.
        </p>
      </div>

      <div className="about-cards">

        <div className="about-card">
          <span>01</span>
          <h3>Organize Items You Have</h3>
          <p>
            Digital wardrobe: Keep track of
            what you own.
          </p>
        </div>

        <div className="about-card">
          <span>02</span>
          <h3>Get Outfit Ideas</h3>
          <p>
            Get suggestions based on your preference!
          </p>
        </div>

        <div className="about-card">
          <span>03</span>
          <h3>Rewear More</h3>
          <p>
            Find new ways to wear your clothes instead of always
            buying something new.
          </p>
        </div>

      </div>

    </section>
  );
}