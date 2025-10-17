# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is `@jitsi/js-utils`, a collection of utility libraries for Jitsi JavaScript projects. The package is published to npm and provides shared functionality across the Jitsi ecosystem. This is a JavaScript/TypeScript hybrid project that exports ES6 modules.

## Development Commands

### Build and Type Generation
- `npm run build` - Compile TypeScript files using tsc
- `npm run gen-types` - Generate TypeScript declaration files in the `types/` directory
- `npm run prepack` - Runs both build and gen-types (automatically runs before publishing)

### Linting
- `npm run lint` - Run ESLint using @jitsi/eslint-config
- Always run linting before committing changes

## Code Architecture

### Module Structure
The codebase is organized as a collection of independent utility modules, each in its own directory:

- **avatar/** - Avatar generation utilities
- **browser-detection/** - Browser and environment detection using ua-parser-js
  - Uses TypeScript with `BrowserDetection` class
  - Maps various browser names to Jitsi-specific naming conventions
  - Detects React Native, Electron, Chromium-based browsers, engines (Blink, Gecko, WebKit)

- **jitsi-local-storage/** - LocalStorage wrapper with fallback
  - Provides `JitsiLocalStorage` class extending EventEmitter
  - Falls back to `DummyLocalStorage` (in-memory) when localStorage is unavailable
  - Emits 'changed' events on modifications
  - Supports serialization with optional key exclusion

- **json.ts** - Safe JSON parsing using @hapi/bourne

- **polyfills/** - Browser polyfills (currently querySelector-related)

- **random/** - Random utility functions
  - `roomNameGenerator.js` - Generate random room names
  - `randomUtil.js` - General random utilities

- **transport/** - Message transport abstraction with request/response pattern
  - `Transport.js` - Main transport class with event emitter pattern
  - Handles MESSAGE_TYPE_EVENT, MESSAGE_TYPE_REQUEST, MESSAGE_TYPE_RESPONSE
  - Implements pluggable backends via `setBackend()`
  - `PostMessageTransportBackend.js` - postMessage-based backend
  - `postis.js` - Third-party postMessage utility (used by PostMessageTransportBackend)

- **uri/** - URI manipulation utilities

### Entry Point
The main `index.js` re-exports all module functionality:

### TypeScript Configuration
- Target: ES6 modules
- Strict mode enabled
- Declaration files generated in `types/` directory
- Only compiles specific TypeScript files (browser-detection, json.ts, polyfills)
- Most of the codebase remains in JavaScript

### Package Publishing
- Published as `@jitsi/js-utils` to npm with public access
- Main entry: `index.js`
- Type: ES module
- The `files` field in package.json controls what gets published
- AutoPublish workflow triggers on master branch pushes
- Version bumping handled automatically by gh-action-bump-version

## Key Dependencies
- `@hapi/bourne` - Safe JSON parsing (prevents prototype pollution)
- `js-md5` - MD5 hashing
- `ua-parser-js` - User agent parsing for browser detection

## Coding Conventions
- Uses @jitsi/eslint-config with @babel/eslint-parser
- JSDoc comments for all public APIs
- Private members prefixed with underscore (_)
- Event emitter pattern used for reactive components (JitsiLocalStorage, Transport)

## TypeScript Migration
The project is gradually migrating from JavaScript to TypeScript. When adding features:
- New utilities should be written in TypeScript when possible
- When modifying existing JavaScript files, consider converting to TypeScript if it makes sense
- Update tsconfig.json `include` array when adding new TypeScript files
- Run `npm run build` and `npm run gen-types` to ensure type generation works

## Testing and CI
- CI runs on pull requests via GitHub Actions
- Linting is enforced in CI (no test suite currently defined)
