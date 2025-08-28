// src/services/awsService.js - Fixed for Vite + Browser environment

// AWS Configuration - Using Vite environment variables
const AWS_CONFIG = {
  region: import.meta.env.VITE_AWS_REGION || 'us-west-2',
  photoCdnDomain: import.meta.env.VITE_PHOTO_CDN_DOMAIN,
  dynamoTableName: import.meta.env.VITE_DYNAMO_TABLE_NAME
};

// AWS SDK v3 imports
import { DynamoDBClient, ScanCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

// Custom credential provider for browser environment
const createCredentialProvider = () => {
  const credentials = {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
    sessionToken: import.meta.env.VITE_AWS_SESSION_TOKEN,
  };

  console.log('🔍 AWS Credential Check:', {
    region: AWS_CONFIG.region,
    tableName: AWS_CONFIG.dynamoTableName,
    cdnDomain: AWS_CONFIG.photoCdnDomain,
    hasAccessKey: !!credentials.accessKeyId,
    hasSecretKey: !!credentials.secretAccessKey,
    hasSessionToken: !!credentials.sessionToken,
    accessKeyPreview: credentials.accessKeyId ? `${credentials.accessKeyId.substring(0, 8)}...` : 'MISSING'
  });

  if (!credentials.accessKeyId || !credentials.secretAccessKey) {
    throw new Error(`
      Missing AWS credentials. Please ensure your .env.local file contains:
      - VITE_AWS_ACCESS_KEY_ID
      - VITE_AWS_SECRET_ACCESS_KEY
      - VITE_AWS_SESSION_TOKEN (for temporary credentials)
      
      Current status:
      - Access Key ID: ${credentials.accessKeyId ? 'SET' : 'MISSING'}
      - Secret Access Key: ${credentials.secretAccessKey ? 'SET' : 'MISSING'}
      - Session Token: ${credentials.sessionToken ? 'SET' : 'MISSING'}
      
      💡 Run your get-sso-credentials.sh script and restart the dev server
    `);
  }

  return credentials;
};

// Initialize DynamoDB client with explicit credentials
let dynamoClient;

try {
  const credentials = createCredentialProvider();
  
  dynamoClient = new DynamoDBClient({
    region: AWS_CONFIG.region,
    credentials: credentials,
  });
  
  console.log('✅ DynamoDB client initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize DynamoDB client:', error.message);
  // Don't throw here, let individual functions handle the error
}

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
    if (!dynamoClient) {
      throw new Error('DynamoDB client not initialized. Check your AWS credentials.');
    }

    if (!AWS_CONFIG.dynamoTableName) {
      throw new Error('VITE_DYNAMO_TABLE_NAME environment variable is not set');
    }

    console.log(`🔍 Scanning DynamoDB table: ${AWS_CONFIG.dynamoTableName}`);

    const command = new ScanCommand({
      TableName: AWS_CONFIG.dynamoTableName,
      FilterExpression: 'portfolio = :portfolio',
      ExpressionAttributeValues: marshall({
        ':portfolio': true
      })
    });

    const response = await dynamoClient.send(command);
    
    console.log(`✅ Retrieved ${response.Items?.length || 0} portfolio items from DynamoDB`);
    
    if (import.meta.env.VITE_DEBUG_AWS === 'true') {
      console.log('DynamoDB Response:', response);
    }

    return response.Items?.map(transformDynamoItem) || [];
    
  } catch (error) {
    console.error('❌ Error fetching products from DynamoDB:', error);
    
    // Enhanced error logging
    if (error.name === 'CredentialsProviderError') {
      console.error('🔑 Credential Provider Error - Check your AWS credentials configuration');
    } else if (error.name === 'ResourceNotFoundException') {
      console.error(`🏷️ Table not found: ${AWS_CONFIG.dynamoTableName}`);
    } else if (error.name === 'AccessDeniedException') {
      console.error('🚫 Access denied - Check your IAM permissions for DynamoDB');
    } else if (error.message.includes('Credential is missing')) {
      console.error('🔑 Missing credentials - Run get-sso-credentials.sh and restart dev server');
    }
    
    throw error;
  }
};

/**
 * Fetch featured products from DynamoDB
 */
export const fetchFeaturedProducts = async () => {
  try {
    if (!dynamoClient) {
      throw new Error('DynamoDB client not initialized. Check your AWS credentials.');
    }

    console.log(`🌟 Fetching featured products from: ${AWS_CONFIG.dynamoTableName}`);

    // Use Scan with filter since we might not have a GSI set up
    const command = new ScanCommand({
      TableName: AWS_CONFIG.dynamoTableName,
      FilterExpression: 'featured = :featured AND portfolio = :portfolio',
      ExpressionAttributeValues: marshall({
        ':featured': true,
        ':portfolio': true
      })
    });

    const response = await dynamoClient.send(command);
    
    console.log(`✅ Retrieved ${response.Items?.length || 0} featured items from DynamoDB`);
    
    return response.Items?.map(transformDynamoItem) || [];
    
  } catch (error) {
    console.error('❌ Error fetching featured products from DynamoDB:', error);
    
    // If GSI doesn't exist, fall back to scan
    if (error.name === 'ResourceNotFoundException' && error.message.includes('FeaturedIndex')) {
      console.warn('⚠️ FeaturedIndex not found, falling back to scan');
      return fetchProducts().then(products => products.filter(p => p.featured));
    }
    
    throw error;
  }
};

/**
 * Fetch products by category from DynamoDB
 */
export const fetchProductsByCategory = async (category) => {
  try {
    if (!dynamoClient) {
      throw new Error('DynamoDB client not initialized. Check your AWS credentials.');
    }

    console.log(`🏷️ Fetching products by category: ${category}`);

    // Use Scan with filter since CategoryIndex might not exist
    const command = new ScanCommand({
      TableName: AWS_CONFIG.dynamoTableName,
      FilterExpression: 'category = :category AND portfolio = :portfolio',
      ExpressionAttributeValues: marshall({
        ':category': category,
        ':portfolio': true
      })
    });

    const response = await dynamoClient.send(command);
    return response.Items?.map(transformDynamoItem) || [];
    
  } catch (error) {
    console.error('❌ Error fetching products by category from DynamoDB:', error);
    
    // Fall back to filtering all products
    if (error.name === 'ResourceNotFoundException' && error.message.includes('CategoryIndex')) {
      console.warn('⚠️ CategoryIndex not found, falling back to scan');
      return fetchProducts().then(products => products.filter(p => p.category === category));
    }
    
    throw error;
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
      description: 'This is sample data shown when AWS services are unavailable. Please check your credentials and try again.',
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

/**
 * Test AWS connection and credentials
 */
export const testAWSConnection = async () => {
  try {
    console.log('🧪 Testing AWS connection...');
    
    if (!dynamoClient) {
      throw new Error('DynamoDB client not initialized');
    }

    // Simple operation to test credentials
    const command = new ScanCommand({
      TableName: AWS_CONFIG.dynamoTableName,
      Limit: 1
    });

    await dynamoClient.send(command);
    console.log('✅ AWS connection test successful');
    return true;
    
  } catch (error) {
    console.error('❌ AWS connection test failed:', error);
    return false;
  }
};

/**
 * Debug credentials and environment
 */
export const debugCredentials = async () => {
  try {
    console.log('🔍 Debugging AWS Credentials...');
    
    // Check environment variables
    console.log('Environment variables:');
    console.log('- VITE_AWS_REGION:', import.meta.env.VITE_AWS_REGION);
    console.log('- VITE_DYNAMO_TABLE_NAME:', import.meta.env.VITE_DYNAMO_TABLE_NAME);
    console.log('- VITE_PHOTO_CDN_DOMAIN:', import.meta.env.VITE_PHOTO_CDN_DOMAIN);
    console.log('- VITE_AWS_ACCESS_KEY_ID:', import.meta.env.VITE_AWS_ACCESS_KEY_ID ? '[SET]' : '[NOT SET]');
    console.log('- VITE_AWS_SECRET_ACCESS_KEY:', import.meta.env.VITE_AWS_SECRET_ACCESS_KEY ? '[SET]' : '[NOT SET]');
    console.log('- VITE_AWS_SESSION_TOKEN:', import.meta.env.VITE_AWS_SESSION_TOKEN ? '[SET]' : '[NOT SET]');

    // Test STS call if credentials are available
    if (import.meta.env.VITE_AWS_ACCESS_KEY_ID && import.meta.env.VITE_AWS_SECRET_ACCESS_KEY) {
      const { STSClient, GetCallerIdentityCommand } = await import('@aws-sdk/client-sts');
      const stsClient = new STSClient({ 
        region: AWS_CONFIG.region,
        credentials: createCredentialProvider()
      });
      const identity = await stsClient.send(new GetCallerIdentityCommand({}));
      
      console.log('✅ AWS Identity:', identity);
      return identity;
    } else {
      throw new Error('Credentials not available for STS test');
    }
    
  } catch (error) {
    console.error('❌ AWS Credentials Debug Failed:', error);
    throw error;
  }
};