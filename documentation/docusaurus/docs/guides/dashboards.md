---
title: Dashboards
description: Comprehensive guide to creating and managing dashboards
---

# Dashboards Guide

This guide covers everything you need to know about creating, managing, and optimizing dashboards in the SaaS BI Platform.

## Table of Contents

- [Creating a Dashboard](#creating-a-dashboard)
- [Dashboard Layout](#dashboard-layout)
- [Adding Widgets](#adding-widgets)
- [Widget Types](#widget-types)
- [Sharing and Permissions](#sharing-and-permissions)
- [Dashboard Settings](#dashboard-settings)
- [Advanced Features](#advanced-features)
- [Best Practices](#best-practices)

## Creating a Dashboard

### From the Dashboard List

1. Navigate to **Dashboards** in the sidebar
2. Click **+ New Dashboard**
3. Enter a name and description
4. Click **Create**

### Using a Template

1. From the dashboard list, click **Create from Template**
2. Browse available templates
3. Click **Use Template**
4. Customize as needed
5. Click **Save**

## Dashboard Layout

### Grid System

- **Columns**: 12-column responsive grid
- **Widget Sizing**: Widgets can be resized in 1-column increments
- **Minimum Size**: 2x2 columns
- **Maximum Size**: 12x12 columns

### Layout Modes

1. **Freeform**: Drag and drop widgets anywhere
2. **Grid**: Snap to grid (recommended for consistency)
3. **Vertical**: Stack widgets vertically

### Responsive Behavior

- **Desktop**: Full layout with all widgets visible
- **Tablet**: Adjusts to 2-column layout
- **Mobile**: Stacks widgets vertically

## Adding Widgets

### From the Widget Library

1. Click **+ Add Widget**
2. Select a widget type
3. Configure data source and appearance
4. Click **Add to Dashboard**

### From a Saved Widget

1. Click **Saved Widgets**
2. Select a widget
3. Adjust settings if needed
4. Click **Add to Dashboard**

## Widget Types

### Chart Widgets

- **Line Chart**: Show trends over time
- **Bar Chart**: Compare categories
- **Pie Chart**: Show proportions
- **Area Chart**: Emphasize volume
- **Scatter Plot**: Show correlations
- **Heatmap**: Visualize density

### Data Widgets

- **Table**: Display tabular data
- **Metric**: Show key metrics
- **Gauge**: Show progress toward a goal
- **Funnel**: Show conversion steps
- **Pivot Table**: Multi-dimensional analysis

### Custom Widgets

- **HTML/JS**: Add custom code
- **Embed**: Embed external content
- **Image**: Add static images
- **Text**: Add rich text or markdown

## Data Sources

### Connecting Data

1. Click **Add Data Source**
2. Select a data source type:
   - Database (PostgreSQL, MySQL, etc.)
   - API
   - CSV/Excel
   - Google Sheets
3. Configure the connection
4. Test and save

### Query Builder

1. Select a data source
2. Build queries visually
3. Add filters and aggregations
4. Preview results
5. Save as a view

## Sharing and Permissions

### Sharing Options

- **Private**: Only you can view/edit
- **Team**: Specific team members
- **Organization**: Everyone in your organization
- **Public**: Anyone with the link

### Permission Levels

1. **View**: Can view the dashboard
2. **Edit**: Can modify the dashboard
3. **Admin**: Full control, including sharing

### Embedding

1. Click **Share**
2. Go to **Embed** tab
3. Configure options
4. Copy the iframe or JavaScript code

## Dashboard Settings

### General

- **Title & Description**
- **Tags**
- **Thumbnail**
- **Default View**
- **Auto-refresh**

### Appearance

- **Theme**: Light/Dark/System
- **Color Scheme**
- **Font Family**
- **Background**

### Advanced

- **Caching**
- **Query Timeout**
- **Data Sampling**
- **Export Options**

## Advanced Features

### Dashboard Variables

Create interactive filters:

1. Go to **Variables**
2. Click **+ Add Variable**
3. Define name, type, and default value
4. Use in queries with `{{variable_name}}`

### Dashboard Actions

Set up actions for interactivity:

1. Select a widget
2. Click **Add Action**
3. Choose action type:
   - Filter
   - Navigation
   - URL
   - Custom JavaScript

### Dashboard Linking

Link dashboards together:

1. Select text or a widget
2. Click **Add Link**
3. Choose a dashboard
4. Pass parameters if needed

## Best Practices

### Design Principles

1. **Focus on Key Metrics**
   - 5-7 key metrics per dashboard
   - Group related metrics

2. **Logical Flow**
   - Top-left to bottom-right
   - Most important metrics at the top

3. **Consistency**
   - Standardize colors and fonts
   - Use consistent date ranges

### Performance

1. **Query Optimization**
   - Limit data volume
   - Use appropriate aggregations
   - Add indexes

2. **Caching**
   - Enable query caching
   - Set appropriate TTL

3. **Refresh Rates**
   - Critical data: 1-5 minutes
   - Operational data: 15-60 minutes
   - Strategic data: Daily

### Accessibility

1. **Color Contrast**
   - Minimum 4.5:1 ratio
   - Test with color blindness simulators

2. **Keyboard Navigation**
   - Tab through widgets
   - Accessible controls

3. **Screen Readers**
   - Alt text for images
   - ARIA labels

## Troubleshooting

### Common Issues

1. **Widget Not Loading**
   - Check data source connection
   - Verify query syntax
   - Check for filters

2. **Slow Performance**
   - Optimize queries
   - Reduce data volume
   - Enable caching

3. **Permission Errors**
   - Verify sharing settings
   - Check user permissions

### Getting Help

- **Documentation**: [Help Center](https://help.example.com)
- **Community**: [Forum](https://community.example.com)
- **Support**: support@example.com
