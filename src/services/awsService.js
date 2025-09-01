// src/services/awsService.js - Production-ready version for Amplify

// AWS Configuration
const AWS_CONFIG = {
  region: import.meta.env.VITE_AWS_REGION || 'us-west-2',
  photoCdnDomain: import.meta.env.VITE_PHOTO_CDN_DOMAIN,
  dynamoTableName: import.meta.env.VITE_DYNAMO_TABLE_NAME
};

// AWS SDK v3 imports
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

// Environment detection
const isProduction = import.meta.env.PROD;
const isAmplify = !import.meta.env.VITE_AWS_ACCESS_KEY_ID; // Amplify won't have explicit credentials

/**
 * Create appropriate credential provider based on environment
 */
const createCredentialProvider = () => {
  // Production/Amplify: Use IAM roles (no explicit credentials needed)
  if (isProduction || isAmplify) {
    console.log('🏭 Production mode: Using IAM role credentials');
    return undefined; // Let AWS SDK use IAM role automatically
  }

  // Development: Use explicit credentials from environment
  const credentials = {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
    sessionToken: import.meta.env.VITE_AWS_SESSION_TOKEN,
  };

  console.log('🔧 Development mode: Using explicit credentials');
  console.log('Credential status:', {
    hasAccessKey: !!credentials.accessKeyId,
    hasSecretKey: !!credentials.secretAccessKey,
    hasSessionToken: !!credentials.sessionToken,
  });

  if (!credentials.accessKeyId || !credentials.secretAccessKey) {
    throw new Error(`
      Missing AWS credentials for development. Please run:
      bash create-local-dev-env.sh
      
      Then restart your dev server.
    `);
  }

  return credentials;
};

// Initialize DynamoDB client
let dynamoClient;
let initializationError = null;

try {
  const credentials = createCredentialProvider();
  
  dynamoClient = new DynamoDBClient({
    region: AWS_CONFIG.region,
    ...(credentials && { credentials }) // Only include credentials if they exist
  });
  
  console.log('✅ DynamoDB client initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize DynamoDB client:', error.message);
  initializationError = error;
}

/**
 * Convert DynamoDB item to application format
 */
const transformDynamoItem = (item) => {
  const product = unmarshall(item);
  let images = [];
  
  // Process files list from DynamoDB
  if (product.files && Array.isArray(product.files)) {
    images = product.files.map((fileName, index) => {
      const fullPath = fileName.includes('/') 
        ? fileName 
        : `${product.folderPath}/${fileName}`;
      
      return {
        file: fullPath,
        url: `https://${AWS_CONFIG.photoCdnDomain}/${fullPath}`,
        index: index
      };
    });
  } else if (product.folderPath && product.coverImage) {
    // Fallback: use cover image only
    const coverPath = `${product.folderPath}/${product.coverImage}`;
    images = [{
      file: coverPath,
      url: `https://${AWS_CONFIG.photoCdnDomain}/${coverPath}`,
      index: 0
    }];
  }
  
  // Ensure cover image is first
  if (product.coverImage && images.length > 0) {
    const coverFileName = product.coverImage;
    const coverIndex = images.findIndex(img => 
      img.file.endsWith(coverFileName) || img.file === coverFileName
    );
    
    if (coverIndex > 0) {
      const coverImg = images[coverIndex];
      images.splice(coverIndex, 1);
      images.unshift(coverImg);
    } else if (coverIndex === -1 && product.folderPath) {
      const coverPath = `${product.folderPath}/${coverFileName}`;
      images.unshift({
        file: coverPath,
        url: `https://${AWS_CONFIG.photoCdnDomain}/${coverPath}`,
        index: -1
      });
    }
  }
  
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category,
    coverImage: product.coverImage ? `${product.folderPath}/${product.coverImage}` : '',
    coverImageUrl: product.coverImage ? `https://${AWS_CONFIG.photoCdnDomain}/${product.folderPath}/${product.coverImage}` : '',
    featured: product.featured === true || product.featured === 'true',
    portfolio: product.portfolio === true || product.portfolio === 'true',
    folderPath: product.folderPath,
    images: images,
    files: product.files || []
  };
};

/**
 * Fetch all portfolio products from DynamoDB
 */
export const fetchProducts = async () => {
  if (initializationError) {
    throw initializationError;
  }
  
  if (!dynamoClient) {
    throw new Error('DynamoDB client not initialized');
  }
  
  if (!AWS_CONFIG.dynamoTableName) {
    throw new Error('VITE_DYNAMO_TABLE_NAME environment variable is not set');
  }

  try {
    console.log(`🔍 Scanning DynamoDB table`);
    
    const command = new ScanCommand({
      TableName: AWS_CONFIG.dynamoTableName,
      FilterExpression: 'portfolio = :portfolio',
      ExpressionAttributeValues: marshall({
        ':portfolio': "true"
      })
    });
    
    const response = await dynamoClient.send(command);
    console.log(`✅ Retrieved ${response.Items?.length || 0} portfolio items from DynamoDB`);
    
    return response.Items ? response.Items.map(transformDynamoItem) : [];
    
  } catch (error) {
    console.error('❌ Error fetching products from DynamoDB:', error);
    
    // Enhanced error handling
    if (error.name === 'UnauthorizedOperation' || error.name === 'AccessDeniedException') {
      throw new Error('AWS permissions denied. Check IAM role configuration.');
    } else if (error.name === 'ResourceNotFoundException') {
      throw new Error(`DynamoDB table "${AWS_CONFIG.dynamoTableName}" not found.`);
    } else if (error.message.includes('Credential')) {
      throw new Error('AWS credential configuration error. Check environment setup.');
    }
    
    throw error;
  }
};

/**
 * Fetch featured products from DynamoDB
 */
export const fetchFeaturedProducts = async () => {
  if (initializationError) {
    throw initializationError;
  }
  
  try {
    console.log(`🌟 Fetching featured products`);
    
    const command = new ScanCommand({
      TableName: AWS_CONFIG.dynamoTableName,
      FilterExpression: 'featured = :featured AND portfolio = :portfolio',
      ExpressionAttributeValues: marshall({
        ':featured': "true",
        ':portfolio': "true"
      })
    });
    
    const response = await dynamoClient.send(command);
    console.log(`✅ Retrieved ${response.Items?.length || 0} featured items from DynamoDB`);
    
    return response.Items ? response.Items.map(transformDynamoItem) : [];
    
  } catch (error) {
    console.error('❌ Error fetching featured products from DynamoDB:', error);
    throw error;
  }
};

/**
 * Get image URL from CloudFront CDN
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  const cleanPath = imagePath.replace(/^\/+/, '');
  return `https://${AWS_CONFIG.photoCdnDomain}/${cleanPath}`;
};

// Fallback data for when AWS services are unavailable
const FALLBACK_DATA = {
  products: [
    {
      id: 'fallback-item',
      name: 'Sample Quilt',
      description: 'AWS services are currently unavailable. This is sample data. Please try again later.',
      category: 'Sample',
      coverImage: '',
      coverImageUrl: '/logos/Loubie Designs Circle Green Background.png', // Use local logo as fallback
      featured: false,
      portfolio: true,
      images: [],
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
    console.warn('⚠️ AWS services unavailable, using fallback data:', error.message);
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
    console.warn('⚠️ AWS services unavailable for featured products:', error.message);
    return [];
  }
};