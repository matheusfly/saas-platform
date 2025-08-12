import os
import subprocess
import sys

def get_python_executable():
    """Tries to find the python executable in the virtual environment."""
    # Check for venv in the current directory
    venv_path = '.venv'
    if sys.platform == "win32":
        python_exec = os.path.join(venv_path, 'Scripts', 'python.exe')
    else:
        python_exec = os.path.join(venv_path, 'bin', 'python')

    if os.path.exists(python_exec):
        return python_exec
    # Fallback to the python executable that is running this script
    return sys.executable

def generate_report():
    """
    Generates a markdown report by running python scripts from the bi_dash/components directory.
    """
    components_dir = 'bi_dash/components'
    report_path = 'report.md'
    markdown_content = "# Business Intelligence Dashboard Report\n\n"
    
    print("Starting report generation...")

    try:
        files_to_run = sorted([
            f for f in os.listdir(components_dir)
            if f.endswith('.py') and not f.startswith('__')
        ])
        
        if not files_to_run:
            print(f"No suitable python scripts found in {components_dir} to generate a report.")
            return

        print(f"Found {len(files_to_run)} scripts to run: {', '.join(files_to_run)}")

        python_executable = get_python_executable()
        print(f"Using python interpreter: {python_executable}")

        for filename in files_to_run:
            script_path = os.path.join(components_dir, filename)
            markdown_content += f"## Output for `{filename}`\n\n"
            print(f"Running {script_path}...")
            
            try:
                result = subprocess.run(
                    [python_executable, script_path],
                    capture_output=True,
                    text=True,
                    check=False,  # Continue even if a script fails
                    encoding='utf-8',
                    errors='replace'
                )
                
                output = result.stdout
                stderr = result.stderr

                if not output.strip() and not stderr.strip():
                    output = "No output generated."
                
                if output:
                    markdown_content += f"### STDOUT\n\n"
                    markdown_content += f"```\n{output.strip()}\n```\n\n"

                if stderr:
                    markdown_content += f"### STDERR\n\n"
                    markdown_content += f"```\n{stderr.strip()}\n```\n\n"
                
                if result.returncode != 0:
                    markdown_content += f"**Warning:** Script exited with code {result.returncode}.\n\n"


            except Exception as e:
                 markdown_content += f"```\nFailed to run {filename}: {e}\n```\n\n"
                 print(f"Error running {filename}: {e}")


        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(markdown_content)
        
        print(f"Successfully generated report at '{report_path}'")

    except FileNotFoundError:
        error_msg = f"Error: Directory not found at '{components_dir}'. Make sure you are in the correct directory."
        print(error_msg)
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(f"# Report Generation Failed\n\n{error_msg}")

    except Exception as e:
        error_msg = f"An unexpected error occurred: {e}"
        print(error_msg)
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(f"# Report Generation Failed\n\n{error_msg}")


if __name__ == "__main__":
    generate_report()
