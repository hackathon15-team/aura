# Structure Agent

**Role:** Page structure and semantic architecture specialist

**Responsibility:** Improves overall document structure including landmarks, headings, and navigation.

## Tasks

1. **Landmark regions**
   - Identify and mark header (`<header>` or `role="banner"`)
   - Identify and mark footer (`<footer>` or `role="contentinfo"`)
   - Identify and mark navigation (`<nav>` or `role="navigation"`)
   - Identify and mark main content (`<main>` or `role="main"`)
   - Identify and mark sidebars (`<aside>` or `role="complementary"`)
   - Identify search areas (`role="search"`)

2. **Heading hierarchy**
   - Analyze existing heading structure (h1-h6)
   - Detect visual headings (large/bold text without semantic tags)
   - Fix hierarchy issues (no skipping levels)
   - Ensure single h1 per page
   - Add missing headings for major sections

3. **List structure**
   - Convert pseudo-lists to proper `<ul>` / `<ol>`
   - Ensure all list items are in `<li>` tags
   - Add structure to navigation menus
   - Fix nested list hierarchies

4. **Table accessibility**
   - Add `<caption>` to tables
   - Mark header cells with `<th>`
   - Add scope attribute (row/col)
   - Ensure data tables have proper structure

5. **Form structure**
   - Connect labels to inputs (for/id or wrapping)
   - Group related inputs with `<fieldset>` / `<legend>`
   - Add helpful hints with aria-describedby
   - Ensure proper tab order

6. **Skip navigation**
   - Add "Skip to main content" link
   - Ensure it's first focusable element
   - Make it visible on focus
   - Link to main content area

7. **Focus order optimization**
   - Ensure tab order is logical
   - Remove unnecessary tabindex=-1
   - Fix tabindex > 0 issues
   - Ensure modal focus trapping

8. **Create structure modules**
   - `src/structure/LandmarkDetector.ts`
   - `src/structure/HeadingAnalyzer.ts`
   - `src/structure/ListStructurer.ts`
   - `src/structure/TableEnhancer.ts`
   - `src/structure/FormStructurer.ts`
   - `src/structure/FocusManager.ts`

## Detection Heuristics

- **Header:** Top of page, contains logo/navigation
- **Navigation:** Multiple links, often in list format
- **Main:** Largest content area, unique to page
- **Aside:** Related content, sidebar position
- **Footer:** Bottom of page, copyright/links

## Integration Points

- Works in parallel with ARIA Agent
- Uses Scanner Agent data for detection
- Coordinates with Keyboard Agent for focus management

## Success Criteria

- All pages have proper landmark regions
- Heading hierarchy is logical and complete
- Forms are fully labeled and structured
- Users can navigate by landmarks
- Skip navigation works correctly

## Update TASKS.md

Mark Task 2.2 as complete when done.
