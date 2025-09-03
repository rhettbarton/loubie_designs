#!/bin/bash
# create-local-dev-env.sh - Updated for API Gateway approach

set -e

PROFILE_NAME="loubie"
ENV_FILE=".env.local"

echo "🔑 Setting up local development environment with API Gateway"
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

# Step 2: Get CDK stack outputs for development
echo "2️⃣ Getting CDK stack outputs..."
API_URL=$(aws cloudformation describe-stacks \
    --stack-name LoubieDesignsInfrastructureStack-dev \
    --profile $PROFILE_NAME \
    --query "Stacks[0].Outputs[?OutputKey=='ApiGatewayUrl'].OutputValue" \
    --output text 2>/dev/null)

# Remove trailing slash if present
API_URL=$(echo "$API_URL" | sed 's/\/$//')

if [ -z "$API_URL" ] || [ "$API_URL" = "None" ]; then
    echo "⚠️ Warning: Could not get API Gateway URL from CDK stack"
    echo "Please ensure you've deployed the updated CDK stack:"
    echo "   cd cdk && cdk deploy --context environment=dev"
    echo ""
    echo "Using placeholder URL for now..."
    API_URL="https://your-api-gateway-url.execute-api.us-west-2.amazonaws.com/prod"
fi

echo "📋 Stack outputs:"
echo "   - API URL: $API_URL"
echo ""

# Step 3: Create .env.local file
echo "3️⃣ Creating $ENV_FILE..."

cat > $ENV_FILE << EOF
# Local development environment variables
# Generated: $(date)
# NOTE: This app now uses API Gateway instead of direct AWS SDK calls

# API Gateway endpoint (no AWS credentials needed in browser)
VITE_API_URL=$API_URL
VITE_ENVIRONMENT=dev

# Legacy variables (kept for backward compatibility)
VITE_AWS_REGION=us-west-2

# Debug flag (optional)
VITE_DEBUG_API=true
EOF

echo "✅ Created $ENV_FILE with API Gateway configuration"
echo ""

# Step 4: Test the API endpoint (if it's not a placeholder)
if [[ "$API_URL" != *"your-api-gateway-url"* ]]; then
    echo "4️⃣ Testing API endpoint..."
    
    if curl -s -f "$API_URL/api/products" >/dev/null 2>&1; then
        echo "✅ API endpoint is responding!"
    else
        echo "⚠️ API endpoint test failed - this may be normal if CORS is strict"
        echo "The API should work once you start your React app"
    fi
else
    echo "4️⃣ Skipping API test (placeholder URL)"
fi

echo ""
echo "🎉 Setup complete! You can now run your React app:"
echo "   npm run dev"
echo ""
echo "📝 Key changes:"
echo "   • No more AWS credentials needed in browser"
echo "   • App now uses API Gateway for data"
echo "   • Images come with pre-signed URLs from API"
echo ""
echo "🔄 If you haven't deployed the updated CDK stack yet:"
echo "   cd infrastructure"
echo "   cdk deploy --context environment=dev"
echo ""
echo "🗑️ To clean up: rm $ENV_FILE"