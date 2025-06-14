from nbformat import v4 as nbf
import json
import sys

def add_markdown_cell(notebook_path, cell_text, position=0):
    """
    Add a markdown cell to a Jupyter notebook.
    
    Args:
        notebook_path (str): Path to the notebook file
        cell_text (str): The markdown text to add
        position (int): Position to insert the cell (0 for top)
    """
    print(f"Starting to add markdown cell to: {notebook_path}", file=sys.stderr)
    try:
        # Read the notebook
        with open(notebook_path, 'r', encoding='utf-8') as f:
            nb = json.load(f)
        print("Successfully read notebook", file=sys.stderr)
        
        # Create a new markdown cell
        new_cell = nbf.new_markdown_cell(cell_text)
        print("Created new markdown cell", file=sys.stderr)
        
        # Insert the cell at the specified position
        nb['cells'].insert(position, new_cell)
        print(f"Inserted cell at position {position}", file=sys.stderr)
        
        # Write the notebook back
        with open(notebook_path, 'w', encoding='utf-8') as f:
            json.dump(nb, f, indent=1)
        print("Successfully wrote notebook back to disk", file=sys.stderr)
        
        return True
    except Exception as e:
        print(f"Error adding markdown cell: {str(e)}", file=sys.stderr)
        return False

def hello():
    """Example function to test the extension."""
    print("Hello function called", file=sys.stderr)
    return "Hello from ReproLab!"

def add(a, b):
    """Return the sum of a and b."""
    return a + b 
