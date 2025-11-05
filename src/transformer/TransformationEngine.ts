/**
 * TransformationEngine - Improves accessibility WITHOUT changing visual appearance
 * Strategy: Add ARIA attributes and keyboard handlers only, no DOM structure changes
 */

import { AccessibilityIssue, IssueType } from '../scanner/DOMScanner';

export interface TransformationLog {
  type: string;
  description: string;
  element: string;
  before: string;
  after: string;
}

export class TransformationEngine {
  private transformedElements = new WeakSet<HTMLElement>();

  async transform(issue: AccessibilityIssue): Promise<TransformationLog | null> {
    // Prevent duplicate transformations
    if (this.transformedElements.has(issue.element)) {
      return null;
    }

    try {
      let log: TransformationLog | null = null;

      switch (issue.type) {
        case IssueType.NON_SEMANTIC_BUTTON:
          log = await this.makeButtonAccessible(issue.element);
          break;

        case IssueType.NON_SEMANTIC_EMPHASIS:
          log = await this.makeEmphasisAccessible(issue.element);
          break;

        case IssueType.MISSING_ALT_TEXT:
          log = await this.addAltText(issue.element as HTMLImageElement);
          break;

        case IssueType.MISSING_KEYBOARD_ACCESS:
          log = await this.addKeyboardAccess(issue.element);
          break;

        case IssueType.UNLABELED_FORM_ELEMENT:
          log = await this.addFormLabel(issue.element);
          break;

        default:
          // Other issues handled by ARIAManager
          break;
      }

      this.transformedElements.add(issue.element);
      return log;
    } catch (error) {
      console.error('[TransformationEngine] Failed to transform element:', error);
      return null;
    }
  }

  private getElementDescription(element: HTMLElement): string {
    const tag = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : '';
    const classes = element.className ? `.${element.className.split(' ').slice(0, 2).join('.')}` : '';
    const text = element.textContent?.trim().slice(0, 30) || '';
    return `<${tag}${id}${classes}>${text ? ` "${text}..."` : ''}`;
  }

  /**
   * Make clickable div/span accessible as button WITHOUT changing DOM structure
   * Only adds ARIA role and keyboard handlers
   */
  private async makeButtonAccessible(element: HTMLElement): Promise<TransformationLog | null> {
    const tagName = element.tagName.toLowerCase();

    // Skip if already semantic
    if (tagName === 'button' || tagName === 'a') {
      return null;
    }

    const before = `<${tagName}> (클릭 가능하지만 버튼 역할 없음)`;
    const modifications: string[] = [];

    // Add button role for screen readers
    if (!element.hasAttribute('role')) {
      element.setAttribute('role', 'button');
      modifications.push('role="button"');
    }

    // Make keyboard accessible
    if (!element.hasAttribute('tabindex')) {
      element.tabIndex = 0;
      modifications.push('tabindex="0"');
    }

    // Add keyboard event handler if not already present
    const hasKeyboardHandler = element.hasAttribute('data-weally-keyboard');
    if (!hasKeyboardHandler) {
      element.addEventListener('keydown', (event: KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          element.click();
        }
      });
      element.setAttribute('data-weally-keyboard', 'true');
      modifications.push('키보드 이벤트');
    }

    // Add accessible label if missing
    let label = '';
    if (!element.hasAttribute('aria-label') && !element.hasAttribute('aria-labelledby')) {
      const text = element.textContent?.trim();
      if (text && text.length > 0 && text.length < 100) {
        element.setAttribute('aria-label', text);
        label = text.slice(0, 20);
        modifications.push(`aria-label="${label}${text.length > 20 ? '...' : ''}"`);
      }
    }

    console.log('[TransformationEngine] Made', tagName, 'accessible as button (no DOM change)');

    return {
      type: '버튼 접근성',
      description: `${tagName} 요소를 접근 가능한 버튼으로 변환`,
      element: this.getElementDescription(element),
      before,
      after: `버튼 역할 추가 (${modifications.join(', ')})`
    };
  }

  /**
   * Make CSS-styled emphasis accessible WITHOUT changing visual appearance
   * Only adds ARIA or visually-hidden semantic indicators
   */
  private async makeEmphasisAccessible(element: HTMLElement): Promise<TransformationLog | null> {
    const computed = window.getComputedStyle(element);

    // Check if bold or italic
    const isBold = computed.fontWeight === 'bold' || parseInt(computed.fontWeight) >= 700;
    const isItalic = computed.fontStyle === 'italic';

    if (!isBold && !isItalic) {
      return;
    }

    // Don't add if already has semantic children
    const hasSemanticEmphasis = element.querySelector('strong, em, b, i');
    if (hasSemanticEmphasis) {
      return;
    }

    // Add aria-label to indicate emphasis to screen readers
    const existingLabel = element.getAttribute('aria-label');
    const text = element.textContent?.trim();

    if (text && text.length > 0 && !existingLabel) {
      // Add role="text" to ensure it's read as emphasized
      if (isBold) {
        element.setAttribute('role', 'text');
        element.setAttribute('aria-label', `강조: ${text}`);
      } else if (isItalic) {
        element.setAttribute('role', 'text');
        element.setAttribute('aria-label', `이탤릭: ${text}`);
      }
    }

    console.log('[TransformationEngine] Made emphasis accessible (no visual change)');
    return null; // Simplified for now
  }

  /**
   * Add alt text to images using Vision API
   */
  private async addAltText(img: HTMLImageElement): Promise<TransformationLog | null> {
    // Don't modify if already has alt (even if empty - empty means decorative)
    if (img.hasAttribute('alt')) {
      return null;
    }

    let altText = '';

    // Check for aria-label first
    if (img.getAttribute('aria-label')) {
      altText = img.getAttribute('aria-label')!;
    }
    // Check for title attribute
    else if (img.title) {
      altText = img.title;
    }
    // Try Vision API for actual image analysis
    else if (img.src && img.complete && img.naturalWidth > 0) {
      try {
        // Skip data URLs and very small images (likely icons/decorative)
        if (!img.src.startsWith('data:') && img.naturalWidth > 50 && img.naturalHeight > 50) {
          altText = await this.analyzeImageWithVision(img.src);
        }
      } catch (error) {
        console.log('[TransformationEngine] Vision API failed, using fallback');
      }
    }

    // Fallback to filename if Vision API failed
    if (!altText && img.src) {
      const filename = img.src.split('/').pop()?.split('.')[0] || '';
      if (filename && !filename.match(/^\d+$/) && filename.length < 50) {
        altText = filename.replace(/[-_]/g, ' ');
      }
    }

    img.alt = altText;
    console.log('[TransformationEngine] Added alt text:', altText || '(decorative)');

    return {
      type: 'Image Alt',
      description: 'alt 텍스트 추가',
      element: this.getElementDescription(img),
      before: '(없음)',
      after: altText || '(장식용)',
    };
  }

  private async analyzeImageWithVision(imageUrl: string): Promise<string> {
    const serverUrl = 'http://localhost:3000/analyze-image';

    try {
      const response = await fetch(serverUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        throw new Error('Vision API request failed');
      }

      const data = await response.json();
      return data.altText || '';
    } catch (error) {
      console.error('[TransformationEngine] Vision API error:', error);
      return '';
    }
  }

  /**
   * Add keyboard access WITHOUT changing visual appearance
   * Only adds event listeners and tabindex
   */
  private async addKeyboardAccess(element: HTMLElement): Promise<TransformationLog | null> {
    // Add tabindex if not already focusable
    if (!element.hasAttribute('tabindex') && element.tabIndex < 0) {
      element.tabIndex = 0;
    }

    // Add keyboard event handler if element has click handler
    const hasClickHandler = element.onclick !== null ||
                           element.hasAttribute('onclick') ||
                           element.getAttribute('role') === 'button';

    const hasKeyboardHandler = element.hasAttribute('data-weally-keyboard');

    if (hasClickHandler && !hasKeyboardHandler) {
      element.addEventListener('keydown', (event: KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          element.click();
        }
      });
      element.setAttribute('data-weally-keyboard', 'true');

      console.log('[TransformationEngine] Added keyboard access (no visual change)');
    }
    return null; // Simplified for now
  }

  /**
   * Add form labels WITHOUT changing visual appearance
   * Uses aria-label instead of visible <label> elements
   */
  private async addFormLabel(element: HTMLElement): Promise<TransformationLog | null> {
    // Skip if already has label
    if (element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby')) {
      return null;
    }

    // Check if there's already a visible label
    const existingLabel = element.id ? document.querySelector(`label[for="${element.id}"]`) : null;
    if (existingLabel) {
      return null;
    }

    // Try to infer label text
    let labelText = '';

    // Check for placeholder
    if ((element as HTMLInputElement).placeholder) {
      labelText = (element as HTMLInputElement).placeholder;
    }
    // Check for title
    else if (element.title) {
      labelText = element.title;
    }
    // Check for name attribute
    else if (element.hasAttribute('name')) {
      const name = element.getAttribute('name')!;
      labelText = name.replace(/[-_]/g, ' ').replace(/([A-Z])/g, ' $1').trim();
    }
    // Check previous sibling text
    else if (element.previousElementSibling?.textContent) {
      const prevText = element.previousElementSibling.textContent.trim();
      if (prevText.length > 0 && prevText.length < 50) {
        labelText = prevText;
      }
    }
    // Check parent text (if parent has little text)
    else if (element.parentElement) {
      // Get direct text nodes only (not nested elements)
      const parentText = Array.from(element.parentElement.childNodes)
        .filter(node => node.nodeType === Node.TEXT_NODE)
        .map(node => node.textContent?.trim())
        .filter(text => text && text.length > 0)
        .join(' ');

      if (parentText.length > 0 && parentText.length < 50) {
        labelText = parentText;
      }
    }

    // Add aria-label (no visual change)
    if (labelText) {
      element.setAttribute('aria-label', labelText);
      console.log('[TransformationEngine] Added aria-label to form element:', labelText);
    } else {
      // Fallback: use input type as label
      const inputType = (element as HTMLInputElement).type || 'field';
      element.setAttribute('aria-label', `${inputType} input`);
      console.log('[TransformationEngine] Added fallback aria-label:', inputType);
    }
    return null; // Simplified for now
  }
}
