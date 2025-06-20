import pandas as pd
import numpy as np
import xarray as xr

import json
import gzip
import os
import hashlib
import inspect
import boto3
from botocore.exceptions import ClientError
from typing import Union, Type, Dict, Callable, Any, Optional
from functools import wraps
from pathlib import Path
import os
import yaml
import datetime
import os
import glob
import pprint

# Define supported data types for type hints
SupportedDataTypes = Union[
    pd.DataFrame,
    pd.Series,
    np.ndarray,
    dict,
    list,
    xr.Dataset,
    xr.DataArray
]

# Ensure .reprolab_data directory exists
REPROLAB_DATA_DIR = 'reprolab_data'
os.makedirs(REPROLAB_DATA_DIR, exist_ok=True)

# Mapping from type names to actual types and vice versa
TYPE_MAPPING: Dict[str, Type[SupportedDataTypes]] = {
    'DataFrame': pd.DataFrame,
    'Series': pd.Series,
    'ndarray': np.ndarray,
    'dict': dict,
    'list': list,
    'Dataset': xr.Dataset,
    'DataArray': xr.DataArray
}

# Reverse mapping for getting type names
TYPE_NAME_MAPPING = {v: k for k, v in TYPE_MAPPING.items()}

def _get_function_hash(func: Callable, args: tuple, kwargs: dict) -> str:
    """
    Calculate a unique hash for a function call based on its code and arguments.
    The hash is based on the function's body and arguments, excluding decorators.
    
    Args:
        func: The function to hash
        args: Positional arguments
        kwargs: Keyword arguments
    
    Returns:
        str: MD5 hash of the function body and its arguments
    """
    # Get function source code
    source = inspect.getsource(func)
    
    # Remove decorators from source code
    lines = source.split('\n')
    # Skip decorator lines (lines starting with @)
    body_lines = [line for line in lines if not line.strip().startswith('@')]
    # Skip empty lines at the start
    while body_lines and not body_lines[0].strip():
        body_lines.pop(0)
    # Reconstruct source without decorators
    source = '\n'.join(body_lines)
    
    # Convert args and kwargs to a stable string representation
    args_str = str(args)
    kwargs_str = str(sorted(kwargs.items()))
    
    # Combine all components and create hash
    hash_input = f"{source}{args_str}{kwargs_str}"
    return hashlib.md5(hash_input.encode()).hexdigest()

def persistio(only_local: bool = False) -> Callable:
    """
    Decorator that caches function results using save_compact and read_compact.
    The cache is based on a hash of the function's source code and its arguments.
    If only_local is False, it will also try to load/save from cloud storage.
    
    Args:
        only_local: If True, only use local storage. If False, also use cloud storage.
    
    Returns:
        Callable: Decorated function that caches its results
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            # Calculate hash for this function call
            name_hash = _get_function_hash(func, args, kwargs)
            print(f"\n[persistio] Function: {func.__name__}")
            print(f"[persistio] Hash: {name_hash}")
            
            # Log and record metadata for every persistio trigger
            try:
                # Get function source code for code_origin
                code_origin = inspect.getsource(func)
                # Get bucket name from AWS environment (if available)
                bucket_name = None
                if not only_local:
                    try:
                        aws_env = get_aws_env()
                        bucket_name = aws_env['AWS_BUCKET']
                    except Exception:
                        bucket_name = "local_only"
                else:
                    bucket_name = "local_only"
                
                # Persist metadata for the current notebook
                persist_metadata_for_current_notebook(name_hash, code_origin, bucket_name)
                print(f"[persistio] Trigger logged for function: {func.__name__}")
            except Exception as metadata_error:
                print(f"[persistio] Failed to log trigger metadata: {str(metadata_error)}")
            
            # Try to read from local cache first
            try:
                print("[persistio] Attempting to load from local cache...")
                result = read_compact(name_hash)
                print("[persistio] Successfully loaded from local cache!")
                return result
            except ValueError:
                print("[persistio] Local cache miss")
            
            # If local cache fails and cloud is enabled, try cloud
            if not only_local:
                try:
                    print("[persistio] Attempting to load from cloud...")
                    # Get AWS credentials
                    aws_env = get_aws_env()
                    
                    # Initialize S3 client
                    s3_client = boto3.client(
                        's3',
                        aws_access_key_id=aws_env['AWS_ACCESS_KEY_ID'],
                        aws_secret_access_key=aws_env['AWS_SECRET_ACCESS_KEY']
                    )
                    
                    # List objects in bucket with the hash prefix
                    response = s3_client.list_objects_v2(
                        Bucket=aws_env['AWS_BUCKET'],
                        Prefix=name_hash
                    )
                    
                    # Check if we found any matching files
                    if 'Contents' in response:
                        # Get the first matching file
                        cloud_file = response['Contents'][0]['Key']
                        print(f"[persistio] Found file in cloud: {cloud_file}")
                        download_from_cloud(cloud_file)
                        result = read_compact(name_hash)
                        print("[persistio] Successfully loaded from cloud!")
                        return result
                    else:
                        print("[persistio] No matching file found in cloud")
                except Exception as e:
                    print(f"[persistio] Cloud load failed: {str(e)}")
            
            # If both local and cloud attempts fail, execute function
            print("[persistio] Cache miss - executing function...")
            result = func(*args, **kwargs)
            
            # Save result if it's a supported type
            if isinstance(result, tuple(TYPE_MAPPING.values())):
                print(f"[persistio] Saving result of type {type(result).__name__} to cache...")
                save_compact(result, name_hash)
                print("[persistio] Successfully saved to local cache!")
                
                if not only_local:
                    try:
                        # Find the file that was just saved
                        matching_files = [f for f in os.listdir(REPROLAB_DATA_DIR) if f.startswith(name_hash + '.')]
                        if matching_files:
                            cloud_file = matching_files[0]
                            upload_to_cloud(cloud_file)
                            print("[persistio] Successfully saved to cloud!")
                    except Exception as e:
                        print(f"[persistio] Cloud save failed: {str(e)}")
            else:
                print(f"[persistio] Result type {type(result).__name__} not supported for caching")
            
            return result
        
        return wrapper
    return decorator

def _get_extension(data_type: Type[SupportedDataTypes]) -> str:
    """
    Get the appropriate file extension for a given data type.
    
    Args:
        data_type: The type of data to get extension for.
    
    Returns:
        str: The appropriate file extension (e.g., '.parquet', '.npy', '.json.gz', '.nc')
    """
    if data_type in (pd.DataFrame, pd.Series):
        return '.parquet'
    elif data_type == np.ndarray:
        return '.npy'
    elif data_type in (dict, list):
        return '.json.gz'
    elif data_type in (xr.Dataset, xr.DataArray):
        return '.nc'
    else:
        raise ValueError(f"Unsupported data type: {data_type}")

def save_compact(data: SupportedDataTypes, name_hash: str) -> None:
    """
    Save a Python data structure to the most compact file format possible in the .reprolab_data directory.
    
    Args:
        data: Input data (pandas.DataFrame, pandas.Series, numpy.ndarray, dict, list,
              xarray.Dataset, or xarray.DataArray).
        name_hash: Prefix for the filename. The final filename will be in the format:
                  <name_hash>.<original_type>.<compact_type>
    
    Raises:
        ValueError: If data type is unsupported or name_hash is invalid.
        Exception: For file I/O or library-specific errors.
    """
    try:
        original_type = type(data)
        if original_type not in TYPE_NAME_MAPPING:
            raise ValueError(f"Unsupported data type: {original_type}. Supported types: {list(TYPE_MAPPING.keys())}")
            
        original_type_name = TYPE_NAME_MAPPING[original_type]
        compact_type = _get_extension(original_type).lstrip('.')
        
        file_name = f"{name_hash}.{original_type_name}.{compact_type}"
        file_path = os.path.join(REPROLAB_DATA_DIR, file_name)
        
        # Pandas DataFrame
        if isinstance(data, pd.DataFrame):
            data.to_parquet(file_path, engine='pyarrow', compression='snappy')
        
        # Pandas Series
        elif isinstance(data, pd.Series):
            data.to_frame().to_parquet(file_path, engine='pyarrow', compression='snappy')
        
        # NumPy Array (including Structured Array)
        elif isinstance(data, np.ndarray):
            np.save(file_path, data)
        
        # Python Dictionary or List
        elif isinstance(data, (dict, list)):
            with gzip.open(file_path, 'wt', encoding='utf-8', compresslevel=6) as f:
                json.dump(data, f)
        
        # xarray Dataset or DataArray
        elif isinstance(data, (xr.Dataset, xr.DataArray)):
            data.to_netcdf(file_path, engine='netcdf4', encoding={var: {'zlib': True, 'complevel': 6} for var in data.variables})
        
        else:
            raise ValueError(f"Unsupported data type: {type(data)}. Supported types: {list(TYPE_MAPPING.keys())}")
        
        print(f"Data saved compactly to {file_path} ({os.path.getsize(file_path)} bytes)")
    
    except Exception as e:
        raise Exception(f"Error saving data: {str(e)}")

def read_compact(name_hash: str) -> SupportedDataTypes:
    """
    Read a file saved in a compact format back into its original Python data type from the .reprolab_data directory.
    
    Args:
        name_hash: Prefix of the file to read. The function will look for a file matching:
                  <name_hash>.<original_type>.<compact_type>
    
    Returns:
        Data in its original Python type (pandas.DataFrame, pandas.Series, numpy.ndarray, dict, list,
        xarray.Dataset, or xarray.DataArray).
    
    Raises:
        ValueError: If file does not exist, format is unsupported, or type is invalid.
        Exception: For file I/O or library-specific errors.
    """
    # Find the file with the given prefix
    matching_files = [f for f in os.listdir(REPROLAB_DATA_DIR) if f.startswith(name_hash + '.')]
    
    if not matching_files:
        raise ValueError(f"No file found with prefix '{name_hash}' in {REPROLAB_DATA_DIR}")
    if len(matching_files) > 1:
        raise ValueError(f"Multiple files found with prefix '{name_hash}' in {REPROLAB_DATA_DIR}: {matching_files}")
    
    file_name = matching_files[0]
    file_path = os.path.join(REPROLAB_DATA_DIR, file_name)
    
    # Extract original type from filename
    _, original_type_name, _ = file_name.split('.')
    if original_type_name not in TYPE_MAPPING:
        raise ValueError(f"Unknown type name in filename: {original_type_name}")
    
    original_type = TYPE_MAPPING[original_type_name]
    
    try:
        # Pandas DataFrame
        if original_type == pd.DataFrame:
            return pd.read_parquet(file_path, engine='pyarrow')
        
        # Pandas Series
        elif original_type == pd.Series:
            df = pd.read_parquet(file_path, engine='pyarrow')
            if df.shape[1] != 1:
                raise ValueError("Parquet file must contain exactly one column for Series")
            return df.iloc[:, 0]
        
        # NumPy Array (including Structured Array)
        elif original_type == np.ndarray:
            return np.load(file_path)
        
        # Python Dictionary
        elif original_type == dict:
            with gzip.open(file_path, 'rt', encoding='utf-8') as f:
                return json.load(f)
        
        # Python List
        elif original_type == list:
            with gzip.open(file_path, 'rt', encoding='utf-8') as f:
                return json.load(f)
        
        # xarray Dataset
        elif original_type == xr.Dataset:
            return xr.open_dataset(file_path, engine='netcdf4')
        
        # xarray DataArray
        elif original_type == xr.DataArray:
            ds = xr.open_dataset(file_path, engine='netcdf4')
            if len(ds.data_vars) != 1:
                raise ValueError("NetCDF file must contain exactly one variable for DataArray")
            return ds[list(ds.data_vars.keys())[0]]
        
        else:
            raise ValueError(f"Unsupported original type: {original_type}. Supported types: {list(TYPE_MAPPING.keys())}")
    
    except Exception as e:
        raise Exception(f"Error reading data: {str(e)}")

def get_aws_env() -> dict:
    """
    Read AWS credentials from aws_env.json file in the reprolab_data directory.
    
    Returns:
        dict: Dictionary containing AWS credentials (AWS_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
    
    Raises:
        ValueError: If required credentials are missing
    """
    try:
        aws_env_path = Path(REPROLAB_DATA_DIR) / 'aws_env.json'
        if not aws_env_path.exists():
            raise ValueError("AWS credentials file not found")
            
        with open(aws_env_path) as f:
            env_vars = json.load(f)
            
        # Check for required credentials
        required_vars = ['AWS_BUCKET', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY']
        missing_vars = [var for var in required_vars if var not in env_vars or not env_vars[var]]
        
        if missing_vars:
            raise ValueError(f"Missing required AWS credentials: {', '.join(missing_vars)}")
            
        return env_vars
    except Exception as e:
        raise ValueError(f"Could not read AWS credentials: {str(e)}")

def upload_to_cloud(file_name: str) -> None:
    """
    Upload a file from reprolab_data to S3.
    
    Args:
        file_name: Name of the file to upload (must exist in reprolab_data)
    
    Raises:
        ValueError: If required credentials are not set
        Exception: If upload fails
    """
    try:
        # Get AWS credentials
        aws_env = get_aws_env()
        
        # Initialize S3 client
        s3_client = boto3.client(
            's3',
            aws_access_key_id=aws_env['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=aws_env['AWS_SECRET_ACCESS_KEY']
        )
        
        # Create full local path
        local_path = os.path.join(REPROLAB_DATA_DIR, file_name)
        if not os.path.exists(local_path):
            raise ValueError(f"File not found: {local_path}")
        
        print(f"[upload_to_cloud] Uploading {local_path} to s3://{aws_env['AWS_BUCKET']}/{file_name}")
        s3_client.upload_file(local_path, aws_env['AWS_BUCKET'], file_name)
        print(f"[upload_to_cloud] Successfully uploaded to s3://{aws_env['AWS_BUCKET']}/{file_name}")
        
    except ClientError as e:
        raise Exception(f"Failed to upload file: {str(e)}")
    except Exception as e:
        raise Exception(f"Error during upload: {str(e)}")

def download_from_cloud(file_name: str) -> str:
    """
    Download a file from S3 and save it to reprolab_data.
    
    Args:
        file_name: Name of the file to download
    
    Returns:
        str: Path to the downloaded file
    
    Raises:
        ValueError: If required credentials are not set
        Exception: If download fails
    """
    try:
        # Get AWS credentials
        aws_env = get_aws_env()
        
        # Initialize S3 client
        s3_client = boto3.client(
            's3',
            aws_access_key_id=aws_env['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=aws_env['AWS_SECRET_ACCESS_KEY']
        )
        
        # Create local path
        local_path = os.path.join(REPROLAB_DATA_DIR, file_name)
        
        print(f"[download_from_cloud] Downloading s3://{aws_env['AWS_BUCKET']}/{file_name} to {local_path}")
        s3_client.download_file(aws_env['AWS_BUCKET'], file_name, local_path)
        print(f"[download_from_cloud] Successfully downloaded to {local_path}")
        
        return local_path
        
    except ClientError as e:
        raise Exception(f"Failed to download file: {str(e)}")
    except Exception as e:
        raise Exception(f"Error during download: {str(e)}")


def get_last_changed_notebook():
    """
    Returns the name of the most recently modified Jupyter notebook (.ipynb) file 
    in the current directory.
    """
    try:
        # Find all .ipynb files in the current directory
        notebook_files = glob.glob('*.ipynb')
        if not notebook_files:
            raise RuntimeError("No .ipynb files found in the current directory")
        
        # Get the most recently modified notebook
        latest_notebook = max(notebook_files, key=os.path.getmtime)
        return latest_notebook
    except Exception as e:
        raise RuntimeError(f"Error finding last changed notebook: {str(e)}")

def persist_metadata_for_current_notebook(cell_hash, code_origin, bucket_name):
    notebook_name = get_last_changed_notebook()
    
    try:
        yaml_filename = f"{notebook_name}_persistio_archive.yaml"
        now_iso = datetime.datetime.now(datetime.UTC)

        if os.path.exists(yaml_filename):
            with open(yaml_filename, 'r') as f:
                metadata = yaml.safe_load(f) or {}
        else:
            metadata = {}

        metadata['jupyter_notebook'] = notebook_name
        metadata['last_executed'] = now_iso

        if 'creation_data' not in metadata:
            metadata['creation_data'] = now_iso

        if 'bucket_name' not in metadata:
            metadata['bucket_name'] = bucket_name

        if 'cells_instrumented' not in metadata:
            metadata['cells_instrumented'] = []

        # Format code_origin properly for YAML
        formatted_code_origin = pprint.pformat(code_origin.strip(), width=80, depth=None, compact=False)
        
        existing = next((cell for cell in metadata['cells_instrumented'] if cell['hash'] == cell_hash), None)
        if existing:
            existing['code_origin'] = formatted_code_origin
        else:
            metadata['cells_instrumented'].append({
                'hash': cell_hash,
                'code_origin': formatted_code_origin
            })

        # Use custom YAML dumper to avoid anchors and format code properly
        class NoAliasDumper(yaml.SafeDumper):
            def ignore_aliases(self, data):
                return True
        
        # Custom representer for datetime objects
        def represent_datetime(dumper, data):
            return dumper.represent_scalar('tag:yaml.org,2002:str', data.isoformat())
        
        # Custom representer for code_origin to preserve formatting
        def represent_str(dumper, data):
            if '\n' in data:
                return dumper.represent_scalar('tag:yaml.org,2002:str', data, style='|')
            return dumper.represent_scalar('tag:yaml.org,2002:str', data)
        
        NoAliasDumper.add_representer(datetime.datetime, represent_datetime)
        NoAliasDumper.add_representer(str, represent_str)

        with open(yaml_filename, 'w') as f:
            yaml.dump(metadata, f, Dumper=NoAliasDumper, sort_keys=False, default_flow_style=False, indent=2)

        print(f"✅ Metadata written to {yaml_filename}")
    except Exception as e:
        print(f"❌ Error persisting metadata: {e}")

def download_notebook_cache_package(notebook_name: str, output_zip_path: str = None) -> str:
    """
    Download all cached data for a given notebook and package it with metadata into a zip file.
    
    Args:
        notebook_name: Name of the notebook (with or without .ipynb extension)
        output_zip_path: Optional path for the output zip file. If None, uses default naming.
    
    Returns:
        str: Path to the created zip file
    
    Raises:
        ValueError: If notebook metadata file is not found
        Exception: If download or packaging fails
    """
    import zipfile
    import tempfile
    import shutil
    
    try:
        # Construct the metadata filename - try both with and without .ipynb extension
        yaml_filename_with_ext = f"{notebook_name}_persistio_archive.yaml"
        yaml_filename_without_ext = f"{notebook_name.replace('.ipynb', '')}_persistio_archive.yaml"
        
        # Check if metadata file exists (try both variations)
        yaml_filename = None
        if os.path.exists(yaml_filename_with_ext):
            yaml_filename = yaml_filename_with_ext
        elif os.path.exists(yaml_filename_without_ext):
            yaml_filename = yaml_filename_without_ext
        else:
            # Try to find any matching metadata file
            possible_files = [f for f in os.listdir('.') if f.endswith('_persistio_archive.yaml')]
            if possible_files:
                yaml_filename = possible_files[0]
                print(f"[download_notebook_cache_package] Found metadata file: {yaml_filename}")
            else:
                raise ValueError(f"Metadata file not found. Tried: {yaml_filename_with_ext}, {yaml_filename_without_ext}")
        
        # Load metadata
        with open(yaml_filename, 'r') as f:
            metadata = yaml.safe_load(f)
        
        if not metadata or 'cells_instrumented' not in metadata:
            raise ValueError(f"No cached data found in metadata file: {yaml_filename}")
        
        # Create output zip path if not provided
        if output_zip_path is None:
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            output_zip_path = f"{notebook_name}_cache_package_{timestamp}.zip"
        
        print(f"[download_notebook_cache_package] Processing notebook: {notebook_name}")
        print(f"[download_notebook_cache_package] Using metadata file: {yaml_filename}")
        print(f"[download_notebook_cache_package] Found {len(metadata['cells_instrumented'])} cached functions")
        
        # Create temporary directory for organizing files
        with tempfile.TemporaryDirectory() as temp_dir:
            # Copy metadata file to temp directory
            temp_yaml_path = os.path.join(temp_dir, yaml_filename)
            shutil.copy2(yaml_filename, temp_yaml_path)
            
            # Get AWS environment for cloud downloads
            aws_env = None
            try:
                aws_env = get_aws_env()
                print(f"[download_notebook_cache_package] Using cloud storage: {aws_env['AWS_BUCKET']}")
            except Exception as e:
                print(f"[download_notebook_cache_package] Cloud storage not available: {str(e)}")
            
            # Download each cached file
            downloaded_count = 0
            for cell_info in metadata['cells_instrumented']:
                cell_hash = cell_info['hash']
                
                # Check if file exists locally first
                local_files = [f for f in os.listdir(REPROLAB_DATA_DIR) if f.startswith(cell_hash + '.')]
                
                if local_files:
                    # File exists locally, copy it
                    local_file = local_files[0]
                    local_path = os.path.join(REPROLAB_DATA_DIR, local_file)
                    temp_path = os.path.join(temp_dir, local_file)
                    shutil.copy2(local_path, temp_path)
                    print(f"[download_notebook_cache_package] Copied local file: {local_file}")
                    downloaded_count += 1
                
                elif aws_env:
                    # Try to download from cloud
                    try:
                        s3_client = boto3.client(
                            's3',
                            aws_access_key_id=aws_env['AWS_ACCESS_KEY_ID'],
                            aws_secret_access_key=aws_env['AWS_SECRET_ACCESS_KEY']
                        )
                        
                        # List objects with the hash prefix
                        response = s3_client.list_objects_v2(
                            Bucket=aws_env['AWS_BUCKET'],
                            Prefix=cell_hash
                        )
                        
                        if 'Contents' in response:
                            cloud_file = response['Contents'][0]['Key']
                            temp_path = os.path.join(temp_dir, cloud_file)
                            
                            # Download from S3
                            s3_client.download_file(aws_env['AWS_BUCKET'], cloud_file, temp_path)
                            print(f"[download_notebook_cache_package] Downloaded from cloud: {cloud_file}")
                            downloaded_count += 1
                        else:
                            print(f"[download_notebook_cache_package] Warning: No cloud file found for hash: {cell_hash}")
                    
                    except Exception as e:
                        print(f"[download_notebook_cache_package] Warning: Failed to download {cell_hash} from cloud: {str(e)}")
                else:
                    print(f"[download_notebook_cache_package] Warning: No local or cloud file found for hash: {cell_hash}")
            
            # Create zip file
            print(f"[download_notebook_cache_package] Creating zip package: {output_zip_path}")
            with zipfile.ZipFile(output_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                # Add all files from temp directory to zip
                for root, dirs, files in os.walk(temp_dir):
                    for file in files:
                        file_path = os.path.join(root, file)
                        arc_name = os.path.relpath(file_path, temp_dir)
                        zipf.write(file_path, arc_name)
            
            print(f"[download_notebook_cache_package] ✅ Successfully created package: {output_zip_path}")
            print(f"[download_notebook_cache_package] 📦 Package contains {downloaded_count} cached files + metadata")
            
            return output_zip_path
    
    except Exception as e:
        raise Exception(f"Failed to create notebook cache package: {str(e)}")

import subprocess

def commit_and_checkout_git_tag(tag, repo_path='.'):
    try:
        # Ensure the tag exists
        result = subprocess.run(
            ['git', '-C', repo_path, 'tag'],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        tags = [t for t in result.stdout.strip().split('\n') if t]

        if tag not in tags:
            print(f"Tag '{tag}' not found.")
            return False

        # Stage all changes (new, modified, deleted)
        subprocess.run(['git', '-C', repo_path, 'add', '-A'], check=True)

        # Check if there is anything to commit
        status_result = subprocess.run(
            ['git', '-C', repo_path, 'status', '--porcelain'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

        if status_result.stdout.strip():  # There are changes to commit
            subprocess.run(
                ['git', '-C', repo_path, 'commit', '-m', f'Committing before checkout to tag {tag}'],
                check=True
            )
            print(f"Committed changes before checking out to tag '{tag}'.")
        else:
            print("No changes to commit before checkout.")

        # Checkout to the tag
        subprocess.run(['git', '-C', repo_path, 'checkout', tag], check=True)
        print(f"Checked out to tag '{tag}' successfully.")
        return True

    except subprocess.CalledProcessError as e:
        print(f"Error: {e.stderr}")
        return False

def download_reproducability_package(tag_name: str) -> str:
    """
    Create a complete reproducibility package for a given git tag.
    
    This function:
    1. Checks out to the specified git tag
    2. Downloads code package as <tag>_code.zip
    3. Downloads data package as <tag>_data.zip
    4. Combines both into <tag>_reproducability_package.zip
    
    Args:
        tag_name: The git tag to create the package for
    
    Returns:
        str: Path to the final reproducibility package zip file
    
    Raises:
        Exception: If any step in the process fails
    """
    import zipfile
    import tempfile
    import shutil
    import glob
    
    try:
        print(f"[download_reproducability_package] 🚀 Starting reproducibility package creation for tag: {tag_name}")
        
        # Step 1: Checkout to the git tag
        print(f"[download_reproducability_package] 📋 Step 1: Checking out to git tag '{tag_name}'")
        if not commit_and_checkout_git_tag(tag_name):
            raise Exception(f"Failed to checkout to tag '{tag_name}'")
        
        # Step 2: Find all notebooks in the current directory
        print(f"[download_reproducability_package] 📋 Step 2: Finding notebooks")
        notebook_files = glob.glob('*.ipynb')
        if not notebook_files:
            raise Exception("No .ipynb files found in the current directory")
        
        print(f"[download_reproducability_package] Found {len(notebook_files)} notebooks: {notebook_files}")
        
        # Step 3: Create code package (all files except those in folders starting with .)
        print(f"[download_reproducability_package] 📋 Step 3: Creating code package")
        code_zip_path = f"{tag_name}_code.zip"
        
        with zipfile.ZipFile(code_zip_path, 'w', zipfile.ZIP_DEFLATED) as code_zip:
            # Add all files in the current directory and subdirectories
            for root, dirs, files in os.walk('.'):
                # Skip directories that start with a dot and node_modules
                dirs[:] = [d for d in dirs if not d.startswith('.') and d != 'node_modules']
                
                for file in files:
                    # Skip certain file types
                    if file.endswith(('.pyc', '.pyo', '.DS_Store', '.zip', '.tar.gz')):
                        continue
                    
                    file_path = os.path.join(root, file)
                    # Use relative path for the archive
                    arc_name = os.path.relpath(file_path, '.')
                    code_zip.write(file_path, arc_name)
                    print(f"[download_reproducability_package] Added to code package: {arc_name}")
        
        print(f"[download_reproducability_package] ✅ Code package created: {code_zip_path}")
        
        # Step 4: Create data packages for each notebook
        print(f"[download_reproducability_package] 📋 Step 4: Creating data packages")
        data_packages = []
        
        for notebook in notebook_files:
            notebook_name = notebook.replace('.ipynb', '')
            try:
                data_zip_path = f"{tag_name}_{notebook_name}_data.zip"
                download_notebook_cache_package(notebook_name, data_zip_path)
                data_packages.append(data_zip_path)
                print(f"[download_reproducability_package] ✅ Data package created: {data_zip_path}")
            except Exception as e:
                print(f"[download_reproducability_package] ⚠️ Warning: Failed to create data package for {notebook_name}: {str(e)}")
        
        # Step 5: Create final reproducibility package
        print(f"[download_reproducability_package] 📋 Step 5: Creating final reproducibility package")
        final_package_path = f"{tag_name}_reproducability_package.zip"
        
        with zipfile.ZipFile(final_package_path, 'w', zipfile.ZIP_DEFLATED) as final_zip:
            # Add code package
            final_zip.write(code_zip_path, f"code/{code_zip_path}")
            print(f"[download_reproducability_package] Added to final package: code/{code_zip_path}")
            
            # Add data packages
            for data_package in data_packages:
                final_zip.write(data_package, f"data/{data_package}")
                print(f"[download_reproducability_package] Added to final package: data/{data_package}")
            
            # Add a README file with package information
            readme_content = f"""# Reproducibility Package for Tag: {tag_name}

This package contains all the code and data needed to reproduce the results from git tag '{tag_name}'.

## Contents

### Code Package
- `code/{code_zip_path}`: Contains all project files (excluding files in folders starting with '.' and node_modules)

### Data Packages
"""
            for data_package in data_packages:
                notebook_name = data_package.replace(f"{tag_name}_", "").replace("_data.zip", "")
                readme_content += f"- `data/{data_package}`: Cached data for {notebook_name}.ipynb\n"
            
            readme_content += f"""
## Usage

1. Extract this package
2. Extract the code package to get the notebooks
3. Extract the data packages to get the cached data
4. Run the notebooks with the reprolab environment

## Package Creation Details
- Created on: {datetime.datetime.now(datetime.UTC).isoformat()}
- Git tag: {tag_name}
- Total notebooks: {len(notebook_files)}
- Total data packages: {len(data_packages)}
"""
            
            final_zip.writestr("README.md", readme_content)
            print(f"[download_reproducability_package] Added to final package: README.md")
        
        # Clean up intermediate files
        print(f"[download_reproducability_package] 🧹 Cleaning up intermediate files")
        try:
            os.remove(code_zip_path)
            for data_package in data_packages:
                os.remove(data_package)
            print(f"[download_reproducability_package] ✅ Intermediate files cleaned up")
        except Exception as e:
            print(f"[download_reproducability_package] ⚠️ Warning: Failed to clean up some intermediate files: {str(e)}")
        
        print(f"[download_reproducability_package] 🎉 SUCCESS! Reproducibility package created: {final_package_path}")
        print(f"[download_reproducability_package] 📦 Package contains:")
        print(f"   - Code package with {len(notebook_files)} notebooks")
        print(f"   - {len(data_packages)} data packages")
        print(f"   - README with usage instructions")
        
        # Checkout back to main branch
        print(f"[download_reproducability_package] 🔄 Checking out to main branch...")
        try:
            subprocess.run(['git', 'checkout', 'main'], check=True)
            print(f"[download_reproducability_package] ✅ Successfully checked out to main branch")
        except subprocess.CalledProcessError as e:
            print(f"[download_reproducability_package] ⚠️ Warning: Failed to checkout to main branch: {str(e)}")
        
        return final_package_path
    
    except Exception as e:
        print(f"[download_reproducability_package] ❌ ERROR: Failed to create reproducibility package: {str(e)}")
        raise Exception(f"Failed to create reproducibility package for tag '{tag_name}': {str(e)}")

import subprocess
import re

def list_and_sort_git_tags(repo_path='.'):
    try:
        result = subprocess.run(
            ['git', '-C', repo_path, 'tag'],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        tags = result.stdout.strip().split('\n')
        tags = [tag for tag in tags if tag]

        # Convert tags like v1.2.3 to 123 for sorting
        def tag_to_sort_key(tag):
            match = re.match(r'v(\d+)\.(\d+)\.(\d+)', tag)
            if match:
                return int(''.join(match.groups()))
            return -1  # Push malformed tags to the end

        sorted_tags = sorted(tags, key=tag_to_sort_key, reverse=True)
        return sorted_tags
    except subprocess.CalledProcessError as e:
        print(f"Error listing tags: {e.stderr}")
        return []

