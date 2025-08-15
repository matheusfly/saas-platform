---
title: Installation
description: Step-by-step guide to install the SaaS BI Platform
---

# Installation Guide

## Prerequisites

Before you begin, make sure you have the following installed on your system:

- Node.js 16 or later
- npm 7 or later (comes with Node.js)
- PostgreSQL 13 or later
- Redis 6 or later

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/saas-platform.git
cd saas-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your configuration:
   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=saas_platform
   DB_USER=postgres
   DB_PASSWORD=your_password

   # Redis
   REDIS_HOST=localhost
   REDIS_PORT=6379

   # App
   NODE_ENV=development
   PORT=3000
   ```

### 4. Database Setup

1. Create the database:
   ```bash
   createdb saas_platform
   ```

2. Run migrations:
   ```bash
   npx sequelize-cli db:migrate
   ```

### 5. Start the Development Server

```bash
npm run dev
```

The application should now be running at `http://localhost:3000`

## Next Steps

- [Configure your application](/docs/getting-started/configuration)
- [Take a quick tour](/docs/getting-started/quickstart)
