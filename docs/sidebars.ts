import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  docsSidebar: [
    'README',
    {
      type: 'category',
      label: 'Developer Handbook',
      items: [
        'developer-handbook/cli-cheat-sheet',
        'developer-handbook/docker-troubleshooting',
        'developer-handbook/future-docker-topics',
        'developer-handbook/performance-reliability',
        'developer-handbook/roadmap-integration',
        'developer-handbook/runtime-architecture',
        'developer-handbook/testing-strategy',
      ],
    },
    {
      type: 'category',
      label: 'Roadmap',
      items: [
        'roadmap/current-focus',
        'roadmap/documentation-status',
        'roadmap/in-progress',
        'roadmap/known-issues',
        'roadmap/upcoming-roadmap',
      ],
    },
    'dev-tools-cli',
  ],

  // But you can create a sidebar manually
  /*
  tutorialSidebar: [
    'intro',
    'hello',
    {
      type: 'category',
      label: 'Tutorial',
      items: ['tutorial-basics/create-a-document'],
    },
  ],
   */
};

export default sidebars;
