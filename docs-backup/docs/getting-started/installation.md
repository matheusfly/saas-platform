---
title: Installation
description: Get started with the SaaS BI Platform installation
---

# Installation Guide

## Prerequisites

- Node.js 16+ and npm
- PostgreSQL 13+
- Redis 6+

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/saas-platform.git
   cd saas-platform
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Run database migrations:
   ```bash
   npm run db:migrate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

Your application should now be running at `http://localhost:3000`
