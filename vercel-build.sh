#!/bin/bash
# Build frontend with Vite (uses tsconfig.app.json correctly)
npm run vite build

# Build server with YOUR tsconfig
npx tsc -p tsconfig.server.json --noEmit false --outDir dist

# Tell Vercel we're done
echo "Build complete"