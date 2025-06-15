import pandas as pd
import numpy as np
import xarray as xr
import json
import gzip
import os
from typing import Union, Type, Dict

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
REPROLAB_DATA_DIR = '.reprolab_data'
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
