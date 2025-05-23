#!/bin/bash

# Branch Protection Setup Script
# Automates the setup of branch protection rules for CI/CD enforcement

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🛡️  Setting up Branch Protection Rules${NC}"
echo "This script will configure branch protection for main and develop branches"
echo ""

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed${NC}"
    echo "Please install it from: https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not authenticated with GitHub CLI${NC}"
    echo "Please run: gh auth login"
    exit 1
fi

# Get repository information
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
if [ -z "$REPO" ]; then
    echo -e "${RED}❌ Could not determine repository${NC}"
    echo "Please run this script from within a GitHub repository"
    exit 1
fi

echo -e "${GREEN}📋 Repository: $REPO${NC}"

# Define the required status checks
STATUS_CHECKS='[
  "Run Tests",
  "Build APK", 
  "Run Instrumented Tests",
  "Build Application",
  "Build Docker Image",
  "Security Scan"
]'

# Function to set up branch protection
setup_branch_protection() {
    local branch=$1
    echo -e "\n${YELLOW}🔧 Setting up protection for '$branch' branch...${NC}"
    
    # Create the protection rule
    gh api "repos/$REPO/branches/$branch/protection" \
        --method PUT \
        --field required_status_checks="{
            \"strict\": true,
            \"contexts\": $STATUS_CHECKS
        }" \
        --field enforce_admins=true \
        --field required_pull_request_reviews="{
            \"required_approving_review_count\": 1,
            \"dismiss_stale_reviews\": true,
            \"require_code_owner_reviews\": false
        }" \
        --field restrictions=null \
        --silent

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Branch protection set up for '$branch'${NC}"
    else
        echo -e "${RED}❌ Failed to set up protection for '$branch'${NC}"
        return 1
    fi
}

# Ask for confirmation
echo -e "\n${YELLOW}This will set up the following protections:${NC}"
echo "• Require PR reviews (1 approval minimum)"
echo "• Require all CI checks to pass:"
echo "  - Run Tests (Android & Backend)"
echo "  - Build APK (Android)"
echo "  - Run Instrumented Tests (Android)"
echo "  - Build Application (Backend)"
echo "  - Build Docker Image (Backend)"
echo "  - Security Scan (Backend)"
echo "• Dismiss stale reviews on new commits"
echo "• Enforce rules for administrators"
echo ""

read -p "Do you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⏹️  Setup cancelled${NC}"
    exit 0
fi

# Set up protection for main branch
setup_branch_protection "main"

# Set up protection for develop branch
setup_branch_protection "develop"

echo -e "\n${GREEN}🎉 Branch protection setup complete!${NC}"
echo -e "\n${BLUE}📋 Next Steps:${NC}"
echo "1. Create a test PR to verify the pipelines run"
echo "2. Check that all required status checks appear"
echo "3. Verify that merge is blocked until all checks pass"
echo "4. Adjust settings in GitHub web UI if needed"

echo -e "\n${YELLOW}💡 Notes:${NC}"
echo "• Status check names must match exactly with job names"
echo "• You may need to run pipelines once for checks to appear"
echo "• Settings can be modified later in GitHub repo settings"
echo "• See .github/BRANCH_PROTECTION_SETUP.md for more details" 