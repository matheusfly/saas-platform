# Textual Method Guides

This document provides detailed guides for implementing common patterns and methods in Textual TUI applications.

## Table of Contents
1. [Creating Responsive Layouts](#creating-responsive-layouts)
2. [Implementing Interactive Components](#implementing-interactive-components)
3. [Managing State with Reactive Attributes](#managing-state-with-reactive-attributes)
4. [Handling User Input and Events](#handling-user-input-and-events)
5. [Displaying Live Output and Logs](#displaying-live-output-and-logs)
6. [Creating Custom Widgets](#creating-custom-widgets)
7. [Background Task Management](#background-task-management)
8. [Styling with CSS](#styling-with-css)
9. [Error Handling and Validation](#error-handling-and-validation)
10. [Testing Textual Applications](#testing-textual-applications)

## Creating Responsive Layouts

### Grid-Based Layouts

Textual's grid system provides powerful layout capabilities:

```python
CSS = """
Screen {
    layout: grid;
    grid-size: 3;  /* 3 columns */
    grid-columns: 1fr 2fr 1fr;  /* Column proportions */
    grid-rows: auto 1fr auto;  /* Row proportions */
}
"""
```

### Nested Layouts

Combine containers for complex layouts:

```python
def compose(self) -> ComposeResult:
    with Container(id="main-container"):
        with Horizontal():
            yield Sidebar()
            with Vertical():
                yield Header()
                yield ContentArea()
                yield Footer()
```

### Responsive Design

Use CSS media queries for different terminal sizes:

```css
/* Default styles */
Widget {
    width: 100%;
}

/* For wider terminals */
@media (min-width: 120) {
    Widget {
        width: 50%;
    }
}
```

## Implementing Interactive Components

### Button Handling

Create buttons with event handlers:

```python
def compose(self) -> ComposeResult:
    yield Button("Submit", id="submit-btn", variant="primary")
    yield Button("Cancel", id="cancel-btn", variant="error")

def on_button_pressed(self, event: Button.Pressed) -> None:
    if event.button.id == "submit-btn":
        self.handle_submit()
    elif event.button.id == "cancel-btn":
        self.handle_cancel()
```

### Input Fields

Handle user input with validation:

```python
def compose(self) -> ComposeResult:
    yield Input(placeholder="Enter your name", id="name-input")

def on_input_changed(self, event: Input.Changed) -> None:
    if event.input.id == "name-input":
        self.validate_name(event.value)

def validate_name(self, name: str) -> None:
    if len(name) < 2:
        self.notify("Name must be at least 2 characters", severity="error")
```

### Keyboard Shortcuts

Define keyboard bindings for quick actions:

```python
BINDINGS = [
    ("ctrl+s", "save", "Save"),
    ("ctrl+o", "open", "Open"),
    ("ctrl+q", "quit", "Quit"),
]

def action_save(self) -> None:
    # Save functionality
    pass

def action_open(self) -> None:
    # Open functionality
    pass

def action_quit(self) -> None:
    self.exit()
```

## Managing State with Reactive Attributes

### Basic Reactive Attributes

Define attributes that automatically update the UI:

```python
from textual.reactive import reactive

class Counter(Widget):
    count = reactive(0)
    
    def watch_count(self, count: int) -> None:
        """Called when count changes"""
        self.update(f"Count: {count}")
    
    def increment(self) -> None:
        self.count += 1
```

### Computed Properties

Create properties that depend on reactive attributes:

```python
class ProgressBarWidget(Widget):
    current = reactive(0)
    total = reactive(100)
    
    @property
    def percentage(self) -> float:
        return (self.current / self.total) * 100 if self.total > 0 else 0
    
    def watch_current(self, current: int) -> None:
        self.update_progress()
    
    def update_progress(self) -> None:
        # Update visual representation
        pass
```

### Reactive Collections

Manage collections of data reactively:

```python
from textual.reactive import var

class TodoList(Widget):
    todos = var([])
    
    def add_todo(self, todo: str) -> None:
        self.todos = self.todos + [todo]
        self.refresh()
    
    def remove_todo(self, index: int) -> None:
        self.todos = [todo for i, todo in enumerate(self.todos) if i != index]
        self.refresh()
```

## Handling User Input and Events

### Event Handler Patterns

Use specific event handlers for different interactions:

```python
def on_key(self, event: events.Key) -> None:
    """Handle key presses"""
    if event.key == "enter":
        self.submit_form()
    elif event.key == "escape":
        self.cancel_operation()

def on_click(self, event: events.Click) -> None:
    """Handle mouse clicks"""
    # Handle click events
    pass

def on_mouse_scroll_down(self, event: events.MouseScrollDown) -> None:
    """Handle mouse wheel down"""
    self.scroll_down()
```

### Custom Events

Create and dispatch custom events:

```python
from textual.message import Message

class DataLoaded(Message):
    def __init__(self, data: dict) -> None:
        self.data = data
        super().__init__()

class DataLoader(Widget):
    async def load_data(self) -> None:
        # Load data asynchronously
        data = await self.fetch_data()
        # Dispatch custom event
        self.post_message(DataLoaded(data))
```

### Event Bubbling and Capture

Control event propagation:

```python
def on_button_pressed(self, event: Button.Pressed) -> None:
    """Handle button press"""
    # Process the event
    self.handle_action(event.button.id)
    
    # Stop event from bubbling up
    event.stop()
```

## Displaying Live Output and Logs

### RichLog for Formatted Output

Use RichLog for rich text display:

```python
def compose(self) -> ComposeResult:
    yield RichLog(id="output", highlight=True, markup=True)

def log_message(self, message: str, level: str = "info") -> None:
    output = self.query_one("#output", RichLog)
    
    # Add color coding based on level
    if level == "error":
        output.write(f"[bold red]ERROR:[/bold red] {message}")
    elif level == "warning":
        output.write(f"[bold yellow]WARNING:[/bold yellow] {message}")
    else:
        output.write(f"[green]INFO:[/green] {message}")
```

### Auto-scrolling Management

Control scrolling behavior:

```python
class LogViewer(Widget):
    auto_scroll = reactive(True)
    
    def compose(self) -> ComposeResult:
        yield RichLog(id="log")
        yield Checkbox("Auto-scroll", id="auto-scroll-check")
    
    def on_checkbox_changed(self, event: Checkbox.Changed) -> None:
        if event.checkbox.id == "auto-scroll-check":
            self.auto_scroll = event.value
    
    def add_log_entry(self, entry: str) -> None:
        log = self.query_one("#log", RichLog)
        log.write(entry)
        
        if self.auto_scroll:
            log.scroll_to_end()
```

### Progress Tracking

Display progress with visual feedback:

```python
def compose(self) -> ComposeResult:
    yield ProgressBar(id="progress")
    yield Static("0%", id="progress-label")

def update_progress(self, percentage: float) -> None:
    progress = self.query_one("#progress", ProgressBar)
    label = self.query_one("#progress-label", Static)
    
    progress.update(percentage)
    label.update(f"{percentage:.1f}%")
```

## Creating Custom Widgets

### Extending Base Widgets

Create specialized widgets by extending existing ones:

```python
from textual.widget import Widget
from textual.containers import Container

class StatusIndicator(Widget):
    status = reactive("idle")
    
    def __init__(self, status: str = "idle", **kwargs) -> None:
        super().__init__(**kwargs)
        self.status = status
    
    def watch_status(self, status: str) -> None:
        """Update appearance when status changes"""
        self.refresh()
    
    def render(self) -> str:
        status_symbols = {
            "idle": "○",
            "running": "●",
            "success": "✓",
            "error": "✗"
        }
        return f"{status_symbols.get(self.status, '?')} {self.status.title()}"
```

### Composite Widgets

Combine multiple widgets into a single component:

```python
class UserCard(Widget):
    def __init__(self, user_data: dict, **kwargs) -> None:
        super().__init__(**kwargs)
        self.user_data = user_data
    
    def compose(self) -> ComposeResult:
        with Container(classes="user-card"):
            yield Static(f"[bold]{self.user_data['name']}[/bold]", classes="user-name")
            yield Static(f"Email: {self.user_data['email']}", classes="user-email")
            yield Button("Edit", id="edit-user", variant="primary")
            yield Button("Delete", id="delete-user", variant="error")
    
    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "edit-user":
            self.post_message(UserEditRequested(self.user_data))
        elif event.button.id == "delete-user":
            self.post_message(UserDeleteRequested(self.user_data))
```

## Background Task Management

### Using @work Decorator

Run long-running tasks without blocking the UI:

```python
from textual import work

class DataProcessor(App):
    @work(exclusive=True)
    async def process_data(self) -> None:
        """Process data in background thread"""
        try:
            # Simulate long-running task
            for i in range(100):
                await asyncio.sleep(0.1)
                # Update progress safely
                self.call_from_thread(self.update_progress, i + 1)
            
            # Notify completion
            self.call_from_thread(self.notify, "Processing complete!")
        except Exception as e:
            self.call_from_thread(self.notify, f"Error: {e}", severity="error")
    
    def update_progress(self, progress: int) -> None:
        """Update UI with progress (called from background thread)"""
        progress_bar = self.query_one("#progress", ProgressBar)
        progress_bar.update(progress)
```

### Task Cancellation

Implement task cancellation:

```python
class TaskManager(Widget):
    def __init__(self) -> None:
        super().__init__()
        self.current_task = None
    
    @work(exclusive=True)
    async def long_task(self) -> None:
        self.current_task = asyncio.current_task()
        try:
            # Long running operation
            await self.process_data()
        except asyncio.CancelledError:
            # Handle cancellation
            self.call_from_thread(self.notify, "Task cancelled")
        finally:
            self.current_task = None
    
    def cancel_task(self) -> None:
        if self.current_task and not self.current_task.done():
            self.current_task.cancel()
```

### Thread-Safe UI Updates

Safely update UI from background threads:

```python
def background_operation(self) -> None:
    """Run in background thread"""
    # Do some work
    result = perform_calculation()
    
    # Safely update UI
    self.call_from_thread(self.update_result, result)

def update_result(self, result: str) -> None:
    """Update UI with result (runs in main thread)"""
    result_display = self.query_one("#result", Static)
    result_display.update(result)
```

## Styling with CSS

### Advanced CSS Techniques

Use advanced CSS features for better styling:

```css
/* CSS Variables for theming */
$primary-color: #007bff;
$secondary-color: #6c757d;
$success-color: #28a745;

/* Nested selectors */
.user-card {
    background: $surface;
    border: solid $primary-color;
    padding: 1;
    
    .user-name {
        color: $primary-color;
        text-style: bold;
    }
    
    .user-email {
        color: $secondary-color;
    }
}

/* Pseudo-classes */
Button:hover {
    background: $boost;
}

Button:focus {
    border: heavy $primary-color;
}

/* Dynamic classes */
.user-card.-active {
    border: heavy $success-color;
}
```

### Animation Effects

Add animations for enhanced user experience:

```python
def highlight_widget(self, widget_id: str) -> None:
    widget = self.query_one(f"#{widget_id}")
    widget.styles.animate("background", "#ffff00", duration=0.5)
    widget.styles.animate("background", "initial", duration=0.5, delay=0.5)
```

### Responsive Styling

Create responsive designs with CSS:

```css
/* Default mobile-first styles */
.widget {
    width: 100%;
    padding: 1;
}

/* For larger terminals */
@media (min-width: 80) {
    .widget {
        width: 50%;
        padding: 2;
    }
}

/* For very wide terminals */
@media (min-width: 120) {
    .widget {
        width: 33%;
    }
}
```

## Error Handling and Validation

### Exception Handling

Implement robust error handling:

```python
def on_button_pressed(self, event: Button.Pressed) -> None:
    try:
        if event.button.id == "save-btn":
            self.save_data()
    except ValidationError as e:
        self.notify(f"Validation error: {e}", severity="error")
    except IOError as e:
        self.notify(f"IO error: {e}", severity="error")
    except Exception as e:
        self.notify(f"Unexpected error: {e}", severity="error")
        # Log the full traceback for debugging
        import traceback
        self.log(traceback.format_exc())
```

### Input Validation

Validate user input with real-time feedback:

```python
class FormValidator:
    @staticmethod
    def validate_email(email: str) -> tuple[bool, str]:
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not email:
            return False, "Email is required"
        if not re.match(pattern, email):
            return False, "Invalid email format"
        return True, ""
    
    @staticmethod
    def validate_password(password: str) -> tuple[bool, str]:
        if len(password) < 8:
            return False, "Password must be at least 8 characters"
        if not re.search(r'[A-Z]', password):
            return False, "Password must contain uppercase letter"
        if not re.search(r'[a-z]', password):
            return False, "Password must contain lowercase letter"
        if not re.search(r'\d', password):
            return False, "Password must contain number"
        return True, ""
```

### User Notifications

Provide clear feedback to users:

```python
def notify_user(self, message: str, severity: str = "information") -> None:
    """Show notification with appropriate styling"""
    if severity == "error":
        self.notify(f"[bold red]Error:[/bold red] {message}", severity="error")
    elif severity == "warning":
        self.notify(f"[bold yellow]Warning:[/bold yellow] {message}", severity="warning")
    elif severity == "success":
        self.notify(f"[bold green]Success:[/bold green] {message}", severity="information")
    else:
        self.notify(message, severity="information")
```

## Testing Textual Applications

### Unit Testing Widgets

Test individual widgets in isolation:

```python
import pytest
from textual.app import App
from textual.pilot import Pilot

class TestCounterWidget:
    def test_initial_state(self):
        counter = Counter()
        assert counter.count == 0
    
    def test_increment(self):
        counter = Counter()
        counter.increment()
        assert counter.count == 1
    
    async def test_render(self):
        async with Counter().run_test() as pilot:
            counter = pilot.app
            assert counter.render() == "Count: 0"
            counter.increment()
            assert counter.render() == "Count: 1"
```

### Integration Testing

Test the complete application flow:

```python
@pytest.mark.asyncio
async def test_app_workflow():
    async with MyApp().run_test() as pilot:
        # Test initial state
        assert pilot.app.title == "My Application"
        
        # Simulate user interaction
        await pilot.click("#submit-button")
        
        # Verify results
        output = pilot.app.query_one("#output", RichLog)
        assert "Success" in output.text
```

### Mocking External Dependencies

Mock external services for testing:

```python
from unittest.mock import AsyncMock, patch

@pytest.mark.asyncio
async def test_data_loading():
    async with DataApp().run_test() as pilot:
        # Mock external API call
        with patch('myapp.api.fetch_data', new_callable=AsyncMock) as mock_fetch:
            mock_fetch.return_value = {"status": "success", "data": []}
            
            # Trigger data loading
            await pilot.press("ctrl+l")
            
            # Verify mock was called
            mock_fetch.assert_called_once()
