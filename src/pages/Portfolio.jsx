import React, { useState, useEffect, useCallback } from 'react'
import '../styles/Portfolio.css'
import data from '../data/photos.json'

function Portfolio() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load products data
    const loadProducts = async () => {
      try {
        // Filter only portfolio items
        const portfolioItems = data.products.filter(product => product.portfolio === true)
        setProducts(portfolioItems)
        setFilteredProducts(portfolioItems)
        setLoading(false)
      } catch (error) {
        console.error('Error loading products:', error)
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  useEffect(() => {
    // Filter products based on category and search
    let filtered = products

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.images.some(img => 
          img.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          img.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    setFilteredProducts(filtered)
  }, [products, selectedCategory, searchTerm])

  const featuredProducts = products.filter(product => product.featured === true)
  const categories = ['all', ...new Set(products.map(product => product.category))]

  const openLightbox = (product, imageIndex = 0) => {
    setSelectedProduct(product)
    setCurrentImageIndex(imageIndex)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setSelectedProduct(null)
    setCurrentImageIndex(0)
    document.body.style.overflow = 'unset'
  }

  const nextImage = useCallback(() => {
    if (selectedProduct) {
      setCurrentImageIndex((prev) => 
        prev === selectedProduct.images.length - 1 ? 0 : prev + 1
      )
    }
  }, [selectedProduct])

  const prevImage = useCallback(() => {
    if (selectedProduct) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedProduct.images.length - 1 : prev - 1
      )
    }
  }, [selectedProduct])

  const goToImage = (index) => {
    setCurrentImageIndex(index)
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!selectedProduct) return
      
      switch(e.key) {
        case 'Escape':
          closeLightbox()
          break
        case 'ArrowLeft':
          prevImage()
          break
        case 'ArrowRight':
          nextImage()
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [selectedProduct, prevImage, nextImage])

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
      {featuredProducts.length > 0 && (
        <section className="featured-section">
          <div className="featured-container">
            <h2 className="featured-title">Featured Items</h2>
            <div className="featured-reel">
              {featuredProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="featured-item"
                  onClick={() => openLightbox(product)}
                >
                  <img 
                    src={`/photos/${product.coverImage}`} 
                    alt={product.name}
                    className="featured-image"
                  />
                  <div className="featured-overlay">
                    <h3 className="featured-label">{product.name}</h3>
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
            <h1 className="portfolio-title">Browse My Projects</h1>
            
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
              {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} 
              {searchTerm && ` matching "${searchTerm}"`}
              {selectedCategory !== 'all' && ` in ${selectedCategory}`}
            </p>
          </div>

          {/* Products Grid */}
          <div className="photo-grid">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                className="photo-item product-card"
                onClick={() => openLightbox(product)}
              >
                <div className="photo-wrapper">
                  <img 
                    src={`/photos/${product.coverImage}`} 
                    alt={product.name}
                    className="photo-image"
                  />
                  <div className="photo-overlay">
                    <h3 className="photo-label">{product.name}</h3>
                    <div className="photo-category">{product.category}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
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

      {/* Enhanced Lightbox Modal with Image Navigation */}
      {selectedProduct && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-container product-lightbox" onClick={(e) => e.stopPropagation()}>
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
            
            <div className="lightbox-header">
              <h2 className="lightbox-collection-title">{selectedProduct.name}</h2>
            </div>
            
            <div className="lightbox-content">
              <div className="lightbox-image-container">
                <img 
                  src={`/photos/${selectedProduct.images[currentImageIndex].file}`} 
                  alt={selectedProduct.images[currentImageIndex].label}
                  className="lightbox-image"
                />
                
                {selectedProduct.images.length > 1 && (
                  <>
                    <button 
                      className="nav-button prev-button" 
                      onClick={prevImage}
                      aria-label="Previous image"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>
                    <button 
                      className="nav-button next-button" 
                      onClick={nextImage}
                      aria-label="Next image"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>
                  </>
                )}
              </div>
              
              <div className="lightbox-info">
                <h3 className="lightbox-title">{selectedProduct.images[currentImageIndex].label}</h3>
                <div className="lightbox-category">{selectedProduct.category}</div>
                <p className="lightbox-description">{selectedProduct.images[currentImageIndex].description}</p>
              </div>
            </div>

            {/* Thumbnail Strip */}
            {selectedProduct.images.length > 1 && (
              <div className="thumbnail-strip">
                {selectedProduct.images.map((image, index) => (
                  <img
                    key={index}
                    src={`/photos/${image.file}`}
                    alt={image.label}
                    className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => goToImage(index)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Portfolio