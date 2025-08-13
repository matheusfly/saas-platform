# Textual Component Reference

This document provides detailed reference information for key components used in Textual TUI applications.

## Table of Contents
1. [App Class](#app-class)
2. [Core Widgets](#core-widgets)
3. [Layout Containers](#layout-containers)
4. [Specialized Widgets](#specialized-widgets)
5. [Utility Classes](#utility-classes)

## App Class

The `App` class is the foundation of any Textual application.

### Key Methods

#### compose() -> ComposeResult
Defines the structure of the application by yielding widgets.

```python
def compose(self) -> ComposeResult:
    yield Header()
    yield Button("Click me")
    yield Footer()
```

#### run()
Starts the application in terminal mode.

```python
if __name__ == "__main__":
    app = MyApp()
    app.run()
```

#### query() and query_one()
Find widgets in the DOM.

```python
# Find all buttons
buttons = self.query(Button)

# Find a specific widget by ID
header = self.query_one("#header", Header)
```

#### mount()
Dynamically add widgets to the application.

```python
new_widget = MyWidget()
self.mount(new_widget)
```

### Key Properties

#### theme
Current application theme.

#### screen
The current screen object.

#### bindings
Keyboard bindings for the application.

### Common Attributes

#### CSS_PATH
Path to external CSS file.

```python
CSS_PATH = "app.tcss"
```

#### CSS
Inline CSS styling.

```python
CSS = """
Screen {
    background: blue;
}
"""
```

#### BINDINGS
Keyboard shortcuts for the application.

```python
BINDINGS = [
    ("d", "toggle_dark", "Toggle dark mode"),
    ("q", "quit", "Quit"),
]
```

## Core Widgets

### Button

Interactive button widget.

#### Constructor
```python
Button(label, id=None, variant=None)
```

#### Parameters
- `label`: Text displayed on the button
- `id`: Unique identifier for the button
- `variant`: Visual style ("default", "primary", "success", "warning", "error")

#### Events
- `Button.Pressed`: Fired when button is pressed

#### Example
```python
button = Button("Click me", id="my_button", variant="primary")
```

### Static

Displays static text content.

#### Constructor
```python
Static(renderable, *, name=None, id=None, classes=None)
```

#### Parameters
- `renderable`: Content to display (string, Rich renderable, etc.)
- `name`: Name for the widget
- `id`: Unique identifier
- `classes`: CSS classes

#### Example
```python
static = Static("Hello, World!", id="greeting")
```

### Header

Displays application title and subtitle.

#### Constructor
```python
Header(*, name=None, id=None, classes=None)
```

#### Properties
- `app.title`: Main title displayed in header
- `app.sub_title`: Subtitle displayed in header

#### Example
```python
class MyApp(App):
    TITLE = "My Application"
    SUB_TITLE = "A Textual App"
    
    def compose(self):
        yield Header()
```

### Footer

Displays key bindings information.

#### Constructor
```python
Footer(*, name=None, id=None, classes=None)
```

#### Example
```python
def compose(self):
    yield Header()
    # ... other widgets
    yield Footer()
```

### ProgressBar

Visual indicator of task progress.

#### Constructor
```python
ProgressBar(*, name=None, id=None, classes=None, show_eta=True)
```

#### Parameters
- `show_eta`: Whether to display estimated time of arrival

#### Methods
- `update(progress)`: Update progress percentage (0-100)

#### Example
```python
progress = ProgressBar()
progress.update(50)  # 50% complete
```

### RichLog

Advanced text display with rich formatting support.

#### Constructor
```python
RichLog(*, name=None, id=None, classes=None, highlight=False, markup=False)
```

#### Parameters
- `highlight`: Enable syntax highlighting
- `markup`: Enable Rich markup

#### Methods
- `write(content)`: Add content to the log
- `clear()`: Clear all content
- `scroll_to_end()`: Scroll to the end of content

#### Example
```python
log = RichLog(highlight=True, markup=True)
log.write("[bold green]Success![/bold green]")
```

## Layout Containers

### Container

Generic container for organizing widgets.

#### Constructor
```python
Container(*children, name=None, id=None, classes=None)
```

#### Example
```python
with Container(id="main"):
    yield Button("Button 1")
    yield Button("Button 2")
```

### VerticalScroll

Container with vertical scrolling capability.

#### Constructor
```python
VerticalScroll(*children, name=None, id=None, classes=None)
```

#### Example
```python
scrollable = VerticalScroll(
    Static("Item 1"),
    Static("Item 2"),
    # ... many items
)
```

### HorizontalGroup

Arranges widgets horizontally.

#### Constructor
```python
HorizontalGroup(*children, name=None, id=None, classes=None)
```

#### Example
```python
with HorizontalGroup():
    yield Button("Left")
    yield Button("Center")
    yield Button("Right")
```

## Specialized Widgets

### DataTable

Displays tabular data with sorting and selection.

#### Constructor
```python
DataTable(*, name=None, id=None, classes=None)
```

#### Methods
- `add_column(label)`: Add a column
- `add_row(*cells)`: Add a row of data
- `clear()`: Clear all data
- `sort(column_key)`: Sort by column

#### Example
```python
table = DataTable()
table.add_column("Name")
table.add_column("Age")
table.add_row("Alice", 30)
table.add_row("Bob", 25)
```

### Tree

Displays hierarchical data.

#### Constructor
```python
Tree(label, *, name=None, id=None, classes=None)
```

#### Methods
- `root.add(label)`: Add child node
- `root.expand()`: Expand node
- `root.collapse()`: Collapse node

#### Example
```python
tree = Tree("Root")
child = tree.root.add("Child")
grandchild = child.add("Grandchild")
```

### Input

Single-line text input field.

#### Constructor
```python
Input(*, value="", placeholder="", name=None, id=None, classes=None)
```

#### Parameters
- `value`: Initial value
- `placeholder`: Hint text when empty

#### Events
- `Input.Changed`: Fired when text changes
- `Input.Submitted`: Fired when Enter is pressed

#### Example
```python
input_field = Input(placeholder="Enter your name")
```

### TextArea

Multi-line text editor.

#### Constructor
```python
TextArea(*, text="", language=None, theme="monokai", name=None, id=None, classes=None)
```

#### Parameters
- `text`: Initial text content
- `language`: Syntax highlighting language
- `theme`: Color theme

#### Methods
- `text`: Get/set text content
- `insert(text)`: Insert text at cursor
- `clear()`: Clear all text

#### Example
```python
editor = TextArea(text="print('Hello, World!')", language="python")
```

## Utility Classes

### reactive

Decorator for creating reactive attributes.

#### Usage
```python
from textual.reactive import reactive

class MyWidget(Widget):
    value = reactive(0)
    
    def watch_value(self, value):
        # Called when value changes
        self.update(str(value))
```

### work

Decorator for running background tasks.

#### Usage
```python
from textual import work

class MyApp(App):
    @work(exclusive=True)
    async def background_task(self):
        # Long-running operation
        pass
```

### ComposeResult

Type hint for compose method return type.

#### Usage
```python
from textual.app import ComposeResult

def compose(self) -> ComposeResult:
    yield Button("Click me")
```

## Event Reference

### Common Events

#### Mount
Fired when widget is added to the app.

```python
def on_mount(self):
    # Initialization code
```

#### Key
Fired when a key is pressed.

```python
def on_key(self, event: events.Key):
    if event.key == "enter":
        # Handle Enter key
```

#### Click
Fired when widget is clicked.

```python
def on_click(self, event: events.Click):
    # Handle click
```

#### Button.Pressed
Fired when button is pressed.

```python
def on_button_pressed(self, event: Button.Pressed):
    # Handle button press
```

## CSS Styling Reference

### Common Properties

#### Layout
- `layout`: "vertical", "horizontal", "grid"
- `grid-size`: Number of rows/columns
- `grid-columns`: Column sizes
- `grid-rows`: Row sizes

#### Sizing
- `width`: Widget width
- `height`: Widget height
- `min-width`: Minimum width
- `max-width`: Maximum width

#### Spacing
- `padding`: Inner spacing
- `margin`: Outer spacing
- `border`: Border style

#### Colors
- `background`: Background color
- `color`: Text color
- `border-color`: Border color

#### Typography
- `text-align`: Text alignment
- `text-style`: Text style (bold, italic, etc.)
- `content-align`: Content alignment

### Selectors

#### ID Selector
```css
#my_widget {
    background: blue;
}
```

#### Class Selector
```css
.highlight {
    background: yellow;
}
```

#### Widget Type Selector
```css
Button {
    width: 100%;
}
```

#### Descendant Selector
```css
Container Button {
    margin: 1;
}
```

### CSS Variables

#### Built-in Variables
- `$primary`: Primary color
- `$secondary`: Secondary color
- `$background`: Background color
- `$surface`: Surface color
- `$panel`: Panel color
- `$boost`: Highlight color

#### Custom Variables
```css
$my-color: #ff5722;

Widget {
    background: $my-color;
}
