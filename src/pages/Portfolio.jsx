import React, { useState, useEffect } from 'react'
import '../styles/Portfolio.css'
import data from '../data/photos.json'


function Portfolio() {
  const [photos, setPhotos] = useState([])
  const [filteredPhotos, setFilteredPhotos] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load photos data
    const loadPhotos = async () => {
      try {
        
        // Filter only portfolio items
        const portfolioItems = data.filter(photo => photo.portfolio === true)
        setPhotos(portfolioItems)
        setFilteredPhotos(portfolioItems)
        setLoading(false)
      } catch (error) {
        console.error('Error loading photos:', error)
        setLoading(false)
      }
    }

    loadPhotos()
  }, [])

  useEffect(() => {
    // Filter photos based on category and search
    let filtered = photos

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(photo => photo.category === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(photo => 
        photo.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        photo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        photo.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredPhotos(filtered)
  }, [photos, selectedCategory, searchTerm])

  const featuredPhotos = photos.filter(photo => photo.featured === true)
  const categories = ['all', ...new Set(photos.map(photo => photo.category))]

  const openLightbox = (photo) => {
    setSelectedPhoto(photo)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setSelectedPhoto(null)
    document.body.style.overflow = 'unset'
  }

  if (loading) {
    return (
      <div className="portfolio-loading">
        <div className="loading-spinner"></div>
        <p>Loading beautiful quilts...</p>
      </div>
    )
  }

  return (
    <div className="portfolio">
      {/* Featured Reel */}
      {featuredPhotos.length > 0 && (
        <section className="featured-section">
          <div className="featured-container">
            <h2 className="featured-title">Featured Items</h2>
            <div className="featured-reel">
              {featuredPhotos.map((photo, index) => (
                <div 
                  key={index} 
                  className="featured-item"
                  onClick={() => openLightbox(photo)}
                >
                  <img 
                    src={`/photos/${photo.file}`} 
                    alt={photo.label}
                    className="featured-image"
                  />
                  <div className="featured-overlay">
                    <h3 className="featured-label">{photo.label}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Portfolio Section */}
      <section className="portfolio-main">
        <div className="portfolio-container">
          <div className="portfolio-header">
            <h1 className="portfolio-title">My Work</h1>
            
            {/* Search Bar */}
            <div className="search-container">
              <div className="search-input-wrapper">
                <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="search-clear"
                    aria-label="Clear search"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                      <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <div className="category-filter">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                >
                  {category === 'all' ? 'All Items' : category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Results Info */}
          <div className="results-info">
            <p className="results-count">
              {filteredPhotos.length} {filteredPhotos.length === 1 ? 'item' : 'items'} 
              {searchTerm && ` matching "${searchTerm}"`}
              {selectedCategory !== 'all' && ` in ${selectedCategory}`}
            </p>
          </div>

          {/* Photo Grid */}
          <div className="photo-grid">
            {filteredPhotos.map((photo, index) => (
              <div 
                key={index} 
                className="photo-item"
                onClick={() => openLightbox(photo)}
              >
                <div className="photo-wrapper">
                  <img 
                    src={`/photos/${photo.file}`} 
                    alt={photo.label}
                    className="photo-image"
                  />
                  <div className="photo-overlay">
                    <h3 className="photo-label">{photo.label}</h3>
                    <div className="photo-category">{photo.category}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPhotos.length === 0 && (
            <div className="no-results">
              <p>No items found matching your criteria.</p>
              <button 
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('all')
                }}
                className="btn btn-secondary"
              >
                Show All Items
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
            <button 
              className="lightbox-close"
              onClick={closeLightbox}
              aria-label="Close lightbox"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2"/>
                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
            
            <div className="lightbox-content">
              <div className="lightbox-image-container">
                <img 
                  src={`/photos/${selectedPhoto.file}`} 
                  alt={selectedPhoto.label}
                  className="lightbox-image"
                />
              </div>
              
              <div className="lightbox-info">
                <h2 className="lightbox-title">{selectedPhoto.label}</h2>
                <div className="lightbox-category">{selectedPhoto.category}</div>
                <p className="lightbox-description">{selectedPhoto.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Portfolio