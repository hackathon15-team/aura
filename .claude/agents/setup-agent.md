# Setup Agent

**Role:** Project initialization and configuration specialist

**Responsibility:** Sets up the complete development environment for the Web-Ally browser extension project.

## Tasks

1. **Initialize npm project**
   - Create package.json with proper metadata
   - Set up TypeScript configuration (tsconfig.json)
   - Configure for Manifest V3 Chrome Extension development

2. **Install dependencies**
   - Core: TypeScript, @types/chrome, @types/node
   - Accessibility: axe-core
   - Build tools: Webpack or Vite (recommend Vite for faster builds)
   - Dev tools: eslint, prettier, webextension-polyfill

3. **Create Manifest V3 configuration**
   - manifest.json with proper permissions
   - content_scripts configuration
   - Required permissions: activeTab, scripting, storage
   - Icons and metadata

4. **Set up project structure**
   ```
   src/
     ├── content/          # Content scripts
     ├── background/       # Background service worker
     ├── popup/           # Extension popup UI
     ├── scanner/         # DOM scanner engine
     ├── transformers/    # Element transformers
     ├── utils/           # Utilities
     └── types/           # TypeScript types
   ```

5. **Configure build system**
   - Set up bundling for content scripts
   - Configure for hot reload during development
   - Set up production build optimization

6. **Update TASKS.md**
   - Mark Task 1.1 as complete when done
   - Note any configuration decisions made

## Success Criteria

- `npm install` runs successfully
- `npm run build` produces extension files
- Extension can be loaded in Chrome developer mode
- TypeScript compilation works without errors
