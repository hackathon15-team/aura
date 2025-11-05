# Observer Agent

**Role:** Dynamic content monitoring and real-time accessibility maintenance specialist

**Responsibility:** Watches for DOM changes and applies accessibility fixes to dynamically loaded content.

## Tasks

1. **MutationObserver setup**
   - Watch entire document for changes
   - Configure: childList, subtree, attributes
   - Efficient filtering of relevant mutations
   - Debouncing for performance

2. **Dynamic content detection**
   - New elements added to DOM
   - Elements removed from DOM
   - Attribute changes on existing elements
   - Text content changes
   - Style changes that affect semantics

3. **SPA (Single Page Application) support**
   - Detect route changes
   - Re-scan on navigation
   - Handle framework-specific updates (React, Vue, Angular)
   - Support History API navigation

4. **AJAX/Fetch content handling**
   - Detect XHR/Fetch responses
   - Monitor for injected HTML
   - Handle JSON-rendered content
   - Process streamed content

5. **Dynamic elements processing**
   - Modals/dialogs appearing
   - Infinite scroll content
   - Lazy-loaded images
   - Auto-suggest dropdowns
   - Toast notifications
   - Live chat widgets

6. **Performance optimization**
   - Batch mutations before processing
   - Throttle high-frequency changes
   - Skip duplicate processing
   - Use requestIdleCallback for low priority
   - Prevent infinite observer loops

7. **Change prioritization**
   - P0: New interactive elements (buttons, forms)
   - P1: Structural changes (headings, landmarks)
   - P2: Visual changes (emphasis, decorative)
   - Process by priority under load

8. **Create observer modules**
   - `src/observer/MutationObserverManager.ts`
   - `src/observer/DynamicContentDetector.ts`
   - `src/observer/SPANavigationDetector.ts`
   - `src/observer/MutationBatcher.ts`
   - `src/observer/ChangeClassifier.ts`

## Critical Safety Measures

- **MUST prevent infinite loops:**
  - Disconnect observer before making changes
  - Reconnect after changes complete
  - Track processed elements to avoid re-processing
  - Set maximum recursion depth

- **Performance safeguards:**
  - Maximum mutations processed per batch: 100
  - Minimum delay between batches: 50ms
  - Maximum processing time per frame: 16ms
  - Timeout for stuck operations: 5s

## Integration Points

- Triggers Scanner Agent for new content
- Coordinates with all transformer agents
- Reports metrics to Performance Agent
- Uses same transformation pipeline as initial scan

## Success Criteria

- Detects all dynamic content additions
- Applies fixes within 100ms of content appearing
- No infinite loops or performance degradation
- Works on major SPA frameworks
- Handles infinite scroll smoothly

## Update TASKS.md

Mark Task 2.4 as complete when done.
