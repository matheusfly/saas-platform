import typer
from rich.console import Console
import subprocess
import os
from datetime import datetime

app = typer.Typer()
console = Console()

LOG_DIR = "logs"
if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)

def run_task(task_name: str, log_name: str):
    """Runs a taskipy task and logs the output."""
    log_filename = f"{log_name}-{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.log"
    log_filepath = os.path.join(LOG_DIR, log_filename)
    command = f"C:\\Users\\mathe\\AppData\\Local\\Programs\\Python\\Python313\\Scripts\\task {task_name}"

    console.rule(f"[bold green]Running task: {task_name}[/bold green]")
    
    try:
        with open(log_filepath, "w") as log_file:
            process = subprocess.Popen(
                command,
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                universal_newlines=True,
            )

            for line in process.stdout:
                console.print(line, end="")
                log_file.write(line)

            process.wait()

            if process.returncode == 0:
                console.rule(f"[bold green]Success: {task_name}[/bold green]")
            else:
                console.rule(f"[bold red]Error: {task_name} exited with code {process.returncode}[/bold red]")

    except Exception as e:
        console.print(f"[bold red]An exception occurred: {e}[/bold red]")
        with open(log_filepath, "a") as log_file:
            log_file.write(f"\nAn exception occurred: {e}\n")

test_app = typer.Typer()
app.add_typer(test_app, name="test")

@test_app.command("root")
def test_root():
    """Test the root application."""
    run_task("test_root", "root-test")

@test_app.command("dashboard")
def test_dashboard():
    """Test the dashboard application."""
    run_task("test_dashboard", "dashboard-test")

@test_app.command("scheduler")
def test_scheduler():
    """Test the scheduler application."""
    run_task("test_scheduler", "scheduler-test")

@test_app.command("clients")
def test_clients():
    """Test the clients application."""
    run_task("test_clients", "clients-test")

@test_app.command("all")
def test_all():
    """Test all applications."""
    run_task("test_root", "root-test")
    run_task("test_dashboard", "dashboard-test")
    run_task("test_scheduler", "scheduler-test")
    run_task("test_clients", "clients-test")

if __name__ == "__main__":
    app()
