# User Data ETL Pipeline & API

A TypeScript Node.js Express application for processing user data through a reusable ETL pipeline and scalable API for accessing clean, structured data.

## Project Structure

```
src/
├── __tests__/        # Unit tests
├── config/           # Configuration files
├── controllers/      # API controllers
├── routes/           # Express routes
├── schemas/          # Zod validation schemas
├── services/         # Business logic services
├── scripts/          # Utility scripts
├── app.ts            # Express app setup
└── index.ts          # Server entry point
```

## Features

- ETL Pipeline: Configurable data extraction, transformation, and loading
- Data Validation: Zod used for validation
- Data Normalisation: Standardises identifiers, formats, and structures
- REST API: Scalable backend API for data access
- Date Handling: Uses date-fns for reliable date parsing and formatting
- TypeScript: Full type safety and modern development experience

## Installation

1. Clone the repository and navigate to the project directory:

   ```
   cd duel-tech-test
   ```

2. Install dependencies:

   ```
   pnpm install
   ```

3. Build the project if needed:
   ```
   pnpm run build
   ```

## Database Setup with Prisma

This project uses Prisma for database management.

### Initial Setup

1. Configure your database connection in `.env` file or use prisma to generate one if running locally:

   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/some_db?schema=public"
   ```

   Or for SQLite (development):

   ```
   DATABASE_URL="file:./dev.db"
   ```

2. Generate the Prisma client:

   ```
   pnpm prisma generate
   ```

3. Run initial database migration:

   ```
   pnpm prisma migrate dev --name init
   ```

### Prisma Commands

- **View database in Prisma Studio**:

  ```
  pnpm prisma studio
  ```

- **New Migration after schema changes**:

  ```
  pnpm prisma migrate dev --name your_migration_name
  ```

### Database Schema

The data model is defined in `prisma/schema.prisma`. Key entities include:

- User
- AdvocacyProgram
- Task
- Platform

For detailed schema information, refer to the Prisma schema file.

### Seeding Data

To seed your database with initial data:

1. Process data using `pnpm run etl:process`
2. Seed the data to prisma with: `pnpm prisma db seed`

## Usage

### Running the ETL Pipeline

Process raw user data through the ETL pipeline:

```
pnpm run etl:process
```

### Starting the API Server

Development mode:

```
pnpm run dev:express
```

The server will start on http://localhost:3000

Production mode:

```
pnpm start
```

### API Endpoints

#### Health Check

- GET /health - Server health status

#### User Management

- GET /api/users - Get users with pagination (page, limit)
- GET /api/users/:user_id - Get user by ID
- GET /api/users/search?q=query - Search users by name, email, or social handles
- GET /api/users/stats - Get data statistics

#### ETL Operations

- POST /api/etl/process - Receives input data, runs through the transformation and saves to DB
- GET /api/etl/status - Get processing status

#### Insights & Visualisations

- GET /api/insights/engagement - Total engagement per user/platform/programme
- GET /api/insights/top-advocates - Top advocates by activity/influence/conversions
- GET /api/insights/sales-attribution - Sales attribution patterns

#### API Documentation

- GET /api - API documentation and endpoint list

## Data Processing Features

### Input Data Handling

- Handles missing fields, incorrect typing, formatting issues, invalid dates, social media handle errors, NaN values

### Data Transformation

- UUID generation for missing IDs
- Email validation and normalisation
- Date normalisation (ISO format)
- Social handle standardisation
- Platform mapping
- URL validation
- Numeric field cleaning

### Data Output

- Clean, validated data structure
- Consistent typing and formatting
- Null handling for missing/invalid data
- UUID identifiers for all entities

## Example API Usage

```
curl "http://localhost:3000/api/users?page=1&limit=5"
curl "http://localhost:3000/api/users/search?q=John"
curl "http://localhost:3000/api/users/stats"
curl -X POST "http://localhost:3000/api/etl/process"
```

## Data Statistics

The API provides comprehensive statistics including:

- Total users processed
- Users with valid emails
- Users with social media handles
- Users with advocacy programmes
- Total tasks across all programmes
- Platform distribution analytics

## Architecture

ETL Pipeline:

1. Extract: Load raw JSON data from files
2. Transform: Apply validation and transformation rules
3. Load: Save processed data to structured format

ETL Flow:
Raw JSON Files → DataStorageService → DataTransformationService → Validated Data → API

Key Components:

- DataTransformationService: Handles all data cleaning and validation
- databaseService: Manages data persistence and retrieval
- Express Controllers: Handle API requests and responses
- Zod Schemas: Ensure data integrity and type safety

## Configuration

Environment variables:

- PORT: Server port (default: 3000)
- NODE_ENV: Environment mode (development/production)
  APP_CONFIG variables are stored within "src/config/config.ts"

Settings:

- feature flags
- default etl directories.
- env variables will be used if running the etl:process script, unless they are not provided, then they will fallback to the config variables

## Error Handling

- Schema validation errors
- File system operation errors
- API request/response errors
- Data transformation errors
- Graceful degradation for invalid data

## Data Validation Rules

User Data:

- user_id: Valid UUID or auto-generated
- name: Non-empty string (null if invalid)
- email: Valid email format or null
- social_handles: Standardised format (@username) or null
- joined_at: Valid ISO datetime or null

Advocacy Programmes:

- program_id: Valid UUID or auto-generated
- brand: String representation of brand
- tasks_completed: Array of valid tasks
- total_sales_attributed: Numeric value or null

Tasks:

- task_id: Valid UUID or auto-generated
- platform: Mapped to standard platform names
- post_url: Valid URL or null
- likes/comments/shares/reach: Numeric values or null

## Success Metrics

The ETL pipeline tracks:

- Processing success rate
- Data quality improvements
- Validation error rates
- Performance metrics

## License

MIT

## Areas for improvement:

- Test Coverage, Error Handling, Logging and Monitoring
- Implement something like Swagger for API documentation
- Some refactoring to reduce repetition, potential to use createMany functions for prisma
- Create a FE to display data using something like recharts.
- Decide if I prefer to declare functions with es6 syntax or trad function expressions.
