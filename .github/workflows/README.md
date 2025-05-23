# CI/CD Pipelines Documentation

This repository contains two comprehensive CI/CD pipelines for the F1 Champions project:

## 🏗️ Pipeline Overview

### Android Pipeline (`android.yml`)
- **Triggers**: Changes to `android/**` directory and the workflow file itself
- **Jobs**: `test`, `build`, `instrumented-test`
- **Platform**: Ubuntu Latest with Android SDK

### Backend Pipeline (`backend.yml`)
- **Triggers**: Changes to `backend/**` directory and the workflow file itself  
- **Jobs**: `test`, `build`, `docker-build`, `security-scan`
- **Platform**: Ubuntu Latest with Node.js 20

## 📱 Android Pipeline Details

### Prerequisites
- **JDK**: 17 (Temurin distribution)
- **Android SDK**: Latest via `android-actions/setup-android`
- **Build Tool**: Gradle with wrapper

### Jobs Breakdown

#### 1. Test Job
- **Purpose**: Runs linting, unit tests, and generates reports
- **Steps**:
  - Setup Java and Android SDK
  - Cache Gradle dependencies
  - Run `./gradlew lint`
  - Run `./gradlew test --continue`
  - Generate Jacoco test reports
  - Upload test artifacts

#### 2. Build Job
- **Purpose**: Builds the Android APK
- **Dependencies**: Requires `test` job to pass
- **Steps**:
  - Setup environment
  - Build debug APK with `./gradlew assembleDebug`
  - Upload APK artifacts

#### 3. Instrumented Test Job
- **Purpose**: Runs Android instrumented tests on emulator
- **Dependencies**: Requires `test` job to pass
- **Features**:
  - KVM acceleration for emulator performance
  - AVD caching for faster subsequent runs
  - API level 34 with Google APIs
  - Headless emulator execution

### Caching Strategy
- **Gradle Dependencies**: `~/.gradle/caches`, `~/.gradle/wrapper`, `android/.gradle`
- **AVD Images**: Android Virtual Device snapshots for faster emulator startup

## 🖥️ Backend Pipeline Details

### Prerequisites
- **Node.js**: 20.x
- **Database**: PostgreSQL 15 (test container)
- **Package Manager**: npm

### Environment Variables
- `NODE_VERSION`: '20'
- `DATABASE_URL`: Test PostgreSQL connection string

### Jobs Breakdown

#### 1. Test Job
- **Purpose**: Runs linting, unit tests, and e2e tests
- **Services**: PostgreSQL 15 container
- **Steps**:
  - Setup Node.js with npm caching
  - Install dependencies with `npm ci`
  - Generate Prisma client
  - Run database migrations
  - Execute linting (`npm run lint`)
  - Run unit tests (`npm run test`)
  - Generate coverage reports (`npm run test:cov`)
  - Run e2e tests (`npm run test:e2e`)
  - Upload coverage and test artifacts

#### 2. Build Job
- **Purpose**: Builds the NestJS application
- **Dependencies**: Requires `test` job to pass
- **Steps**:
  - Setup environment
  - Install dependencies
  - Generate Prisma client
  - Build application (`npm run build`)
  - Upload build artifacts

#### 3. Docker Build Job
- **Purpose**: Builds and pushes Docker images
- **Dependencies**: Requires `test` job to pass
- **Features**:
  - Multi-platform builds (linux/amd64, linux/arm64)
  - GitHub Container Registry integration
  - Automatic tagging strategy
  - Build cache optimization
  - Only pushes on non-PR events

#### 4. Security Scan Job
- **Purpose**: Performs security analysis
- **Dependencies**: Requires `test` job to pass
- **Tools**:
  - npm audit for dependency vulnerabilities
  - Trivy scanner for filesystem vulnerabilities
  - SARIF report upload to GitHub Security tab

### Caching Strategy
- **Node Modules**: npm cache based on `package-lock.json`
- **Docker Layers**: GitHub Actions cache for build optimization

## 🎯 Key Features

### Failure Handling
- **Test Failures**: Builds are rejected if any tests fail
- **Continue on Error**: Some steps use `--continue` to gather all test results
- **Always Upload**: Test artifacts uploaded even on failure for debugging

### Artifact Management
- **Android**: APK files, test reports, lint results, instrumented test results
- **Backend**: Build output, coverage reports, test results, Docker images

### Security & Best Practices
- **Dependency Caching**: Reduces build times significantly
- **Parallel Execution**: Jobs run in parallel where possible
- **Path-based Triggers**: Only runs when relevant files change
- **Multi-architecture Support**: Backend Docker images support both AMD64 and ARM64
- **Security Scanning**: Automated vulnerability detection

## 🚀 Usage

### Triggering Pipelines
Pipelines automatically trigger on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Only when files in respective project directories change

### Manual Workflow Dispatch
You can manually trigger workflows from the GitHub Actions tab if needed.

### Viewing Results
- **Test Results**: Available in the Actions tab and as downloadable artifacts
- **Coverage Reports**: Uploaded as artifacts for analysis
- **Security Scans**: Results appear in the Security tab (for Trivy scans)

## 🔧 Configuration

### Android Configuration
- Modify `android.yml` for different API levels or test configurations
- Update `android/app/build.gradle` for build variants

### Backend Configuration
- Modify `backend.yml` for different Node.js versions or test databases
- Update `backend/package.json` for different npm scripts

### Environment Variables
Set repository secrets for:
- `GITHUB_TOKEN`: Automatically provided by GitHub
- Additional secrets as needed for external services

## 📊 Monitoring

Both pipelines provide comprehensive monitoring through:
- Build status badges (can be added to README)
- Detailed job logs
- Test result artifacts
- Coverage reports
- Security scan results

The pipelines are designed to provide fast feedback while maintaining thorough testing and security standards. 