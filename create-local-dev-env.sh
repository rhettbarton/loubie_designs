#!/bin/bash
# create-local-dev-env.sh - Get SSO credentials directly for React development

set -e

PROFILE_NAME="loubie"
ENV_FILE=".env.local"

echo "🔑 Getting SSO credentials for profile: $PROFILE_NAME"
echo ""

# Step 1: Ensure SSO login is current
echo "1️⃣ Checking SSO login status..."
if ! aws sts get-caller-identity --profile $PROFILE_NAME >/dev/null 2>&1; then
    echo "❌ SSO session expired or not logged in"
    echo "🔄 Logging in to SSO..."
    aws sso login --profile $PROFILE_NAME
    echo ""
else
    echo "✅ SSO session is active"
    echo ""
fi

# Step 2: Get current SSO credentials from cache
echo "2️⃣ Extracting SSO credentials from cache..."

# Get the SSO cache directory
SSO_CACHE_DIR="$HOME/.aws/sso/cache"
SSO_CONFIG_DIR="$HOME/.aws/cli/cache"

# Find the most recent credential file
CRED_FILE=""
if [ -d "$SSO_CACHE_DIR" ]; then
    CRED_FILE=$(find "$SSO_CACHE_DIR" -name "*.json" -type f | head -n 1)
fi

if [ -z "$CRED_FILE" ] || [ ! -f "$CRED_FILE" ]; then
    echo "❌ Could not find SSO credential cache"
    echo "💡 Try running: aws sso login --profile $PROFILE_NAME"
    exit 1
fi

# Alternative method: Use AWS CLI to get credentials
echo "📋 Using AWS CLI credential process..."
AWS_CREDS=$(aws configure export-credentials --profile $PROFILE_NAME --format env 2>/dev/null || echo "")

if [ -z "$AWS_CREDS" ]; then
    echo "❌ Could not export credentials from profile"
    echo "💡 Trying alternative method..."
    
    # Get credentials by calling STS with the profile
    CALLER_IDENTITY=$(aws sts get-caller-identity --profile $PROFILE_NAME --output json)
    
    # Use a temporary approach - set the profile and let AWS SDK handle it
    echo "✅ Using profile-based authentication"
    PROFILE_BASED=true
else
    echo "✅ Got SSO credentials"
    PROFILE_BASED=false
    
    # Parse the exported credentials
    eval "$AWS_CREDS"
fi

# Step 3: Get CDK stack outputs
echo "3️⃣ Getting CDK stack outputs..."
CDN_DOMAIN=$(aws cloudformation describe-stacks \
    --stack-name LoubieDesignsInfrastructureStack-dev \
    --profile $PROFILE_NAME \
    --query "Stacks[0].Outputs[?OutputKey=='PhotoDistributionDomain'].OutputValue" \
    --output text 2>/dev/null)

TABLE_NAME=$(aws cloudformation describe-stacks \
    --stack-name LoubieDesignsInfrastructureStack-dev \
    --profile $PROFILE_NAME \
    --query "Stacks[0].Outputs[?OutputKey=='PhotoMetadataTableName'].OutputValue" \
    --output text 2>/dev/null)

if [ -z "$CDN_DOMAIN" ] || [ "$CDN_DOMAIN" = "None" ]; then
    echo "⚠️ Warning: Could not get CloudFront domain from CDK stack"
    CDN_DOMAIN="your-cloudfront-domain.cloudfront.net"
fi

if [ -z "$TABLE_NAME" ] || [ "$TABLE_NAME" = "None" ]; then
    echo "⚠️ Warning: Could not get DynamoDB table name from CDK stack"
    TABLE_NAME="your-dynamodb-table-name"
fi

echo "📋 Stack outputs:"
echo "   - CDN Domain: $CDN_DOMAIN"
echo "   - Table Name: $TABLE_NAME"
echo ""

# Step 4: Create .env.local file
echo "4️⃣ Creating $ENV_FILE..."

if [ "$PROFILE_BASED" = true ]; then
    echo "⚠️  Profile-based authentication doesn't work in React browsers"
    echo "🔄 Attempting to get explicit credentials..."
    
    # Try to get credentials using credential_process
    TEMP_CREDS_JSON=$(aws configure export-credentials --profile $PROFILE_NAME --format json 2>/dev/null || echo "")
    
    if [ -n "$TEMP_CREDS_JSON" ]; then
        AWS_ACCESS_KEY_ID=$(echo "$TEMP_CREDS_JSON" | jq -r '.AccessKeyId // empty')
        AWS_SECRET_ACCESS_KEY=$(echo "$TEMP_CREDS_JSON" | jq -r '.SecretAccessKey // empty')
        AWS_SESSION_TOKEN=$(echo "$TEMP_CREDS_JSON" | jq -r '.SessionToken // empty')
        
        if [ -n "$AWS_ACCESS_KEY_ID" ] && [ -n "$AWS_SECRET_ACCESS_KEY" ]; then
            echo "✅ Successfully extracted credentials from profile"
            PROFILE_BASED=false
        fi
    fi
fi

if [ "$PROFILE_BASED" = true ]; then
    echo "❌ Could not extract explicit credentials for React"
    echo "💡 React apps in browsers need explicit credential environment variables"
    exit 1
fi

# Create .env.local with Vite-compatible variables
cat > $ENV_FILE << EOF
# AWS credentials for Vite React app (browser environment)
# Generated: $(date)
# NOTE: Vite requires VITE_ prefix for environment variables

# AWS credentials (both formats for compatibility)
AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
AWS_SESSION_TOKEN=$AWS_SESSION_TOKEN
AWS_REGION=us-west-2

# Vite app environment variables (VITE_ prefix required)
VITE_AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
VITE_AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
VITE_AWS_SESSION_TOKEN=$AWS_SESSION_TOKEN
VITE_AWS_REGION=us-west-2
VITE_PHOTO_CDN_DOMAIN=$CDN_DOMAIN
VITE_DYNAMO_TABLE_NAME=$TABLE_NAME
VITE_ENVIRONMENT=dev

# Debug flag (optional)
VITE_DEBUG_AWS=true
EOF

echo "✅ Created $ENV_FILE with SSO credentials"
echo ""

# Step 5: Test the credentials
echo "5️⃣ Testing credentials..."
export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
export AWS_SESSION_TOKEN=$AWS_SESSION_TOKEN
export AWS_REGION=us-west-2

if aws sts get-caller-identity >/dev/null 2>&1; then
    echo "✅ Credentials are working!"
    IDENTITY=$(aws sts get-caller-identity --output json)
    echo "👤 Identity: $(echo $IDENTITY | jq -r '.Arn')"
else
    echo "❌ Credentials test failed"
    exit 1
fi

echo ""
echo "🎉 Setup complete! You can now run your React app:"
echo "   npm run dev"
echo ""
echo "📝 Note: React credentials expire with your SSO session"
echo "🔄 Re-run this script when SSO session expires"
echo "⚠️  Important: Restart your React dev server after running this script"
echo ""
echo "🗑️ To clean up: rm $ENV_FILE"