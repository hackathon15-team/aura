/**
 * ARIAManager - Comprehensive ARIA attribute management
 * Automatically adds all missing ARIA attributes based on context
 */

import { DOMUtils } from '../utils/DOMUtils';

export class ARIAManager {
  private processedElements = new WeakSet<HTMLElement>();

  async applyARIA(root: HTMLElement): Promise<number> {
    let count = 0;

    // Apply ARIA roles
    count += this.applyRoles(root);

    // Apply ARIA labels
    count += this.applyLabels(root);

    // Apply ARIA states
    count += this.applyStates(root);

    // Apply ARIA properties
    count += this.applyProperties(root);

    // Apply landmark roles
    count += this.applyLandmarks(root);

    console.log(`[ARIAManager] Added ${count} ARIA attributes`);
    return count;
  }

  private applyRoles(root: HTMLElement): number {
    let count = 0;

    // Navigation
    const navElements = root.querySelectorAll('nav, [class*="nav"], [id*="nav"]');
    navElements.forEach(el => {
      if (el instanceof HTMLElement && !el.hasAttribute('role')) {
        el.setAttribute('role', 'navigation');
        count++;
      }
    });

    // Main content
    const mainElements = root.querySelectorAll('main, [class*="main"], [id*="main"]');
    mainElements.forEach(el => {
      if (el instanceof HTMLElement && !el.hasAttribute('role')) {
        el.setAttribute('role', 'main');
        count++;
      }
    });

    // Dialogs/Modals
    const dialogSelectors = [
      '[class*="modal"]',
      '[class*="dialog"]',
      '[class*="popup"]',
      '[class*="overlay"]'
    ].join(', ');

    const dialogs = root.querySelectorAll(dialogSelectors);
    dialogs.forEach(el => {
      if (el instanceof HTMLElement && !el.hasAttribute('role')) {
        const style = window.getComputedStyle(el);
        if (style.position === 'fixed' || style.position === 'absolute') {
          el.setAttribute('role', 'dialog');
          el.setAttribute('aria-modal', 'true');
          count += 2;
        }
      }
    });

    // Search forms
    const searchForms = root.querySelectorAll('form[class*="search"], form[id*="search"]');
    searchForms.forEach(el => {
      if (el instanceof HTMLElement && !el.hasAttribute('role')) {
        el.setAttribute('role', 'search');
        count++;
      }
    });

    // Buttons that look like buttons
    const buttonLikeElements = root.querySelectorAll(
      '[class*="btn"], [class*="button"], [id*="btn"], [id*="button"]'
    );
    buttonLikeElements.forEach(el => {
      if (el instanceof HTMLElement &&
          el.tagName.toLowerCase() !== 'button' &&
          !el.hasAttribute('role')) {
        el.setAttribute('role', 'button');
        count++;
      }
    });

    return count;
  }

  private applyLabels(root: HTMLElement): number {
    let count = 0;

    const interactiveElements = root.querySelectorAll(
      'button, a, input, select, textarea, [role="button"], [onclick]'
    );

    interactiveElements.forEach(el => {
      if (!(el instanceof HTMLElement)) return;
      if (this.processedElements.has(el)) return;

      // Skip if already has label
      if (el.hasAttribute('aria-label') ||
          el.hasAttribute('aria-labelledby') ||
          el.getAttribute('title')) {
        return;
      }

      // Try to infer label
      const label = this.inferLabel(el);
      if (label) {
        el.setAttribute('aria-label', label);
        this.processedElements.add(el);
        count++;
      }
    });

    return count;
  }

  private applyStates(root: HTMLElement): number {
    let count = 0;

    // Expandable elements
    const expandableSelectors = [
      '[class*="collapse"]',
      '[class*="expand"]',
      '[class*="accordion"]',
      '[class*="dropdown"]'
    ].join(', ');

    const expandables = root.querySelectorAll(expandableSelectors);
    expandables.forEach(el => {
      if (!(el instanceof HTMLElement)) return;
      if (el.hasAttribute('aria-expanded')) return;

      const isExpanded = DOMUtils.isVisible(el);
      el.setAttribute('aria-expanded', String(isExpanded));
      count++;

      if (!el.hasAttribute('tabindex') && DOMUtils.isInteractive(el)) {
        el.tabIndex = 0;
      }
    });

    // Hidden elements
    const hiddenElements = root.querySelectorAll('[style*="display: none"], [style*="visibility: hidden"]');
    hiddenElements.forEach(el => {
      if (el instanceof HTMLElement && !el.hasAttribute('aria-hidden')) {
        el.setAttribute('aria-hidden', 'true');
        count++;
      }
    });

    // Selected items
    const selectedSelectors = [
      '[class*="selected"]',
      '[class*="active"]',
      '.current'
    ].join(', ');

    const selectedElements = root.querySelectorAll(selectedSelectors);
    selectedElements.forEach(el => {
      if (!(el instanceof HTMLElement)) return;
      if (el.hasAttribute('aria-selected')) return;

      const role = el.getAttribute('role');
      if (role === 'tab' || role === 'option' || role === 'menuitem') {
        el.setAttribute('aria-selected', 'true');
        count++;
      }
    });

    // Disabled elements
    const disabledElements = root.querySelectorAll('[disabled], [class*="disabled"]');
    disabledElements.forEach(el => {
      if (el instanceof HTMLElement && !el.hasAttribute('aria-disabled')) {
        el.setAttribute('aria-disabled', 'true');
        count++;
      }
    });

    return count;
  }

  private applyProperties(root: HTMLElement): number {
    let count = 0;

    // Live regions
    const liveRegionSelectors = [
      '[class*="alert"]',
      '[class*="notification"]',
      '[class*="toast"]',
      '[role="alert"]',
      '[role="status"]'
    ].join(', ');

    const liveRegions = root.querySelectorAll(liveRegionSelectors);
    liveRegions.forEach(el => {
      if (!(el instanceof HTMLElement)) return;
      if (el.hasAttribute('aria-live')) return;

      const role = el.getAttribute('role');
      if (role === 'alert') {
        el.setAttribute('aria-live', 'assertive');
        el.setAttribute('aria-atomic', 'true');
        count += 2;
      } else {
        el.setAttribute('aria-live', 'polite');
        el.setAttribute('aria-atomic', 'true');
        count += 2;
      }
    });

    // Required form fields
    const requiredFields = root.querySelectorAll('input[required], select[required], textarea[required]');
    requiredFields.forEach(el => {
      if (el instanceof HTMLElement && !el.hasAttribute('aria-required')) {
        el.setAttribute('aria-required', 'true');
        count++;
      }
    });

    // Invalid form fields
    const invalidFields = root.querySelectorAll('.error input, .error select, .error textarea');
    invalidFields.forEach(el => {
      if (el instanceof HTMLElement && !el.hasAttribute('aria-invalid')) {
        el.setAttribute('aria-invalid', 'true');
        count++;
      }
    });

    // Descriptions
    const describedElements = root.querySelectorAll('[title]');
    describedElements.forEach(el => {
      if (!(el instanceof HTMLElement)) return;
      if (el.hasAttribute('aria-description')) return;

      const title = el.getAttribute('title');
      if (title) {
        el.setAttribute('aria-description', title);
        count++;
      }
    });

    return count;
  }

  private applyLandmarks(root: HTMLElement): number {
    let count = 0;

    // Header
    const headers = root.querySelectorAll('header, [class*="header"], [id*="header"]');
    headers.forEach(el => {
      if (el instanceof HTMLElement && !el.hasAttribute('role')) {
        el.setAttribute('role', 'banner');
        count++;
      }
    });

    // Footer
    const footers = root.querySelectorAll('footer, [class*="footer"], [id*="footer"]');
    footers.forEach(el => {
      if (el instanceof HTMLElement && !el.hasAttribute('role')) {
        el.setAttribute('role', 'contentinfo');
        count++;
      }
    });

    // Aside
    const asides = root.querySelectorAll('aside, [class*="sidebar"], [id*="sidebar"]');
    asides.forEach(el => {
      if (el instanceof HTMLElement && !el.hasAttribute('role')) {
        el.setAttribute('role', 'complementary');
        count++;
      }
    });

    // Article
    const articles = root.querySelectorAll('article, [class*="article"], [class*="post"]');
    articles.forEach(el => {
      if (el instanceof HTMLElement && !el.hasAttribute('role')) {
        el.setAttribute('role', 'article');
        count++;
      }
    });

    return count;
  }

  private inferLabel(element: HTMLElement): string | null {
    // Try text content
    const textContent = DOMUtils.getCleanTextContent(element);
    if (textContent && textContent.length > 0 && textContent.length < 100) {
      return textContent;
    }

    // Try child image alt text
    const img = element.querySelector('img');
    if (img?.alt) {
      return img.alt;
    }

    // Try aria-label on children
    const childWithLabel = element.querySelector('[aria-label]');
    if (childWithLabel) {
      return childWithLabel.getAttribute('aria-label');
    }

    // Try class name
    const className = element.className;
    if (className && typeof className === 'string') {
      const cleaned = className
        .split(/[\s_-]+/)
        .filter(c => c.length > 2)
        .join(' ');
      if (cleaned.length > 0 && cleaned.length < 50) {
        return cleaned;
      }
    }

    // Try ID
    const id = element.id;
    if (id) {
      const cleaned = id.replace(/[-_]/g, ' ');
      if (cleaned.length > 0 && cleaned.length < 50) {
        return cleaned;
      }
    }

    return null;
  }
}
