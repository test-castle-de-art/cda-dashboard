#!/bin/bash
npm run build:server
npx vite build --outDir dist/src
echo "Build complete"