/**
 * AccessibilityObserver - Real-time monitoring of DOM changes
 * Detects and processes dynamic content (SPA, AJAX, infinite scroll, etc.)
 */

export class AccessibilityObserver {
  private observer: MutationObserver | null = null;
  private callback: (mutations: MutationRecord[]) => void;
  private isObserving = false;
  private mutationQueue: MutationRecord[] = [];
  private processingTimeout: number | null = null;
  private readonly DEBOUNCE_MS = 100;

  constructor(callback: (mutations: MutationRecord[]) => void) {
    this.callback = callback;
  }

  start(): void {
    if (this.isObserving) {
      console.warn('[AccessibilityObserver] Already observing');
      return;
    }

    this.observer = new MutationObserver((mutations) => {
      this.handleMutations(mutations);
    });

    // Observe entire document for changes
    this.observer.observe(document.body, {
      childList: true,        // Watch for added/removed nodes
      subtree: true,          // Watch all descendants
      attributes: true,       // Watch attribute changes
      attributeFilter: [      // Only watch accessibility-relevant attributes
        'class',
        'style',
        'aria-hidden',
        'aria-expanded',
        'disabled',
        'hidden',
      ],
      characterData: false,   // Ignore text changes
    });

    this.isObserving = true;
    console.log('[AccessibilityObserver] Started monitoring DOM changes');
  }

  stop(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    if (this.processingTimeout) {
      clearTimeout(this.processingTimeout);
      this.processingTimeout = null;
    }

    this.isObserving = false;
    this.mutationQueue = [];
    console.log('[AccessibilityObserver] Stopped monitoring');
  }

  private handleMutations(mutations: MutationRecord[]): void {
    // Filter out irrelevant mutations
    const relevantMutations = mutations.filter(mutation => {
      // Ignore mutations in our own generated elements
      if (mutation.target instanceof HTMLElement) {
        const target = mutation.target;
        if (target.hasAttribute('data-web-ally-generated')) {
          return false;
        }
      }

      // Ignore mutations that only change style/class without affecting visibility
      if (mutation.type === 'attributes') {
        const target = mutation.target as HTMLElement;
        const attrName = mutation.attributeName;

        if (attrName === 'class' || attrName === 'style') {
          // Only process if visibility changed
          return this.didVisibilityChange(target, mutation.oldValue);
        }
      }

      return true;
    });

    if (relevantMutations.length === 0) {
      return;
    }

    // Add to queue
    this.mutationQueue.push(...relevantMutations);

    // Debounce processing to avoid excessive updates
    if (this.processingTimeout) {
      clearTimeout(this.processingTimeout);
    }

    this.processingTimeout = window.setTimeout(() => {
      this.processMutationQueue();
    }, this.DEBOUNCE_MS);
  }

  private processMutationQueue(): void {
    if (this.mutationQueue.length === 0) {
      return;
    }

    const mutations = this.mutationQueue;
    this.mutationQueue = [];
    this.processingTimeout = null;

    // Process in next frame to avoid blocking
    requestAnimationFrame(() => {
      try {
        this.callback(mutations);
      } catch (error) {
        console.error('[AccessibilityObserver] Error processing mutations:', error);
      }
    });
  }

  private didVisibilityChange(element: HTMLElement, oldValue: string | null): boolean {
    const computed = window.getComputedStyle(element);

    // Check current visibility
    const isCurrentlyVisible = (
      computed.display !== 'none' &&
      computed.visibility !== 'hidden' &&
      parseFloat(computed.opacity) > 0
    );

    // If we don't have old value, assume it changed
    if (!oldValue) {
      return true;
    }

    // Simple heuristic: if class/style contains hide/show keywords
    const currentValue = element.getAttribute('class') || element.getAttribute('style') || '';
    const visibilityKeywords = ['hide', 'show', 'visible', 'hidden', 'display', 'opacity'];

    const hasVisibilityKeyword = visibilityKeywords.some(keyword =>
      currentValue.includes(keyword) || oldValue.includes(keyword)
    );

    return hasVisibilityKeyword;
  }

  /**
   * Temporarily pause observation (useful during batch updates)
   */
  pause(): void {
    if (this.observer && this.isObserving) {
      this.observer.disconnect();
      this.isObserving = false;
    }
  }

  /**
   * Resume observation after pause
   */
  resume(): void {
    if (!this.isObserving) {
      this.start();
    }
  }
}
