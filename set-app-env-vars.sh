#!/bin/bash
# set-app-env-vars.sh

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

# Function to fetch stack outputs
get_stack_outputs() {
  local STACK_NAME=$1
  local CDN_DOMAIN=$(aws cloudformation describe-stacks \
      --stack-name $STACK_NAME \
      --profile $PROFILE_NAME \
      --query "Stacks[0].Outputs[?OutputKey=='PhotoDistributionDomain'].OutputValue" \
      --output text 2>/dev/null)

  local TABLE_NAME=$(aws cloudformation describe-stacks \
      --stack-name $STACK_NAME \
      --profile $PROFILE_NAME \
      --query "Stacks[0].Outputs[?OutputKey=='PhotoMetadataTableName'].OutputValue" \
      --output text 2>/dev/null)

  if [ -z "$CDN_DOMAIN" ] || [ "$CDN_DOMAIN" = "None" ]; then
      CDN_DOMAIN="your-cloudfront-domain.cloudfront.net"
  fi

  if [ -z "$TABLE_NAME" ] || [ "$TABLE_NAME" = "None" ]; then
      TABLE_NAME="your-dynamodb-table-name"
  fi

  echo "$CDN_DOMAIN|$TABLE_NAME"
}

# Step 2: Get stack outputs for both stage and prod
echo "3️⃣ Getting CDK stack outputs..."

PROD_OUTPUTS=$(get_stack_outputs "LoubieDesignsInfrastructureStack-prod")
STAGE_OUTPUTS=$(get_stack_outputs "LoubieDesignsInfrastructureStack-stage")

PROD_CDN_DOMAIN=$(echo $PROD_OUTPUTS | cut -d'|' -f1)
PROD_TABLE_NAME=$(echo $PROD_OUTPUTS | cut -d'|' -f2)

STAGE_CDN_DOMAIN=$(echo $STAGE_OUTPUTS | cut -d'|' -f1)
STAGE_TABLE_NAME=$(echo $STAGE_OUTPUTS | cut -d'|' -f2)

echo "📋 Prod Stack:"
echo "   - CDN Domain: $PROD_CDN_DOMAIN"
echo "   - Table Name: $PROD_TABLE_NAME"
echo ""
echo "📋 Stage Stack:"
echo "   - CDN Domain: $STAGE_CDN_DOMAIN"
echo "   - Table Name: $STAGE_TABLE_NAME"
echo ""

# Step 3: Get Amplify App ID
APP_ID=$(aws amplify list-apps --query "apps[?name=='loubie_designs'].appId" --output text --no-cli-pager --profile $PROFILE_NAME)

echo "📋 Amplify App ID: $APP_ID"

# Step 4: Update Amplify branch environment variables
echo "4️⃣ Updating Amplify branch environment variables..."

# Prod branch
aws amplify update-branch \
    --app-id $APP_ID \
    --branch-name prod \
    --environment-variables \
        VITE_AWS_REGION=us-west-2,VITE_PHOTO_CDN_DOMAIN=$PROD_CDN_DOMAIN,VITE_DYNAMO_TABLE_NAME=$PROD_TABLE_NAME \
    --profile $PROFILE_NAME \
    --no-cli-pager

# Stage branch
aws amplify update-branch \
    --app-id $APP_ID \
    --branch-name stage \
    --environment-variables \
        VITE_AWS_REGION=us-west-2,VITE_PHOTO_CDN_DOMAIN=$STAGE_CDN_DOMAIN,VITE_DYNAMO_TABLE_NAME=$STAGE_TABLE_NAME \
    --profile $PROFILE_NAME \
    --no-cli-pager

echo ""
echo "🎉 The Amplify branch environment variables have been successfully updated for both stage and prod."
