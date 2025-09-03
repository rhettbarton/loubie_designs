#!/bin/bash
# set-app-env-vars.sh - Updated for API Gateway approach

set -e

PROFILE_NAME="loubie"

echo "🔑 Setting up environment variables for API Gateway approach"
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

# Step 2: Get CDK stack outputs for production
echo "2️⃣ Getting CDK stack outputs..."
API_URL=$(aws cloudformation describe-stacks \
    --stack-name LoubieDesignsInfrastructureStack-prod \
    --profile $PROFILE_NAME \
    --query "Stacks[0].Outputs[?OutputKey=='ApiGatewayUrl'].OutputValue" \
    --output text 2>/dev/null)

# Remove trailing slash if present
API_URL=$(echo "$API_URL" | sed 's/\/$//')

if [ -z "$API_URL" ] || [ "$API_URL" = "None" ]; then
    echo "⚠️ Warning: Could not get API Gateway URL from CDK stack"
    echo "Please ensure the CDK stack has been deployed with the updated infrastructure"
    exit 1
fi

echo "📋 Stack outputs:"
echo "   - API URL: $API_URL"
echo ""

# Step 3: Get Amplify App ID
echo "3️⃣ Getting Amplify App ID..."
APP_ID=$(aws amplify list-apps --query "apps[?name=='loubie_designs'].appId" --output text --no-cli-pager --profile $PROFILE_NAME)

if [ -z "$APP_ID" ] || [ "$APP_ID" = "None" ]; then
    echo "⚠️ Warning: Could not find Amplify app"
    echo "Please ensure the Amplify app exists"
    exit 1
fi

echo "📋 Amplify App ID: $APP_ID"
echo ""

# Step 4: Update Amplify app environment variables
echo "4️⃣ Updating Amplify app environment variables..."
aws amplify update-app \
    --app-id $APP_ID \
    --environment-variables \
        VITE_API_URL=$API_URL,VITE_ENVIRONMENT=prod \
    --profile $PROFILE_NAME \
    --no-cli-pager

echo ""
echo "🎉 Amplify environment variables updated successfully!"
echo ""
echo "📝 Updated variables:"
echo "   - VITE_API_URL: $API_URL"
echo "   - VITE_ENVIRONMENT: prod"
echo ""
echo "🔄 Trigger a new deployment in Amplify Console to apply changes"