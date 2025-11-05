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
  private readonly MAX_MUTATIONS_PER_BATCH = 100;

  // Track elements we're currently processing to prevent infinite loops
  private processingElements = new WeakSet<Node>();

  // Track recently processed elements to avoid duplicate processing
  private recentlyProcessed = new WeakSet<Node>();

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
      attributeOldValue: true, // Needed to compare old vs new values
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
    // Limit batch size to prevent overload
    if (mutations.length > this.MAX_MUTATIONS_PER_BATCH) {
      console.warn(`[AccessibilityObserver] Large mutation batch: ${mutations.length}, limiting to ${this.MAX_MUTATIONS_PER_BATCH}`);
      mutations = mutations.slice(0, this.MAX_MUTATIONS_PER_BATCH);
    }

    // Filter out irrelevant mutations and prevent infinite loops
    const relevantMutations = mutations.filter(mutation => {
      const target = mutation.target;

      // Prevent infinite loops: ignore elements we're currently processing
      if (this.processingElements.has(target)) {
        return false;
      }

      // Ignore recently processed elements (within debounce window)
      if (this.recentlyProcessed.has(target)) {
        return false;
      }

      // Ignore mutations in our own generated elements
      if (target instanceof HTMLElement) {
        if (target.hasAttribute('data-web-ally-generated')) {
          return false;
        }

        // Ignore mutations caused by our ARIA additions
        if (mutation.type === 'attributes') {
          const attrName = mutation.attributeName;
          // Skip if we're just adding ARIA attributes
          if (attrName?.startsWith('aria-') ||
              attrName === 'role' ||
              attrName === 'tabindex') {
            // Only process if it's a removal or significant change
            const oldValue = mutation.oldValue;
            const newValue = target.getAttribute(attrName || '');

            // If we're adding (null → value), skip
            if (!oldValue && newValue) {
              return false;
            }
          }
        }
      }

      // For childList mutations, only process if new elements added
      if (mutation.type === 'childList') {
        return mutation.addedNodes.length > 0;
      }

      // For attribute mutations on class/style, check if visibility changed
      if (mutation.type === 'attributes') {
        const target = mutation.target as HTMLElement;
        const attrName = mutation.attributeName;

        if (attrName === 'class' || attrName === 'style') {
          return this.didVisibilityChange(mutation.oldValue, target.getAttribute(attrName || ''));
        }
      }

      return true;
    });

    if (relevantMutations.length === 0) {
      return;
    }

    // Deduplicate by target node
    const uniqueTargets = new Set<Node>();
    const dedupedMutations = relevantMutations.filter(mutation => {
      if (uniqueTargets.has(mutation.target)) {
        return false;
      }
      uniqueTargets.add(mutation.target);
      return true;
    });

    // Add to queue
    this.mutationQueue.push(...dedupedMutations);

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

    // Mark elements as being processed
    mutations.forEach(mutation => {
      this.processingElements.add(mutation.target);
      mutation.addedNodes.forEach(node => {
        if (node instanceof HTMLElement) {
          this.processingElements.add(node);
        }
      });
    });

    // Process in next frame to avoid blocking
    requestAnimationFrame(() => {
      try {
        this.callback(mutations);
      } catch (error) {
        console.error('[AccessibilityObserver] Error processing mutations:', error);
      } finally {
        // Clear processing flag and mark as recently processed
        mutations.forEach(mutation => {
          this.processingElements.delete(mutation.target);
          this.recentlyProcessed.add(mutation.target);

          mutation.addedNodes.forEach(node => {
            if (node instanceof HTMLElement) {
              this.processingElements.delete(node);
              this.recentlyProcessed.add(node);
            }
          });
        });

        // Clear recently processed after a delay
        setTimeout(() => {
          this.recentlyProcessed = new WeakSet();
        }, this.DEBOUNCE_MS * 2);
      }
    });
  }

  /**
   * Check if visibility-related attributes changed (without expensive getComputedStyle)
   */
  private didVisibilityChange(oldValue: string | null, newValue: string | null): boolean {
    // If no old value, assume it changed
    if (oldValue === null) {
      return true;
    }

    // If values are identical, no change
    if (oldValue === newValue) {
      return false;
    }

    // Check if visibility-related keywords changed
    const visibilityKeywords = ['hide', 'show', 'visible', 'hidden', 'display', 'opacity', 'collapse'];

    const oldHasKeyword = visibilityKeywords.some(keyword =>
      oldValue?.toLowerCase().includes(keyword)
    );
    const newHasKeyword = visibilityKeywords.some(keyword =>
      newValue?.toLowerCase().includes(keyword)
    );

    // If visibility keywords appeared or disappeared, it's a visibility change
    return oldHasKeyword || newHasKeyword;
  }

  /**
   * Temporarily pause observation (useful during batch updates)
   */
  pause(): void {
    if (this.observer && this.isObserving) {
      this.observer.disconnect();
      this.isObserving = false;
      console.log('[AccessibilityObserver] Paused');
    }
  }

  /**
   * Resume observation after pause
   */
  resume(): void {
    if (this.observer && !this.isObserving) {
      // Reconnect the existing observer
      this.observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeOldValue: true,
        attributeFilter: [
          'class',
          'style',
          'aria-hidden',
          'aria-expanded',
          'disabled',
          'hidden',
        ],
        characterData: false,
      });
      this.isObserving = true;
      console.log('[AccessibilityObserver] Resumed');
    }
  }
}
