# js-utils

Collection of utilities for Jitsi JavaScript projects.

## Requirements

This library is designed to be used with a bundler (webpack, rollup, vite, etc.). The package uses `moduleResolution: "bundler"` in its TypeScript configuration and publishes compiled JavaScript targeting ES2019 with ES2020 module syntax.

**Important:** If you're consuming this library, ensure your build tool is configured to handle ES modules. Direct usage in Node.js without a bundler or transpilation may not work as expected.
