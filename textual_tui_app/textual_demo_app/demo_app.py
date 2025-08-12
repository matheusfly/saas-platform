from textual.app import App, ComposeResult
from textual.containers import Container, VerticalScroll
from textual.widgets import Header, Footer, Static, Button

class DemoApp(App):
    """A Textual app demonstrating advanced concepts."""

    CSS_PATH = "demo_app.tcss"

    BINDINGS = [
        ("d", "toggle_dark", "Toggle dark mode"),
        ("s", "toggle_sidebar", "Toggle Sidebar"),
        ("c", "change_colors", "Change Colors"),
    ]

    def compose(self) -> ComposeResult:
        yield Header()
        with Container(id="app-grid"):
            with VerticalScroll(id="sidebar"):
                yield Static("Sidebar Content", classes="sidebar-item")
                yield Button("Toggle Highlight", id="highlight_button")
                yield Static("Item 1", classes="sidebar-item")
                yield Static("Item 2", classes="sidebar-item")
                yield Static("Item 3", classes="sidebar-item")
            with Container(id="main-content"):
                yield Static("Main Content Area", id="main-title")
                yield Static("This is a demonstration of Textual's advanced layout, styling, and querying capabilities.", classes="info-text")
                yield Static("Grid Cell 1", classes="grid-cell")
                yield Static("Grid Cell 2", classes="grid-cell")
                yield Static("Grid Cell 3 (Spans 2 columns)", classes="grid-cell", id="span-cell")
                yield Static("Grid Cell 4", classes="grid-cell")
                yield Static("Grid Cell 5", classes="grid-cell")
        yield Footer()

    def action_toggle_dark(self) -> None:
        """An action to toggle dark mode."""
        self.theme = (
            "textual-dark" if self.theme == "textual-light" else "textual-light"
        )

    def action_toggle_sidebar(self) -> None:
        """An action to toggle sidebar visibility."""
        sidebar = self.query_one("#sidebar")
        sidebar.toggle_class("-hidden")

    def action_change_colors(self) -> None:
        """An action to change colors of grid cells."""
        grid_cells = self.query(".grid-cell")
        for index, cell in enumerate(grid_cells):
            if index % 2 == 0:
                cell.styles.background = "darkgreen"
                cell.styles.color = "white"
            else:
                cell.styles.background = "darkblue"
                cell.styles.color = "white"
        
        # Demonstrate query_one and updating a specific element
        main_title = self.query_one("#main-title")
        main_title.styles.color = "yellow"
        main_title.update("Main Content Area (Colors Changed!)")

    def on_button_pressed(self, event: Button.Pressed) -> None:
        """Event handler for button presses."""
        if event.button.id == "highlight_button":
            # Demonstrate querying and dynamic styling with classes
            sidebar_items = self.query(".sidebar-item")
            sidebar_items.toggle_class("highlight")
