// src/pages/About.jsx

export default function About() {
  return (
    <main className="about-page">
      <section className="bio">
        <h1>About Me</h1>
        <img
          src="/images/portrait.jpg"
          alt="The artisan at work"
          className="portrait"
        />
        <p>
          Hi, I’m Loubie! I’ve been sewing, quilting, and creating since I was a kid. Every piece I make is inspired by the natural beauty of Idaho and a deep love for textures and color. My work includes quilts, bags, and custom designs made with sustainability and story in mind.
        </p>
        <p>
          When I’m not sewing, you’ll find me birdwatching, sketching new patterns, or spending time with family.
        </p>
      </section>

      <section className="contact">
        <h2>Get in Touch</h2>
        <p>Email: <a href="mailto:loubie@example.com">loubie@example.com</a></p>
        <p>Instagram: <a href="https://instagram.com/loubie.designs" target="_blank" rel="noopener noreferrer">@loubie.designs</a></p>
      </section>
    </main>
  );
}
