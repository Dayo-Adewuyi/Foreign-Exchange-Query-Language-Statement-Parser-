# FXQL Parser Service Setup Guide

## Overview
The FXQL Parser Service is a high-performance API for parsing and storing Foreign Exchange Query Language (FXQL) statements. This guide provides comprehensive instructions for setting up and running the service.

## Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Docker (optional)
- Redis (optional, for caching)

## Installation

### Local Development Setup

1. Clone the repository:
```bash
git clone https://github.com/your-org/fxql-parser.git
cd fxql-parser
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables:
```env
# Application
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=fxql_db
DB_SCHEMA=public
DB_SYNC=false
DB_LOGGING=true
DB_MAX_CONNECTIONS=100
DB_SSL_ENABLED=false

# Cache
CACHE_TTL=300
CACHE_MAX_ITEMS=1000

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
```

5. Run database migrations:
```bash
npm run migration:run
```

6. Start the application:
```bash
npm run start:dev
```

### Docker Setup

1. Build the Docker image:
```bash
docker build -t fxql-parser .
```

2. Run with Docker Compose:
```bash
docker-compose up -d
```

## Database Migrations

### Create a new migration:
```bash
npm run migration:create src/database/migrations/name-of-migration
```

### Generate a migration from entity changes:
```bash
npm run migration:generate src/database/migrations/name-of-migration
```

### Run migrations:
```bash
npm run migration:run
```

### Revert last migration:
```bash
npm run migration:revert
```

## Testing

### Run unit tests:
```bash
npm run test
```

### Run e2e tests:
```bash
npm run test:e2e
```

### Run test coverage:
```bash
npm run test:cov
```

## API Documentation

The API documentation is available at `/api/docs` when running in development mode. It provides detailed information about all available endpoints and their usage.

## Performance Optimization

The service includes several performance optimizations:

1. Connection pooling for database connections
2. Redis caching for frequently accessed data
3. Rate limiting to prevent abuse
4. Compression middleware for response optimization
5. Proper indexing strategy for database queries

## Monitoring and Logging

Logs are stored in the `logs` directory with the following structure:
- `error.log`: Error-level logs
- `combined.log`: All application logs

Use Winston logging levels for different types of logs:
- error: Error events
- warn: Warning events
- info: Informational messages
- debug: Debugging information
- verbose: More detailed debugging information

## Security Considerations

The service implements several security measures:
1. Helmet middleware for HTTP security headers
2. Rate limiting to prevent DoS attacks
3. Input validation and sanitization
4. Proper error handling to prevent information leakage

## Common Issues and Solutions

### Database Connection Issues
1. Check database credentials in .env file
2. Ensure PostgreSQL service is running
3. Verify network connectivity to database host

### Performance Issues
1. Monitor database connection pool usage
2. Check Redis cache hit rates
3. Review query execution plans
4. Monitor rate limiting metrics

