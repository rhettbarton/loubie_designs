// src/services/awsService.js - Updated to use API Gateway instead of direct AWS SDK

// API Configuration
const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_URL || 'https://your-api-gateway-url.execute-api.us-west-2.amazonaws.com/prod',
  environment: import.meta.env.VITE_ENVIRONMENT || 'dev'
};

console.log('🔧 API Service initialized with config:', {
  baseUrl: API_CONFIG.baseUrl,
  environment: API_CONFIG.environment
});

/**
 * Generic API fetch with error handling
 */
const apiRequest = async (endpoint) => {
  const url = `${API_CONFIG.baseUrl}/api${endpoint}`;
  
  try {
    console.log(`📡 Making API request to: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ API response received from ${endpoint}:`, data);
    
    return data;
  } catch (error) {
    console.error(`❌ API request failed for ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Fetch all portfolio products from API
 */
export const fetchProducts = async () => {
  try {
    const response = await apiRequest('/products');
    const products = response.products || [];
    
    console.log(`✅ Retrieved ${products.length} portfolio items from API`);
    return products;
  } catch (error) {
    console.error('❌ Error fetching products from API:', error);
    throw error;
  }
};

/**
 * Fetch featured products from API
 */
export const fetchFeaturedProducts = async () => {
  try {
    const response = await apiRequest('/products/featured');
    const products = response.products || [];
    
    console.log(`✅ Retrieved ${products.length} featured items from API`);
    return products;
  } catch (error) {
    console.error('❌ Error fetching featured products from API:', error);
    throw error;
  }
};

/**
 * Get image URL - now products come with pre-signed URLs from API
 * This function is kept for backward compatibility
 */
export const getImageUrl = (imagePath) => {
  // With the new API, images already have pre-signed URLs
  // This function is mainly for fallback scenarios
  if (!imagePath) return '';
  
  // If it's already a full URL (pre-signed), return as is
  if (imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Fallback to CloudFront (shouldn't be needed with API approach)
  const cdnDomain = import.meta.env.VITE_PHOTO_CDN_DOMAIN;
  if (cdnDomain) {
    const cleanPath = imagePath.replace(/^\/+/, '');
    return `https://${cdnDomain}/${cleanPath}`;
  }
  
  return imagePath;
};

// Fallback data for when API is unavailable
const FALLBACK_DATA = {
  products: [
    {
      id: 'fallback-item',
      name: 'Sample Quilt',
      description: 'The portfolio API is currently unavailable. This is sample data. Please try again later.',
      category: 'Sample',
      coverImage: '',
      coverImageUrl: '/logos/Loubie Designs Circle Green Background.png',
      featured: false,
      portfolio: true,
      images: [{
        file: 'sample',
        url: '/logos/Loubie Designs Circle Green Background.png',
        index: 0
      }],
      files: []
    }
  ]
};

/**
 * Fetch products with fallback to local data
 */
export const fetchProductsWithFallback = async () => {
  try {
    const products = await fetchProducts();
    return products.length > 0 ? products : FALLBACK_DATA.products;
  } catch (error) {
    console.warn('⚠️ Portfolio API unavailable, using fallback data:', error.message);
    return FALLBACK_DATA.products;
  }
};

/**
 * Fetch featured products with fallback
 */
export const fetchFeaturedProductsWithFallback = async () => {
  try {
    const products = await fetchFeaturedProducts();
    return products;
  } catch (error) {
    console.warn('⚠️ Featured products API unavailable:', error.message);
    return [];
  }
};

// Health check function for monitoring
export const healthCheck = async () => {
  try {
    const start = Date.now();
    await apiRequest('/products?limit=1');
    const duration = Date.now() - start;
    
    return {
      status: 'healthy',
      responseTime: duration,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};