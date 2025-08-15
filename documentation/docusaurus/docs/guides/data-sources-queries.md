---
title: Data Sources & Queries
description: Comprehensive guide to working with data sources and writing queries
---

# Data Sources & Queries

This guide covers how to connect to various data sources and write effective queries in the SaaS BI Platform.

## Table of Contents

- [Connecting Data Sources](#connecting-data-sources)
- [Query Builder](#query-builder)
- [SQL Editor](#sql-editor)
- [Query Parameters](#query-parameters)
- [Scheduled Queries](#scheduled-queries)
- [Query Optimization](#query-optimization)
- [Troubleshooting](#troubleshooting)

## Connecting Data Sources

### Supported Data Sources

#### Databases
- **SQL**: PostgreSQL, MySQL, SQL Server, Oracle, SQLite
- **NoSQL**: MongoDB, Cassandra, Redis
- **Data Warehouses**: BigQuery, Redshift, Snowflake
- **Analytics**: Elasticsearch, ClickHouse

#### APIs
- REST APIs
- GraphQL
- OAuth2 Providers

#### Files
- CSV/TSV
- Excel
- JSON
- Parquet

### Adding a New Data Source

1. Navigate to **Data Sources** > **+ New**
2. Select the data source type
3. Enter connection details:
   - Host/URL
   - Port
   - Database name
   - Authentication credentials
4. Test the connection
5. Save the data source

### Connection Settings

- **Connection Pooling**: Configure min/max connections
- **SSL**: Enable for secure connections
- **SSH Tunneling**: For accessing private databases
- **Timeouts**: Set query and connection timeouts
- **Caching**: Configure query result caching

## Query Builder

### Visual Query Builder

1. Select tables to join
2. Choose columns to display
3. Add filters and conditions
4. Apply aggregations
5. Set sort order
6. Preview results

### Joins

- **Inner Join**: Only matching rows
- **Left Join**: All rows from left table
- **Right Join**: All rows from right table
- **Full Outer Join**: All rows from both tables
- **Cross Join**: Cartesian product

### Aggregations

- **Basic**: COUNT, SUM, AVG, MIN, MAX
- **Statistical**: STDDEV, VARIANCE, PERCENTILE
- **Time-based**: DATE_TRUNC, DATE_PART, INTERVAL
- **Conditional**: CASE, COALESCE, NULLIF

### Filters

- **Basic**: `=`, `!=`, `>`, `<`, `>=`, `<=`
- **Text**: `LIKE`, `ILIKE`, `CONTAINS`
- **Date/Time**: Relative dates, date ranges
- **Lists**: `IN`, `NOT IN`
- **Null checks**: `IS NULL`, `IS NOT NULL`

## SQL Editor

### Features

- Syntax highlighting
- Auto-completion
- Query formatting
- Query history
- Query bookmarks
- Snippets

### Writing Queries

```sql
-- Basic query with filtering and sorting
SELECT 
    date_trunc('day', created_at) AS day,
    COUNT(*) AS total_orders,
    SUM(amount) AS total_revenue
FROM orders
WHERE 
    status = 'completed'
    AND created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY 1
ORDER BY 1 DESC;
```

### Query Variables

Use `{{variable}}` syntax for dynamic values:

```sql
SELECT * FROM sales 
WHERE 
    date >= '{{start_date}}'
    AND date <= '{{end_date}}'
    AND region IN ({{#each regions}}'{{this}}'{{#unless @last}},{{/unless}}{{/each}})
```

## Query Parameters

### Defining Parameters

1. In the query editor, click **Parameters**
2. Click **+ Add Parameter**
3. Configure:
   - Name
   - Display name
   - Type (text, number, date, dropdown, etc.)
   - Default value
   - Required (Y/N)

### Using Parameters

- Reference in SQL: `{{parameter_name}}`
- Reference in query builder: `$parameter_name`
- Set dashboard-level defaults
- Allow user overrides

## Scheduled Queries

### Creating a Schedule

1. Open a saved query
2. Click **Schedule**
3. Set frequency:
   - One time
   - Hourly
   - Daily
   - Weekly
   - Monthly
   - Custom cron
4. Configure:
   - Start/end dates
   - Timezone
   - Notification settings

### Destinations

- **Email**: Send results as attachment
- **Webhook**: POST results to a URL
- **Database**: Insert/update a table
- **Storage**: Save to S3/GCS/Azure Blob

### Monitoring

- View execution history
- Check success/failure status
- View execution logs
- Set up alerts for failures

## Query Optimization

### Performance Tips

1. **Limit Data**
   - Use WHERE clauses early
   - SELECT only needed columns
   - Use LIMIT for exploration

2. **Indexing**
   - Add indexes on filtered/sorted columns
   - Use composite indexes for common query patterns
   - Consider partial indexes for filtered queries

3. **Partitioning**
   - Partition large tables by date/id ranges
   - Use table partitioning for time-series data

4. **Materialized Views**
   - Pre-compute expensive aggregations
   - Schedule regular refreshes

### Execution Plans

1. Click **Explain** to view the execution plan
2. Look for:
   - Full table scans
   - Missing indexes
   - Expensive operations
   - Sort/Merge operations

### Caching

- Enable query result caching
- Set appropriate TTL
- Use cache hints for frequently changing data

## Data Transformations

### Built-in Functions

- **String**: CONCAT, SUBSTRING, TRIM, UPPER, LOWER
- **Math**: ROUND, CEIL, FLOOR, POWER, SQRT
- **Date/Time**: NOW, DATE_ADD, DATEDIFF, EXTRACT
- **Conditional**: IF, CASE, COALESCE, NULLIF
- **Window Functions**: ROW_NUMBER, RANK, LAG, LEAD

### Custom Transformations

1. **SQL Expressions**
   ```sql
   SELECT 
       user_id,
       CASE 
           WHEN age < 18 THEN 'Under 18'
           WHEN age BETWEEN 18 AND 24 THEN '18-24'
           ELSE '25+'
       END AS age_group
   FROM users
   ```

2. **JavaScript UDFs**
   ```javascript
   function formatName(first, last) {
       return `${last}, ${first}`.toUpperCase();
   }
   ```

## Troubleshooting

### Common Issues

1. **Connection Failures**
   - Verify network connectivity
   - Check credentials
   - Verify firewall rules

2. **Slow Queries**
   - Check execution plan
   - Add indexes
   - Optimize joins
   - Increase timeouts if needed

3. **Permission Errors**
   - Verify user permissions
   - Check database grants
   - Review row-level security policies

### Debugging

1. **Query Logs**
   - View execution history
   - Check execution time
   - Review error messages

2. **Query Explain**
   - Analyze execution plan
   - Identify bottlenecks
   - Optimize query structure

### Getting Help

- **Documentation**: [Query Reference](https://docs.example.com/queries)
- **Community**: [Forum](https://community.example.com)
- **Support**: support@example.com

## Security

### Best Practices

1. **Principle of Least Privilege**
   - Create read-only database users
   - Limit access to sensitive tables
   - Use row-level security

2. **Data Protection**
   - Encrypt sensitive data
   - Mask PII in query results
   - Audit data access

3. **Connection Security**
   - Use SSL/TLS for all connections
   - Rotate credentials regularly
   - Use SSH tunneling for private networks

### Compliance

- **GDPR**: Data protection and right to be forgotten
- **HIPAA**: Protected health information
- **SOC 2**: Security and privacy controls
- **ISO 27001**: Information security management
