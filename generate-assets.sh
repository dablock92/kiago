#!/bin/bash

# Exit on error
set -e

# Create backup of current assets
echo "Creating backup of current assets in assets/images/backup/..."
mkdir -p assets/images/backup
cp assets/images/*.png assets/images/backup/ 2>/dev/null || true

# Generate icon.png (1024x1024)
echo "Generating icon.png..."
sips --resampleHeightWidthMax 1024 KIAGO.png --out assets/images/icon.png
sips --padToHeightWidth 1024 1024 assets/images/icon.png

# Generate adaptive-icon.png (1024x1024 foreground with safe area padding)
echo "Generating adaptive-icon.png..."
sips --resampleHeightWidthMax 600 KIAGO.png --out assets/images/adaptive-icon.png
sips --padToHeightWidth 1024 1024 assets/images/adaptive-icon.png

# Generate favicon.png (48x48)
echo "Generating favicon.png..."
sips --resampleHeightWidthMax 48 KIAGO.png --out assets/images/favicon.png
sips --padToHeightWidth 48 48 assets/images/favicon.png

# Generate splash.png (1284x2778 portrait splash screen)
echo "Generating splash.png..."
sips --resampleHeightWidthMax 400 KIAGO.png --out assets/images/splash.png
sips --padToHeightWidth 2778 1284 assets/images/splash.png

# Generate splash-icon.png (1024x1024)
echo "Generating splash-icon.png..."
sips --resampleHeightWidthMax 1024 KIAGO.png --out assets/images/splash-icon.png
sips --padToHeightWidth 1024 1024 assets/images/splash-icon.png

echo "Done! Assets generated successfully."
