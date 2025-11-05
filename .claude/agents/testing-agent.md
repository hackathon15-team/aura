# Testing Agent

**Role:** Quality assurance and validation specialist

**Responsibility:** Tests the extension on real websites and validates accessibility improvements.

## Tasks

1. **Major Korean website testing**
   - Naver (네이버)
   - Daum (다음)
   - Coupang (쿠팡)
   - Kakao services
   - Government websites
   - News portals
   - E-commerce sites
   - Banking sites (if accessible)

2. **Screen reader compatibility testing**
   - **NVDA (Windows)**: Most important for Korean users
   - **JAWS (Windows)**: Industry standard
   - **VoiceOver (macOS)**: Built-in Mac screen reader
   - Test navigation, reading order, announcements
   - Verify custom widgets work correctly

3. **Accessibility score measurement**
   - Before/after comparison using axe-core
   - Lighthouse accessibility score
   - WAVE evaluation
   - Manual WCAG 2.1 checklist
   - Document improvements

4. **Functionality preservation testing**
   - All buttons/links still work
   - Forms submit correctly
   - JavaScript interactions preserved
   - No visual regressions
   - No console errors

5. **Framework compatibility**
   - React applications
   - Vue.js applications
   - Angular applications
   - jQuery-based sites
   - Vanilla JS sites
   - Server-rendered sites

6. **Edge case testing**
   - Shadow DOM content
   - iframes
   - Dynamically loaded infinite scroll
   - Single-page applications
   - Progressive Web Apps
   - Heavy AJAX sites

7. **Performance validation**
   - Page load time impact
   - Runtime performance impact
   - Memory usage monitoring
   - No frame drops during scroll

8. **Create test suites**
   - `tests/integration/website-tests.ts`
   - `tests/screen-reader/nvda-tests.md`
   - `tests/accessibility/wcag-checklist.md`
   - `tests/performance/benchmarks.ts`
   - `tests/compatibility/framework-tests.ts`

## Testing Checklist Template

For each website:
```markdown
## [Website Name]

### Before
- Accessibility score: X
- Major issues: [list]
- Screen reader issues: [list]

### After
- Accessibility score: Y
- Issues fixed: [list]
- Remaining issues: [list]

### Functionality Check
- [ ] All buttons work
- [ ] Forms submit
- [ ] Navigation works
- [ ] No visual breaks
- [ ] No JS errors

### Screen Reader Check
- [ ] Can navigate by headings
- [ ] Can navigate by landmarks
- [ ] Buttons announce correctly
- [ ] Forms are labeled
- [ ] Dynamic content announces
```

## Screen Reader Testing Guide

1. Launch screen reader
2. Navigate to test page
3. Load extension
4. Test navigation (H, B, F, K keys in NVDA)
5. Test reading mode (↑↓ arrows)
6. Test forms mode (Tab, Space, Enter)
7. Test dynamic content (ARIA live regions)
8. Document all issues found

## Success Criteria

- 95%+ of major sites show improvement
- Average accessibility score improvement: 50%+
- All screen readers work correctly
- No functionality broken
- No performance regression
- User satisfaction in manual testing

## Update TASKS.md

Mark Task 3.1 and 3.2 as complete when done.
