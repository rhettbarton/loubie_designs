import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/Home.css'

function Home() {
  return (
    <div className="home">
      <div className="hero-section">
        <div className="hero-content">
          <div className="logo-container">
            <div className="logo-placeholder">
              <img src="/logos/Loubie Designs Circle Green Background.png" alt="Loubie Designs Logo" className="logo" />
            </div>
          </div>
          
          <h1 className="tagline">
            Handcrafted Quilted and Sewn Goods
          </h1>
          
          <p className="subtitle">
            Crafted in Boise, Idaho
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