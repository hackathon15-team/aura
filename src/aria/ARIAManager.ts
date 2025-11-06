
import { DOMUtils } from '../utils/DOMUtils';

export class ARIAManager {
  private processedElements = new WeakSet<HTMLElement>();

  async applyARIA(root: HTMLElement): Promise<number> {
    let count = 0;

    count += this.applyRoles(root);
    count += this.applySplitTextLabels(root);
    count += this.applyLabels(root);
    count += this.applyStates(root);
    count += this.applyProperties(root);

    return count;
  }

  private applyRoles(root: HTMLElement): number {
    let count = 0;

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

    
    const dialogSelectors = [
      '[class*="modal"]:not([class*="backdrop"]):not([class*="overlay"])',
      '[class*="dialog"][class*="content"]',
      '[class*="popup"][class*="content"]',
    ].join(', ');

    const dialogs = root.querySelectorAll(dialogSelectors);
    dialogs.forEach(el => {
      if (el instanceof HTMLElement && !el.hasAttribute('role')) {
        const style = window.getComputedStyle(el);
        const text = el.textContent?.trim() || '';
        const hasContent = text.length > 50;
        if ((style.position === 'fixed' || style.position === 'absolute') && hasContent) {
          el.setAttribute('role', 'dialog');
          el.setAttribute('aria-modal', 'true');
          count += 2;
        }
      }
    });

    
    const searchWrappers = root.querySelectorAll(
      'div[class*="search"]:not(form), section[class*="search"]:not(form), ' +
      'div[id*="search"]:not(form), section[id*="search"]:not(form)'
    );
    searchWrappers.forEach(el => {
      if (el instanceof HTMLElement && !el.hasAttribute('role')) {
        const hasForm = el.querySelector('form');
        const hasInput = el.querySelector('input[type="search"], input[type="text"]');
        if (hasForm || hasInput) {
          el.setAttribute('role', 'search');
          count++;
        }
      }
    });

    
    const buttonLikeElements = root.querySelectorAll(
      '[class*="btn"], [class*="button"], [id*="btn"], [id*="button"]'
    );
    buttonLikeElements.forEach(el => {
      if (el instanceof HTMLElement &&
          el.tagName.toLowerCase() !== 'button' &&
          el.tagName.toLowerCase() !== 'a' &&
          el.tagName.toLowerCase() !== 'input' &&
          !el.hasAttribute('role') &&
          el.hasAttribute('onclick')) {
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

      if (el.hasAttribute('aria-label') || el.hasAttribute('aria-labelledby')) {
        return;
      }

      const textContent = el.textContent?.trim();
      const title = el.getAttribute('title');
      const hasVisibleContent = textContent && textContent.length > 0 && textContent.length < 100;
      const hasImage = el.querySelector('img[alt]');

      if (hasVisibleContent || hasImage) {
        return;
      }

      let label = '';
      if (title && title.trim()) {
        label = title.trim();
      } else {
        label = this.inferLabel(el) || '';
      }

      if (label && label.length > 0 && label.length < 100) {
        el.setAttribute('aria-label', label);
        this.processedElements.add(el);
        count++;
      }
    });

    return count;
  }

  private applyStates(root: HTMLElement): number {
    let count = 0;

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

      const role = el.getAttribute('role');
      const validRoles = ['button', 'menuitem', 'tab', 'treeitem', 'combobox'];
      const tagName = el.tagName.toLowerCase();
      const isValidElement = tagName === 'button' || validRoles.includes(role || '');

      if (!isValidElement) return;

      const isExpanded = DOMUtils.isVisible(el);
      el.setAttribute('aria-expanded', String(isExpanded));
      count++;

      if (!el.hasAttribute('tabindex') && DOMUtils.isInteractive(el)) {
        el.tabIndex = 0;
      }
    });

    const hiddenElements = root.querySelectorAll('[style*="display: none"], [style*="visibility: hidden"]');
    hiddenElements.forEach(el => {
      if (el instanceof HTMLElement && !el.hasAttribute('aria-hidden')) {
        el.setAttribute('aria-hidden', 'true');
        count++;
      }
    });

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
      const validRoles = ['option', 'tab', 'gridcell', 'row', 'treeitem'];
      if (validRoles.includes(role || '')) {
        el.setAttribute('aria-selected', 'true');
        count++;
      }
    });

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

    const requiredFields = root.querySelectorAll('input[required], select[required], textarea[required]');
    requiredFields.forEach(el => {
      if (el instanceof HTMLElement && !el.hasAttribute('aria-required')) {
        el.setAttribute('aria-required', 'true');
        count++;
      }
    });

    const invalidFields = root.querySelectorAll('.error input, .error select, .error textarea');
    invalidFields.forEach(el => {
      if (el instanceof HTMLElement && !el.hasAttribute('aria-invalid')) {
        el.setAttribute('aria-invalid', 'true');
        count++;
      }
    });


    return count;
  }

  private applyLandmarks(root: HTMLElement): number {
    let count = 0;

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

  private looksLikeNavigation(el: HTMLElement): boolean {
    const links = el.querySelectorAll('a');
    return links.length >= 2; // At least 2 links
  }

  private looksLikeMain(el: HTMLElement): boolean {
    const textLength = el.textContent?.trim().length || 0;
    return textLength > 100; // At least 100 characters
  }

  private looksLikeHeader(el: HTMLElement): boolean {
    const rect = el.getBoundingClientRect();
    return rect.top < 200; // Within top 200px
  }

  private looksLikeFooter(el: HTMLElement): boolean {
    const rect = el.getBoundingClientRect();
    const docHeight = document.documentElement.scrollHeight;
    return rect.bottom > docHeight - 500; // Within bottom 500px
  }


  /**
   * Improves accessibility for links with split text
   * Example: <span><a>1</a>. 개요</span> → <span><a aria-label="1. 개요">1</a><span aria-hidden="true">. 개요</span></span>
   */
  private applySplitTextLabels(root: HTMLElement): number {
    let count = 0;

    // Find elements that contain both <a> and text nodes
    const potentialParents = root.querySelectorAll('*');
    
    potentialParents.forEach(parent => {
      if (!(parent instanceof HTMLElement)) return;
      
      // Check if parent has exactly one <a> tag and text nodes
      const links = Array.from(parent.children).filter(child => child.tagName === 'A');
      if (links.length !== 1) return;
      
      const link = links[0] as HTMLAnchorElement;
      if (link.hasAttribute('aria-label')) return;
      
      // Get all text content from parent
      const fullText = parent.textContent?.trim();
      if (!fullText || fullText.length === 0) return;
      
      // Check if there's text outside the link
      const linkText = link.textContent?.trim() || '';
      if (fullText === linkText) return; // No split text
      
      // Apply aria-label to link
      link.setAttribute('aria-label', fullText);
      count++;
      
      // Wrap text nodes outside <a> with aria-hidden spans
      const childNodes = Array.from(parent.childNodes);
      childNodes.forEach(node => {
        // Skip if it's the link itself or already processed
        if (node === link) return;
        if (node.nodeType === Node.ELEMENT_NODE && 
            (node as HTMLElement).hasAttribute('aria-hidden')) return;
        
        // Text node - wrap it
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent?.trim();
          if (text && text.length > 0) {
            const span = document.createElement('span');
            span.setAttribute('aria-hidden', 'true');
            span.textContent = node.textContent;
            parent.replaceChild(span, node);
            count++;
          }
        }
      });
    });

    return count;
  }

  private inferLabel(element: HTMLElement): string | null {
    const textContent = DOMUtils.getCleanTextContent(element);
    if (textContent && textContent.length > 0 && textContent.length <= 50) {
      return textContent;
    }

    const img = element.querySelector('img');
    if (img?.alt && img.alt.trim()) {
      return img.alt.trim();
    }

    const childWithLabel = element.querySelector('[aria-label]');
    if (childWithLabel) {
      const label = childWithLabel.getAttribute('aria-label');
      if (label && label.trim()) {
        return label.trim();
      }
    }

    const title = element.getAttribute('title');
    if (title && title.trim() && title.length <= 50) {
      return title.trim();
    }

    const dataLabel = element.getAttribute('data-label') ||
                      element.getAttribute('data-title') ||
                      element.getAttribute('data-text');
    if (dataLabel && dataLabel.trim() && dataLabel.length <= 50) {
      return dataLabel.trim();
    }

    return null;
  }
}
