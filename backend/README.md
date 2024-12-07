# HireMeKnow Backend Services

This is the backend service infrastructure for the HireMeKnow platform, supporting both local development with PostgreSQL and serverless deployment with DynamoDB.

## Project Structure

```plaintext
backend/
├── src/
│   ├── core/              # Core interfaces and types
│   ├── infrastructure/    # Database clients and factory
│   │   ├── local/        # Local development implementations
│   │   └── serverless/   # Serverless implementations
│   ├── services/         # Business logic services
│   └── utils/            # Utility functions
├── docker/               # Docker configurations
├── serverless/           # Serverless configurations
└── package.json
```

## Prerequisites

- Node.js (v18 or later)
- Docker and Docker Compose
- AWS CLI (for serverless deployment)
- PostgreSQL (for local development)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create environment files:
   ```bash
   cp .env.example .env
   ```

3. Start local development environment:
   ```bash
   npm run docker:up
   ```

## Development

### Local Development

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Access the API at `http://localhost:3000`

### Testing

Run the test suite:
```bash
npm test
```

### Linting and Formatting

```bash
# Run ESLint
npm run lint

# Format code with Prettier
npm run format
```

## Deployment

### Serverless Deployment

1. Configure AWS credentials:
   ```bash
   aws configure
   ```

2. Deploy to AWS:
   ```bash
   npm run deploy
   ```

## API Endpoints

### Health Check
- GET `/api/health`

### User Management
- POST `/api/users` - Create user
- GET `/api/users` - List all users
- GET `/api/users/:id` - Get user by ID
- PUT `/api/users/:id` - Update user
- DELETE `/api/users/:id` - Delete user

## Environment Variables

```plaintext
# Local Development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hiremekow
DB_USER=postgres
DB_PASSWORD=postgres
REDIS_HOST=localhost
REDIS_PORT=6379

# Serverless
AWS_REGION=us-east-1
DYNAMODB_ENDPOINT=http://localhost:8000 # Local DynamoDB
```

## Contributing

1. Create a new feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit:
   ```bash
   git commit -m "Description of changes"
   ```

3. Push to the repository:
   ```bash
   git push origin feature/your-feature-name
   ```

## License

This project is licensed under the ISC License. 