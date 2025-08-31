#!/bin/bash
# get-sso-credentials.sh - Get SSO credentials directly for React development

set -e

PROFILE_NAME="loubie"

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

# Step 2: Get CDK stack outputs
echo "3️⃣ Getting CDK stack outputs..."
CDN_DOMAIN=$(aws cloudformation describe-stacks \
    --stack-name LoubieDesignsInfrastructureStack-prod \
    --profile $PROFILE_NAME \
    --query "Stacks[0].Outputs[?OutputKey=='PhotoDistributionDomain'].OutputValue" \
    --output text 2>/dev/null)

TABLE_NAME=$(aws cloudformation describe-stacks \
    --stack-name LoubieDesignsInfrastructureStack-prod \
    --profile $PROFILE_NAME \
    --query "Stacks[0].Outputs[?OutputKey=='PhotoMetadataTableName'].OutputValue" \
    --output text 2>/dev/null)
CDN_DOMAIN=$(aws cloudformation describe-stacks \
    --stack-name LoubieDesignsInfrastructureStack-prod \
    --profile $PROFILE_NAME \
    --query "Stacks[0].Outputs[?OutputKey=='PhotoDistributionDomain'].OutputValue" \
    --output text \
    --no-cli-pager 2>/dev/null)

TABLE_NAME=$(aws cloudformation describe-stacks \
    --stack-name LoubieDesignsInfrastructureStack-prod \
    --profile $PROFILE_NAME \
    --query "Stacks[0].Outputs[?OutputKey=='PhotoMetadataTableName'].OutputValue" \
    --output text \
    --no-cli-pager 2>/dev/null)

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

# Step 3: Get Amplify App ID
APP_ID=$(aws amplify list-apps --query "apps[?name=='loubie_designs'].appId" --output text --no-cli-pager)

echo "📋 Amplify App ID: $APP_ID"

# Step 4: Update Amplify app environment variables
echo "4️⃣ Updating Amplify app environment variables..."
aws amplify update-app \
    --app-id $APP_ID \
    --environment-variables \
        VITE_AWS_REGION=us-west-2,VITE_PHOTO_CDN_DOMAIN=$CDN_DOMAIN,VITE_DYNAMO_TABLE_NAME=$TABLE_NAME \
    --profile $PROFILE_NAME \
    --no-cli-pager


echo ""
echo "🎉 The Amplify app environment variables have been successfully updated."