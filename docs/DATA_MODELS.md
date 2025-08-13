'# 📊 Data Models & Schemas

## 📌 Core Models

### 1. User Model
```mermaid
classDiagram
    class User {
        +string id
        +string email
        +string firstName
        +string lastName
        +string role
        +string status
        +DateTime createdAt
        +DateTime updatedAt
    }
    
    class UserProfile {
        +string userId
        +string avatarUrl
        +string phone
        +string timezone
        +JSON preferences
    }
    
    User "1" -- "1" UserProfile
    User "1" -- "*" UserSession
    User "1" -- "*" AuditLog
```

### 2. Client Model
```mermaid
erDiagram
    CLIENT ||--o{ CONTACT : has
    CLIENT ||--o{ DEAL : has
    CLIENT ||--o{ ACTIVITY : generates
    
    CLIENT {
        string id PK
        string name
        string industry
        string status
        string tier
        date onboardedDate
        decimal annualRevenue
    }
    
    CONTACT {
        string id PK
        string clientId FK
        string name
        string email
        string phone
        string position
    }
```

## 🔄 State Management

### Auth State
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  permissions: string[];
  
  login: (credentials: LoginDTO) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}
```

### Dashboard State
```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Loading: fetchData()
    Loading --> Success: dataReceived()
    Loading --> Error: fetchFailed()
    Success --> Refreshing: refreshData()
    Error --> Loading: retry()
```

## 📊 Dashboard Data Models

### Report Model
```typescript
interface Report {
  id: string;
  name: string;
  type: 'table' | 'line' | 'bar' | 'pie';
  dataSource: string;
  columns: ReportColumn[];
  filters: ReportFilter[];
  createdBy: string;
  updatedAt: Date;
}
```

### Widget Model
```mermaid
graph TD
    A[Widget] --> B[BaseWidget]
    B --> C[ChartWidget]
    B --> D[TableWidget]
    B --> E[MetricWidget]
    
    G[DataSource] --> H[API]
    G --> I[Database]
    
    C --> G
    D --> G
    E --> G
```

## 🗃️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Clients Table
```sql
CREATE TABLE clients (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    status VARCHAR(50) NOT NULL,
    tier VARCHAR(50) DEFAULT 'standard',
    onboarded_date DATE NOT NULL,
    annual_revenue DECIMAL(15, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🔄 Data Flow

### API Request/Response
```mermaid
sequenceDiagram
    UI->>API: GET /api/data
    API->>DB: Query Data
    DB-->>API: Return Data
    API-->>UI: Return Response
```

### Real-time Updates
```mermaid
graph LR
    A[Client] -->|Subscribe| B[WebSocket]
    B --> C[Message Broker]
    C --> D[Services]
    D -->|Publish| C
    C -->|Push| B
    B -->|Update| A
```

## 📝 Data Dictionary

| Entity  | Description                | Key Fields                     |
|---------|----------------------------|-------------------------------|
| User    | System users               | id, email, role, status       |
| Client  | Business clients           | id, name, industry, status    |
| Contact | Client contacts            | id, clientId, email, phone    |
| Report  | Custom reports             | id, name, type, dataSource    |
| Widget  | Dashboard components       | id, type, dataSource, layout  |
