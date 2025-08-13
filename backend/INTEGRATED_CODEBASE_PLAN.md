# Integrated Codebase Implementation Plan

## Project Overview
Creating a full-stack application with:
- Frontend: React with TypeScript (existing)
- Backend: Python with FastAPI
- Database: PostgreSQL with SQLAlchemy ORM
- Data Models: Comprehensive business intelligence models
- Visual Schema Tool: Database diagramming and documentation

## 1. Architecture Structure

```
bi_dash/
├── business-intelligence-dashboard/  (existing React frontend)
├── backend/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── core/          # Core configurations
│   │   ├── models/        # SQLAlchemy data models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── database/      # Database connection
│   │   └── crud/          # Database operations
│   ├── tests/
│   ├── requirements.txt
│   └── main.py
├── database/
│   ├── migrations/        # Alembic migrations
│   └── schemas/           # Database schemas
├── docs/
│   └── schema_diagrams/   # Visual schema documentation
└── docker-compose.yml     # Container orchestration
```

## 2. Backend Implementation with FastAPI and SQLAlchemy

### 2.1 Core Dependencies
Create `backend/requirements.txt`:
```txt
fastapi==0.111.0
uvicorn[standard]==0.30.1
sqlalchemy==2.0.31
psycopg2-binary==2.9.9
alembic==1.13.1
pydantic==2.8.2
pydantic-settings==2.3.4
python-dotenv==1.0.1
```

### 2.2 Database Configuration
Create `backend/app/core/database.py`:
- SQLAlchemy engine setup
- Session management
- Base model class

### 2.3 Data Models
Based on existing frontend components, implement models for:
- Clients/Customer 360 data
- Sales funnel analytics
- Financial data
- Productivity metrics
- Work logs/time tracking
- Business intelligence metrics

### 2.4 API Endpoints
Create RESTful APIs for:
- Dashboard data retrieval
- Analytics data processing
- CRUD operations for all entities
- Data import/export functionality

## 3. Database Design

### 3.1 Primary Entities
1. **Client/Customer Model**
   - Client information, demographics
   - Lifetime value tracking
   - Interaction history

2. **Sales & Financial Models**
   - Sales funnel stages
   - Revenue tracking
   - Cash flow data
   - Financial KPIs

3. **Productivity Models**
   - Work logs
   - Time tracking
   - Schedule management
   - Performance metrics

4. **Analytics Models**
   - Business intelligence metrics
   - Activity tracking
   - Conversion data
   - Predictive analytics data points

### 3.2 Relationships
- Clients → WorkLogs (1:M)
- Clients → SalesFunnel (1:M)
- SalesFunnel → Activities (1:M)
- Activities → ActivityTypes (M:1)

## 4. Visual Schema Tool Implementation

### 4.1 Database Diagramming
- Use tools like DBML or SchemaCrawler
- Generate ERD from SQLAlchemy models
- Export visual diagrams to docs/schema_diagrams/

### 4.2 Schema Documentation
- Auto-generate documentation from model definitions
- Include relationship diagrams
- Data dictionary with field descriptions

## 5. Development Guidelines

### 5.1 Code Organization
- Follow modular structure with clear separation of concerns
- Use dependency injection for database sessions
- Implement proper error handling and logging

### 5.2 Data Modeling Best Practices
- Use SQLAlchemy declarative base
- Implement proper relationships and constraints
- Use Pydantic schemas for data validation
- Follow naming conventions consistently

### 5.3 API Design
- RESTful principles
- Proper HTTP status codes
- Consistent response formats
- Pagination for large datasets

### 5.4 Database Migrations
- Use Alembic for schema versioning
- Create migration scripts for all schema changes
- Test migrations in development before applying to production

## 6. Deployment Architecture

### 6.1 Containerization
- Dockerize backend service
- PostgreSQL container
- Frontend build container

### 6.2 Environment Configuration
- Use environment variables for configuration
- Separate configs for dev/staging/production
- Secure secret management

## 7. Testing Strategy

### 7.1 Unit Tests
- Test data models
- Test API endpoints
- Test business logic

### 7.2 Integration Tests
- Database operations
- API integration
- End-to-end workflows

## 8. Implementation Steps

1. Set up backend directory structure
2. Configure database connection with SQLAlchemy
3. Implement core data models based on frontend components
4. Create API endpoints for data access
5. Set up database migrations
6. Integrate frontend with backend APIs
7. Implement visual schema documentation
8. Add comprehensive testing
9. Containerize the application
10. Document the implementation

## 9. Tools & Technologies

- **Backend**: Python, FastAPI, SQLAlchemy
- **Database**: PostgreSQL
- **Frontend**: React (existing)
- **Schema Tool**: DBML + DBDiagram or SchemaCrawler
- **Deployment**: Docker, Docker Compose
- **Testing**: Pytest
- **Documentation**: Swagger/OpenAPI, custom schema docs

## 10. Success Criteria

- Fully functional backend API
- Complete data model implementation
- Working database with proper relationships
- Visual schema documentation
- Integration with existing frontend
- Comprehensive test coverage
- Containerized deployment