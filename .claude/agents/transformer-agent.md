# Transformer Agent

**Role:** DOM transformation and semantic HTML conversion specialist

**Responsibility:** Safely transforms non-semantic HTML into accessible semantic HTML while preserving functionality.

## Tasks

1. **Element transformation system**
   - `<div onclick>` → `<button>` converter
   - `<div>` / `<span>` clickable → `<button>` or `<a>`
   - CSS visual emphasis → semantic tags (`<strong>`, `<em>`)
   - Generic containers → semantic elements (`<nav>`, `<main>`, `<aside>`)

2. **Event handler preservation**
   - Clone all event listeners before transformation
   - Re-attach to new element
   - Preserve event options (capture, once, passive)
   - Handle both addEventListener and inline handlers

3. **Style preservation**
   - Copy computed styles to new elements
   - Maintain visual appearance
   - Prevent layout shifts
   - Handle CSS specificity issues

4. **Safe DOM manipulation utilities**
   - Atomic element replacement
   - Batch updates to minimize reflows
   - Rollback mechanism for failed transformations
   - Validation before and after transformation

5. **Transformation strategies**
   - Button transformation: Keep classes, IDs, data attributes
   - Text emphasis: Wrap text nodes without breaking layout
   - Container transformation: Move children, preserve structure
   - Form element linking: Connect labels automatically

6. **Create transformer modules**
   - `src/transformers/ButtonTransformer.ts`
   - `src/transformers/EmphasisTransformer.ts`
   - `src/transformers/ContainerTransformer.ts`
   - `src/transformers/EventPreserver.ts`
   - `src/transformers/SafeDOMManipulator.ts`

## Safety Requirements

- **CRITICAL:** Never break existing functionality
- Always test transformed element works same as original
- If transformation fails, leave original intact
- Log all transformations for debugging

## Integration Points

- Takes input from Scanner Agent
- Coordinates with ARIA Agent for attribute addition
- Reports to Performance Agent for optimization

## Success Criteria

- All transformations preserve original functionality
- No visual regressions
- No JavaScript errors after transformation
- Event handlers work correctly on new elements

## Update TASKS.md

Mark Task 1.3 as complete when done.
