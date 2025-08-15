#!/usr/bin/env node

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, extname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = __dirname;

// HTML Template with beautiful styling
const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITLE}} - SaaS BI Platform Documentation</title>
    <style>
        :root {
            --primary-color: #2563eb;
            --secondary-color: #64748b;
            --accent-color: #10b981;
            --background-color: #f8fafc;
            --surface-color: #ffffff;
            --text-primary: #1e293b;
            --text-secondary: #64748b;
            --border-color: #e2e8f0;
            --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
            --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: var(--text-primary);
            background-color: var(--background-color);
        }

        .container {
            display: grid;
            grid-template-columns: 280px 1fr;
            min-height: 100vh;
            max-width: 1400px;
            margin: 0 auto;
            gap: 0;
        }

        /* Sidebar Styles */
        .sidebar {
            background: var(--surface-color);
            border-right: 1px solid var(--border-color);
            padding: 2rem 1.5rem;
            overflow-y: auto;
            position: sticky;
            top: 0;
            height: 100vh;
            box-shadow: var(--shadow);
        }

        .sidebar h1 {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--primary-color);
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid var(--border-color);
        }

        .nav-section {
            margin-bottom: 2rem;
        }

        .nav-section h3 {
            font-size: 0.875rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-secondary);
            margin-bottom: 0.75rem;
        }

        .nav-list {
            list-style: none;
        }

        .nav-item {
            margin-bottom: 0.25rem;
        }

        .nav-link {
            display: block;
            padding: 0.5rem 0.75rem;
            color: var(--text-secondary);
            text-decoration: none;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            transition: all 0.2s ease;
        }

        .nav-link:hover {
            background-color: var(--background-color);
            color: var(--primary-color);
        }

        .nav-link.active {
            background-color: var(--primary-color);
            color: white;
            font-weight: 500;
        }

        /* Main Content Styles */
        .main-content {
            padding: 3rem;
            background: var(--surface-color);
            min-height: 100vh;
        }

        .content-header {
            margin-bottom: 3rem;
            padding-bottom: 1.5rem;
            border-bottom: 1px solid var(--border-color);
        }

        .content-title {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
        }

        .content-description {
            font-size: 1.125rem;
            color: var(--text-secondary);
        }

        .content-body {
            max-width: none;
        }

        /* Typography */
        .content-body h1,
        .content-body h2,
        .content-body h3,
        .content-body h4,
        .content-body h5,
        .content-body h6 {
            margin-top: 2rem;
            margin-bottom: 1rem;
            font-weight: 600;
            line-height: 1.3;
        }

        .content-body h1 { font-size: 2rem; color: var(--text-primary); }
        .content-body h2 { font-size: 1.5rem; color: var(--text-primary); }
        .content-body h3 { font-size: 1.25rem; color: var(--text-primary); }
        .content-body h4 { font-size: 1.125rem; color: var(--text-primary); }

        .content-body p {
            margin-bottom: 1.5rem;
            color: var(--text-primary);
        }

        /* Lists */
        .content-body ul,
        .content-body ol {
            margin: 1.5rem 0;
            padding-left: 1.5rem;
        }

        .content-body li {
            margin-bottom: 0.5rem;
            color: var(--text-primary);
        }

        .content-body ul li {
            list-style-type: none;
            position: relative;
            padding-left: 1.5rem;
        }

        .content-body ul li:before {
            content: '•';
            color: var(--primary-color);
            font-weight: bold;
            position: absolute;
            left: 0;
        }

        /* Code blocks */
        .content-body code {
            background: var(--background-color);
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 0.875rem;
            color: var(--primary-color);
        }

        .content-body pre {
            background: var(--background-color);
            padding: 1.5rem;
            border-radius: 0.5rem;
            overflow-x: auto;
            margin: 1.5rem 0;
            border: 1px solid var(--border-color);
        }

        .content-body pre code {
            background: none;
            padding: 0;
            color: var(--text-primary);
        }

        /* Tables */
        .content-body table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.5rem 0;
            box-shadow: var(--shadow);
            border-radius: 0.5rem;
            overflow: hidden;
        }

        .content-body th,
        .content-body td {
            padding: 1rem;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
        }

        .content-body th {
            background: var(--background-color);
            font-weight: 600;
            color: var(--text-primary);
        }

        /* Cards */
        .card {
            background: var(--surface-color);
            border: 1px solid var(--border-color);
            border-radius: 0.75rem;
            padding: 1.5rem;
            margin: 1.5rem 0;
            box-shadow: var(--shadow);
        }

        .card-header {
            margin-bottom: 1rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid var(--border-color);
        }

        .card-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--text-primary);
        }

        /* Badges */
        .badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            font-size: 0.75rem;
            font-weight: 500;
            border-radius: 9999px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .badge-primary {
            background: var(--primary-color);
            color: white;
        }

        .badge-success {
            background: var(--accent-color);
            color: white;
        }

        .badge-secondary {
            background: var(--background-color);
            color: var(--text-secondary);
        }

        /* Responsive */
        @media (max-width: 768px) {
            .container {
                grid-template-columns: 1fr;
            }
            
            .sidebar {
                position: static;
                height: auto;
                border-right: none;
                border-bottom: 1px solid var(--border-color);
            }
            
            .main-content {
                padding: 1.5rem;
            }
        }

        /* Scroll behavior */
        html {
            scroll-behavior: smooth;
        }

        /* Focus styles */
        .nav-link:focus {
            outline: 2px solid var(--primary-color);
            outline-offset: 2px;
        }
    </style>
</head>
<body>
    <div class="container">
        <nav class="sidebar">
            <h1>📊 SaaS BI Docs</h1>
            {{NAVIGATION}}
        </nav>
        <main class="main-content">
            <header class="content-header">
                <h1 class="content-title">{{TITLE}}</h1>
                <p class="content-description">{{DESCRIPTION}}</p>
            </header>
            <div class="content-body">
                {{CONTENT}}
            </div>
        </main>
    </div>
</body>
</html>`;

// Function to convert markdown to HTML (basic)
function markdownToHtml(markdown) {
    let html = markdown
        // Headers
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        
        // Code blocks
        .replace(/```([^`]+)```/gim, '<pre><code>$1</code></pre>')
        .replace(/`([^`]+)`/gim, '<code>$1</code>')
        
        // Bold and italic
        .replace(/\*\*([^*]+)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/gim, '<em>$1</em>')
        
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
        
        // Lists
        .replace(/^\* (.+)$/gim, '<li>$1</li>')
        .replace(/^- (.+)$/gim, '<li>$1</li>')
        
        // Line breaks
        .replace(/\n\n/gim, '</p><p>')
        .replace(/\n/gim, '<br>');

    // Wrap in paragraphs
    html = '<p>' + html + '</p>';
    
    // Fix list items
    html = html.replace(/(<li>.*<\/li>)/gim, function(match) {
        return '<ul>' + match + '</ul>';
    });

    // Clean up
    html = html
        .replace(/<p><\/p>/gim, '')
        .replace(/<p>(<h[1-6]>)/gim, '$1')
        .replace(/(<\/h[1-6]>)<\/p>/gim, '$1')
        .replace(/<p>(<ul>)/gim, '$1')
        .replace(/(<\/ul>)<\/p>/gim, '$1')
        .replace(/<p>(<pre>)/gim, '$1')
        .replace(/(<\/pre>)<\/p>/gim, '$1');

    return html;
}

// Function to scan directory for markdown files
function scanDirectory(dir, basePath = '') {
    const items = [];
    
    if (!existsSync(dir)) return items;
    
    const files = readdirSync(dir).sort();
    
    for (const file of files) {
        const fullPath = join(dir, file);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== 'build') {
            const subItems = scanDirectory(fullPath, join(basePath, file));
            if (subItems.length > 0) {
                items.push({
                    type: 'directory',
                    name: file,
                    path: basePath,
                    items: subItems
                });
            }
        } else if (file.endsWith('.md') && !file.startsWith('.')) {
            const name = basename(file, '.md');
            items.push({
                type: 'file',
                name: name,
                file: file,
                path: join(basePath, file),
                fullPath: fullPath
            });
        }
    }
    
    return items;
}

// Function to generate navigation HTML
function generateNavigation(items, currentPath = '') {
    let nav = '';
    
    for (const item of items) {
        if (item.type === 'directory') {
            nav += `
                <div class="nav-section">
                    <h3>${item.name.charAt(0).toUpperCase() + item.name.slice(1).replace('-', ' ')}</h3>
                    <ul class="nav-list">
                        ${generateNavigation(item.items, item.path)}
                    </ul>
                </div>
            `;
        } else {
            const isActive = currentPath === item.path;
            const href = item.path.replace(/\.md$/, '.html').replace(/\\/g, '/');
            nav += `
                <li class="nav-item">
                    <a href="${href}" class="nav-link ${isActive ? 'active' : ''}">${item.name.replace('-', ' ')}</a>
                </li>
            `;
        }
    }
    
    return nav;
}

// Main generation function
function generateDocs() {
    console.log('🚀 Generating HTML documentation...');
    
    const outputDir = join(rootDir, 'build');
    if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
    }
    
    // Scan for markdown files
    const docItems = scanDirectory(rootDir);
    console.log(`📋 Found ${JSON.stringify(docItems, null, 2)}`);
    
    // Generate index page
    const indexContent = `
        <div class="card">
            <div class="card-header">
                <h2 class="card-title">Welcome to SaaS BI Platform Documentation</h2>
            </div>
            <p>This documentation provides comprehensive information about our Business Intelligence as a Service platform.</p>
            
            <h3>📚 Available Sections</h3>
            <ul>
                ${docItems.map(item => {
                    if (item.type === 'directory') {
                        return `<li><strong>${item.name}</strong> - ${item.items.length} documents</li>`;
                    } else {
                        return `<li><a href="${item.path.replace(/\.md$/, '.html')}">${item.name}</a></li>`;
                    }
                }).join('')}
            </ul>
        </div>
    `;
    
    const navigation = generateNavigation(docItems);
    
    const indexHtml = htmlTemplate
        .replace('{{TITLE}}', 'Documentation Home')
        .replace('{{DESCRIPTION}}', 'Complete guide and reference for the SaaS BI Platform')
        .replace('{{NAVIGATION}}', navigation)
        .replace('{{CONTENT}}', indexContent);
    
    writeFileSync(join(outputDir, 'index.html'), indexHtml);
    console.log('✅ Generated index.html');
    
    // Generate pages for each markdown file
    function processItems(items, basePath = '') {
        for (const item of items) {
            if (item.type === 'directory') {
                const dirPath = join(outputDir, basePath, item.name);
                if (!existsSync(dirPath)) {
                    mkdirSync(dirPath, { recursive: true });
                }
                processItems(item.items, join(basePath, item.name));
            } else {
                try {
                    const content = readFileSync(item.fullPath, 'utf8');
                    const htmlContent = markdownToHtml(content);
                    
                    const title = item.name.charAt(0).toUpperCase() + item.name.slice(1).replace('-', ' ');
                    const description = `Documentation for ${title}`;
                    
                    const html = htmlTemplate
                        .replace('{{TITLE}}', title)
                        .replace('{{DESCRIPTION}}', description)
                        .replace('{{NAVIGATION}}', generateNavigation(docItems, item.path))
                        .replace('{{CONTENT}}', htmlContent);
                    
                    const outputPath = join(outputDir, basePath, item.file.replace(/\.md$/, '.html'));
                    const outputDirPath = dirname(outputPath);
                    
                    if (!existsSync(outputDirPath)) {
                        mkdirSync(outputDirPath, { recursive: true });
                    }
                    
                    writeFileSync(outputPath, html);
                    console.log(`✅ Generated ${item.file.replace(/\.md$/, '.html')}`);
                } catch (error) {
                    console.error(`❌ Error processing ${item.file}:`, error.message);
                }
            }
        }
    }
    
    processItems(docItems);
    
    console.log(`🎉 Documentation generated successfully in ${outputDir}`);
    console.log(`📂 Open ${join(outputDir, 'index.html')} in your browser to view the documentation`);
}

// Run the generator
if (process.argv[1] && process.argv[1].includes('generate-html-docs.mjs')) {
    generateDocs();
}

export { generateDocs };
