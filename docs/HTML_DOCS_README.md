# 📊 HTML Documentation Generator

## Overview

This is a simple, elegant HTML documentation generator that converts your Markdown files into beautiful, styled HTML documentation with proper navigation and indexing.

## ✨ Features

- **Beautiful Design**: Modern, professional styling with a clean sidebar navigation
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile devices
- **Smart Navigation**: Automatically generates hierarchical navigation from your file structure
- **Markdown Support**: Converts Markdown to HTML with proper formatting
- **Fast & Lightweight**: No complex build process, just pure HTML/CSS/JS
- **Well Organized**: Maintains your directory structure in the output

## 🚀 Quick Start

### Generate Documentation

```bash
# From the docs directory
npm run build:html

# Or run directly
node generate-html-docs.mjs
```

### View Documentation

The generated documentation will be in the `build/` directory. Open `build/index.html` in your browser to view the documentation.

## 📁 File Structure

The generator automatically scans all `.md` files in the current directory and subdirectories, creating:

```
build/
├── index.html              # Main documentation homepage
├── README.html              # Generated from README.md
├── dev_tools_cli.html       # Generated from dev_tools_cli.md
├── blog/                    # Blog section
│   ├── 2019-05-28-first-blog-post.html
│   └── 2019-05-29-long-blog-post.html
├── developer-handbook/      # Developer guides
│   ├── cli-cheat-sheet.html
│   ├── docker-troubleshooting.html
│   └── ...
└── roadmap/                 # Project roadmap
    ├── current-focus.html
    ├── known-issues.html
    └── ...
```

## 🎨 Styling Features

- **Modern Color Scheme**: Professional blue and gray color palette
- **Typography**: Beautiful, readable fonts with proper spacing
- **Navigation**: Sticky sidebar with organized sections
- **Code Highlighting**: Syntax-friendly code blocks
- **Cards & Lists**: Well-formatted content containers
- **Responsive Design**: Mobile-friendly layout

## 📝 Markdown Support

The generator supports:

- Headers (`#`, `##`, `###`)
- **Bold** and *italic* text
- `inline code` and code blocks
- [Links](url)
- Lists (bulleted and numbered)
- Tables
- Line breaks and paragraphs

## ⚙️ Customization

You can customize the generated documentation by editing the `generate-html-docs.mjs` file:

- **Colors**: Modify CSS variables in the `:root` section
- **Layout**: Adjust grid template and spacing
- **Styling**: Update component styles
- **Content**: Modify templates and content generation

## 🔄 Regenerating Documentation

Every time you run the generator, it:

1. Scans all `.md` files in the directory tree
2. Converts them to HTML with beautiful styling
3. Generates navigation based on your file structure
4. Creates a comprehensive index page
5. Organizes everything in the `build/` directory

## 📊 What Makes This Special

Unlike complex documentation systems like Docusaurus, this generator:

- ✅ **Simple**: One script, no complex configuration
- ✅ **Fast**: Generates documentation in seconds
- ✅ **Beautiful**: Professional, modern design
- ✅ **Organized**: Smart navigation and indexing
- ✅ **Portable**: Pure HTML/CSS, works anywhere
- ✅ **Customizable**: Easy to modify and extend

## 🎯 Perfect For

- **Project Documentation**: API docs, guides, tutorials
- **Knowledge Bases**: Internal documentation, procedures
- **Blogs**: Static blog generation from Markdown
- **Portfolios**: Showcase your projects and work
- **Teams**: Shared documentation that looks professional

---

*Generated with ❤️ by the SaaS BI Platform Documentation System*
