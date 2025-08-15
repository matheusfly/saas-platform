#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, basename } from 'path';
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
    <title>SaaS BI Platform - Complete Documentation</title>
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

        .mermaid {
            background-color: var(--background-color);
            padding: 1.5rem;
            border-radius: 0.5rem;
            border: 1px solid var(--border-color);
            text-align: center;
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
            grid-template-columns: 300px 1fr;
            min-height: 100vh;
            max-width: 1600px;
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

        /* Section dividers */
        .section-divider {
            margin: 3rem 0;
            padding: 2rem 0;
            border-top: 2px solid var(--border-color);
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

        /* Back to top button */
        .back-to-top {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: var(--primary-color);
            color: white;
            width: 3rem;
            height: 3rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            box-shadow: var(--shadow-lg);
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .back-to-top.visible {
            opacity: 1;
        }

        .back-to-top:hover {
            background: #1d4ed8;
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
                <h1 class="content-title">Complete Documentation</h1>
                <p class="content-description">All documentation for the SaaS BI Platform in one place</p>
            </header>
            <div class="content-body">
                {{CONTENT}}
            </div>
        </main>
    </div>
    <a href="#" class="back-to-top" id="backToTop">↑</a>
    <script>
        // Back to top button functionality
        const backToTopButton = document.getElementById('backToTop');
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });
        
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    window.scrollTo({
                        top: target.offsetTop - 20,
                        behavior: 'smooth'
                    });
                }
            });
        });
        
        // Error handling
        window.addEventListener('error', function (e) {
            console.error(e);
        });
        
        // Check if Mermaid.js is loaded
        if (typeof mermaid !== 'undefined') {
            console.log('Mermaid.js loaded successfully');
            try {
                // Initialize Mermaid.js for diagram rendering
                mermaid.initialize({ startOnLoad: true });
            } catch (e) {
                console.error('Error initializing Mermaid.js:', e);
            }
        } else {
            console.error('Mermaid.js failed to load');
        }
    </script>
    <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
</body>
</html>`;

// Function to convert markdown to HTML (basic)
function markdownToHtml(markdown) {
    let html = markdown
        // Headers
        .replace(/^###### (.*$)/gim, '<h6 id="$1">$1</h6>')
        .replace(/^##### (.*$)/gim, '<h5 id="$1">$1</h5>')
        .replace(/^#### (.*$)/gim, '<h4 id="$1">$1</h4>')
        .replace(/^### (.*$)/gim, '<h3 id="$1">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 id="$1">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 id="$1">$1</h1>')
        
        // Code blocks
        .replace(/```mermaid([^`]+)```/gim, '<div class="mermaid">$1</div>')
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
    
    // Add IDs to headers for navigation
    html = html.replace(/<h[1-6]>([^<]+)<\/h[1-6]>/gim, function(match, content) {
        const id = content.toLowerCase().replace(/[^a-z0-9]/g, '-');
        return match.replace(/<h[1-6]>/, `<h$1 id="${id}">`).replace(/<\/h[1-6]>/, '</h$1>');
    });

    // Clean up
    html = html
        .replace(/<p><\/p>/gim, '')
        .replace(/<p>(<h[1-6][^>]*>)/gim, '$1')
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
function generateNavigation(items, prefix = '') {
    let nav = '';
    
    for (const item of items) {
        if (item.type === 'directory') {
            nav += `
                <div class="nav-section">
                    <h3>${item.name.charAt(0).toUpperCase() + item.name.slice(1).replace(/-/g, ' ')}</h3>
                    <ul class="nav-list">
                        ${generateNavigation(item.items, prefix + item.name + '/')}
                    </ul>
                </div>
            `;
        } else {
            const id = (prefix + item.name).toLowerCase().replace(/[^a-z0-9]/g, '-');
            nav += `
                <li class="nav-item">
                    <a href="#${id}" class="nav-link">${item.name.replace(/-/g, ' ')}</a>
                </li>
            `;
        }
    }
    
    return nav;
}

// Function to generate content HTML
function generateContent(items, prefix = '') {
    let content = '';
    
    for (const item of items) {
        if (item.type === 'directory') {
            const sectionTitle = item.name.charAt(0).toUpperCase() + item.name.slice(1).replace(/-/g, ' ');
            content += `<div class="section-divider"><h1>${sectionTitle}</h1></div>`;
            content += generateContent(item.items, prefix + item.name + '/');
        } else {
            try {
                const fileContent = readFileSync(item.fullPath, 'utf8');
                const htmlContent = markdownToHtml(fileContent);
                const id = (prefix + item.name).toLowerCase().replace(/[^a-z0-9]/g, '-');
                const title = item.name.charAt(0).toUpperCase() + item.name.slice(1).replace(/-/g, ' ');
                
                content += `<div id="${id}"><h1>${title}</h1>${htmlContent}</div>`;
            } catch (error) {
                console.error(`Error processing ${item.file}:`, error.message);
            }
        }
    }
    
    return content;
}

// Main generation function
async function generateSingleDoc() {
    console.log('🚀 Generating single HTML documentation...');
    
    // Define documentation directories
    const docDirs = [
        { path: join(rootDir, '..'), name: 'Main Documentation' },
        { path: join(rootDir, '..', 'documentation', 'docusaurus', 'docs'), name: 'User Guide' },
        { path: join(rootDir, '..', 'documentacao'), name: 'Technical Documentation' }
    ];
    
    const allItems = [];
    
    // Scan all documentation directories
    for (const docDir of docDirs) {
        if (existsSync(docDir.path)) {
            console.log(`🔍 Scanning ${docDir.name} in ${docDir.path}`);
            const items = scanDirectory(docDir.path);
            if (items.length > 0) {
                allItems.push({
                    type: 'directory',
                    name: docDir.name,
                    path: '',
                    items: items
                });
            }
        }
    }
    
    console.log(`📋 Found ${allItems.length} documentation sections`);
    
    // Generate navigation
    const navigation = generateNavigation(allItems);
    
    // Generate content
    const content = generateContent(allItems);
    
    // Create final HTML
    const finalHtml = htmlTemplate
        .replace('{{NAVIGATION}}', navigation)
        .replace('{{CONTENT}}', content);
    
    // Write to file
    const outputPath = join(rootDir, 'docs.html');
    writeFileSync(outputPath, finalHtml);
    
    console.log(`✅ Successfully generated ${outputPath}`);
    
    // Open the generated HTML file in the browser
    const open = await import('open');
    open.default(outputPath);
}

// Run the generator
if (process.argv[1] && process.argv[1].includes('generate-single-docs.mjs')) {
    generateSingleDoc();
}

export { generateSingleDoc };