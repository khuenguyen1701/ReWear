import "../styles/cta.css";

export default function CTA() {

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thank you for your message!");
  };

  return (
    <section className="contact" id="contact">

      <div className="contact-text">
        <p className="contact-label">CONTACT US</p>

        <h2>
          Get in touch with us!
        </h2>
      </div>

      <form className="contact-form" onSubmit={handleSubmit}>

        <input
          type="text"
          placeholder="Your name"
          required
        />

        <input
          type="email"
          placeholder="Your email"
          required
        />

        <textarea
          placeholder="Your message"
          rows="5"
          required
        />

        <button type="submit">
          Send Message
        </button>

      </form>

    </section>
  );
}