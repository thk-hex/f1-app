# F1 Champions Android App

![Android](https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white)
![Kotlin](https://img.shields.io/badge/Kotlin-7F52FF?style=for-the-badge&logo=kotlin&logoColor=white)
![Jetpack Compose](https://img.shields.io/badge/Jetpack%20Compose-4285F4?style=for-the-badge&logo=jetpack-compose&logoColor=white)
![Material3](https://img.shields.io/badge/Material%203-1976D2?style=for-the-badge&logo=material-design&logoColor=white)

A modern Android application built with Jetpack Compose that provides users access to Formula 1 Champions and race winners data with offline-first capabilities.

## 🏗️ Architecture & Approach

### Clean Architecture
The application follows **Clean Architecture** principles with clear separation of concerns:

### Design Patterns & Principles

#### 1. **MVVM Pattern**
- **Model**: Domain models and data sources
- **View**: Jetpack Compose UI components
- **ViewModel**: UI state management and business logic orchestration

#### 2. **Repository Pattern**
- Abstracts data sources (network, local database)
- Provides single source of truth for data
- Handles offline-first data synchronization

#### 3. **Use Case Pattern**
- Encapsulates single business actions
- Promotes reusability and testability
- Clear separation of business logic

#### 4. **Dependency Injection**
- Hilt for compile-time dependency injection
- Loose coupling and better testability
- Modular architecture support

### Key Architectural Decisions

#### 1. **Offline-First Architecture**
- **Local Database**: Room for persistent data storage
- **Network Connectivity**: Smart offline/online state management
- **Data Synchronization**: Automatic sync when connection is restored
- **User Experience**: Seamless experience regardless of network state

#### 2. **Reactive Programming**
- **Kotlin Coroutines**: Asynchronous operations and threading
- **Flow**: Reactive data streams for UI updates
- **StateFlow**: State management for ViewModels
- **Lifecycle-aware**: Automatic lifecycle management

#### 3. **Modern Android Development**
- **Jetpack Compose**: Declarative UI framework
- **Material 3**: Latest Material Design system
- **Navigation Component**: Type-safe navigation

## 🛠️ Technologies & Libraries

### UI Framework
- **[Jetpack Compose](https://developer.android.com/jetpack/compose)**: Modern declarative UI toolkit
- **[Material 3](https://m3.material.io/)**: Latest Material Design components
- **[Navigation Compose](https://developer.android.com/jetpack/compose/navigation)**: Type-safe navigation
- **[Window Size Classes](https://developer.android.com/guide/topics/large-screens/support-different-screen-sizes)**: Responsive design support

### Architecture Components
- **[ViewModel](https://developer.android.com/topic/libraries/architecture/viewmodel)**: UI-related data management
- **[Lifecycle](https://developer.android.com/topic/libraries/architecture/lifecycle)**: Lifecycle-aware components
- **[Room](https://developer.android.com/training/data-storage/room)**: Local database abstraction layer
- **[Hilt](https://dagger.dev/hilt/)**: Dependency injection framework

### Networking & Data
- **[Retrofit](https://square.github.io/retrofit/)**: Type-safe HTTP client
- **[OkHttp](https://square.github.io/okhttp/)**: HTTP client with interceptors
- **[Moshi](https://github.com/square/moshi)**: JSON parsing library
- **[Kotlin Coroutines](https://kotlinlang.org/docs/coroutines-overview.html)**: Asynchronous programming

### Development & Quality
- **[Kotlin](https://kotlinlang.org/)**: Modern programming language
- **[KSP](https://github.com/google/ksp)**: Kotlin Symbol Processing
- **[JaCoCo](https://www.jacoco.org/)**: Code coverage analysis
- **[Android Lint](https://developer.android.com/studio/write/lint)**: Static code analysis

### Testing Framework
- **[JUnit 4](https://junit.org/junit4/)**: Unit testing framework
- **[MockK](https://mockk.io/)**: Mocking library for Kotlin
- **[Turbine](https://github.com/cashapp/turbine)**: Testing utilities for Flow
- **[Truth](https://truth.dev/)**: Fluent assertion library
- **[Espresso](https://developer.android.com/training/testing/espresso)**: UI testing framework

## 📱 Features

### Core Functionality
- ✅ **Champions List**: Browse F1 World Champions by season
- ✅ **Race Winners**: Detailed race winners for specific years
- ✅ **Offline Support**: Full functionality without internet connection
- ✅ **Network Awareness**: Automatic sync when connection is restored

### User Experience
- ✅ **Material 3 Design**: Modern, consistent UI
- ✅ **Dark Mode**: Automatic theme switching

### Technical Features
- ✅ **Clean Architecture**: Maintainable and testable codebase
- ✅ **Dependency Injection**: Modular and testable components
- ✅ **Reactive Programming**: Real-time UI updates
- ✅ **Type Safety**: Compile-time error prevention

## 🧪 Testing

### Running Tests

#### Unit Tests
```bash
# Run all unit tests
./gradlew test

# Run unit tests for debug variant
./gradlew testDebugUnitTest

# Run tests with coverage
./gradlew jacocoTestReport
```

#### Integration Tests
```bash
# Run all instrumented tests
./gradlew connectedAndroidTest

#### UI Tests
```bash
# Run UI tests on connected device/emulator
./gradlew connectedDebugAndroidTest

```

### Test Coverage
```bash
# Generate coverage report
./gradlew jacocoTestReport

# View coverage report
open app/build/reports/jacoco/jacocoTestReport/html/index.html
```

### Testing Architecture

#### 1. **Unit Tests** (`test/`)

#### 2. **Integration Tests** (`androidTest/`)

## 🚀 Getting Started

### Prerequisites
- **Android Studio** Meerkat
- **JDK 17** or later
- **Android SDK** API level 27+ (minimum), API level 36 (target)
- **Kotlin** 2.1.21

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone git@github.com:thk-hex/f1-app.git
   cd f1-app/android
   ```

2. **Open in Android Studio**
   - Launch Android Studio
   - Select "Open an existing project"
   - Navigate to the `android` directory

3. **Build the project**
   ```bash
   ./gradlew build
   ```

4. **Run on device/emulator**
   ```bash
   ./gradlew installDebug
   ```


## 🚀 Build & Deployment

### Local Development
```bash
# Debug build
./gradlew assembleDebug

# Release build
./gradlew assembleRelease

# Install on connected device
./gradlew installDebug
```

### Code Quality Checks
```bash
# Run lint checks
./gradlew lint

# Run all checks
./gradlew check

# Format code
./gradlew ktlintFormat
```

### Build Optimization
- **R8 Optimization**: Aggressive code shrinking and optimization
- **ProGuard Rules**: Custom rules for library compatibility
- **Build Cache**: Gradle build cache for faster builds
- **Parallel Execution**: Multi-module parallel builds

### Continuous Integration
- **GitHub Actions**: Automated build and test pipeline
- **Quality Gates**: Automated code quality checks
- **Test Reports**: Automated test result reporting
- **APK Generation**: Automated APK builds for releases

## 🔄 Data Flow

```
User Interaction → ViewModel → Use Case → Repository
                                              ↓
Local Database ← Data Sync ← Network Check ← API Service
      ↓
  Cache Layer → UI State → Compose UI
```
