import subprocess
import re
from typing import List
import glob
import os
import time


def save_notebooks():
    """
    Save the current Jupyter notebook using ipylab.
    This triggers the actual Jupyter save action to ensure outputs are persisted.
    """
    try:
        from ipylab import JupyterFrontEnd
        
        app = JupyterFrontEnd()
        app.commands.execute('docmanager:save')
        
        # Add the current notebook to Git staging
        notebook_name = get_current_notebook_name()
        if notebook_name:
            subprocess.run(['git', 'add', notebook_name], 
                          check=True, capture_output=True, text=True)
            
    except ImportError:
        print("ipylab not available. Install with: pip install ipylab")
    except Exception as e:
        print(f"Error saving notebook: {e}")


def get_current_notebook_name():
    """
    Get the name of the current Jupyter notebook.
    
    Returns:
        str: The notebook filename or None if not found
    """
    try:
        import glob
        import os
        
        # Look for .ipynb files in current directory
        notebook_files = glob.glob('*.ipynb')
        if len(notebook_files) == 1:
            return notebook_files[0]
        elif len(notebook_files) > 1:
            # If multiple notebooks, try to guess based on most recent modification
            most_recent = max(notebook_files, key=lambda f: os.path.getmtime(f))
            return most_recent
        else:
            return None
            
    except Exception as e:
        print(f"Error getting notebook name: {e}")
        return None


def add_notebooks() -> bool:
    """
    Add the current Jupyter notebook file to git staging area.
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        notebook_name = get_current_notebook_name()
        if not notebook_name:
            return False
        
        subprocess.run(['git', 'add', notebook_name], 
                      check=True, capture_output=True, text=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error adding current notebook: {e}")
        return False


def commit_notebooks(message: str) -> bool:
    """
    Add all notebooks and create a commit with the given message.
    
    Args:
        message (str): Commit message
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Add notebooks
        if not add_notebooks():
            return False
        
        # Create commit with the message
        subprocess.run(['git', 'commit', '-m', message], 
                      check=True, capture_output=True, text=True)
        
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error creating commit: {e}")
        return False


def add_and_commit_notebooks(message: str) -> bool:
    """
    Convenience function that combines adding notebooks and committing in one step.
    
    Args:
        message (str): Commit message
        
    Returns:
        bool: True if successful, False otherwise
    """
    return commit_notebooks(message)


def get_next_tag_name() -> str:
    """
    Determines the next tag name in the format vX.Y.Z by incrementing the middle version number.
    Returns:
        str: The next tag name (e.g., 'v1.3.0')
    """
    existing_tags = get_all_tags()
    if not existing_tags:
        return "v1.0.0"
    version_pattern = re.compile(r'^v(\d+)\.(\d+)\.(\d+)$')
    version_tags = []
    for tag in existing_tags:
        match = version_pattern.match(tag)
        if match:
            major, minor, patch = map(int, match.groups())
            version_tags.append((major, minor, patch, tag))
    if not version_tags:
        return "v1.0.0"
    version_tags.sort()
    latest_major, latest_minor, latest_patch, latest_tag = version_tags[-1]
    new_minor = latest_minor + 1
    return f"v{latest_major}.{new_minor}.0"


def start_experiment() -> str:
    """
    Save all notebooks, then commit them with a message indicating the project state before running an experiment.
    The tag name is automatically determined as the next tag.
    Returns:
        str: The tag name used in the message, or empty string on failure
    """
    # Save all notebooks first
    save_notebooks()
    
    next_tag = get_next_tag_name()
    message = f"Project state before running experiment {next_tag}"
    commit_success = commit_notebooks(message)
    if commit_success:
        print(f"Started experiment: {next_tag}")
        return next_tag
    else:
        print("Failed to start experiment")
        return ""


def end_experiment() -> str:
    """
    Save all notebooks, commit them with a message indicating the project state after running an experiment,
    create the next tag, and push the tag to the remote.
    Returns:
        str: The new tag name if successful, empty string otherwise
    """
    # Save all notebooks first
    save_notebooks()
    
    next_tag = get_next_tag_name()
    message = f"Project state after running experiment {next_tag}"
    commit_success = commit_notebooks(message)
    if not commit_success:
        print("Failed to end experiment")
        return ""
    
    # Now create the tag
    try:
        subprocess.run(['git', 'tag', next_tag], check=True, capture_output=True, text=True)
        subprocess.run(['git', 'push', 'origin', next_tag], check=True, capture_output=True, text=True)
        print(f"Ended experiment: {next_tag}")
        return next_tag
    except subprocess.CalledProcessError as e:
        print(f"Error creating or pushing tag: {e}")
        return ""


def get_all_tags() -> List[str]:
    """
    Fetch all tags from remote repositories and return them as a Python list.
    
    Returns:
        List[str]: List of all Git tags
    """
    try:
        # Fetch all tags from all remotes
        subprocess.run(['git', 'fetch', '--all', '--tags'], 
                      check=True, capture_output=True, text=True)
        
        # Get all tags
        result = subprocess.run(['git', 'tag'], 
                              check=True, capture_output=True, text=True)
        
        # Split by newlines and filter out empty strings
        tags = [tag.strip() for tag in result.stdout.split('\n') if tag.strip()]
        
        return tags
    except subprocess.CalledProcessError as e:
        print(f"Error fetching tags: {e}")
        return []


def create_next_tag() -> str:
    """
    Create a new tag by incrementing the middle version number.
    Expects tags in format vX.Y.Z and creates vX.(Y+1).0
    
    Returns:
        str: The newly created tag name
    """
    # Get the next tag name
    new_tag = get_next_tag_name()
    try:
        # Create the new tag
        subprocess.run(['git', 'tag', new_tag], check=True)
        print(f"Created new tag: {new_tag}")
        return new_tag
    except subprocess.CalledProcessError as e:
        print(f"Error creating tag: {e}")
        return ""
