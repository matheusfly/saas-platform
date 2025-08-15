# Textual TUI Development Guide

This guide provides a comprehensive overview of developing Terminal User Interface (TUI) applications using the Textual framework.

## Table of Contents
1. [Introduction to Textual](#introduction-to-textual)
2. [Setting Up Your Development Environment](#setting-up-your-development-environment)
3. [Core Concepts](#core-concepts)
4. [Application Structure](#application-structure)
5. [Widgets](#widgets)
6. [Layout Management](#layout-management)
7. [Styling with CSS](#styling-with-css)
8. [Event Handling](#event-handling)
9. [Reactive Programming](#reactive-programming)
10. [Background Tasks](#background-tasks)
11. [Best Practices](#best-practices)
12. [Testing](#testing)
13. [Deployment](#deployment)

## Introduction to Textual

Textual is a Python framework for creating Terminal User Interface (TUI) applications. It provides a rich set of tools for building interactive command-line applications with sophisticated user interfaces.

Key features:
- Rich widget library
- CSS-like styling system
- Responsive layout engine
- Event-driven architecture
- Reactive programming model
- Cross-platform compatibility

## Setting Up Your Development Environment

### Installation

Install Textual using pip:
```bash
pip install textual
```

For development tools:
```bash
pip install textual-dev
```

### Basic Requirements
- Python 3.8 or later
- Terminal that supports ANSI escape sequences
- For Windows: Windows Terminal is recommended

## Core Concepts

### App Class
The `App` class is the foundation of any Textual application. It manages the application lifecycle, handles events, and orchestrates the UI.

```python
from textual.app import App

class MyApp(App):
    pass
```

### Widgets
Widgets are the building blocks of your UI. They handle rendering, user interaction, and state management.

### Compose Method
The `compose` method defines the structure of your application by yielding widgets.

### Events
Textual uses an event system to handle user interactions and system events.

### Reactive Attributes
Reactive attributes automatically update the UI when their values change.

## Application Structure

A typical Textual application follows this structure:

```python
from textual.app import App, ComposeResult
from textual.widgets import Header, Footer

class MyApp(App):
    def compose(self) -> ComposeResult:
        yield Header()
        # Your widgets here
        yield Footer()
        
    def on_mount(self) -> None:
        # Initialization code
        
    # Event handlers
    def on_button_pressed(self, event) -> None:
        pass

if __name__ == "__main__":
    app = MyApp()
    app.run()
```

## Widgets

### Built-in Widgets
Textual provides a rich set of built-in widgets:

- `Button` - Interactive button
- `Label` - Text display
- `Input` - Text input field
- `TextArea` - Multi-line text editor
- `DataTable` - Tabular data display
- `Tree` - Hierarchical data display
- `ProgressBar` - Progress indicator
- `RichLog` - Rich text log display
- `Header`/`Footer` - Application chrome

### Custom Widgets
Create custom widgets by extending existing ones or the base `Widget` class:

```python
from textual.widget import Widget
from textual.containers import Container

class CustomWidget(Widget):
    def render(self):
        return "Custom Content"
```

## Layout Management

### Containers
Containers organize widgets in layouts:
- `Container` - Generic container
- `Vertical` - Stack widgets vertically
- `Horizontal` - Arrange widgets horizontally
- `Grid` - Grid-based layout

### CSS Grid
Textual uses a CSS Grid-like system for complex layouts:

```python
CSS = """
Screen {
    layout: grid;
    grid-size: 2;
    grid-columns: 1fr 3fr;
}
"""
```

## Styling with CSS

Textual uses a CSS-like styling system:

### Basic Styling
```css
WidgetName {
    background: blue;
    color: white;
    padding: 1;
}
```

### CSS Variables
```css
$primary-color: #007bff;

Button {
    background: $primary-color;
}
```

### Selectors
- `#id` - Select by ID
- `.class` - Select by class
- `WidgetName` - Select by widget type
- `Parent Child` - Descendant selector

## Event Handling

### Message Handlers
Handle events with methods named `on_eventname`:

```python
def on_button_pressed(self, event: Button.Pressed) -> None:
    # Handle button press
```

### Actions
Define actions that can be triggered by key bindings:

```python
BINDINGS = [
    ("d", "toggle_dark", "Toggle dark mode"),
]

def action_toggle_dark(self) -> None:
    # Toggle dark mode
```

## Reactive Programming

### Reactive Attributes
Define reactive attributes that automatically update the UI:

```python
from textual.reactive import reactive

class MyWidget(Widget):
    value = reactive(0)
    
    def watch_value(self, value: int) -> None:
        # Called when value changes
        self.update(str(value))
```

### Computed Properties
Create computed properties that depend on other reactive attributes:

```python
@property
def derived_value(self) -> str:
    return f"Value: {self.value}"
```

## Background Tasks

### @work Decorator
Run long-running tasks in background threads:

```python
from textual import work

class MyApp(App):
    @work(exclusive=True)
    async def long_running_task(self) -> None:
        # Long running operation
        pass
```

### Thread Safety
Use `call_from_thread` to safely update UI from background threads:

```python
self.call_from_thread(self.update_display, data)
```

## Best Practices

### Performance
- Minimize DOM queries
- Use reactive attributes for state management
- Avoid unnecessary widget updates

### Code Organization
- Separate concerns into different widgets
- Use composition over inheritance
- Keep event handlers focused

### Error Handling
- Handle exceptions in event handlers
- Provide user feedback for errors
- Log errors for debugging

### Accessibility
- Provide keyboard navigation
- Use semantic widget names
- Include screen reader support

## Testing

### Unit Testing
Test individual widgets and components:

```python
import pytest
from textual.widgets import Button

def test_button_pressed():
    button = Button("Click me")
    # Test button behavior
```

### Integration Testing
Test the complete application flow:

```python
from textual.app import App
from textual.pilot import Pilot

async def test_app():
    async with App().run_test() as pilot:
        # Test application behavior
```

## Deployment

### Packaging
Package your application with setuptools or poetry:

```toml
[tool.poetry.dependencies]
python = "^3.8"
textual = "^0.1.0"
```

### Distribution
Distribute as:
- Standalone Python package
- Executable with PyInstaller
- Docker container

### Performance Optimization
- Use `__slots__` for widgets
- Minimize widget creation
- Cache expensive computations

## Advanced Topics

### Custom Renderables
Create custom visual elements using Rich:

```python
from rich.text import Text

class MyWidget(Widget):
    def render(self) -> Text:
        return Text("Custom text")
```

### Animations
Add animations for enhanced user experience:

```python
self.styles.animate("opacity", 0.5, duration=0.5)
```

### Internationalization
Support multiple languages with translation files.

### Theming
Create custom themes for different visual styles.

## Troubleshooting

### Common Issues
- Widget not updating: Check reactive attributes
- Layout problems: Verify CSS grid settings
- Event not firing: Confirm event handler naming

### Debugging Tools
- Use `textual console` for development
- Enable logging for detailed output
- Use the devtools for CSS live editing

### Performance Profiling
- Use Python's cProfile module
- Monitor widget update frequency
- Optimize expensive render operations

## Resources

### Official Documentation
- [Textual Documentation](https://textual.textualize.io/)
- [Textual GitHub Repository](https://github.com/Textualize/textual)

### Community
- Textual Discord server
- GitHub discussions
- Stack Overflow

### Examples
- Textual examples repository
- Community showcase projects
- Tutorial applications
