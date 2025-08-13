from textual.app import App, ComposeResult
from textual.widgets import Footer, Header

class MinimalApp(App):
    """A minimal Textual app to test Header and Footer widgets.
    
    This application demonstrates the most basic Textual app structure:
    - Header for app title and key bindings display
    - Footer for additional key bindings display
    - Dark mode toggle functionality
    """

    # Keyboard binding for toggling dark mode
    # Format: (key, action_name, description)
    BINDINGS = [("d", "toggle_dark", "Toggle dark mode")]

    def compose(self) -> ComposeResult:
        """Create child widgets for the app.
        
        This method defines the minimal structure of the application by yielding:
        1. Header for app title and primary key bindings
        2. Footer for additional key bindings
        """
        # Add the header to display app title and primary key bindings
        yield Header()
        
        # Add the footer to display additional key bindings
        yield Footer()

    def action_toggle_dark(self) -> None:
        """An action to toggle between dark and light themes.
        
        This method switches between the built-in textual-dark and
        textual-light themes based on the current theme setting.
        """
        # Toggle between dark and light themes
        self.theme = (
            "textual-dark" if self.theme == "textual-light" else "textual-light"
        )

if __name__ == "__main__":
    # Create and run the minimal application
    app = MinimalApp()
    app.run()
