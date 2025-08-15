# Textual TUI Demo App Documentation

This document provides comprehensive documentation for the Textual TUI demo application, explaining each component, design pattern, and implementation detail.

## Table of Contents
- [Textual TUI Demo App Documentation](#textual-tui-demo-app-documentation)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Application Structure](#application-structure)
  - [Key Components](#key-components)
    - [DemoApp Class](#demoapp-class)
    - [Widgets](#widgets)
      - [Header and Footer](#header-and-footer)
      - [Static](#static)
      - [Button](#button)
      - [ProgressBar](#progressbar)
      - [RichLog](#richlog)
      - [Container and VerticalScroll](#container-and-verticalscroll)
  - [Event Handling](#event-handling)
  - [Reactive Programming](#reactive-programming)
  - [CSS Styling](#css-styling)
  - [Background Tasks](#background-tasks)
  - [Usage Guide](#usage-guide)

## Overview

The DemoApp is a comprehensive Textual application that demonstrates advanced concepts in Terminal User Interface (TUI) development. It showcases:

- Complex layout management using CSS Grid
- Interactive components with real-time feedback
- Reactive programming patterns
- Background task execution with progress tracking
- Live terminal output display
- Dynamic styling and theme management

## Application Structure

The application follows a modular structure with the following key elements:

1. **App Class** (`DemoApp`) - The main application class that orchestrates all components
2. **Widgets** - UI components that handle specific functionality
3. **Layout Containers** - Organize widgets in a structured layout
4. **Event Handlers** - Process user interactions and system events
5. **Reactive Attributes** - Manage state changes automatically
6. **Background Workers** - Handle long-running tasks without blocking the UI

## Key Components

### DemoApp Class

The main application class that inherits from `textual.app.App`. It serves as the central controller for the entire application.

Key features:
- CSS styling through inline CSS or external files
- Keyboard bindings for user actions
- Widget composition and layout management
- Event handling and state management

### Widgets

#### Header and Footer
Standard Textual widgets that provide application title and key bindings information.

#### Static
Used for displaying static text content with styling.

#### Button
Interactive components that trigger actions when pressed.

#### ProgressBar
Visual indicator for task progress.

#### RichLog
Advanced text display widget that supports rich text formatting and auto-scrolling.

#### Container and VerticalScroll
Layout containers that organize widgets and provide scrolling functionality.

## Event Handling

The application uses Textual's event system to respond to user interactions:

1. **Button Press Events** - Handle user clicks on buttons
2. **Key Binding Actions** - Process keyboard shortcuts
3. **Mount Events** - Initialize components when added to the app
4. **Reactive Watchers** - Respond to state changes automatically

## Reactive Programming

Reactive attributes automatically update the UI when their values change:

- `auto_scroll` - Controls whether the output log auto-scrolls
- `task_running` - Tracks the state of background tasks

## CSS Styling

The application uses Textual's CSS-like styling system with:

- CSS variables for consistent theming
- Grid layouts for responsive design
- Nested selectors for component-specific styling
- Dynamic classes for state-based styling

## Background Tasks

Long-running operations are handled using Textual's `@work` decorator:

- Executes tasks in separate threads
- Uses `call_from_thread` to safely update UI from background threads
- Provides progress feedback to users

## Usage Guide

To run the application:
```bash
python textual_demo_app/demo_app.py
```

Key keyboard shortcuts:
- `d` - Toggle dark mode
- `s` - Toggle sidebar visibility
- `c` - Change grid cell colors
- `r` - Run simulated process
- `Ctrl+C` - Exit the application

Interactive features:
- Click "Run Process" button to start a simulated long-running task
- Click "Clear Output" to clear the terminal log
- Click "Toggle Auto-scroll" to control log scrolling behavior
- Click "Toggle Highlight" in the sidebar to highlight items
