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
  async scan(root: HTMLElement): Promise<AccessibilityIssue[]> {
    const issues: AccessibilityIssue[] = [];

    // Run axe-core analysis
    const axeIssues = await this.runAxeCore(root);
    issues.push(...axeIssues);

    // Custom scanners for specific patterns
    issues.push(...this.scanNonSemanticButtons(root));
    issues.push(...this.scanNonSemanticEmphasis(root));
    issues.push(...this.scanMissingARIA(root));
    issues.push(...this.scanStructuralIssues(root));
    issues.push(...this.scanKeyboardIssues(root));
    issues.push(...this.scanFormIssues(root));

    // Sort by priority
    issues.sort((a, b) => a.priority - b.priority);

    return issues;
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

  private scanNonSemanticButtons(root: HTMLElement): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    // Find divs/spans with click handlers
    const clickableElements = root.querySelectorAll('[onclick], [ng-click], [v-on\\:click]');

    clickableElements.forEach((element) => {
      if (!(element instanceof HTMLElement)) return;

      const tagName = element.tagName.toLowerCase();
      if (tagName !== 'button' && tagName !== 'a') {
        issues.push({
          element,
          type: IssueType.NON_SEMANTIC_BUTTON,
          priority: Priority.P0,
          description: `${tagName} with click handler should be a <button>`,
        });
      }
    });

    // Find elements with cursor:pointer that aren't buttons/links
    const allElements = root.querySelectorAll('*');
    allElements.forEach((element) => {
      if (!(element instanceof HTMLElement)) return;

      const computed = window.getComputedStyle(element);
      const tagName = element.tagName.toLowerCase();

      if (computed.cursor === 'pointer' &&
          tagName !== 'button' &&
          tagName !== 'a' &&
          !element.hasAttribute('role')) {
        issues.push({
          element,
          type: IssueType.NON_SEMANTIC_BUTTON,
          priority: Priority.P0,
          description: `${tagName} with cursor:pointer should be a <button>`,
        });
      }
    });

    return issues;
  }

  private scanNonSemanticEmphasis(root: HTMLElement): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    const allElements = root.querySelectorAll('*');
    allElements.forEach((element) => {
      if (!(element instanceof HTMLElement)) return;

      const computed = window.getComputedStyle(element);
      const tagName = element.tagName.toLowerCase();

      // Check for CSS-only bold text
      if (computed.fontWeight === 'bold' ||
          computed.fontWeight === '700' ||
          parseInt(computed.fontWeight) >= 700) {
        if (tagName !== 'strong' && tagName !== 'b' && tagName !== 'h1' &&
            tagName !== 'h2' && tagName !== 'h3' && tagName !== 'h4' &&
            tagName !== 'h5' && tagName !== 'h6') {
          issues.push({
            element,
            type: IssueType.NON_SEMANTIC_EMPHASIS,
            priority: Priority.P1,
            description: 'CSS-only bold text should use <strong> tag',
          });
        }
      }

      // Check for CSS-only italic text
      if (computed.fontStyle === 'italic') {
        if (tagName !== 'em' && tagName !== 'i') {
          issues.push({
            element,
            type: IssueType.NON_SEMANTIC_EMPHASIS,
            priority: Priority.P1,
            description: 'CSS-only italic text should use <em> tag',
          });
        }
      }
    });

    return issues;
  }

  private scanMissingARIA(root: HTMLElement): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    // Interactive elements without labels
    const interactiveElements = root.querySelectorAll('button, a, input, select, textarea');
    interactiveElements.forEach((element) => {
      if (!(element instanceof HTMLElement)) return;

      const hasLabel = element.hasAttribute('aria-label') ||
                       element.hasAttribute('aria-labelledby') ||
                       element.textContent?.trim() ||
                       (element as HTMLInputElement).placeholder;

      if (!hasLabel) {
        issues.push({
          element,
          type: IssueType.MISSING_ARIA_LABEL,
          priority: Priority.P0,
          description: 'Interactive element missing accessible label',
        });
      }
    });

    return issues;
  }

  private scanStructuralIssues(root: HTMLElement): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    // Check for missing alt text on images
    const images = root.querySelectorAll('img');
    images.forEach((img) => {
      if (!img.hasAttribute('alt')) {
        issues.push({
          element: img,
          type: IssueType.MISSING_ALT_TEXT,
          priority: Priority.P0,
          description: 'Image missing alt attribute',
        });
      }
    });

    return issues;
  }

  private scanKeyboardIssues(root: HTMLElement): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    // Interactive elements without keyboard access
    const clickableElements = root.querySelectorAll('[onclick]');
    clickableElements.forEach((element) => {
      if (!(element instanceof HTMLElement)) return;

      const tagName = element.tagName.toLowerCase();
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
    });

    return issues;
  }

  private scanFormIssues(root: HTMLElement): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];

    // Form inputs without labels
    const inputs = root.querySelectorAll('input:not([type="hidden"]), select, textarea');
    inputs.forEach((input) => {
      if (!(input instanceof HTMLElement)) return;

      const hasLabel = input.hasAttribute('aria-label') ||
                       input.hasAttribute('aria-labelledby') ||
                       document.querySelector(`label[for="${input.id}"]`);

      if (!hasLabel) {
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

  private mapAxeImpactToPriority(impact?: string): Priority {
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
