import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/Home.css'

function Home() {
  return (
    <div className="home">
      <div className="hero-section">
        <div className="hero-content">
          {/* Logo container - ready for actual logo image */}
          <div className="logo-container">
            <div className="logo-placeholder">
              <img src="/logos/Loubie Designs Circle Green Background.png" alt="Loubie Designs Logo" className="logo" />
              <img src="/images/logo.png" alt="Loubie Designs Logo" className="logo" style={{ display: 'none' }} />
            </div>
          </div>
          
          <h1 className="tagline">
            Handcrafted Quilts with Love & Precision
          </h1>
          
          <p className="subtitle">
            Where traditional artistry meets modern elegance
          </p>
          
          <div className="cta-buttons">
            <Link to="/portfolio" className="btn btn-primary">
              View My Work
            </Link>
            <Link to="/about" className="btn btn-secondary">
              My Story
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home