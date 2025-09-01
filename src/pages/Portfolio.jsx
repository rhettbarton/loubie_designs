// src/pages/Portfolio.jsx
import React, { useState, useEffect, useCallback } from 'react'
import '../styles/Portfolio.css'
import { 
  fetchProductsWithFallback, 
  fetchFeaturedProductsWithFallback,
  getImageUrl
} from '../services/awsService'

function Portfolio() {
  const [products, setProducts] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Load products data from AWS
    const loadProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch both regular and featured products
        const [allProducts, featuredItems] = await Promise.all([
          fetchProductsWithFallback(),
          fetchFeaturedProductsWithFallback()
        ])
        
        // Filter only portfolio items
        const portfolioItems = allProducts.filter(product => product.portfolio === true)
        setProducts(portfolioItems)
        setFilteredProducts(portfolioItems)
        setFeaturedProducts(featuredItems.filter(product => product.portfolio === true))
        
      } catch (err) {
        console.error('Error loading products:', err)
        setError('Failed to load products. Please try again later.')
      } finally {
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
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredProducts(filtered)
  }, [products, selectedCategory, searchTerm])

  // Get unique categories from products
  const categories = ['all', ...new Set(products.map(product => product.category))]

  const openLightbox = (product, imageIndex = 0) => { 
    // Use images from the files list
    let images = product.images && product.images.length > 0 ? product.images : [];
    
    // Fallback to cover image if no images
    if (images.length === 0 && product.coverImage) {
      images = [{ file: product.coverImage, url: product.coverImageUrl }];
    }
    
    const productWithImages = { ...product, images };
    setSelectedProduct(productWithImages);
    setCurrentImageIndex(Math.min(imageIndex, images.length - 1));
    document.body.style.overflow = 'hidden';
  }

  const closeLightbox = () => {
    setSelectedProduct(null)
    setCurrentImageIndex(0)
    document.body.style.overflow = 'unset'
  }

  const nextImage = useCallback(() => {
    if (selectedProduct && selectedProduct.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === selectedProduct.images.length - 1 ? 0 : prev + 1
      )
    }
  }, [selectedProduct])

  const prevImage = useCallback(() => {
    if (selectedProduct && selectedProduct.images.length > 0) {
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

  if (error) {
    return (
      <div className="portfolio-loading">
        <div className="error-message">
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
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
                    src={product.coverImageUrl || getImageUrl(product.coverImage)} 
                    alt={product.name}
                    className="featured-image"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      console.warn(`Failed to load image: ${product.coverImageUrl}`)
                    }}
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
                    src={product.coverImageUrl || getImageUrl(product.coverImage)} 
                    alt={product.name}
                    className="photo-image"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      console.warn(`Failed to load image: ${product.coverImageUrl}`)
                    }}
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
              {selectedProduct.images && selectedProduct.images.length > 0 ? (
                <>
                  <div className="lightbox-image-container">
                    <img 
                      src={selectedProduct.images[currentImageIndex]?.url || getImageUrl(selectedProduct.images[currentImageIndex]?.file)} 
                      alt={`${selectedProduct.name} ${currentImageIndex + 1}`}
                      className="lightbox-image"
                      onError={(e) => {
                        console.warn(`Failed to load lightbox image: ${e.target.src}`)
                      }}
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
                </>
              ) : (
                <div className="no-images">
                  <p>No images available for this item</p>
                </div>
              )}
              
              <div className="lightbox-info">
                <p className="lightbox-description">{selectedProduct.description}</p>
              </div>
            </div>

            {/* Thumbnail Strip */}
            {selectedProduct.images && selectedProduct.images.length > 1 && (
              <div className="thumbnail-strip">
                {selectedProduct.images.map((image, index) => (
                  <img
                    key={index}
                    src={image.url || getImageUrl(image.file)}
                    alt={`${selectedProduct.name} ${index + 1}`}
                    className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                    onClick={() => goToImage(index)}
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
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