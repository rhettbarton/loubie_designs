import React from 'react'
import '../styles/About.css'

function About() {
  return (
    <div className="about">
      <div className="about-hero">
        <div className="about-content">
          <div className="profile-container">
            <img src="/photos/profile.jpg" alt="Lauren" className="profile-photo" />
          </div>
          
          <div className="about-text">
            <h1 className="about-title">Hi, I'm Lauren!</h1>
            
            <div className="about-story">
              <p className="story-intro">
                I'm a passionate quilter based in the Boise, ID. My love for quilting is deeply rooted in family traditions and the joy of creating something beautiful with my hands.
              </p>
              
              <p className="story-paragraph">
                My mom and grandma taught me how to sew at a young age. My interest was renewed in early 2024 when a friend invited me to quilt along with her. What started as a one-time project with a friend grew into a true passion. 
              </p>
              
              <p className="story-paragraph">
                I believe in creating timeless quilts - pieces that can create lasting memories. Quilting is an art form that transcends the generations. It connects us to our heritage, sometimes with a contemporary spin. Each piece I make features intricate piecing and careful hand-binding, with care in every step.
              </p>
              
              <p className="story-paragraph">
                When I'm not in my studio surrounded by heaps of fabric, I can be found trying to keep up with my three kids, playing games with my husband and friends, and reading endless historical fiction (bonus points for romantic sub-plots).
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