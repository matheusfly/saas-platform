from time import monotonic

from textual.app import App, ComposeResult
from textual.containers import HorizontalGroup, VerticalScroll
from textual.reactive import reactive
from textual.widgets import Button, Digits, Footer, Header


class TimeDisplay(Digits):
    """A widget to display elapsed time with high precision.
    
    This widget uses reactive attributes to automatically update the display
    when the time value changes. It handles time calculation and formatting
    for stopwatch functionality.
    """

    # Reactive attributes for time management
    # These automatically trigger UI updates when their values change
    start_time = reactive(monotonic)  # When the stopwatch was started/restarted
    time = reactive(0.0)              # Current elapsed time (displayed value)
    total = reactive(0.0)             # Total accumulated time from previous sessions

    def on_mount(self) -> None:
        """Event handler called when widget is added to the app.
        
        This method initializes the timer that updates the time display.
        The timer is initially paused and will be resumed when the stopwatch starts.
        """
        # Create a timer that calls update_time 60 times per second (60 FPS)
        # The timer is initially paused to prevent time updates until started
        self.update_timer = self.set_interval(1 / 60, self.update_time, pause=True)

    def update_time(self) -> None:
        """Method to update the current time to reflect elapsed time.
        
        This method calculates the current elapsed time by adding:
        1. The total accumulated time from previous sessions
        2. The time elapsed since the current session started
        
        The calculation uses monotonic time to ensure accuracy and avoid
        issues with system clock adjustments.
        """
        # Calculate current elapsed time:
        # total = time from previous sessions
        # (monotonic() - start_time) = time elapsed in current session
        self.time = self.total + (monotonic() - self.start_time)

    def watch_time(self, time: float) -> None:
        """Called automatically when the time attribute changes.
        
        This method formats and displays the time value whenever it changes.
        It converts the raw time value (in seconds) to HH:MM:SS.SS format.
        
        Args:
            time: The new time value in seconds
        """
        # Convert time (seconds) to hours, minutes, seconds, and centiseconds
        minutes, seconds = divmod(time, 60)      # Get minutes and remaining seconds
        hours, minutes = divmod(minutes, 60)     # Get hours and remaining minutes
        
        # Format as HH:MM:SS.SS (e.g., 01:23:45.67)
        # - hours: 2 digits, zero-padded
        # - minutes: 2 digits, zero-padded
        # - seconds: 2 digits before decimal, 2 digits after
        self.update(f"{hours:02,.0f}:{minutes:02.0f}:{seconds:05.2f}")

    def start(self) -> None:
        """Method to start (or resume) time updating.
        
        This method records the current time as the new start time and
        resumes the update timer to begin updating the display.
        """
        # Record current time as the new start time for this session
        self.start_time = monotonic()
        
        # Resume the timer to begin updating the time display
        self.update_timer.resume()

    def stop(self) -> None:
        """Method to stop the time display updating.
        
        This method pauses the timer and accumulates the elapsed time
        from this session into the total time for future sessions.
        """
        # Pause the timer to stop updating the time display
        self.update_timer.pause()
        
        # Add the time elapsed in this session to the total accumulated time
        self.total += monotonic() - self.start_time
        
        # Update the displayed time to match the total accumulated time
        self.time = self.total

    def reset(self) -> None:
        """Method to reset the time display to zero.
        
        This method clears both the total accumulated time and the
        currently displayed time, effectively resetting the stopwatch.
        """
        # Clear the total accumulated time
        self.total = 0
        
        # Clear the currently displayed time
        self.time = 0


class Stopwatch(HorizontalGroup):
    """A stopwatch widget that combines buttons and time display.
    
    This widget provides a complete stopwatch interface with start, stop,
    and reset functionality. It manages the interaction between the buttons
    and the time display component.
    """

    def on_button_pressed(self, event: Button.Pressed) -> None:
        """Event handler called when a button is pressed within this widget.
        
        This method handles the three main stopwatch actions:
        - Start: Begins time tracking
        - Stop: Pauses time tracking
        - Reset: Clears accumulated time
        
        It also manages the visual state by adding/removing the "started" CSS class.
        
        Args:
            event: The Button.Pressed event containing information about the pressed button
        """
        # Get the ID of the pressed button to determine which action to take
        button_id = event.button.id
        
        # Get the TimeDisplay widget within this stopwatch
        time_display = self.query_one(TimeDisplay)
        
        # Handle different button actions
        if button_id == "start":
            # Start the time display updating
            time_display.start()
            
            # Add the "started" CSS class to change visual appearance
            self.add_class("started")
        elif button_id == "stop":
            # Stop the time display updating
            time_display.stop()
            
            # Remove the "started" CSS class to change visual appearance
            self.remove_class("started")
        elif button_id == "reset":
            # Reset the time display to zero
            time_display.reset()

    def compose(self) -> ComposeResult:
        """Create child widgets that make up the stopwatch interface.
        
        This method defines the structure of the stopwatch widget by yielding:
        1. Start button (green, success variant)
        2. Stop button (red, error variant)
        3. Reset button (default variant)
        4. Time display (Digits widget showing elapsed time)
        """
        # Yield the start button with success styling
        yield Button("Start", id="start", variant="success")
        
        # Yield the stop button with error styling
        yield Button("Stop", id="stop", variant="error")
        
        # Yield the reset button with default styling
        yield Button("Reset", id="reset")
        
        # Yield the time display widget
        yield TimeDisplay()


class StopwatchApp(App):
    """A Textual app to manage multiple stopwatches with dynamic addition/removal.
    
    This application demonstrates advanced Textual concepts including:
    - Dynamic widget creation and removal
    - CSS styling with external files
    - Keyboard bindings for app actions
    - Reactive UI updates
    """

    # Path to external CSS file for styling
    CSS_PATH = "app.tcss"

    # Keyboard bindings for app-level actions
    # Format: (key, action_name, description)
    BINDINGS = [
        ("d", "toggle_dark", "Toggle dark mode"),  # Toggle between light/dark themes
        ("a", "add_stopwatch", "Add"),             # Add a new stopwatch
        ("r", "remove_stopwatch", "Remove"),       # Remove the last stopwatch
    ]

    def compose(self) -> ComposeResult:
        """Create and compose the application widgets.
        
        This method defines the overall structure of the application by yielding:
        1. Header for app title and key bindings
        2. Footer for additional key bindings
        3. Vertical scroll container with initial stopwatches
        """
        # Add the header to display app title and key bindings
        yield Header()
        
        # Add the footer for additional key bindings
        yield Footer()
        
        # Add a vertical scroll container with three initial stopwatches
        # The container has an ID for easy querying
        yield VerticalScroll(Stopwatch(), Stopwatch(), Stopwatch(), id="timers")

    def action_add_stopwatch(self) -> None:
        """An action to add a new stopwatch to the application.
        
        This method creates a new Stopwatch widget and mounts it to the
        timers container. It also ensures the new stopwatch is visible
        by scrolling to it if necessary.
        """
        # Create a new stopwatch widget
        new_stopwatch = Stopwatch()
        
        # Mount the new stopwatch to the timers container
        self.query_one("#timers").mount(new_stopwatch)
        
        # Scroll to make the new stopwatch visible
        new_stopwatch.scroll_visible()

    def action_remove_stopwatch(self) -> None:
        """An action to remove the last stopwatch from the application.
        
        This method finds all stopwatch widgets and removes the last one.
        If no stopwatches exist, it does nothing.
        """
        # Query for all Stopwatch widgets in the application
        timers = self.query("Stopwatch")
        
        # If there are stopwatches, remove the last one
        if timers:
            timers.last().remove()

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
    # Create and run the stopwatch application
    app = StopwatchApp()
    app.run()
