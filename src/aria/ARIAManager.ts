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

    // Navigation (exclude HTML5 <nav> - already has implicit role)
    const navElements = root.querySelectorAll(
      '[class~="nav"]:not(nav), [class~="navbar"]:not(nav), [class~="navigation"]:not(nav), ' +
      '[id="nav"]:not(nav), [id="navbar"]:not(nav), [id="navigation"]:not(nav)'
    );
    navElements.forEach(el => {
      if (el instanceof HTMLElement &&
          !el.hasAttribute('role') &&
          !this.processedElements.has(el) &&
          this.looksLikeNavigation(el)) {
        el.setAttribute('role', 'navigation');
        this.processedElements.add(el);
        count++;
      }
    });

    // Main content (exclude HTML5 <main> - already has implicit role)
    const mainElements = root.querySelectorAll(
      '[class~="main"]:not(main), [class~="main-content"]:not(main), ' +
      '[id="main"]:not(main), [id="main-content"]:not(main), [id="content"]:not(main)'
    );
    mainElements.forEach(el => {
      if (el instanceof HTMLElement && !el.hasAttribute('role') && this.looksLikeMain(el)) {
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
    // Note: aria-description has limited support, so we skip this
    // Title attribute is already exposed by screen readers
    // If needed, create a visually hidden element with aria-describedby instead

    return count;
  }

  private applyLandmarks(root: HTMLElement): number {
    let count = 0;

    // Header (exclude HTML5 <header> - already has implicit role)
    const headers = root.querySelectorAll(
      '[class~="header"]:not(header), [class~="site-header"]:not(header), ' +
      '[id="header"]:not(header), [id="site-header"]:not(header)'
    );
    headers.forEach(el => {
      if (el instanceof HTMLElement && !el.hasAttribute('role') && this.looksLikeHeader(el)) {
        el.setAttribute('role', 'banner');
        count++;
      }
    });

    // Footer (exclude HTML5 <footer> - already has implicit role)
    const footers = root.querySelectorAll(
      '[class~="footer"]:not(footer), [class~="site-footer"]:not(footer), ' +
      '[id="footer"]:not(footer), [id="site-footer"]:not(footer)'
    );
    footers.forEach(el => {
      if (el instanceof HTMLElement && !el.hasAttribute('role') && this.looksLikeFooter(el)) {
        el.setAttribute('role', 'contentinfo');
        count++;
      }
    });

    // Aside (exclude HTML5 <aside> - already has implicit role)
    const asides = root.querySelectorAll(
      '[class~="sidebar"]:not(aside), [class~="aside"]:not(aside), ' +
      '[id="sidebar"]:not(aside), [id="aside"]:not(aside)'
    );
    asides.forEach(el => {
      if (el instanceof HTMLElement && !el.hasAttribute('role')) {
        el.setAttribute('role', 'complementary');
        count++;
      }
    });

    // Article (exclude HTML5 <article> - already has implicit role)
    const articles = root.querySelectorAll(
      '[class~="article"]:not(article), [class~="post"]:not(article), [class~="entry"]:not(article)'
    );
    articles.forEach(el => {
      if (el instanceof HTMLElement && !el.hasAttribute('role')) {
        el.setAttribute('role', 'article');
        count++;
      }
    });

    return count;
  }

  // Helper methods for validation
  private looksLikeNavigation(el: HTMLElement): boolean {
    // Check for links/navigation patterns
    const links = el.querySelectorAll('a');
    return links.length >= 2; // At least 2 links
  }

  private looksLikeMain(el: HTMLElement): boolean {
    // Main content should be large and contain significant content
    const textLength = el.textContent?.trim().length || 0;
    return textLength > 100; // At least 100 characters
  }

  private looksLikeHeader(el: HTMLElement): boolean {
    // Headers typically at top and contain logo/nav
    const rect = el.getBoundingClientRect();
    return rect.top < 200; // Within top 200px
  }

  private looksLikeFooter(el: HTMLElement): boolean {
    // Footers typically at bottom
    const rect = el.getBoundingClientRect();
    const docHeight = document.documentElement.scrollHeight;
    return rect.bottom > docHeight - 500; // Within bottom 500px
  }

  private inferLabel(element: HTMLElement): string | null {
    // 1. Try text content (most reliable)
    const textContent = DOMUtils.getCleanTextContent(element);
    if (textContent && textContent.length > 0 && textContent.length <= 50) {
      return textContent;
    }

    // 2. Try child image alt text
    const img = element.querySelector('img');
    if (img?.alt && img.alt.trim()) {
      return img.alt.trim();
    }

    // 3. Try aria-label on children
    const childWithLabel = element.querySelector('[aria-label]');
    if (childWithLabel) {
      const label = childWithLabel.getAttribute('aria-label');
      if (label && label.trim()) {
        return label.trim();
      }
    }

    // 4. Try title attribute
    const title = element.getAttribute('title');
    if (title && title.trim() && title.length <= 50) {
      return title.trim();
    }

    // 5. Try data-* attributes that might contain labels
    const dataLabel = element.getAttribute('data-label') ||
                      element.getAttribute('data-title') ||
                      element.getAttribute('data-text');
    if (dataLabel && dataLabel.trim() && dataLabel.length <= 50) {
      return dataLabel.trim();
    }

    // DON'T use className or ID - they are developer-facing, not user-facing
    return null;
  }
}
