from textual.app import App, ComposeResult
from textual.containers import Container
from textual.widgets import Header, Footer, Static, Button, TextLog, ProgressBar

class TestApp(App):
    """A simple test app to verify our Textual setup and demonstrate basic components.
    
    This application showcases:
    - Basic application structure with header, footer, and content
    - Simple button interaction
    - Text logging output
    - Progress bar widget
    """
    
    # Inline CSS styling for the application
    CSS = """
    /* Screen-level styling - vertical layout for simple stacking */
    Screen {
        layout: vertical;    /* Stack widgets vertically */
    }
    
    /* Output log styling */
    #output {
        height: 100%;        /* Use all available height */
        border: solid green; /* Green solid border */
    }
    """
    
    def compose(self) -> ComposeResult:
        """Create and compose the application widgets.
        
        This method defines the structure of the application by yielding:
        1. Header for app title and key bindings
        2. Test button for user interaction
        3. Text log for output display
        4. Progress bar for visual feedback
        5. Footer for additional key bindings
        """
        # Add the header to display app title and key bindings
        yield Header()
        
        # Add a test button with ID for event handling
        yield Button("Test Button", id="test_btn")
        
        # Add a text log for output display with ID for querying
        yield TextLog(id="output")
        
        # Add a progress bar for visual feedback
        yield ProgressBar()
        
        # Add the footer for additional key bindings
        yield Footer()
    
    def on_button_pressed(self, event: Button.Pressed) -> None:
        """Handle button press events.
        
        This event handler is called when any button is pressed in the app.
        It checks the button ID to determine which action to take.
        
        Args:
            event: The Button.Pressed event containing information about the pressed button
        """
        # Check if the pressed button is our test button
        if event.button.id == "test_btn":
            # Get the output log widget by ID
            output = self.query_one("#output", TextLog)
            
            # Write a message to the output log
            output.write("Button pressed!")

if __name__ == "__main__":
    # Create and run the test application
    app = TestApp()
    app.run()
