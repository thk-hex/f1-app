# Branch Protection Setup Guide

This guide explains how to set up branch protection rules to ensure PRs cannot be merged until CI/CD pipelines succeed.

## 🛡️ Overview

With the updated CI/CD configuration:
- **Both pipelines run on ANY PR** (regardless of which files changed)
- **Path-based triggers remain for push events** (only relevant pipeline runs)
- **Branch protection blocks merging** until all required checks pass

## 🔧 Setting Up Branch Protection Rules

### Method 1: GitHub Web Interface

1. **Navigate to Repository Settings**
   - Go to your repository on GitHub
   - Click `Settings` tab
   - Select `Branches` from the left sidebar

2. **Add Branch Protection Rule**
   - Click `Add rule` button
   - Enter branch name pattern: `main` (repeat for `develop`)

3. **Configure Protection Settings**
   Check the following options:

   ✅ **Require a pull request before merging**
   - Require approvals: `1` (or your preferred number)
   - Dismiss stale PR approvals when new commits are pushed
   - Require review from code owners (if you have CODEOWNERS file)

   ✅ **Require status checks to pass before merging**
   - Require branches to be up to date before merging
   - **Required status checks** (add these):
     - `Run Tests` (Android pipeline test job)
     - `Build APK` (Android pipeline build job)  
     - `Run Instrumented Tests` (Android pipeline instrumented-test job)
     - `Run Tests` (Backend pipeline test job)
     - `Build Application` (Backend pipeline build job)
     - `Build Docker Image` (Backend pipeline docker-build job)
     - `Security Scan` (Backend pipeline security-scan job)

   ✅ **Require conversation resolution before merging**

   ✅ **Restrict pushes that create files exceeding 100MB**

   ✅ **Do not allow bypassing the above settings**
   - Include administrators (recommended for consistency)

4. **Save the Rule**
   - Click `Create` to save the branch protection rule

### Method 2: GitHub CLI (gh)

```bash
# Install GitHub CLI if not already installed
# https://cli.github.com/

# Authenticate
gh auth login

# Set branch protection for main branch
gh api repos/:owner/:repo/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"checks":[
    {"context":"Run Tests","app_id":15368},
    {"context":"Build APK","app_id":15368},
    {"context":"Run Instrumented Tests","app_id":15368},
    {"context":"Build Application","app_id":15368},
    {"context":"Build Docker Image","app_id":15368},
    {"context":"Security Scan","app_id":15368}
  ]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null

# Repeat for develop branch
gh api repos/:owner/:repo/branches/develop/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"checks":[
    {"context":"Run Tests","app_id":15368},
    {"context":"Build APK","app_id":15368},
    {"context":"Run Instrumented Tests","app_id":15368},
    {"context":"Build Application","app_id":15368},
    {"context":"Build Docker Image","app_id":15368},
    {"context":"Security Scan","app_id":15368}
  ]}' \
  --field enforce_admins=true \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  --field restrictions=null
```

### Method 3: Terraform Configuration

```hcl
resource "github_branch_protection" "main" {
  repository_id = "your-repo-name"
  pattern       = "main"

  required_status_checks {
    strict = true
    contexts = [
      "Run Tests",           # Android
      "Build APK",          # Android  
      "Run Instrumented Tests", # Android
      "Run Tests",          # Backend (will show as "Run Tests / backend")
      "Build Application",  # Backend
      "Build Docker Image", # Backend
      "Security Scan"       # Backend
    ]
  }

  required_pull_request_reviews {
    required_approving_review_count = 1
    dismiss_stale_reviews          = true
    require_code_owner_reviews     = true
  }

  enforce_admins = true
}

resource "github_branch_protection" "develop" {
  repository_id = "your-repo-name"
  pattern       = "develop"

  required_status_checks {
    strict = true
    contexts = [
      "Run Tests",           # Android
      "Build APK",          # Android  
      "Run Instrumented Tests", # Android
      "Run Tests",          # Backend
      "Build Application",  # Backend
      "Build Docker Image", # Backend
      "Security Scan"       # Backend
    ]
  }

  required_pull_request_reviews {
    required_approving_review_count = 1
    dismiss_stale_reviews          = true
    require_code_owner_reviews     = true
  }

  enforce_admins = true
}
```

## 📋 Required Status Check Names

The exact names of status checks that will appear in GitHub:

### Android Pipeline Jobs
- `Run Tests` - Android unit tests and linting
- `Build APK` - Android application build
- `Run Instrumented Tests` - Android emulator tests

### Backend Pipeline Jobs  
- `Run Tests` - Backend tests, linting, and coverage
- `Build Application` - Backend build process
- `Build Docker Image` - Docker containerization
- `Security Scan` - Security vulnerability scanning

## 🔍 Finding Status Check Names

If you're unsure about the exact status check names:

1. **Create a test PR** with some changes
2. **Wait for pipelines to run**
3. **Check the PR page** - scroll down to see the status checks
4. **Copy the exact names** to use in branch protection settings

Alternatively, check the Actions tab after a pipeline run to see the job names.

## 🚨 Important Notes

### Pipeline Behavior Changes
- **PR Creation**: Both Android and Backend pipelines now run on ANY PR
- **Push Events**: Only relevant pipeline runs (based on changed files)
- **Performance**: PR checks may take longer but provide comprehensive validation

### Recommended Settings
- **Require branches to be up to date**: Ensures latest changes don't break integration
- **Dismiss stale reviews**: Forces re-approval after new commits
- **Include administrators**: Maintains consistency across all users

### Troubleshooting
- **Missing status checks**: Wait for pipelines to run at least once to populate the list
- **Check names mismatch**: Verify exact job names in GitHub Actions tab
- **Admin bypass**: Ensure "Include administrators" is checked if you want strict enforcement

## 🎯 Expected Workflow

1. **Developer creates PR**
2. **Both pipelines automatically trigger**
3. **All jobs must pass**:
   - Android: Tests → Build → Instrumented Tests
   - Backend: Tests → (Build + Docker + Security in parallel)
4. **PR review required** (1+ approvals)
5. **Merge button enabled** only after all checks pass

## 📊 Monitoring

You can monitor the effectiveness of branch protection through:
- **Insights → Pulse**: See PR and merge activity
- **Insights → Contributors**: Track contribution patterns  
- **Actions tab**: Monitor pipeline success rates
- **Security tab**: Review security scan results

This setup ensures code quality and prevents broken code from reaching your main branches while maintaining development velocity. 