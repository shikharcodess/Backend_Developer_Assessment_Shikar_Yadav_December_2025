# Backend Developer Assessment

### Not Implemented:

- Observability (Metrics) - No Prometheus/metrics collection
- Clean Architecture/DDD - Discussed but not implemented
- API Versioning - Single version API (no /v1/ prefix)
- Serverless - Not applicable to this architecture

## Architecture Overview

The application follows a modular monolithic architecture with the following components:

- **API Layer**: RESTful endpoints with Express.js
- **Real-time Layer**: WebSocket server for live updates
- **Job Processing**: RabbitMQ-based asynchronous task queue
- **Data Layer**: PostgreSQL with Prisma ORM
- **Caching Layer**: Redis for session management and rate limiting
- **Authentication**: JWT-based access and refresh tokens

## Setup & Run Instructions

### Prerequisites

- Node.js 18+
- Docker and Docker Compose

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create `.env` file with required environment variables (refer to `src/config/env/env-schema.ts`)

4. Start infrastructure services:

   ```bash
   docker-compose up -d
   ```

5. Run database migrations:

   ```bash
   npx prisma migrate deploy
   ```

6. Start the application:
   ```bash
   npm run dev
   ```

The server will be available at `http://localhost:3000`

## Design Decisions and Trade-offs

### Design Decisions

- **Modular Structure**: Organized by feature domain for maintainability and scalability
- **Prisma ORM**: Type-safe database access with automatic migrations
- **JWT Authentication**: Stateless authentication with refresh token rotation
- **RabbitMQ**: Decoupled job processing for background tasks
- **WebSocket Integration**: Real-time collaboration features with workspace presence

### Trade-offs

- **Monolithic vs Microservices**: Chose monolithic for simplicity while maintaining modular boundaries for future service extraction
- **Redis Caching**: Additional infrastructure dependency for improved performance
- **Synchronous vs Asynchronous Processing**: Critical operations are synchronous; heavy tasks are queued

## Scalability Considerations

- **Horizontal Scaling**: Stateless application design allows multiple instances behind load balancer
- **Database Connection Pooling**: Prisma manages connection pools efficiently
- **Redis Cluster**: Can be configured for distributed caching
- **RabbitMQ Clustering**: Supports multiple workers for parallel job processing
- **Rate Limiting**: Redis-based rate limiting prevents resource exhaustion
- **WebSocket Scaling**: Can be scaled with Redis Pub/Sub for multi-instance coordination

## API Documentation

Interactive API documentation is available via Swagger UI:

```
http://localhost:3000/docs
```

### Authentication

All protected endpoints require Bearer token in Authorization header:

```
Authorization: Bearer <access_token>
```

### Key Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/users/me` - Get current user
- `POST /api/projects` - Create project
- `GET /api/projects` - List projects
- `POST /api/jobs` - Create job
- `GET /api/jobs` - List jobs

Refer to Swagger documentation for complete endpoint details and schemas.

## Test Instructions

### Running Tests

```bash
npm test
```

### Running Tests with Coverage

```bash
npm run test:coverage
```

### Linting

```bash
npm run lint
npm run lint:fix  # Auto-fix issues
```

### Code Formatting

```bash
npm run format        # Format code
npm run format:check  # Check formatting
```

### Manual Testing

1. Start the application using setup instructions
2. Access Swagger UI at `/docs` for interactive API testing
3. Test WebSocket connection using `/websocket-client.html`
4. Verify job processing by creating jobs and monitoring worker logs

## CI/CD Pipeline

The project includes automated CI/CD using GitHub Actions with three stages:

### 1. Lint

- Runs ESLint to check code quality
- Validates code formatting with Prettier
- Executes on every push and pull request

### 2. Test

- Runs Jest test suite
- Generates code coverage reports
- Uploads coverage to Codecov (optional)

### 3. Build

- Generates Prisma client
- Performs TypeScript type checking
- Compiles TypeScript to JavaScript
- Creates build artifacts

**Workflow triggers:** Push to `main` or `develop` branches, and pull requests.

**View workflow:** `.github/workflows/ci.yml`

## Deployment Instructions

### Docker Deployment

Start all services using Docker Compose:

```bash
# Start all services
docker-compose up -d

# Build and start (if Dockerfile changed)
docker-compose up --build -d

# View logs
docker-compose logs -f app

# Run migrations
docker-compose exec app npx prisma migrate deploy

# Stop all services
docker-compose down
```

### Production Deployment

1. Build the application:

   ```bash
   npm run build
   ```

2. Set production environment variables

3. Deploy using Docker:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Environment Variables

Ensure all required environment variables are configured:

- Database connection strings
- Redis URL
- RabbitMQ URL
- JWT secrets
- CORS settings
- Feature flags (optional)

### Feature Flags

The application supports feature flags for dynamic feature control. Configure via environment variables:

```bash
FEATURE_FLAG_PROJECT_INVITES=true
```

Available feature flags:

- `FEATURE_FLAG_PROJECT_INVITES` - Enable/disable project invite functionality

To disable a feature, set the value to `false` or `0`. Features are enabled by default.

### Database Migrations

Run migrations in production:

```bash
npx prisma migrate deploy
```

### Health Check

Verify deployment:

```bash
curl http://your-domain/health
```

### Monitoring

- Application logs via Docker logs
- Database metrics via PostgreSQL monitoring tools
- Queue metrics via RabbitMQ management console
- Redis metrics via Redis CLI or monitoring tools
