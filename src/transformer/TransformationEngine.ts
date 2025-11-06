import { AccessibilityIssue, IssueType } from '../scanner/DOMScanner';

export interface TransformationLog {
  type: string;
  description: string;
  element: string;
  before: string;
  after: string;
}

export class TransformationEngine {
  private transformedElements = new WeakMap<HTMLElement, Set<IssueType>>();

  private keyboardHandlers = new WeakMap<HTMLElement, (event: KeyboardEvent) => void>();
  private readonly OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
  private readonly OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
  private readonly VISION_API_TIMEOUT = 10000;
  private readonly VISION_API_RETRIES = 2;

  async transform(issue: AccessibilityIssue): Promise<TransformationLog | null> {
    if (!this.transformedElements.has(issue.element)) {
      this.transformedElements.set(issue.element, new Set());
    }

    const processedTypes = this.transformedElements.get(issue.element)!;
    if (processedTypes.has(issue.type)) {
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

        case IssueType.UNCONNECTED_LABEL_INPUT:
          log = await this.connectLabelToInput(issue.element as HTMLLabelElement);
          break;

        case IssueType.ANCHOR_NEEDS_CONTEXT:
          log = await this.addContextToAnchor(issue.element as HTMLAnchorElement);
          break;

        default:
          // Other issues handled by ARIAManager
          break;
      }

      processedTypes.add(issue.type);
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

    // If it's an image, also add alt text
    if (tagName === 'img' && !element.hasAttribute('alt')) {
      await this.addAltText(element as HTMLImageElement);
    }

    const before = `<${tagName}> (클릭 가능하지만 버튼 역할 없음)`;
    const modifications: string[] = [];

    if (!element.hasAttribute('role')) {
      element.setAttribute('role', 'button');
      modifications.push('role="button"');
    }

    if (!element.hasAttribute('tabindex')) {
      element.tabIndex = 0;
      modifications.push('tabindex="0"');
    }

    if (!this.keyboardHandlers.has(element)) {
      const handler = (event: KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          element.click();
        }
      };
      element.addEventListener('keydown', handler);
      this.keyboardHandlers.set(element, handler);
      modifications.push('키보드 이벤트');
    }

    let label = '';
    if (!element.hasAttribute('aria-label') && !element.hasAttribute('aria-labelledby')) {
      const text = element.textContent?.trim();
      if (text && text.length > 0 && text.length < 100) {
        element.setAttribute('aria-label', text);
        label = text.slice(0, 20);
        modifications.push(`aria-label="${label}${text.length > 20 ? '...' : ''}"`);
      } else {
        element.setAttribute('aria-label', 'button');
        modifications.push('aria-label="button"');
      }
    }

    return {
      type: '버튼 접근성',
      description: `${tagName} 요소를 접근 가능한 버튼으로 변환`,
      element: this.getElementDescription(element),
      before,
      after: `버튼 역할 추가 (${modifications.join(', ')})`
    };
  }

  /**
   * Make CSS-styled emphasis accessible
   */
  private async makeEmphasisAccessible(element: HTMLElement): Promise<TransformationLog | null> {
    // For CSS-styled elements, don't process if already has semantic children
    const hasSemanticEmphasis = element.querySelector('strong, em, b, i');
    if (hasSemanticEmphasis) {
      return null;
    }

    const existingLabel = element.getAttribute('aria-label');
    const text = element.textContent?.trim();

    if (!text || text.length === 0 || text.length > 100 || existingLabel) {
      return null;
    }

    const computed = window.getComputedStyle(element);
    const isBold = computed.fontWeight === 'bold' || parseInt(computed.fontWeight) >= 700;
    const isItalic = computed.fontStyle === 'italic';

    if (!isBold && !isItalic) {
      return null;
    }

    if (isBold) {
      element.setAttribute('data-weally-emphasis', 'strong');
    } else if (isItalic) {
      element.setAttribute('data-weally-emphasis', 'em');
    }

    return {
      type: '강조 접근성',
      description: `${isBold ? 'Bold' : 'Italic'} 텍스트 접근성 개선`,
      element: this.getElementDescription(element),
      before: 'CSS only emphasis',
      after: `data-emphasis="${isBold ? 'strong' : 'em'}"`
    };
  }

  /**
   * Add alt text to images using Vision API
   */
  private async addAltText(img: HTMLImageElement): Promise<TransformationLog | null> {
    if (img.hasAttribute('alt')) {
      return null;
    }

    let altText = '';

    if (img.getAttribute('aria-label')) {
      altText = img.getAttribute('aria-label')!;
    }
    else if (img.title) {
      altText = img.title;
    }
    else if (img.src) {
      if (!img.complete) {
        await new Promise((resolve) => {
          const timeout = setTimeout(resolve, 1500);
          img.onload = () => {
            clearTimeout(timeout);
            resolve(null);
          };
          img.onerror = () => {
            clearTimeout(timeout);
            resolve(null);
          };
        });
      }

      try {
        if (!img.src.startsWith('data:') && img.naturalWidth > 50 && img.naturalHeight > 50) {
          altText = await this.analyzeImageWithVision(img.src);
          if (altText) {
            console.log('[AURA] Generated alt text for image:', altText.substring(0, 50));
          }
        }
      } catch (error) {
        console.warn('[TransformationEngine] Vision API error:', error);
      }
    }

    if (!altText && img.src) {
      const filename = img.src.split('/').pop()?.split('.')[0] || '';
      if (filename && !filename.match(/^\d+$/) && filename.length < 50) {
        altText = filename.replace(/[-_]/g, ' ');
      }
    }

    img.alt = altText;

    return {
      type: 'Image Alt',
      description: 'alt 텍스트 추가',
      element: this.getElementDescription(img),
      before: '(없음)',
      after: altText || '(장식용)',
    };
  }

  /**
   * Analyze image with OpenAI Vision API (direct call, with retry and timeout)
   */
  private async analyzeImageWithVision(imageUrl: string): Promise<string> {
    // Check if API key is configured
    if (!this.OPENAI_API_KEY) {
      console.warn('[TransformationEngine] OpenAI API key not configured. Skipping vision analysis.');
      return '';
    }

    let lastError: Error | null = null;

    // Retry loop
    for (let attempt = 0; attempt < this.VISION_API_RETRIES; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.VISION_API_TIMEOUT);

        const response = await fetch(this.OPENAI_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: `이 이미지에 대한 alt 텍스트를 작성해주세요. 다음 지침을 따라주세요:

1. 이미지의 **목적과 의미**를 설명하세요 (단순히 외형 묘사는 피하세요)
2. 이미지에 **텍스트**가 포함되어 있다면 반드시 그 내용을 포함하세요
3. **간결하게** 작성하세요 (1-2문장, 최대 125자)
4. "이미지", "사진", "그림" 같은 불필요한 단어는 생략하세요
5. 장식용 이미지라면 "장식용 이미지"라고만 답하세요
6. 버튼이나 링크 이미지라면 그 **기능**을 설명하세요 (예: "검색", "닫기")

핵심 정보만 한국어로 간결하게 작성해주세요.`,
                  },
                  {
                    type: 'image_url',
                    image_url: { url: imageUrl },
                  },
                ],
              },
            ],
            max_tokens: 100,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`OpenAI API returned ${response.status}: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        const altText = data.choices?.[0]?.message?.content?.trim() || '';

        if (altText) {
          return altText;
        }

        throw new Error('Empty alt text from OpenAI API');
      } catch (error) {
        lastError = error as Error;

        // If aborted (timeout), don't retry
        if (lastError.name === 'AbortError') {
          console.warn('[TransformationEngine] OpenAI Vision API timeout');
          break;
        }

        // Wait before retry (exponential backoff)
        if (attempt < this.VISION_API_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    console.warn('[TransformationEngine] OpenAI Vision API failed after retries:', lastError?.message);
    return '';
  }

  /**
   * Add keyboard access WITHOUT changing visual appearance
   * Only adds event listeners and tabindex
   */
  private async addKeyboardAccess(element: HTMLElement): Promise<TransformationLog | null> {
    const modifications: string[] = [];

    // Add tabindex if not already focusable
    if (!element.hasAttribute('tabindex') && element.tabIndex < 0) {
      element.tabIndex = 0;
      modifications.push('tabindex="0"');
    }

    // Add keyboard event handler if element has click handler
    const hasClickHandler = element.onclick !== null ||
                           element.hasAttribute('onclick') ||
                           element.getAttribute('role') === 'button';

    if (hasClickHandler && !this.keyboardHandlers.has(element)) {
      const handler = (event: KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          element.click();
        }
      };
      element.addEventListener('keydown', handler);
      this.keyboardHandlers.set(element, handler);
      modifications.push('keyboard handler');
    }

    if (modifications.length === 0) {
      return null;
    }

    return {
      type: '키보드 접근성',
      description: '키보드로 접근 가능하도록 개선',
      element: this.getElementDescription(element),
      before: '키보드 접근 불가',
      after: modifications.join(', ')
    };
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
      return {
        type: '폼 레이블',
        description: '입력 필드에 레이블 추가',
        element: this.getElementDescription(element),
        before: '레이블 없음',
        after: `aria-label="${labelText.slice(0, 30)}${labelText.length > 30 ? '...' : ''}"`
      };
    } else {
      // Fallback: use input type as label
      const inputType = (element as HTMLInputElement).type || 'field';
      const fallbackLabel = `${inputType} input`;
      element.setAttribute('aria-label', fallbackLabel);
      return {
        type: '폼 레이블',
        description: '입력 필드에 기본 레이블 추가',
        element: this.getElementDescription(element),
        before: '레이블 없음',
        after: `aria-label="${fallbackLabel}"`
      };
    }
  }

  /**
   * Connect label to adjacent input using for-id relationship
   * Generates unique ID if needed
   */
  private async connectLabelToInput(label: HTMLLabelElement): Promise<TransformationLog | null> {
    const nextElement = label.nextElementSibling;
    if (!nextElement) return null;

    // Check if next sibling is a form element
    const isFormElement = ['INPUT', 'TEXTAREA', 'SELECT'].includes(nextElement.tagName);
    if (!isFormElement) return null;

    const input = nextElement as HTMLInputElement;

    // Skip hidden inputs
    if (input.type === 'hidden') return null;

    // Skip if label wraps the input (valid pattern)
    if (label.contains(input)) return null;

    // Skip if already properly connected
    const labelFor = label.getAttribute('for');
    if (labelFor && input.id && labelFor === input.id) {
      return null;
    }

    const before = label.hasAttribute('for')
      ? `for="${label.getAttribute('for')}"`
      : 'for 속성 없음';

    // Generate unique ID if input doesn't have one
    if (!input.id) {
      input.id = `aura-input-${Math.random().toString(36).substring(2, 11)}`;
    }

    // Connect label to input
    label.setAttribute('for', input.id);

    return {
      type: 'Label-Input 연결',
      description: 'label과 input을 for-id로 연결',
      element: this.getElementDescription(label),
      before,
      after: `for="${input.id}"`
    };
  }

  /**
   * Add context to anchor links from surrounding text
   * Example: <span><a href="#s-1">1</a>. 개요</span> → <span><a aria-label="1. 개요">1</a><span aria-hidden="true">. 개요</span></span>
   */
  private async addContextToAnchor(anchor: HTMLAnchorElement): Promise<TransformationLog | null> {
    console.log('[TransformationEngine] addContextToAnchor called for:', anchor.getAttribute('href'));

    if (anchor.hasAttribute('aria-label')) {
      console.log('[TransformationEngine] Already has aria-label, skipping');
      return null;
    }

    const parent = anchor.parentElement;
    if (!parent) {
      console.log('[TransformationEngine] No parent, skipping');
      return null;
    }

    // Build label from anchor text + next text node
    let linkText = anchor.textContent?.trim() || '';
    let nextText = '';

    // Get text from next sibling (text node)
    let nextSibling = anchor.nextSibling;
    if (nextSibling && nextSibling.nodeType === Node.TEXT_NODE) {
      nextText = nextSibling.textContent?.trim() || '';
    }

    const fullText = (linkText + nextText).trim();
    console.log('[TransformationEngine] fullText:', fullText);

    if (!fullText) {
      console.log('[TransformationEngine] No full text, skipping');
      return null;
    }

    // Add aria-label with full context
    anchor.setAttribute('aria-label', fullText);

    // Wrap text nodes after the anchor with aria-hidden
    let currentSibling = anchor.nextSibling;
    while (currentSibling) {
      const next = currentSibling.nextSibling;

      if (currentSibling.nodeType === Node.TEXT_NODE) {
        const text = currentSibling.textContent?.trim() || '';
        if (text && currentSibling.parentElement === parent) {
          const wrapper = document.createElement('span');
          wrapper.setAttribute('aria-hidden', 'true');
          wrapper.textContent = currentSibling.textContent;
          currentSibling.parentElement?.replaceChild(wrapper, currentSibling);
        }
      }

      currentSibling = next;
    }

    return {
      type: 'Anchor 컨텍스트',
      description: '앵커 링크에 주변 텍스트 컨텍스트 추가',
      element: this.getElementDescription(anchor),
      before: `"${linkText}"`,
      after: `aria-label="${fullText.slice(0, 40)}${fullText.length > 40 ? '...' : ''}"`
    };
  }
}
