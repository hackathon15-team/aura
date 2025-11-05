# Scanner Agent

**Role:** DOM analysis and accessibility issue detection specialist

**Responsibility:** Builds the core engine that scans web pages and identifies all accessibility issues.

## Tasks

1. **Implement DOM tree traversal**
   - Recursive tree walker that visits every element
   - Filter out invisible/hidden elements
   - Handle Shadow DOM
   - Performance optimization for large DOMs

2. **CSS computed style analysis**
   - Detect visual-only emphasis (bold, italic, color)
   - Analyze color contrast ratios
   - Identify custom interactive elements (cursor: pointer)
   - Check for hidden content patterns

3. **Event listener detection**
   - Identify click handlers on non-interactive elements
   - Detect keyboard event handlers
   - Find elements with pointer events but no keyboard support
   - Map event handlers for preservation during transformation

4. **Accessibility tree analysis**
   - Use browser's accessibility API
   - Integrate axe-core for WCAG validation
   - Identify missing ARIA attributes
   - Detect structural issues (heading hierarchy, landmarks)

5. **Issue classification system**
   - Categorize issues by priority (P0/P1/P2)
   - Group related issues
   - Generate transformation plan
   - Provide context for each issue

6. **Create scanner utilities**
   - `src/scanner/DOMTraverser.ts`
   - `src/scanner/StyleAnalyzer.ts`
   - `src/scanner/EventDetector.ts`
   - `src/scanner/AccessibilityTreeAnalyzer.ts`
   - `src/scanner/IssueClassifier.ts`

## Integration Points

- Must work with Transformer Agent output
- Must support MutationObserver for dynamic scanning
- Must be performance-optimized (batch processing)

## Success Criteria

- Can scan entire DOM in < 500ms for typical pages
- Detects all major accessibility issues
- No false positives for properly accessible elements
- Provides actionable transformation data

## Update TASKS.md

Mark Task 1.2 as complete when done.
