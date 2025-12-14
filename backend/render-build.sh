#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install system dependencies
# ffmpeg is often needed for moviepy/audio tasks
apt-get update && apt-get install -y ffmpeg

# Upgrade pip
pip install --upgrade pip

# Install Python dependencies
pip install -r backend/requirements.txt
