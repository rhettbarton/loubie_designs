// src/services/awsService.js

// AWS Configuration - These should be set as environment variables in Amplify
const AWS_CONFIG = {
  region: process.env.REACT_APP_AWS_REGION || 'us-west-2',
  photoCdnDomain: process.env.REACT_APP_PHOTO_CDN_DOMAIN,
  dynamoTableName: process.env.REACT_APP_DYNAMO_TABLE_NAME
};

// AWS SDK v3 imports (you'll need to install these)
import { DynamoDBClient, ScanCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

// Initialize DynamoDB client
const dynamoClient = new DynamoDBClient({
  region: AWS_CONFIG.region,
  // Amplify will handle authentication automatically
});

/**
 * Convert DynamoDB item to application format and generate image URLs
 */
const transformDynamoItem = (item) => {
  const product = unmarshall(item);
  
  // Generate image URLs based on folderPath
  const images = [];
  if (product.coverImage) {
    images.push({
      file: `${product.folderPath}/${product.coverImage}`,
      url: `https://${AWS_CONFIG.photoCdnDomain}/${product.folderPath}/${product.coverImage}`
    });
  }
  
  // Note: For now, we'll just use the cover image. 
  // In a complete implementation, you'd need to list all images in the S3 folder
  // This would require additional API calls or pre-populating the image list in DynamoDB
  
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category,
    coverImage: `${product.folderPath}/${product.coverImage}`,
    coverImageUrl: `https://${AWS_CONFIG.photoCdnDomain}/${product.folderPath}/${product.coverImage}`,
    featured: product.featured === true || product.featured === 'true',
    portfolio: product.portfolio === true || product.portfolio === 'true',
    folderPath: product.folderPath,
    images: images
  };
};

/**
 * Fetch all portfolio products from DynamoDB
 */
export const fetchProducts = async () => {
  try {
    const command = new ScanCommand({
      TableName: AWS_CONFIG.dynamoTableName,
      FilterExpression: 'portfolio = :portfolio',
      ExpressionAttributeValues: marshall({
        ':portfolio': true
      })
    });

    const response = await dynamoClient.send(command);
    return response.Items.map(transformDynamoItem);
  } catch (error) {
    console.error('Error fetching products from DynamoDB:', error);
    throw new Error('Failed to fetch products');
  }
};

/**
 * Fetch featured products from DynamoDB
 */
export const fetchFeaturedProducts = async () => {
  try {
    const command = new QueryCommand({
      TableName: AWS_CONFIG.dynamoTableName,
      IndexName: 'FeaturedIndex',
      KeyConditionExpression: 'featured = :featured',
      ExpressionAttributeValues: marshall({
        ':featured': true
      })
    });

    const response = await dynamoClient.send(command);
    return response.Items.map(transformDynamoItem);
  } catch (error) {
    console.error('Error fetching featured products from DynamoDB:', error);
    throw new Error('Failed to fetch featured products');
  }
};

/**
 * Fetch products by category from DynamoDB
 */
export const fetchProductsByCategory = async (category) => {
  try {
    const command = new QueryCommand({
      TableName: AWS_CONFIG.dynamoTableName,
      IndexName: 'CategoryIndex',
      KeyConditionExpression: 'category = :category',
      ExpressionAttributeValues: marshall({
        ':category': category
      })
    });

    const response = await dynamoClient.send(command);
    return response.Items.map(transformDynamoItem);
  } catch (error) {
    console.error('Error fetching products by category from DynamoDB:', error);
    throw new Error('Failed to fetch products by category');
  }
};

/**
 * Get image URL from CloudFront CDN
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  return `https://${AWS_CONFIG.photoCdnDomain}/${imagePath}`;
};

/**
 * Get all categories from products
 */
export const getCategories = async () => {
  try {
    const products = await fetchProducts();
    const categories = [...new Set(products.map(product => product.category))];
    return ['all', ...categories.sort()];
  } catch (error) {
    console.error('Error getting categories:', error);
    return ['all'];
  }
};

// Fallback data in case AWS services are unavailable
const FALLBACK_DATA = {
  products: [
    {
      id: 'fallback-item',
      name: 'Sample Quilt',
      description: 'This is sample data shown when AWS services are unavailable.',
      category: 'Sample',
      coverImage: '',
      coverImageUrl: '',
      featured: false,
      portfolio: true,
      images: []
    }
  ]
};

/**
 * Fetch products with fallback to local data
 */
export const fetchProductsWithFallback = async () => {
  try {
    return await fetchProducts();
  } catch (error) {
    console.warn('AWS services unavailable, using fallback data:', error);
    return FALLBACK_DATA.products;
  }
};

/**
 * Fetch featured products with fallback
 */
export const fetchFeaturedProductsWithFallback = async () => {
  try {
    return await fetchFeaturedProducts();
  } catch (error) {
    console.warn('AWS services unavailable for featured products:', error);
    return [];
  }
};