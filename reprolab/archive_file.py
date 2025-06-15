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

