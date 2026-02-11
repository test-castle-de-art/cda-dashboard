#!/bin/bash
# Build server bundle and frontend assets
npm run build:server
npx vite build --outDir dist/src

echo "Build complete"