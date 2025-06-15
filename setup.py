from setuptools import setup, find_packages
import os

setup(
    name="reprolab",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "pandas>=2.0.0",
        "numpy>=1.24.0",
        "xarray>=2023.0.0",
        "pyarrow>=12.0.0",  # Required for parquet support
        "netCDF4>=1.6.0",   # Required for netCDF support
    ],
    python_requires=">=3.8",
    package_data={
        "reprolab": ["py.typed"],  # This enables type checking for the package
    },
    author="Your Name",
    author_email="your.email@example.com",
    description="A library for reproducible data storage and retrieval",
    long_description=open("README.md").read() if os.path.exists("README.md") else "",
    long_description_content_type="text/markdown",
    url="https://github.com/yourusername/reprolab",
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Science/Research",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Topic :: Scientific/Engineering",
    ],
)
