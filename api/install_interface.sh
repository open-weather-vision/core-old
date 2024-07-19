#!/bin/sh
# This script installs an interface
git clone $1 > /dev/null
$folder_name="$(basename "$_" .git)"
cd $folder_name
npm start > /dev/null
echo $folder_name