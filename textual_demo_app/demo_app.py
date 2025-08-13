from textual.app import App, ComposeResult
from textual.containers import Container, VerticalScroll
from textual.widgets import Header, Footer, Static, Button, ProgressBar, RichLog
from textual.reactive import reactive
from textual import work
from time import sleep
import random

class DemoApp(App):
    """A comprehensive Textual TUI application demonstrating advanced concepts.
    
    This application showcases:
    - Complex layout management using CSS Grid
    - Interactive components with real-time feedback
    - Reactive programming patterns
    - Background task execution with progress tracking
    - Live terminal output display
    - Dynamic styling and theme management
    """

    # Inline CSS styling for the application
    # Uses CSS Grid for responsive layout and custom variables for consistent theming
    CSS = """
    /* Define CSS variables for consistent styling across the application */
    $sidebar-width: 25;    /* Width of the sidebar in cells */
    $main-bg: $surface;    /* Main background color */
    $grid-bg: $panel;      /* Grid background color */
    $highlight-color: orange;  /* Highlight color for selected items */

    /* Screen-level styling - defines the overall application layout */
    Screen {
        layout: grid;                    /* Use grid layout */
        grid-size: 2;                    /* 2 columns */
        grid-columns: $sidebar-width 1fr; /* Fixed sidebar width, flexible main content */
        grid-rows: auto 1fr auto;        /* Auto header, flexible content, auto footer */
        background: $main-bg;            /* Apply background color */
    }

    /* Header styling - spans across both columns */
    Header {
        column-span: 2;                  /* Span across both columns */
        height: 3;                       /* Fixed height of 3 cells */
        content-align: center middle;    /* Center content horizontally and vertically */
        background: $primary;            /* Primary color background */
        color: white;                    /* White text */
    }

    /* Footer styling - spans across both columns */
    Footer {
        column-span: 2;                  /* Span across both columns */
        height: 2;                       /* Fixed height of 2 cells */
        content-align: center middle;    /* Center content */
        background: $primary;            /* Primary color background */
        color: white;                    /* White text */
    }

    /* Main application grid container */
    #app-grid {
        column-span: 2;                  /* Span across both columns */
        layout: grid;                    /* Use grid layout */
        grid-size: 2;                    /* 2 columns for sidebar and main content */
        grid-columns: $sidebar-width 1fr; /* Same column proportions as Screen */
        grid-rows: 1fr;                  /* Flexible row for content */
    }

    /* Sidebar styling */
    #sidebar {
        background: $panel;              /* Panel background color */
        border: solid $primary;          /* Solid border with primary color */
        padding: 1;                      /* 1 cell padding */
        margin: 1;                       /* 1 cell margin */
        width: 100%;                     /* Full width */
        height: 100%;                    /* Full height */
        overflow-y: auto;                /* Enable vertical scrolling */

        /* Nested CSS for sidebar items */
        .sidebar-item {
            background: $boost;          /* Boost background color */
            color: $text;                /* Text color */
            padding: 0 1;                /* Horizontal padding */
            margin-bottom: 1;            /* Bottom margin */
            height: 3;                   /* Fixed height */
            content-align: center middle; /* Center content */
        }

        /* Nested CSS for highlighted sidebar items */
        .sidebar-item.highlight {
            background: $highlight-color; /* Highlight background */
            color: black;                 /* Black text */
            text-style: bold;             /* Bold text */
        }

    /* Nested CSS for the toggle highlight button */
        Button {
            width: 100%;                  /* Full width */
            margin-bottom: 1;             /* Bottom margin */
        }
    }

    /* Hidden sidebar class - used to toggle sidebar visibility */
    #sidebar.-hidden {
        width: 0;                        /* No width */
        min-width: 0;                    /* No minimum width */
        max-width: 0;                    /* No maximum width */
        border: none;                    /* No border */
        padding: 0;                      /* No padding */
        margin: 0;                       /* No margin */
        display: none;                   /* Completely hidden */
    }

    /* Main content area styling */
    #main-content {
        layout: grid;                    /* Use grid layout */
        grid-size: 3;                    /* 3 columns for grid cells */
        grid-columns: 1fr 1fr auto;      /* Flexible columns, last one auto-sized */
        grid-rows: auto auto auto 1fr 1fr; /* Auto rows for headers/buttons, flexible for content */
        grid-gutter: 1 2;                /* 1 cell vertical gutter, 2 cell horizontal gutter */
        background: $grid-bg;            /* Grid background color */
        border: solid $secondary;        /* Solid border with secondary color */
        padding: 1;                      /* 1 cell padding */
        margin: 1;                       /* 1 cell margin */
        overflow: auto;                  /* Enable scrolling */

        /* Nested CSS for main title */
        #main-title {
            column-span: 3;              /* Span across all 3 columns */
            text-align: center;          /* Center text */
            text-style: bold;            /* Bold text */
            color: $text;                /* Text color */
            background: $accent;         /* Accent background */
            padding: 1;                  /* Padding */
            margin-bottom: 1;            /* Bottom margin */
        }

        /* Nested CSS for info text */
        .info-text {
            column-span: 3;              /* Span across all 3 columns */
            text-align: center;          /* Center text */
            color: $text-muted;          /* Muted text color */
            margin-bottom: 1;            /* Bottom margin */
        }
        
        /* Button section styling */
        #button-section {
            column-span: 3;              /* Span across all 3 columns */
            layout: horizontal;          /* Horizontal layout */
            height: auto;                /* Auto height */
            margin-bottom: 1;            /* Bottom margin */
            padding: 1;                  /* Padding */
            background: $boost;          /* Boost background */
            border: round $secondary;    /* Rounded border */
        }
        
        #button-section Button {
            margin-right: 1;             /* Right margin */
            width: auto;                 /* Auto width */
        }
        
        /* Progress bar styling */
        ProgressBar {
            column-span: 3;              /* Span across all 3 columns */
            margin-bottom: 1;            /* Bottom margin */
            height: 1;                   /* Fixed height */
        }
        
        /* Terminal output styling */
        #output_log {
            column-span: 3;              /* Span across all 3 columns */
            height: 100%;                /* Full height */
            border: solid $secondary;    /* Solid border */
            padding: 1;                  /* Padding */
            background: $surface;        /* Surface background */
            color: $text;                /* Text color */
        }

        /* Nested CSS for grid cells */
        .grid-cell {
            background: $boost;          /* Boost background */
            color: $text;                /* Text color */
            border: round $surface;      /* Rounded border */
            content-align: center middle; /* Center content */
            height: 100%;                /* Full height */
        }

        /* Specific styling for the cell that spans columns */
        #span-cell {
            column-span: 2;              /* Span across 2 columns */
            background: $warning;        /* Warning background */
            color: black;                /* Black text */
            text-style: bold;            /* Bold text */
        }
    }
    """
    
    # Reactive attributes for state management
    # These automatically update the UI when their values change
    auto_scroll = reactive(True)   # Controls whether output log auto-scrolls
    task_running = reactive(False) # Tracks if a background task is running

    # Keyboard bindings for user actions
    # Format: (key, action_name, description)
    BINDINGS = [
        ("d", "toggle_dark", "Toggle dark mode"),      # Toggle between light/dark themes
        ("s", "toggle_sidebar", "Toggle Sidebar"),     # Show/hide sidebar
        ("c", "change_colors", "Change Colors"),       # Change grid cell colors
        ("r", "run_process", "Run Process"),           # Run simulated background process
    ]

    def compose(self) -> ComposeResult:
        """Create and compose the application widgets.
        
        This method defines the structure of the application by yielding widgets
        in the order they should appear. It uses context managers for nested
        container structures.
        """
        # Add the header to the application
        yield Header()
        
        # Create the main application grid container
        with Container(id="app-grid"):
            # Create the sidebar with vertical scrolling
            with VerticalScroll(id="sidebar"):
                # Add static content and interactive elements to the sidebar
                yield Static("Sidebar Content", classes="sidebar-item")
                yield Button("Toggle Highlight", id="highlight_button")
                yield Static("Item 1", classes="sidebar-item")
                yield Static("Item 2", classes="sidebar-item")
                yield Static("Item 3", classes="sidebar-item")
            
            # Create the main content area
            with Container(id="main-content"):
                # Add title and informational text
                yield Static("Main Content Area", id="main-title")
                yield Static("This is a demonstration of Textual's advanced layout, styling, and querying capabilities.", classes="info-text")
                
                # Interactive buttons section for user actions
                with Container(id="button-section"):
                    yield Button("Run Process", id="run_button", variant="primary")      # Start background process
                    yield Button("Clear Output", id="clear_button", variant="error")     # Clear output log
                    yield Button("Toggle Auto-scroll", id="autoscroll_button", variant="warning")  # Toggle auto-scroll
                
                # Progress bar for visual feedback during long-running tasks
                yield ProgressBar(id="task_progress", show_eta=False)
                
                # Terminal output display for logging and results
                yield RichLog(id="output_log", highlight=True, markup=True)
                
                # Grid cells to demonstrate layout and styling
                yield Static("Grid Cell 1", classes="grid-cell")
                yield Static("Grid Cell 2", classes="grid-cell")
                yield Static("Grid Cell 3 (Spans 2 columns)", classes="grid-cell", id="span-cell")
                yield Static("Grid Cell 4", classes="grid-cell")
                yield Static("Grid Cell 5", classes="grid-cell")
        
        # Add the footer to the application
        yield Footer()

    def action_toggle_dark(self) -> None:
        """Toggle between dark and light themes.
        
        This action is triggered by the 'd' key binding and switches
        between the built-in textual-dark and textual-light themes.
        """
        # Switch theme based on current theme
        self.theme = (
            "textual-dark" if self.theme == "textual-light" else "textual-light"
        )

    def action_toggle_sidebar(self) -> None:
        """Toggle the visibility of the sidebar.
        
        This action is triggered by the 's' key binding and adds/removes
        the '-hidden' class to the sidebar widget to show/hide it.
        """
        # Get the sidebar widget and toggle its hidden class
        sidebar = self.query_one("#sidebar")
        sidebar.toggle_class("-hidden")

    def action_change_colors(self) -> None:
        """Change the colors of grid cells to demonstrate dynamic styling.
        
        This action is triggered by the 'c' key binding and modifies
        the background and text colors of grid cells in alternating pattern.
        """
        # Get all grid cells using CSS class selector
        grid_cells = self.query(".grid-cell")
        
        # Iterate through grid cells and apply alternating colors
        for index, cell in enumerate(grid_cells):
            if index % 2 == 0:
                # Even cells: dark green background with white text
                cell.styles.background = "darkgreen"
                cell.styles.color = "white"
            else:
                # Odd cells: dark blue background with white text
                cell.styles.background = "darkblue"
                cell.styles.color = "white"
        
        # Demonstrate querying a specific element by ID and updating it
        main_title = self.query_one("#main-title")
        main_title.styles.color = "yellow"  # Change title text color
        main_title.update("Main Content Area (Colors Changed!)")  # Update title text

    def on_button_pressed(self, event: Button.Pressed) -> None:
        """Handle button press events from any button in the application.
        
        This event handler is called whenever any button is pressed.
        It uses the button ID to determine which action to take.
        
        Args:
            event: The Button.Pressed event containing information about the pressed button
        """
        # Handle different buttons based on their ID
        if event.button.id == "highlight_button":
            # Toggle highlighting of sidebar items
            sidebar_items = self.query(".sidebar-item")
            sidebar_items.toggle_class("highlight")
        elif event.button.id == "run_button":
            # Start the simulated background process
            self.run_process()
        elif event.button.id == "clear_button":
            # Clear the terminal output display
            self.clear_output()
        elif event.button.id == "autoscroll_button":
            # Toggle auto-scroll behavior for the output log
            self.toggle_auto_scroll()
    
    def action_run_process(self) -> None:
        """Action to run the simulated process (triggered by 'r' key binding).
        
        This is a wrapper method that calls the main run_process method.
        """
        self.run_process()
    
    def run_process(self) -> None:
        """Run the simulated long-running process.
        
        This method starts the background simulation if no task is currently running.
        It sets the task_running reactive attribute to prevent multiple concurrent tasks.
        """
        # Only start if no task is currently running
        if not self.task_running:
            self.task_running = True  # Set running state
            self.simulate_process()   # Start the background simulation
    
    def clear_output(self) -> None:
        """Clear the terminal output display.
        
        This method finds the RichLog widget and clears all its content.
        """
        # Get the output log widget and clear its content
        output_log = self.query_one("#output_log", RichLog)
        output_log.clear()
    
    def toggle_auto_scroll(self) -> None:
        """Toggle auto-scroll for the output display.
        
        This method switches the auto_scroll reactive attribute and updates
        the button label to reflect the current state.
        """
        # Toggle the auto_scroll reactive attribute
        self.auto_scroll = not self.auto_scroll
        
        # Update the button label to show current state
        autoscroll_button = self.query_one("#autoscroll_button", Button)
        autoscroll_button.label = "Disable Auto-scroll" if self.auto_scroll else "Enable Auto-scroll"
    
    @work(exclusive=True)
    async def simulate_process(self) -> None:
        """Simulate a long-running process with output (runs in background thread).
        
        This method simulates a long-running task by sleeping between steps,
        updating a progress bar, and writing log messages to the output display.
        It uses call_from_thread to safely update UI elements from the background thread.
        """
        # Get references to UI elements for updating
        progress = self.query_one("#task_progress", ProgressBar)
        output_log = self.query_one("#output_log", RichLog)
        
        # Reset progress bar to 0% and add starting message
        self.call_from_thread(progress.update, progress=0)
        self.call_from_thread(output_log.write, "[bold green]Starting process...[/bold green]")
        
        # Simulate a process with multiple steps
        steps = 20  # Total number of steps
        for i in range(steps):
            # Simulate work by sleeping for a random duration
            sleep(random.uniform(0.1, 0.5))
            
            # Update progress bar with current percentage
            progress_percent = (i + 1) / steps * 100
            self.call_from_thread(progress.update, progress=progress_percent)
            
            # Add progress message every 5 steps
            if i % 5 == 0:
                self.call_from_thread(
                    output_log.write, 
                    f"[yellow]Step {i+1}/{steps}[/yellow] - Processing data..."
                )
            
            # Randomly add log messages (30% chance per step)
            if random.random() < 0.3:
                # Select a random log level
                log_levels = ["INFO", "DEBUG", "WARNING"]
                log_level = random.choice(log_levels)
                
                # Define colors for each log level
                log_colors = {"INFO": "blue", "DEBUG": "magenta", "WARNING": "yellow"}
                
                # Add log message with appropriate coloring
                self.call_from_thread(
                    output_log.write,
                    f"[{log_colors[log_level]}]{log_level}:[/{log_colors[log_level]}] Random event occurred"
                )
        
        # Finalize the process
        self.call_from_thread(progress.update, progress=100)  # Set progress to 100%
        self.call_from_thread(output_log.write, "[bold green]Process completed successfully![/bold green]")  # Success message
        self.call_from_thread(lambda: setattr(self, 'task_running', False))  # Reset running state

if __name__ == "__main__":
    # Create and run the application
    app = DemoApp()
    app.run()
