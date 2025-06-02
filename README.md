# F1 Champions Full Stack Application

![F1 Logo](https://img.shields.io/badge/F1-Champions-red?style=for-the-badge&logo=formula-1)
[![Backend](https://img.shields.io/badge/Backend-NestJS-E0234E?style=flat&logo=nestjs)](./backend/README.md)
[![Android](https://img.shields.io/badge/Android-Kotlin-A4C639?style=flat&logo=android)](./android/README.md)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker)](./infrastructure/docker-compose.yml)

A comprehensive full-stack application for exploring Formula 1 Champions and race winners data. This project demonstrates modern development practices with a NestJS backend, native Android app, and containerized infrastructure.

## 🏎️ Project Overview

The F1 Champions application provides users with easy access to Formula 1 historical data, including:

- **Champions Data**: Complete list of F1 World Champions by season
- **Race Winners**: Detailed race winners information for any specific year
- **Real-time Updates**: Automated data synchronization with external F1 data sources
- **Offline Support**: Cached data for seamless offline experience

## 🏗️ Architecture

This project follows modern full-stack architecture principles:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Android App   │───▶│   Backend API   │───▶│   External API  │
│    (Kotlin)     │    │    (NestJS)     │    │    (Ergast)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                       ┌──────┴──────┐
                       │  PostgreSQL │
                       │   + Redis   │
                       └─────────────┘
```

## 📱 Components

### [Backend API](./backend/README.md)
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis for performance optimization
- **API Documentation**: OpenAPI/Swagger
- **Automated Updates**: Scheduled data synchronization
- **Containerization**: Docker support

### [Android Application](./android/README.md)
- **Language**: Kotlin with Jetpack Compose
- **Architecture**: Clean Architecture with MVVM
- **Dependency Injection**: Hilt/Dagger
- **Networking**: Retrofit + OkHttp
- **Local Storage**: Room Database
- **Testing**: Comprehensive unit and integration tests

### Infrastructure
- **Containerization**: Docker Compose setup
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Development Tools**: pgAdmin for database management

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone git@github.com:thk-hex/f1-app.git

# Navigate to infrastructure directory
cd f1-app/infrastructure

# Start all services
docker-compose up
```

This will start:
- Backend API at `http://localhost:3000`
- PostgreSQL database at `localhost:5432`
- Redis cache at `localhost:6379`
- pgAdmin at `http://localhost:5050`

### Manual Setup

1. **Backend Setup**
   ```bash
   cd backend
   npm install
   npm run prisma:migrate
   npm run db:seed
   npm run start:dev
   ```

2. **Android Setup**
   ```bash
   cd android
   ./gradlew build
   ./gradlew installDebug
   ```

For detailed setup instructions, see the individual component README files.

## 📖 API Documentation

Once the backend is running, you can access:

- **Swagger UI**: http://localhost:3000/api
- **OpenAPI YAML**: http://localhost:3000/api-yaml
- **OpenAPI JSON**: http://localhost:3000/api-json

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm run test          # Unit tests
npm run test:cov      # Coverage report
```

### Android Tests
```bash
cd android
./gradlew test                    # Unit tests
./gradlew connectedAndroidTest   # Integration tests
./gradlew jacocoTestReport       # Coverage report
```

## 🛠️ Development

### Prerequisites
- **Node.js** 18+ (for backend)
- **Android Studio** with Kotlin support
- **Docker** and Docker Compose
- **PostgreSQL** 15+ (if not using Docker)
- **Redis** 7+ (if not using Docker)

### Environment Setup
1. Copy environment files:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Configure your environment variables:
   - `DATABASE_URL`: PostgreSQL connection string
   - `BASE_URL`: Ergast F1 API base URL
   - `GP_START_YEAR`: Starting year for F1 data (optional)

### Code Quality
- **Backend**: ESLint + Prettier for code formatting
- **Android**: Kotlin coding conventions with custom lint rules
- **Git Hooks**: Pre-commit hooks for code quality

## 🗂️ Project Structure

```
f1-app/
├── android/           # Android Kotlin application
├── backend/           # NestJS API server
├── infrastructure/    # Docker Compose configuration
├── .github/          # GitHub workflows and templates
└── README.md         # This file
```

## 🔄 Data Flow

1. **External Data**: Fetches from Ergast F1 API
2. **Backend Processing**: Validates, transforms, and stores data
3. **Caching**: Redis for frequently accessed data
4. **API Endpoints**: RESTful APIs with OpenAPI documentation
5. **Android Client**: Consumes APIs with offline-first approach
6. **Local Storage**: Room database for offline capabilities

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow established coding conventions
- Write comprehensive tests
- Update documentation
- Ensure all CI checks pass

## 📋 Features

- ✅ **Champions Data Management**: Complete F1 champions history
- ✅ **Race Winners Tracking**: Detailed race results by year
- ✅ **Automated Data Sync**: Weekly updates from external sources
- ✅ **Caching Strategy**: Multi-layer caching for performance
- ✅ **Offline Support**: Local data storage for seamless UX
- ✅ **Network Connectivity**: Smart offline/online state management
- ✅ **Error Handling**: Comprehensive error handling and recovery
- ✅ **API Documentation**: Complete OpenAPI/Swagger documentation
- ✅ **Testing Coverage**: Unit and integration tests
- ✅ **CI/CD Ready**: GitHub Actions workflow support

## 🚧 Roadmap

- [ ] **Web Frontend**: React/Vue.js web application
- [ ] **Real-time Updates**: WebSocket support for live data
- [ ] **Analytics Dashboard**: Admin dashboard for data insights
- [ ] **Mobile Notifications**: Push notifications for race updates
- [ ] **User Authentication**: User accounts and preferences
- [ ] **Social Features**: Comments and community features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check component-specific README files
- **Issues**: [GitHub Issues](https://github.com/thk-hex/f1-app/issues)
- **API Docs**: Available at `/api` endpoint when backend is running

## 🙏 Acknowledgments

- **Ergast F1 API**: For providing comprehensive F1 data
- **NestJS Team**: For the excellent Node.js framework
- **Android Jetpack**: For modern Android development tools
- **Open Source Community**: For the amazing libraries and tools

---

**Built with ❤️ for Formula 1 enthusiasts**
