#!/bin/sh
# This script installs an interface
mkdir -p /interfaces
cd /interfaces
git clone --quiet $1 > /dev/null
folder_name=$(basename "$1" .git)
cd $folder_name
echo -n $folder_name
npm run --silent build > /dev/null