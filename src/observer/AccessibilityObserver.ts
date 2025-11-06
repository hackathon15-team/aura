
export class AccessibilityObserver {
  private observer: MutationObserver | null = null;
  private callback: (mutations: MutationRecord[]) => void;
  private isObserving = false;
  private mutationQueue: MutationRecord[] = [];
  private processingTimeout: number | null = null;
  private readonly DEBOUNCE_MS = 100;
  private readonly MAX_MUTATIONS_PER_BATCH = 100;

  private processingElements = new WeakSet<Node>();

  private recentlyProcessed = new WeakSet<Node>();

  constructor(callback: (mutations: MutationRecord[]) => void) {
    this.callback = callback;
  }

  start(): void {
    if (this.isObserving) return;

    this.observer = new MutationObserver((mutations) => {
      this.handleMutations(mutations);
    });

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
      characterData: true,    // Watch text changes (Vue rendering)
      characterDataOldValue: true,
    });

    this.isObserving = true;
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
  }

  private handleMutations(mutations: MutationRecord[]): void {
    if (mutations.length > this.MAX_MUTATIONS_PER_BATCH) {
      console.warn(`[AccessibilityObserver] Large mutation batch: ${mutations.length}, limiting to ${this.MAX_MUTATIONS_PER_BATCH}`);
      mutations = mutations.slice(0, this.MAX_MUTATIONS_PER_BATCH);
    }

    const relevantMutations = mutations.filter(mutation => {
      const target = mutation.target;

      if (this.processingElements.has(target)) {
        return false;
      }

      if (this.recentlyProcessed.has(target)) {
        return false;
      }

      if (target instanceof HTMLElement) {
        if (target.hasAttribute('data-web-ally-generated')) {
          return false;
        }

        if (mutation.type === 'attributes') {
          const attrName = mutation.attributeName;
          if (attrName?.startsWith('aria-') ||
              attrName === 'role' ||
              attrName === 'tabindex') {
            const oldValue = mutation.oldValue;
            const newValue = target.getAttribute(attrName || '');

            if (!oldValue && newValue) {
              return false;
            }
          }
        }
      }

      if (mutation.type === 'childList') {
        return mutation.addedNodes.length > 0;
      }

      if (mutation.type === 'characterData') {
        const oldValue = mutation.oldValue?.trim() || '';
        const newValue = (mutation.target as Text).textContent?.trim() || '';

        if (oldValue.length === 0 && newValue.length > 0) {
          return true;
        }

        return false;
      }

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

    const uniqueTargets = new Set<Node>();
    const dedupedMutations = relevantMutations.filter(mutation => {
      if (uniqueTargets.has(mutation.target)) {
        return false;
      }
      uniqueTargets.add(mutation.target);
      return true;
    });

    this.mutationQueue.push(...dedupedMutations);

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

    mutations.forEach(mutation => {
      this.processingElements.add(mutation.target);
      mutation.addedNodes.forEach(node => {
        if (node instanceof HTMLElement) {
          this.processingElements.add(node);
        }
      });
    });

    requestAnimationFrame(() => {
      try {
        this.callback(mutations);
      } catch (error) {
        console.error('[AccessibilityObserver] Error processing mutations:', error);
      } finally {
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

        setTimeout(() => {
          this.recentlyProcessed = new WeakSet();
        }, this.DEBOUNCE_MS * 2);
      }
    });
  }

  private didVisibilityChange(oldValue: string | null, newValue: string | null): boolean {
    if (oldValue === null) {
      return true;
    }

    if (oldValue === newValue) {
      return false;
    }

    const visibilityKeywords = ['hide', 'show', 'visible', 'hidden', 'display', 'opacity', 'collapse'];

    const oldHasKeyword = visibilityKeywords.some(keyword =>
      oldValue?.toLowerCase().includes(keyword)
    );
    const newHasKeyword = visibilityKeywords.some(keyword =>
      newValue?.toLowerCase().includes(keyword)
    );

    return oldHasKeyword || newHasKeyword;
  }

  pause(): void {
    if (this.observer && this.isObserving) {
      this.observer.disconnect();
      this.isObserving = false;
    }
  }

  resume(): void {
    if (this.observer && !this.isObserving) {
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
        characterData: true,
        characterDataOldValue: true,
      });
      this.isObserving = true;
    }
  }
}
