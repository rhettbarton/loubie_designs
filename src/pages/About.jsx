import React from 'react'
import '../styles/About.css'

function About() {
  return (
    <div className="about">
      <div className="about-hero">
        <div className="about-content">
          <div className="profile-container">
              <div className="profile-placeholder">
                <img src="/photos/profile.jpg" alt="Lauren" className="profile-photo" />
              </div>
          </div>
          
          <div className="about-text">
            <h1 className="about-title">Hi, I'm Lauren!</h1>
            
            <div className="about-story">
              <p className="story-intro">
                I'm a passionate quilter and textile artist based in the heart of our vibrant community. My love for quilting is deeply rooted in family traditions and the joy of creating something beautiful with my hands.
              </p>
              
              <p className="story-paragraph">
                My journey with quilting began over two decades ago when my grandmother passed down her vintage Singer sewing machine along with a treasure trove of fabric scraps and unfinished projects. What started as a way to honor her memory has blossomed into a passionate pursuit of textile artistry.
              </p>
              
              <p className="story-paragraph">
                Each quilt I create is a unique blend of traditional techniques and contemporary design. I believe in the power of handcrafted beauty to transform spaces and create lasting memories. From intricate piecing to careful hand-quilting, every detail receives my full attention and care.
              </p>
              
              <p className="story-paragraph">
                When I'm not in my studio surrounded by colorful fabrics and the gentle hum of my sewing machine, you'll find me exploring local textile shops, attending quilting guilds, or drawing inspiration from the natural beauty of our community.
              </p>
            </div>
            
            <div className="about-cta">
              <a href="/portfolio" className="btn btn-primary">View My Work</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About