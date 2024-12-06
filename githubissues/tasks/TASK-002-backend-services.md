# Task: Backend Services Setup and Configuration

## Overview
Set up a flexible backend infrastructure that supports both local development and serverless deployment using AWS services for the HireMeKnow platform. The architecture will be designed to seamlessly switch between local and cloud environments.

## Task Details

### Prerequisites
- Docker and Docker Compose for local development
- AWS Account with appropriate IAM permissions (for serverless deployment)
- Node.js v16.x or higher
- TypeScript knowledge
- Understanding of containerization and serverless architecture

### Development Steps

1. Project Structure
```
backend/
├── src/
│   ├── core/                 # Shared business logic
│   ├── infrastructure/       # Infrastructure abstractions
│   │   ├── local/           # Local development implementations
│   │   └── serverless/      # AWS serverless implementations
│   ├── services/            # Service implementations
│   └── utils/               # Shared utilities
├── docker/                  # Docker configuration for local development
├── serverless/             # Serverless configuration
└── package.json
```

2. Infrastructure Abstraction Layer
```typescript
// src/infrastructure/database/DatabaseClient.ts
export interface DatabaseClient {
  query(params: QueryParams): Promise<QueryResult>;
  put(params: PutParams): Promise<void>;
  // ... other database operations
}

// Local implementation using PostgreSQL
export class LocalDatabaseClient implements DatabaseClient {
  // Implementation for local PostgreSQL
}

// Serverless implementation using DynamoDB
export class DynamoDBClient implements DatabaseClient {
  // Implementation for AWS DynamoDB
}

// Factory to create the appropriate client
export class DatabaseClientFactory {
  static create(environment: 'local' | 'serverless'): DatabaseClient {
    return environment === 'local' 
      ? new LocalDatabaseClient()
      : new DynamoDBClient();
  }
}
```

3. Service Layer Implementation
```typescript
// src/services/user/UserService.ts
export class UserService {
  constructor(private dbClient: DatabaseClient) {}

  async createUser(userData: UserData): Promise<User> {
    // Business logic remains the same regardless of environment
    const user = new User(userData);
    await this.dbClient.put({
      table: 'users',
      item: user.toDatabase()
    });
    return user;
  }
}
```

4. Local Development Setup
```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DB_HOST=postgres
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: hiremekow
      POSTGRES_USER: developer
      POSTGRES_PASSWORD: localdev
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:6
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

5. Serverless Configuration
```yaml
# serverless.yml
service: hiremekow-backend

provider:
  name: aws
  runtime: nodejs16.x
  stage: ${opt:stage, 'dev'}
  environment:
    DEPLOYMENT_TYPE: serverless

functions:
  userApi:
    handler: src/handlers/user.handler
    events:
      - http:
          path: /users
          method: ANY
```

6. Environment Configuration
```typescript
// src/config/environment.ts
export const config = {
  isLocal: process.env.NODE_ENV === 'development',
  database: {
    client: process.env.NODE_ENV === 'development' ? 'postgresql' : 'dynamodb',
    // ... other config
  },
  auth: {
    provider: process.env.NODE_ENV === 'development' ? 'local' : 'cognito',
    // ... other config
  }
};
```

### Local Development Setup

1. Start Local Environment
```bash
# Start all services
docker-compose up -d

# Run migrations
npm run migrate

# Start development server
npm run dev
```

2. Local Testing
```bash
# Unit tests
npm run test

# Integration tests (local)
npm run test:integration:local

# Integration tests (serverless)
npm run test:integration:serverless
```

### Serverless Deployment

1. Deploy to AWS
```bash
# Deploy development environment
npm run deploy:dev

# Deploy production environment
npm run deploy:prod
```

## Validation Steps

### 1. Local Environment Validation
```bash
# Health check
curl http://localhost:3000/health

# Create user (local)
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

### 2. Serverless Environment Validation
```bash
# Same endpoints, different base URL
curl https://api.hiremekow.com/users
```

## Architecture Guidelines

### Service Layer Design
1. Use dependency injection for infrastructure dependencies
2. Implement repository pattern for data access
3. Use environment-agnostic business logic
4. Implement feature flags for environment-specific behavior

### Security Considerations
1. Use environment-specific authentication strategies
2. Implement secure configuration management
3. Apply proper CORS settings for both environments

## Monitoring and Logging

1. Local Development Monitoring
```typescript
// src/infrastructure/monitoring/LocalMonitor.ts
export class LocalMonitor implements Monitor {
  async logMetric(metric: Metric): Promise<void> {
    console.log(`[METRIC] ${metric.name}: ${metric.value}`);
  }
}
```

2. Serverless Monitoring
```typescript
// src/infrastructure/monitoring/CloudWatchMonitor.ts
export class CloudWatchMonitor implements Monitor {
  async logMetric(metric: Metric): Promise<void> {
    // AWS CloudWatch implementation
  }
}
```

## Dependencies
- Express (local development)
- AWS SDK (serverless)
- PostgreSQL (local)
- DynamoDB (serverless)
- Docker & Docker Compose
- TypeScript
- Jest
- Winston

## Task Completion Checklist
- [ ] Local development environment setup
- [ ] Serverless infrastructure code written
- [ ] Environment-agnostic service layer implemented
- [ ] Database abstraction layer completed
- [ ] Authentication for both environments configured
- [ ] API documentation updated for both approaches
- [ ] Tests covering both environments
- [ ] Monitoring setup for both environments
- [ ] Security measures implemented
- [ ] Docker configuration completed
- [ ] Deployment scripts prepared
- [ ] Team review conducted