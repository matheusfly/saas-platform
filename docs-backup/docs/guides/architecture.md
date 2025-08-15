---
title: Architecture Overview
description: High-level architecture of the SaaS BI Platform
---

# System Architecture

## Overview

The SaaS BI Platform is built with a modern, scalable architecture that separates concerns and enables flexibility.

## Core Components

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Redux Toolkit** for state management
- **MUI** for UI components

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **PostgreSQL** for relational data
- **Redis** for caching and real-time features

### Data Processing
- **ETL Pipelines** for data transformation
- **Job Queues** for background processing
- **Analytics Engine** for business intelligence

## Data Flow

1. Data is ingested from various sources
2. Processed through ETL pipelines
3. Stored in the data warehouse
4. Served to the frontend via the API
5. Visualized in dashboards and reports
