#!/usr/bin/env node

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

/**
 * Parse PROJECT_STATUS.md and extract unchecked items organized by sections
 */
function parseProjectStatus() {
  const projectStatusPath = join(rootDir, 'PROJECT_STATUS.md');
  
  if (!existsSync(projectStatusPath)) {
    console.error('❌ PROJECT_STATUS.md not found');
    process.exit(1);
  }

  const content = readFileSync(projectStatusPath, 'utf8');
  const lines = content.split('\n');
  
  const sections = [];
  let currentSection = null;
  let currentSubsection = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Match main sections (## heading)
    const mainSectionMatch = line.match(/^##\s+(.+)/);
    if (mainSectionMatch) {
      const title = mainSectionMatch[1];
      // Skip certain sections we don't want in roadmap
      if (title.includes('Current Status') || title.includes('Performance Metrics') || 
          title.includes('Recent Changes') || title.includes('Technical Debt') ||
          title.includes('Resource Allocation')) {
        currentSection = null;
        continue;
      }
      
      currentSection = {
        title: title.replace(/[🚦📊🚀📝📈🐛🔄🏗🎯📅]/g, '').trim(),
        slug: title.toLowerCase()
          .replace(/[🚦📊🚀📝📈🐛🔄🏗🎯📅]/g, '')
          .replace(/[^a-z0-9\s]/g, '')
          .trim()
          .replace(/\s+/g, '-')
          .replace(/^-+|-+$/g, ''),
        subsections: [],
        items: []
      };
      sections.push(currentSection);
      continue;
    }
    
    // Match subsections (### heading)
    const subSectionMatch = line.match(/^###\s+(.+)/);
    if (subSectionMatch && currentSection) {
      const title = subSectionMatch[1];
      currentSubsection = {
        title: title.replace(/[✅⚠️🔴]/g, '').trim(),
        items: []
      };
      currentSection.subsections.push(currentSubsection);
      continue;
    }
    
    // Match unchecked items (- [ ] ...)
    const uncheckedMatch = line.match(/^-\s+\[\s*\]\s+(.+)/);
    if (uncheckedMatch && (currentSection || currentSubsection)) {
      const item = {
        text: uncheckedMatch[1].trim(),
        priority: 'medium', // default priority
        category: currentSubsection ? currentSubsection.title : 'General'
      };
      
      // Determine priority based on keywords or context
      if (item.text.toLowerCase().includes('security') || 
          item.text.toLowerCase().includes('critical') ||
          item.text.toLowerCase().includes('memory leak') ||
          item.text.toLowerCase().includes('authentication token')) {
        item.priority = 'high';
      } else if (item.text.toLowerCase().includes('console warning') || 
                 item.text.toLowerCase().includes('tooltip') ||
                 item.text.toLowerCase().includes('loading state')) {
        item.priority = 'low';
      }
      
      if (currentSubsection) {
        currentSubsection.items.push(item);
      } else {
        currentSection.items.push(item);
      }
    }
  }
  
  return sections.filter(section => 
    section.items.length > 0 || 
    section.subsections.some(sub => sub.items.length > 0)
  );
}

/**
 * Generate markdown content for a roadmap section
 */
function generateSectionMarkdown(section) {
  let markdown = '';
  
  // Front matter for Docusaurus
  markdown += '---\n';
  markdown += `title: "${section.title}"\n`;
  markdown += `id: ${section.slug}\n`;
  markdown += `sidebar_position: ${getSidebarPosition(section.title)}\n`;
  markdown += '---\n\n';
  
  markdown += `# ${section.title}\n\n`;
  
  // Add description based on section title
  const description = getSectionDescription(section.title);
  if (description) {
    markdown += `${description}\n\n`;
  }
  
  // Process subsections
  if (section.subsections.length > 0) {
    section.subsections.forEach(subsection => {
      if (subsection.items.length > 0) {
        markdown += `## ${subsection.title}\n\n`;
        
        // Group items by priority
        const priorityGroups = groupItemsByPriority(subsection.items);
        
        Object.entries(priorityGroups).forEach(([priority, items]) => {
          if (items.length > 0) {
            markdown += `### ${getPriorityTitle(priority)}\n\n`;
            items.forEach(item => {
              const priorityIcon = getPriorityIcon(priority);
              markdown += `- ${priorityIcon} ${item.text}\n`;
            });
            markdown += '\n';
          }
        });
      }
    });
  }
  
  // Process direct section items
  if (section.items.length > 0) {
    const priorityGroups = groupItemsByPriority(section.items);
    
    Object.entries(priorityGroups).forEach(([priority, items]) => {
      if (items.length > 0) {
        markdown += `## ${getPriorityTitle(priority)}\n\n`;
        items.forEach(item => {
          const priorityIcon = getPriorityIcon(priority);
          markdown += `- ${priorityIcon} ${item.text}\n`;
        });
        markdown += '\n';
      }
    });
  }
  
  // Add metadata footer
  markdown += '---\n\n';
  markdown += '*This roadmap is automatically generated from PROJECT_STATUS.md*\n';
  markdown += `*Last updated: ${new Date().toISOString().split('T')[0]}*\n`;
  
  return markdown;
}

/**
 * Group items by priority
 */
function groupItemsByPriority(items) {
  return items.reduce((groups, item) => {
    const priority = item.priority || 'medium';
    if (!groups[priority]) {
      groups[priority] = [];
    }
    groups[priority].push(item);
    return groups;
  }, {});
}

/**
 * Get priority title
 */
function getPriorityTitle(priority) {
  const titles = {
    'high': 'High Priority',
    'medium': 'Medium Priority', 
    'low': 'Low Priority'
  };
  return titles[priority] || 'Items';
}

/**
 * Get priority icon
 */
function getPriorityIcon(priority) {
  const icons = {
    'high': '🔴',
    'medium': '🟡',
    'low': '🔵'
  };
  return icons[priority] || '⚪';
}

/**
 * Get sidebar position for section ordering
 */
function getSidebarPosition(title) {
  const positions = {
    'Current Focus': 1,
    'Upcoming Roadmap': 2,
    'Known Issues': 3,
    'In Progress': 4,
    'Focus Areas for Next Release': 5,
    'Upcoming Milestones': 6
  };
  return positions[title] || 10;
}

/**
 * Get section description
 */
function getSectionDescription(title) {
  const descriptions = {
    'Current Focus': 'Items currently being worked on in active sprints.',
    'Upcoming Roadmap': 'Features and improvements planned for future releases.',
    'Known Issues': 'Identified bugs and issues that need to be addressed.',
    'In Progress': 'Work that is currently underway.',
    'Focus Areas for Next Release': 'Key areas of improvement for the upcoming release.',
    'Upcoming Milestones': 'Important deadlines and deliverables.'
  };
  return descriptions[title];
}

/**
 * Generate overview/index file for the roadmap
 */
function generateOverviewMarkdown(sections) {
  let markdown = '';
  
  // Front matter
  markdown += '---\n';
  markdown += 'title: "Roadmap Overview"\n';
  markdown += 'id: overview\n';
  markdown += 'sidebar_position: 0\n';
  markdown += 'slug: /roadmap\n';
  markdown += '---\n\n';
  
  markdown += '# Project Roadmap\n\n';
  markdown += 'This roadmap shows all pending tasks and future plans extracted from our project status.\n\n';
  
  // Summary statistics
  const totalItems = sections.reduce((total, section) => {
    const sectionItems = section.items.length;
    const subsectionItems = section.subsections.reduce((subTotal, sub) => subTotal + sub.items.length, 0);
    return total + sectionItems + subsectionItems;
  }, 0);
  
  markdown += `## Summary\n\n`;
  markdown += `- **Total pending items**: ${totalItems}\n`;
  markdown += `- **Sections**: ${sections.length}\n`;
  markdown += `- **Last updated**: ${new Date().toISOString().split('T')[0]}\n\n`;
  
  // Section links
  markdown += '## Sections\n\n';
  sections.forEach(section => {
    const itemCount = section.items.length + section.subsections.reduce((total, sub) => total + sub.items.length, 0);
    markdown += `- [${section.title}](./${section.slug}) (${itemCount} items)\n`;
  });
  
  markdown += '\n---\n\n';
  markdown += '*This roadmap is automatically generated from PROJECT_STATUS.md*\n';
  
  return markdown;
}

/**
 * Main function to generate all roadmap documentation
 */
function generateRoadmapDocs() {
  console.log('🚀 Generating roadmap documentation...');
  
  // Parse PROJECT_STATUS.md
  const sections = parseProjectStatus();
  console.log(`📋 Found ${sections.length} sections with pending items`);
  
  // Ensure roadmap directory exists
  const roadmapDir = join(rootDir, 'docs', 'roadmap');
  if (!existsSync(roadmapDir)) {
    mkdirSync(roadmapDir, { recursive: true });
    console.log(`📁 Created roadmap directory: ${roadmapDir}`);
  }
  
  // Generate overview file
  const overviewMarkdown = generateOverviewMarkdown(sections);
  const overviewPath = join(roadmapDir, 'index.md');
  writeFileSync(overviewPath, overviewMarkdown);
  console.log(`✅ Generated overview: ${overviewPath}`);
  
  // Generate individual section files
  let generatedFiles = 1; // counting overview
  sections.forEach(section => {
    const markdown = generateSectionMarkdown(section);
    const filePath = join(roadmapDir, `${section.slug}.md`);
    writeFileSync(filePath, markdown);
    console.log(`✅ Generated section: ${filePath}`);
    generatedFiles++;
  });
  
  console.log(`🎉 Successfully generated ${generatedFiles} roadmap files!`);
  
  // Output file list for verification
  console.log('\n📄 Generated files:');
  console.log(`   - docs/roadmap/index.md (overview)`);
  sections.forEach(section => {
    console.log(`   - docs/roadmap/${section.slug}.md`);
  });
}

// Run the script
if (process.argv[1] && import.meta.url.includes(process.argv[1].replace(/\\/g, '/'))) {
  console.log('🏁 Starting roadmap generation script...');
  try {
    generateRoadmapDocs();
  } catch (error) {
    console.error('❌ Error generating roadmap docs:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

export { generateRoadmapDocs };
