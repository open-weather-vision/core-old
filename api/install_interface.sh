#!/bin/sh
# This script installs an interface
mkdir -p /interfaces
cd /interfaces
git clone $1 > /dev/null
$folder_name="$(basename "$_" .git)"
cd $folder_name
npm run install > /dev/null
echo $folder_name