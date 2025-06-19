def freeze_venv_dependencies(venv_name: str = None):
    import os
    import subprocess
    import sys
    import shutil
    
    # If no venv_name provided, try to detect current environment
    if venv_name is None:
        # Check if we're in a virtual environment
        if hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
            # We're in a virtual environment
            venv_path = sys.prefix
            venv_name = os.path.basename(venv_path)
            print(f"Detected virtual environment: {venv_name} at {venv_path}")
        else:
            # Check for common venv names in current directory
            possible_venv_names = ["my_venv", "venv", "env", "my_new_venv"]
            for name in possible_venv_names:
                venv_path = os.path.join(os.getcwd(), name)
                if os.path.exists(venv_path):
                    venv_name = name
                    print(f"Found virtual environment: {venv_name} at {venv_path}")
                    break
            else:
                print("No virtual environment detected. Please specify venv_name parameter.")
                return
    
    # Define the virtual environment path
    if not os.path.isabs(venv_name):
        venv_path = os.path.join(os.getcwd(), venv_name)
    else:
        venv_path = venv_name
    
    # Check if the virtual environment exists
    if not os.path.exists(venv_path):
        print(f"Virtual environment not found at: {venv_path}")
        return
    
    # Output files
    pip_requirements_file = "requirements.txt"
    conda_env_file = "environment.yml"
    
    # Function to run a command and handle errors
    def run_command(command, error_message):
        try:
            print(f"Running command: {' '.join(command)}")
            result = subprocess.run(command, capture_output=True, text=True, check=True)
            return result.stdout
        except subprocess.CalledProcessError as e:
            print(f"{error_message}: {e}")
            print(f"Command output: {e.stdout}")
            print(f"Command error: {e.stderr}")
            return None
        except FileNotFoundError:
            print(f"Command not found: {' '.join(command)}")
            return None
    
    # Step 1: Freeze pip packages
    # Try multiple possible pip paths
    pip_paths = [
        os.path.join(venv_path, "Scripts" if os.name == "nt" else "bin", "pip"),
        os.path.join(venv_path, "Scripts" if os.name == "nt" else "bin", "pip3"),
        shutil.which("pip"),  # Use system pip if available
    ]
    
    pip_output = None
    for pip_path in pip_paths:
        if pip_path and os.path.exists(pip_path):
            print(f"Trying pip at: {pip_path}")
            pip_output = run_command([pip_path, "freeze"], "Failed to freeze pip dependencies")
            if pip_output:
                break
    
    if not pip_output:
        # Try using python -m pip as fallback
        python_paths = [
            os.path.join(venv_path, "Scripts" if os.name == "nt" else "bin", "python"),
            os.path.join(venv_path, "Scripts" if os.name == "nt" else "bin", "python3"),
            sys.executable,  # Current python
        ]
        
        for python_path in python_paths:
            if python_path and os.path.exists(python_path):
                print(f"Trying python -m pip with: {python_path}")
                pip_output = run_command([python_path, "-m", "pip", "freeze"], "Failed to freeze pip dependencies")
                if pip_output:
                    break
    
    if pip_output:
        with open(pip_requirements_file, "w") as f:
            f.write(pip_output)
        print(f"Pip dependencies saved to {pip_requirements_file}")
        print(f"Found {len(pip_output.strip().split(chr(10)))} packages")
    else:
        print("Failed to freeze pip dependencies with all methods")
    
    # Step 2: Check if the environment is a Conda environment
    conda_path = shutil.which("conda")
    if conda_path:
        # Check if the virtual environment is a Conda environment
        conda_env_name = os.environ.get("CONDA_DEFAULT_ENV")
        if conda_env_name and os.path.basename(venv_path) in conda_env_name:
            conda_output = run_command(
                [conda_path, "env", "export", "--name", conda_env_name],
                "Failed to export Conda environment"
            )
            if conda_output:
                with open(conda_env_file, "w") as f:
                    f.write(conda_output)
                print(f"Conda environment exported to {conda_env_file}")
        else:
            print("Not a Conda environment or not activated. Skipping Conda export.")
    else:
        print("Conda not found. Skipping Conda export.")
    
    # Step 3: Provide instructions
    print("\nTo recreate the environment:")
    if os.path.exists(pip_requirements_file):
        print(f"- For pip: Activate the virtual environment and run: `pip install -r {pip_requirements_file}`")
    if os.path.exists(conda_env_file):
        print(f"- For Conda: Run: `conda env create -f {conda_env_file}`")

import os
import subprocess
import sys

def create_new_venv(venv_name: str):
    # Define the virtual environment name and path
    essential_packages = ["ipykernel","boto3", "ipylab", "pandas","numpy","xarray","requests","pyarrow"]

    venv_path = os.path.join(os.getcwd(), venv_name)
    bin_dir = "Scripts" if os.name == "nt" else "bin"
    python_path = os.path.join(venv_path, bin_dir, "python")
    pip_path = os.path.join(venv_path, bin_dir, "pip")
    
    # Step 1: Create a virtual environment
    try:
        subprocess.run([sys.executable, "-m", "venv", venv_path], check=True)
        print(f"[✔] Virtual environment '{venv_name}' created at {venv_path}")
    except subprocess.CalledProcessError as e:
        print(f"[✘] Failed to create virtual environment: {e}")
        sys.exit(1)
    
    # Step 2: Upgrade pip in the virtual environment
    try:
        subprocess.run([pip_path, "install", "--upgrade", "pip"], check=True)
        print("[✔] Pip upgraded")
    except subprocess.CalledProcessError as e:
        print(f"[✘] Failed to upgrade pip: {e}")
        sys.exit(1)
    
    # Step 3: Install essential packages
    if essential_packages:
        try:
            subprocess.run([pip_path, "install"] + essential_packages, check=True)
            print(f"[✔] Installed essential packages: {', '.join(essential_packages)}")
        except subprocess.CalledProcessError as e:
            print(f"[✘] Failed to install essential packages: {e}")
            sys.exit(1)
    
    # Step 4: Register the virtual environment as a Jupyter kernel
    kernel_name = f"{venv_name}_kernel"
    try:
        subprocess.run([
            python_path, "-m", "ipykernel", "install",
            "--user", "--name", kernel_name,
            "--display-name", f"Python ({venv_name})"
        ], check=True)
        print(f"[✔] Kernel '{kernel_name}' registered for Jupyter")
    except subprocess.CalledProcessError as e:
        print(f"[✘] Failed to register Jupyter kernel: {e}")
        sys.exit(1)
    
    # Final message
    print("\n🎉 Setup complete!")
    print("➡ To use the virtual environment in Jupyter:")
    print(f"   1. Restart your Jupyter server")
    print(f"   2. Select kernel: Python ({venv_name})")
