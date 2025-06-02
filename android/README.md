# F1 Champions Android App

![Android](https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white)
![Kotlin](https://img.shields.io/badge/Kotlin-7F52FF?style=for-the-badge&logo=kotlin&logoColor=white)
![Jetpack Compose](https://img.shields.io/badge/Jetpack%20Compose-4285F4?style=for-the-badge&logo=jetpack-compose&logoColor=white)
![Material3](https://img.shields.io/badge/Material%203-1976D2?style=for-the-badge&logo=material-design&logoColor=white)

A modern Android application built with Jetpack Compose that provides users access to Formula 1 Champions and race winners data with offline-first capabilities.

## 🏗️ Architecture & Approach

### Clean Architecture
The application follows **Clean Architecture** principles with clear separation of concerns:

```
app/src/main/java/com/f1champions/app/
├── presentation/       # UI Layer (Compose, ViewModels)
│   ├── ui/            # Compose UI components
│   ├── viewmodel/     # ViewModels and UI state
│   └── navigation/    # Navigation logic
├── domain/            # Business Logic Layer
│   ├── model/         # Domain models
│   ├── repository/    # Repository interfaces
│   └── usecase/       # Use cases (business logic)
├── data/              # Data Layer
│   ├── api/           # Network layer (Retrofit)
│   ├── local/         # Local storage (Room)
│   ├── repository/    # Repository implementations
│   └── model/         # Data transfer objects
└── di/                # Dependency Injection (Hilt)
```

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
- **Window Size Classes**: Adaptive UI for different screen sizes

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

## 🏆 Best Practices Implemented

### 1. **Code Quality & Standards**
- **Kotlin Coding Conventions**: Official Kotlin style guide
- **Custom Lint Rules**: Project-specific code quality rules
- **Consistent Naming**: Clear and descriptive naming conventions
- **Code Documentation**: KDoc comments for public APIs

### 2. **UI/UX Best Practices**
- **Material 3 Design**: Modern Material Design principles
- **Accessibility**: Full accessibility support with content descriptions
- **Dark Mode**: Automatic dark/light theme support
- **Responsive Design**: Adaptive layouts for different screen sizes
- **Loading States**: Clear loading and error state handling

### 3. **Performance Optimization**
- **Lazy Loading**: Efficient list rendering with LazyColumn
- **Image Loading**: Optimized image handling (planned: Coil integration)
- **Memory Management**: Proper lifecycle management
- **Database Optimization**: Efficient Room queries with proper indexing

### 4. **Error Handling**
- **Graceful Degradation**: App continues working during network issues
- **User-Friendly Messages**: Clear error communication
- **Retry Mechanisms**: Smart retry logic for failed operations
- **Crash Prevention**: Comprehensive error boundaries

### 5. **Testing Strategy**
- **High Test Coverage**: Comprehensive unit and integration tests
- **Test-Driven Development**: Tests written alongside implementation
- **Mock External Dependencies**: Isolated unit testing
- **UI Testing**: Critical user flows covered by UI tests

### 6. **Security**
- **Network Security**: HTTPS-only communication
- **Data Validation**: Input validation and sanitization
- **ProGuard/R8**: Code obfuscation and optimization
- **Certificate Pinning**: Planned for production security

## 📱 Features

### Core Functionality
- ✅ **Champions List**: Browse F1 World Champions by season
- ✅ **Race Winners**: Detailed race winners for specific years
- ✅ **Offline Support**: Full functionality without internet connection
- ✅ **Network Awareness**: Automatic sync when connection is restored
- ✅ **Search & Filter**: Find specific champions or races (planned)

### User Experience
- ✅ **Material 3 Design**: Modern, consistent UI
- ✅ **Dark Mode**: Automatic theme switching
- ✅ **Loading States**: Smooth loading indicators
- ✅ **Error Handling**: User-friendly error messages
- ✅ **Pull-to-Refresh**: Manual data refresh capability

### Technical Features
- ✅ **Clean Architecture**: Maintainable and testable codebase
- ✅ **Dependency Injection**: Modular and testable components
- ✅ **Reactive Programming**: Real-time UI updates
- ✅ **Type Safety**: Compile-time error prevention
- ✅ **Performance Optimization**: Efficient data handling

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

# Run specific test class
./gradlew connectedAndroidTest -Pandroid.testInstrumentationRunnerArguments.class=com.f1champions.app.ExampleInstrumentedTest
```

#### UI Tests
```bash
# Run UI tests on connected device/emulator
./gradlew connectedDebugAndroidTest

# Run UI tests on specific device
adb devices  # List available devices
./gradlew connectedDebugAndroidTest -Pandroid.testInstrumentationRunnerArguments.class=com.f1champions.app.ui.ChampionsScreenTest
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
- **ViewModels**: State management and business logic
- **Use Cases**: Business rules and validation
- **Repositories**: Data access logic
- **Utilities**: Helper functions and extensions

#### 2. **Integration Tests** (`androidTest/`)
- **Database Tests**: Room database operations
- **Network Tests**: API integration testing
- **Repository Tests**: End-to-end data flow
- **UI Component Tests**: Individual Compose components

#### 3. **End-to-End Tests**
- **User Journeys**: Complete user workflows
- **Navigation Tests**: Screen-to-screen navigation
- **Offline Scenarios**: Network state changes
- **Error Scenarios**: Error handling and recovery

### Test Configuration

The project uses JaCoCo for comprehensive code coverage with custom exclusions:

```kotlin
// Coverage exclusions
def fileFilter = [
    // Android generated files
    '**/R.class', '**/R$*.class', '**/BuildConfig.*',
    // Hilt generated files
    '**/*Hilt*.*', '**/*_Impl.*',
    // Compose generated files
    '**/*ComposableSingletons*.*'
]
```

**Target Coverage**: 80% overall, 90% for critical business logic

## 🚀 Getting Started

### Prerequisites
- **Android Studio** Arctic Fox or later
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

### Development Setup

#### Build Variants
- **Debug**: Development build with debug symbols and logging
- **Release**: Production build with ProGuard/R8 optimization

#### Build Configuration
```kotlin
android {
    compileSdk = 36
    
    defaultConfig {
        minSdk = 27
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"
    }
    
    buildFeatures {
        compose = true
        buildConfig = true
    }
}
```

## 🔧 Configuration

### Build Configuration

#### Gradle Scripts
- **Project-level** (`build.gradle`): Global configuration and dependencies
- **App-level** (`app/build.gradle`): App-specific configuration
- **Gradle Properties** (`gradle.properties`): Build optimization settings

#### Key Configurations
```kotlin
// Compose Compiler
composeCompiler {
    enableStrongSkippingMode = true
    stabilityConfigurationFile = rootProject.layout.projectDirectory.file("stability_config.conf")
}

// Build Types
buildTypes {
    debug {
        buildConfigField("String", "BASE_URL", "\"http://10.0.2.2:3000\"")
        minifyEnabled = false
    }
    release {
        minifyEnabled = true
        proguardFiles(getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro')
    }
}
```

### Dependency Versions
Key dependency versions are managed in the project-level `build.gradle`:

```kotlin
ext {
    compose_bom_version = '2024.12.01'
    kotlin_version = '2.1.21'
    hilt_version = '2.54'
    retrofit_version = '2.11.0'
    room_version = '2.7.1'
    // ... other versions
}
```

## 📊 Performance Considerations

### UI Performance
- **Compose Optimization**: Strong skipping mode for efficient recomposition
- **Lazy Loading**: Efficient list rendering with LazyColumn/LazyRow
- **State Management**: Minimized recompositions with proper state hoisting
- **Memory Usage**: Proper lifecycle management and resource cleanup

### Network Performance
- **Caching**: HTTP response caching with OkHttp
- **Request Optimization**: Efficient API calls with proper pagination
- **Offline Strategy**: Smart data synchronization
- **Connection Pooling**: Optimized network connections

### Database Performance
- **Query Optimization**: Efficient Room queries with proper indexes
- **Transaction Management**: Batch operations for better performance
- **Data Pagination**: Efficient large dataset handling
- **Schema Migration**: Smooth database updates

## 🔒 Security

### Network Security
- **HTTPS Only**: All network communication over secure connections
- **Certificate Validation**: Proper SSL certificate validation
- **Request Validation**: Input sanitization and validation
- **API Security**: Secure API communication (planned: API key management)

### Data Security
- **Local Encryption**: Sensitive data encryption (planned)
- **Secure Storage**: Android Keystore integration (planned)
- **Data Minimization**: Only necessary data is stored locally
- **Privacy Compliance**: GDPR-ready data handling

### Code Security
- **ProGuard/R8**: Code obfuscation and optimization
- **Static Analysis**: Android Lint security checks
- **Dependency Scanning**: Regular security updates
- **Permissions**: Minimal permission requirements

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

### Offline-First Strategy
```
User Interaction → ViewModel → Use Case → Repository
                                              ↓
Local Database ← Data Sync ← Network Check ← API Service
      ↓
  Cache Layer → UI State → Compose UI
```

### State Management
- **StateFlow**: Reactive state management in ViewModels
- **Compose State**: Local UI state management
- **Navigation State**: Screen navigation state
- **Global State**: App-level state (network connectivity, themes)

## 📱 UI Components

### Material 3 Components
- **Navigation**: NavigationBar, TopAppBar
- **Content**: Cards, Lists, Buttons
- **Feedback**: Snackbars, Progress indicators
- **Input**: Search, Filters (planned)

### Custom Components
- **ChampionCard**: Display champion information
- **RaceWinnerItem**: Race winner list item
- **LoadingStates**: Custom loading indicators
- **ErrorStates**: User-friendly error displays

## 🧩 Modules & Dependencies

### Core Modules
- **:app**: Main application module
- **Domain Layer**: Business logic and models
- **Data Layer**: Network and local data sources
- **Presentation Layer**: UI components and ViewModels

### Key Dependencies
```kotlin
dependencies {
    // Compose BOM for version alignment
    implementation platform("androidx.compose:compose-bom:$compose_bom_version")
    
    // Core Android
    implementation "androidx.core:core-ktx:1.16.0"
    implementation "androidx.lifecycle:lifecycle-runtime-ktx:$lifecycle_version"
    
    // Compose UI
    implementation "androidx.compose.ui:ui"
    implementation "androidx.compose.material3:material3"
    implementation "androidx.compose.ui:ui-tooling-preview"
    
    // Architecture
    implementation "androidx.lifecycle:lifecycle-viewmodel-compose:$lifecycle_version"
    implementation "androidx.navigation:navigation-compose:$nav_version"
    
    // Dependency Injection
    implementation "com.google.dagger:hilt-android:$hilt_version"
    implementation "androidx.hilt:hilt-navigation-compose:1.2.0"
    
    // Networking
    implementation "com.squareup.retrofit2:retrofit:$retrofit_version"
    implementation "com.squareup.retrofit2:converter-moshi:$retrofit_version"
    implementation "com.squareup.okhttp3:okhttp:$okhttp_version"
    
    // Local Database
    implementation "androidx.room:room-runtime:$room_version"
    implementation "androidx.room:room-ktx:$room_version"
    
    // Coroutines
    implementation "org.jetbrains.kotlinx:kotlinx-coroutines-android:$coroutines_version"
}
```

## 🚧 Future Enhancements

### Planned Features
- [ ] **Search & Filter**: Advanced search capabilities
- [ ] **Favorites**: Save favorite champions and races
- [ ] **Notifications**: Updates for new F1 data
- [ ] **Statistics**: Advanced F1 statistics and charts
- [ ] **Social Features**: Share favorite champions/races
- [ ] **Widgets**: Home screen widgets for quick access

### Technical Improvements
- [ ] **Image Loading**: Coil integration for champion photos
- [ ] **Animations**: Smooth transitions and micro-interactions
- [ ] **Accessibility**: Enhanced accessibility features
- [ ] **Performance**: Further UI performance optimizations
- [ ] **Testing**: Additional UI test coverage
- [ ] **Security**: Enhanced security features

### Architecture Evolution
- [ ] **Modularization**: Multi-module architecture
- [ ] **Pagination**: Efficient large dataset handling
- [ ] **Real-time Updates**: Live data synchronization
- [ ] **Background Sync**: Periodic data updates
- [ ] **Analytics**: User behavior tracking
- [ ] **Crash Reporting**: Production crash monitoring

## 🤝 Contributing

### Development Guidelines
1. **Code Style**: Follow Kotlin coding conventions
2. **Testing**: Write tests for new features
3. **Documentation**: Update documentation for changes
4. **Pull Requests**: Create detailed PR descriptions

### Code Review Checklist
- [ ] Code follows project conventions
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] Performance impact considered
- [ ] Accessibility guidelines followed

### Development Workflow
1. Create feature branch from `main`
2. Implement feature with tests
3. Run quality checks locally
4. Create pull request
5. Address review feedback
6. Merge after approval

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/thk-hex/f1-app/issues)
- **Documentation**: Check this README and inline code documentation
- **Android Documentation**: [Official Android Docs](https://developer.android.com/docs)

---

**Built with 🏎️ for Formula 1 fans using modern Android development practices**
