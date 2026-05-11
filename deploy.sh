#!/bin/bash
# deploy.sh - Local deployment script for Elder Fraud Protection
# Usage: ./deploy.sh <version-label>
#
# Prerequisites:
#   - AWS CLI configured with github_action user credentials
#   - Application already provisioned via Terraform

set -e

if [ -z "$1" ]; then
  echo "Usage: ./deploy.sh <version-label>"
  echo "Example: ./deploy.sh v1.0.0"
  exit 1
fi

VERSION_LABEL="$1"
APP_NAME="elder-fraud-protection"
ENV_NAME="elder-fraud-protection-env"
S3_BUCKET="jxzzzzz-elder-fraud-protection"
REGION="us-east-1"
ZIP_NAME="elder-fraud-deploy-${VERSION_LABEL}.zip"

echo "==> Packaging application..."
zip -r "${ZIP_NAME}" \
  backend/ \
  -x "backend/__pycache__/*" \
  -x "backend/tests/*" \
  -x "backend/example/*"

echo "==> Uploading to S3..."
aws s3 cp "${ZIP_NAME}" "s3://${S3_BUCKET}/"

echo "==> Creating application version..."
aws elasticbeanstalk create-application-version \
  --application-name "${APP_NAME}" \
  --source-bundle S3Bucket="${S3_BUCKET}",S3Key="${ZIP_NAME}" \
  --version-label "${VERSION_LABEL}" \
  --description "Manual deploy ${VERSION_LABEL}" \
  --region "${REGION}"

echo "==> Deploying to environment..."
aws elasticbeanstalk update-environment \
  --environment-name "${ENV_NAME}" \
  --version-label "${VERSION_LABEL}" \
  --region "${REGION}"

echo "==> Deployment initiated! Check AWS console for status."
echo "    Environment: ${ENV_NAME}"
echo "    Version: ${VERSION_LABEL}"
