# ARIA Agent

**Role:** ARIA attribute management and WAI-ARIA compliance specialist

**Responsibility:** Automatically adds all necessary ARIA attributes to make elements screen reader accessible.

## Tasks

1. **ARIA roles system**
   - Auto-detect role based on element context
   - Add: button, dialog, navigation, banner, main, complementary
   - Add: search, form, article, region, alert, status
   - Add: tab, tabpanel, tablist, menu, menuitem, tree
   - Support all WAI-ARIA 1.2 roles

2. **ARIA states management**
   - aria-expanded (for collapsible elements)
   - aria-hidden (for decorative elements)
   - aria-selected (for selectable items)
   - aria-checked (for checkboxes/radio)
   - aria-pressed (for toggle buttons)
   - aria-disabled (for disabled elements)
   - aria-invalid (for form validation)
   - aria-busy (for loading states)

3. **ARIA properties**
   - aria-label / aria-labelledby (for all interactive elements)
   - aria-describedby (for additional descriptions)
   - aria-live / aria-atomic / aria-relevant (for dynamic content)
   - aria-controls / aria-owns (for relationship)
   - aria-haspopup (for menus/dialogs)
   - aria-required / aria-readonly (for forms)
   - aria-level / aria-posinset / aria-setsize (for lists/trees)

4. **Context-aware attribute selection**
   - Analyze element purpose
   - Consider element hierarchy
   - Check existing attributes
   - Avoid redundant ARIA (prefer semantic HTML)
   - Follow ARIA authoring practices

5. **Dynamic state management**
   - Update aria-expanded on collapse/expand
   - Update aria-checked on selection
   - Update aria-hidden on show/hide
   - Update aria-busy during loading
   - Integrate with MutationObserver

6. **Create ARIA modules**
   - `src/aria/RoleManager.ts`
   - `src/aria/StateManager.ts`
   - `src/aria/PropertyManager.ts`
   - `src/aria/ContextAnalyzer.ts`
   - `src/aria/DynamicStateUpdater.ts`

## WAI-ARIA Best Practices

- First rule: Use semantic HTML when possible
- Second rule: Don't override native semantics
- Ensure all interactive elements are keyboard accessible
- Provide text alternatives for all content
- Maintain focus management

## Integration Points

- Works after Transformer Agent completes
- Coordinates with Structure Agent for landmarks
- Provides data to Testing Agent for validation

## Success Criteria

- All interactive elements have proper roles
- All buttons/links have accessible names
- All form inputs have labels
- Dynamic content properly announces to screen readers
- No ARIA validation errors

## Update TASKS.md

Mark Task 2.1 as complete when done.
