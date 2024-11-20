# FXQL Parser

[![NestJS](https://img.shields.io/badge/NestJS-10.0.0-red.svg)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.0-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-20.10.0-blue.svg)](https://www.docker.com/)
[![Tests](https://img.shields.io/badge/Tests-Passing-green.svg)](https://github.com/Dayo-Adewuyi/fxql-parser/actions)

Foreign Exchange Query Language (FXQL) parser built with NestJS and TypeScript. This solution provides an API for parsing and validating FXQL statements.

## 🚀 Key Features

- **Advanced FXQL Parsing**: Custom-built parser with precise error reporting including line numbers and character positions
- **Real-time Validation**: Validation pipeline with custom decorators and pipes
- **High Performance**: Optimized database operations with connection pooling and query caching
- **Security**: Rate limiting, input sanitization, and comprehensive error handling
- **Extensive Testing**: Unit, integration, and E2E tests.
- **Developer Experience**: Swagger documentation, Docker support, and detailed logging


## 🏗️ Architecture

The application follows Clean Architecture principles with a domain-driven design:

```
src/
├── common/          # Cross-cutting concerns
├── config/          # Configuration management
├── core/           # Domain entities and business logic
├── modules/        # Feature modules (FXQL parsing)
└── database/       # Database migrations and seeds
```

### Key Design Patterns
- Repository Pattern for data access
- Decorator Pattern for validation
- Strategy Pattern for parsing
- Factory Pattern for entity creation


## 🛠️ Technical Stack

- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL 15.x
- **Testing**: Jest + Supertest
- **Documentation**: Swagger/OpenAPI
- **Container**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Logging**: Winston 

## 🚦 Getting Started

### Prerequisites

- Node.js 18.x or higher
- Docker and Docker Compose
- PostgreSQL 15.x (if running locally)

### Local Development Setup

```bash
# Install dependencies
npm install

# Run database migrations
npm run migration:run

# Start development server
npm run start:dev
```


### Quick Start with Docker

```bash
curl -O https://raw.githubusercontent.com/yourusername/fxql-parser/main/setup.sh
chmod +x setup.sh
./setup.sh
```

The application will be available at `http://localhost:3000`


## 🔍 API Documentation

Full API documentation is available at `/api/docs` when the server is running. Here's a quick example:

```bash
curl -X POST http://localhost:3000/api/fxql-statements \
  -H "Content-Type: application/json" \
  -d '{
    "FXQL": "USD-GBP {\n BUY 0.85\n SELL 0.90\n CAP 10000\n}"
  }'
```

## ⚡ Performance Optimizations

- Connection pooling for database operations
- Query result caching
- Rate limiting with Redis
- Response compression
- Intelligent error handling with custom filters

## 🔒 Security Features

- Input sanitization
- XSS protection
- CORS configuration
- Helmet security headers

## 🧪 Testing

```bash
npm run test


# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```


## 📈 Monitoring and Logging

- Winston logger integration
- Error tracking with stack traces


## 🔧 Configuration

Configuration is managed through environment variables. See `.env.example` for available options:

```env
# Server Configuration
PORT
CACHE_TTL
CACHE_MAX_ITEMS,
# Database Configuration
DB_USERNAME
DB_PASSWORD
DB_NAME
DB_HOST
DB_PORT
DB_SCHEMA
DB_SYNC
DB_LOGGING
DB_MAX_CONNECTIONS
DB_SSL_ENABLED

# Rate Limiting
RATE_LIMIT_TTL
RATE_LIMIT_MAX

# Node Environment
NODE_ENV

# Test 
TEST_DB_USERNAME
TEST_DB_PASSWORD
TEST_DB_NAME
```



Built with ❤️ by [Dayo Adewuyi](https://github.com/Dayo-Adewuyi)