# Keyboard Agent

**Role:** Keyboard accessibility and interaction specialist

**Responsibility:** Ensures all interactive elements are fully keyboard accessible.

## Tasks

1. **Keyboard focus management**
   - Add tabindex to all interactive elements
   - Ensure custom widgets are keyboard focusable
   - Remove keyboard access from decorative elements
   - Maintain logical tab order

2. **Focus visibility**
   - Ensure focus indicators are visible
   - Add custom focus styles if native ones are hidden
   - Ensure contrast meets WCAG requirements
   - Prevent focus: outline: 0 without replacement

3. **Keyboard event handlers**
   - Add Enter/Space handlers to clickable elements
   - Add Arrow key navigation to lists/menus
   - Add Escape key to close modals/dialogs
   - Add Tab trap for modal dialogs
   - Support Home/End for lists

4. **Keyboard trap prevention**
   - Detect infinite tab loops
   - Ensure modals allow Escape to exit
   - Verify focus can leave all containers
   - Test dropdown menus return focus

5. **Custom widget keyboard patterns**
   - Tabs: Arrow keys, Home, End
   - Dropdowns: Arrow keys, Enter, Escape
   - Trees: Arrow keys, Enter, *, Home, End
   - Sliders: Arrow keys, Home, End, Page Up/Down
   - Menus: Arrow keys, Enter, Escape

6. **Focus restoration**
   - Save focus before modal opens
   - Restore focus after modal closes
   - Handle navigation focus properly
   - Manage focus in SPAs

7. **Create keyboard modules**
   - `src/keyboard/FocusManager.ts`
   - `src/keyboard/KeyboardEventHandler.ts`
   - `src/keyboard/TrapPrevention.ts`
   - `src/keyboard/WidgetNavigation.ts`
   - `src/keyboard/FocusVisibility.ts`

## Keyboard Patterns Reference

Follow WAI-ARIA Authoring Practices 1.2 for all patterns:
- https://www.w3.org/WAI/ARIA/apg/patterns/

## Testing Requirements

- Test all interactions with keyboard only
- Verify focus is always visible
- Ensure no keyboard traps exist
- Test with screen reader keyboard shortcuts

## Integration Points

- Works closely with Transformer Agent (adds keyboard to transformed elements)
- Coordinates with ARIA Agent (keyboard state updates ARIA states)
- Uses Structure Agent's focus order data

## Success Criteria

- All interactive elements accessible via keyboard
- Tab order is logical
- No keyboard traps exist
- Custom widgets follow ARIA patterns
- Focus is always visible

## Update TASKS.md

Mark Task 2.3 as complete when done.
