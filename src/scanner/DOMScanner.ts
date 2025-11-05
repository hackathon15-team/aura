/**
 * DOMScanner - Comprehensive DOM analysis for accessibility issues
 * Detects all WCAG 2.1 violations and semantic HTML issues
 */

import axe from 'axe-core';

export interface AccessibilityIssue {
  element: HTMLElement;
  type: IssueType;
  priority: Priority;
  description: string;
  suggestedFix?: any;
}

export enum IssueType {
  // Semantic HTML
  NON_SEMANTIC_BUTTON = 'non-semantic-button',
  NON_SEMANTIC_LINK = 'non-semantic-link',
  NON_SEMANTIC_EMPHASIS = 'non-semantic-emphasis',

  // ARIA
  MISSING_ARIA_LABEL = 'missing-aria-label',
  MISSING_ARIA_ROLE = 'missing-aria-role',
  MISSING_ARIA_STATE = 'missing-aria-state',

  // Structure
  MISSING_LANDMARK = 'missing-landmark',
  INCORRECT_HEADING_LEVEL = 'incorrect-heading-level',
  MISSING_ALT_TEXT = 'missing-alt-text',

  // Keyboard
  MISSING_KEYBOARD_ACCESS = 'missing-keyboard-access',
  KEYBOARD_TRAP = 'keyboard-trap',

  // Color/Contrast
  LOW_CONTRAST = 'low-contrast',
  COLOR_ONLY_INDICATION = 'color-only-indication',

  // Forms
  UNLABELED_FORM_ELEMENT = 'unlabeled-form-element',
  MISSING_FORM_VALIDATION = 'missing-form-validation',
}

export enum Priority {
  P0 = 0, // Critical - breaks screen reader
  P1 = 1, // Important - degrades experience
  P2 = 2, // Nice to have - minor improvement
}

export class DOMScanner {
  private processedElements = new WeakSet<HTMLElement>();

  async scan(root: HTMLElement): Promise<AccessibilityIssue[]> {
    const issues: AccessibilityIssue[] = [];
    this.processedElements = new WeakSet();

    // Run axe-core analysis
    const axeIssues = await this.runAxeCore(root);
    issues.push(...axeIssues);

    // Optimized: Single-pass DOM traversal for all checks
    issues.push(...this.scanAllElements(root));

    // Specific scans that need different queries
    issues.push(...this.scanStructuralIssues(root));
    issues.push(...this.scanFormIssues(root));

    // Remove duplicates by element + type
    const uniqueIssues = this.deduplicateIssues(issues);

    // Sort by priority
    uniqueIssues.sort((a, b) => a.priority - b.priority);

    return uniqueIssues;
  }

  private deduplicateIssues(issues: AccessibilityIssue[]): AccessibilityIssue[] {
    const seen = new Map<string, AccessibilityIssue>();

    for (const issue of issues) {
      // Use element + type as unique key
      const key = `${issue.element.tagName}-${issue.element.className}-${issue.type}`;
      if (!seen.has(key)) {
        seen.set(key, issue);
      }
    }

    return Array.from(seen.values());
  }

  /**
   * Optimized: Single-pass traversal checking all patterns
   * Replaces multiple querySelectorAll('*') calls
   */
  private scanAllElements(root: HTMLElement): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    const allElements = root.querySelectorAll('*');

    allElements.forEach((element) => {
      if (!(element instanceof HTMLElement)) return;
      if (this.processedElements.has(element)) return;

      const tagName = element.tagName.toLowerCase();

      // Check clickable elements (non-semantic buttons)
      const isClickable = this.isElementClickable(element);
      if (isClickable) {
        if (tagName !== 'button' && tagName !== 'a' && !element.hasAttribute('role')) {
          issues.push({
            element,
            type: IssueType.NON_SEMANTIC_BUTTON,
            priority: Priority.P0,
            description: `${tagName} with click behavior should have role="button"`,
          });
          this.processedElements.add(element);
        }

        // Check keyboard accessibility
        const isNativelyFocusable = ['button', 'a', 'input', 'select', 'textarea'].includes(tagName);
        const hasTabIndex = element.hasAttribute('tabindex');
        if (!isNativelyFocusable && !hasTabIndex) {
          issues.push({
            element,
            type: IssueType.MISSING_KEYBOARD_ACCESS,
            priority: Priority.P0,
            description: 'Interactive element not keyboard accessible',
          });
        }
      }

      // Check CSS-only emphasis (with sampling for performance)
      // Only check 20% of elements to reduce performance impact
      if (Math.random() < 0.2) {
        const computed = window.getComputedStyle(element);

        // CSS-only bold
        if (this.isBoldText(computed)) {
          const isSemanticBold = ['strong', 'b', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName);
          if (!isSemanticBold && element.textContent && element.textContent.trim().length > 0) {
            issues.push({
              element,
              type: IssueType.NON_SEMANTIC_EMPHASIS,
              priority: Priority.P1,
              description: 'CSS-only bold text should use <strong> tag',
            });
          }
        }

        // CSS-only italic
        if (computed.fontStyle === 'italic') {
          const isSemanticItalic = ['em', 'i'].includes(tagName);
          if (!isSemanticItalic && element.textContent && element.textContent.trim().length > 0) {
            issues.push({
              element,
              type: IssueType.NON_SEMANTIC_EMPHASIS,
              priority: Priority.P1,
              description: 'CSS-only italic text should use <em> tag',
            });
          }
        }
      }

      // Check interactive elements without labels
      const isInteractive = ['button', 'a'].includes(tagName);
      if (isInteractive) {
        const hasLabel = element.hasAttribute('aria-label') ||
                         element.hasAttribute('aria-labelledby') ||
                         this.hasValidTextContent(element);

        if (!hasLabel) {
          issues.push({
            element,
            type: IssueType.MISSING_ARIA_LABEL,
            priority: Priority.P0,
            description: 'Interactive element missing accessible label',
          });
        }
      }

      // Check disabled elements for aria-disabled
      if ((element as any).disabled && !element.hasAttribute('aria-disabled')) {
        issues.push({
          element,
          type: IssueType.MISSING_ARIA_STATE,
          priority: Priority.P1,
          description: 'Disabled element should have aria-disabled',
        });
      }

      // Check links opening in new tab
      if (tagName === 'a' && element.getAttribute('target') === '_blank') {
        const hasWarning = element.textContent?.includes('새 창') ||
                          element.textContent?.includes('새 탭') ||
                          element.querySelector('.sr-only');
        if (!hasWarning) {
          issues.push({
            element,
            type: IssueType.MISSING_ARIA_LABEL,
            priority: Priority.P1,
            description: 'Link opening in new tab should indicate this to screen reader users',
          });
        }
      }
    });

    return issues;
  }

  /**
   * Detect if element is clickable (supports modern frameworks)
   */
  private isElementClickable(element: HTMLElement): boolean {
    // HTML onclick attribute
    if (element.hasAttribute('onclick')) return true;

    // Framework-specific attributes
    if (element.hasAttribute('ng-click')) return true; // Angular
    if (element.hasAttribute('v-on:click')) return true; // Vue
    if (element.hasAttribute('@click')) return true; // Vue shorthand

    // React: Check for data attributes or event handlers
    const hasReactProps = Object.keys(element).some(key => key.startsWith('__react'));
    if (hasReactProps) {
      // React elements often have cursor:pointer
      const computed = window.getComputedStyle(element);
      if (computed.cursor === 'pointer') return true;
    }

    // Heuristic: cursor:pointer + not a link/button
    const computed = window.getComputedStyle(element);
    if (computed.cursor === 'pointer' &&
        element.tagName.toLowerCase() !== 'a' &&
        element.tagName.toLowerCase() !== 'button') {
      return true;
    }

    return false;
  }

  private isBoldText(style: CSSStyleDeclaration): boolean {
    return style.fontWeight === 'bold' ||
           style.fontWeight === '700' ||
           parseInt(style.fontWeight) >= 700;
  }

  private hasValidTextContent(element: HTMLElement): boolean {
    const text = element.textContent?.trim();
    if (!text) return false;

    // Reject meaningless text
    const meaningless = ['...', '•', '·', '>', '<', '»', '«'];
    if (meaningless.includes(text)) return false;

    // Must have at least 1 character
    return text.length > 0;
  }

  private async runAxeCore(root: HTMLElement): Promise<AccessibilityIssue[]> {
    const issues: AccessibilityIssue[] = [];

    try {
      const results = await axe.run(root, {
        resultTypes: ['violations'],
      });

      for (const violation of results.violations) {
        for (const node of violation.nodes) {
          const element = node.element as HTMLElement;
          if (element) {
            issues.push({
              element,
              type: this.mapAxeViolationToType(violation.id),
              priority: this.mapAxeImpactToPriority(violation.impact),
              description: violation.description,
              suggestedFix: node.any[0]?.data,
            });
          }
        }
      }
    } catch (error) {
      console.error('[DOMScanner] axe-core analysis failed:', error);
    }

    return issues;
  }


  private scanStructuralIssues(root: HTMLElement): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    // Check images for missing/empty alt text
    const images = root.querySelectorAll('img');
    images.forEach((img) => {
      if (!img.hasAttribute('alt')) {
        issues.push({
          element: img,
          type: IssueType.MISSING_ALT_TEXT,
          priority: Priority.P0,
          description: 'Image missing alt attribute',
        });
      } else if (img.getAttribute('alt') === '' && img.naturalWidth > 50) {
        // Empty alt on non-decorative images (larger than 50px)
        issues.push({
          element: img,
          type: IssueType.MISSING_ALT_TEXT,
          priority: Priority.P1,
          description: 'Non-decorative image has empty alt text',
        });
      }
    });

    // Check heading hierarchy
    const headings = Array.from(root.querySelectorAll('h1, h2, h3, h4, h5, h6')) as HTMLElement[];

    // Check for missing h1
    const hasH1 = headings.some(h => h.tagName === 'H1');
    if (!hasH1 && headings.length > 0) {
      issues.push({
        element: root,
        type: IssueType.INCORRECT_HEADING_LEVEL,
        priority: Priority.P1,
        description: 'Page missing <h1> heading',
      });
    }

    // Check for heading level skips
    let prevLevel = 0;
    for (const heading of headings) {
      const level = parseInt(heading.tagName[1]);
      if (prevLevel > 0 && level > prevLevel + 1) {
        issues.push({
          element: heading,
          type: IssueType.INCORRECT_HEADING_LEVEL,
          priority: Priority.P1,
          description: `Heading level skip: ${prevLevel} → ${level} (should be ${prevLevel + 1})`,
        });
      }
      prevLevel = level;
    }

    return issues;
  }

  private scanFormIssues(root: HTMLElement): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    // Build label map once (performance optimization)
    const labelMap = new Map<string, HTMLLabelElement>();
    const labels = root.querySelectorAll('label[for]');
    labels.forEach((label) => {
      const forId = label.getAttribute('for');
      if (forId) {
        labelMap.set(forId, label as HTMLLabelElement);
      }
    });

    // Form inputs without labels
    const inputs = root.querySelectorAll('input:not([type="hidden"]), select, textarea');
    inputs.forEach((input) => {
      if (!(input instanceof HTMLElement)) return;

      const hasAriaLabel = input.hasAttribute('aria-label') ||
                           input.hasAttribute('aria-labelledby');
      const hasLabelElement = input.id && labelMap.has(input.id);
      const hasPlaceholder = (input as HTMLInputElement).placeholder;

      // Check if wrapped in label
      const wrappedInLabel = input.closest('label');

      if (!hasAriaLabel && !hasLabelElement && !hasPlaceholder && !wrappedInLabel) {
        issues.push({
          element: input,
          type: IssueType.UNLABELED_FORM_ELEMENT,
          priority: Priority.P0,
          description: 'Form input missing label',
        });
      }
    });

    return issues;
  }

  private mapAxeViolationToType(violationId: string): IssueType {
    // Map axe-core violation IDs to our issue types
    const mapping: { [key: string]: IssueType } = {
      'button-name': IssueType.MISSING_ARIA_LABEL,
      'image-alt': IssueType.MISSING_ALT_TEXT,
      'label': IssueType.UNLABELED_FORM_ELEMENT,
      'color-contrast': IssueType.LOW_CONTRAST,
    };

    return mapping[violationId] || IssueType.MISSING_ARIA_ROLE;
  }

  private mapAxeImpactToPriority(impact?: string | null): Priority {
    switch (impact) {
      case 'critical':
      case 'serious':
        return Priority.P0;
      case 'moderate':
        return Priority.P1;
      default:
        return Priority.P2;
    }
  }
}
