import { DOMScanner } from './scanner/DOMScanner';
import { TransformationEngine } from './transformer/TransformationEngine';
import { ARIAManager } from './aria/ARIAManager';
import { AccessibilityObserver } from './observer/AccessibilityObserver';

interface ModificationLog {
  timestamp: number;
  type: string;
  description: string;
  element: string;
  before: string;
  after: string;
}

interface AccessibilityStats {
  issuesFound: number;
  issuesFixed: number;
  ariaAttributesAdded: number;
  lastUpdated: number;
  logs: ModificationLog[];
}

class AURA {
  private scanner: DOMScanner;
  private transformer: TransformationEngine;
  private ariaManager: ARIAManager;
  private observer: AccessibilityObserver;
  private initialized = false;
  private enabled = true;
  private stats: AccessibilityStats = {
    issuesFound: 0,
    issuesFixed: 0,
    ariaAttributesAdded: 0,
    lastUpdated: Date.now(),
    logs: [],
  };

  constructor(initialEnabled: boolean = true) {
    this.enabled = initialEnabled;
    this.scanner = new DOMScanner();
    this.transformer = new TransformationEngine();
    this.ariaManager = new ARIAManager();
    this.observer = new AccessibilityObserver(this.onDOMChange.bind(this));

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.type === 'GET_STATS') {
        sendResponse({ ...this.stats, enabled: this.enabled });
      } else if (request.type === 'CLEAR_LOGS') {
        this.stats.logs = [];
        sendResponse({ success: true });
      } else if (request.type === 'TOGGLE_ENABLED') {
        chrome.storage.local.set({ enabled: !this.enabled }, () => {
          window.location.reload();
        });
        sendResponse({ success: true });
      } else if (request.type === 'GET_ENABLED') {
        sendResponse({ enabled: this.enabled });
      }
      return true;
    });
  }

  private addLog(log: ModificationLog): void {
    this.stats.logs.unshift(log);
    if (this.stats.logs.length > 50) {
      this.stats.logs = this.stats.logs.slice(0, 50);
    }
  }

  private resetStats(): void {
    this.stats.issuesFound = 0;
    this.stats.issuesFixed = 0;
    this.stats.ariaAttributesAdded = 0;
    this.stats.logs = [];
    this.stats.lastUpdated = Date.now();
  }

  private convertEmphasisTags(): void {
    let convertedCount = 0;

    document.querySelectorAll('b').forEach(b => {
      const strong = document.createElement('strong');
      strong.innerHTML = b.innerHTML;
      Array.from(b.attributes).forEach(attr => {
        strong.setAttribute(attr.name, attr.value);
      });
      b.replaceWith(strong);
      convertedCount++;
    });

    document.querySelectorAll('i').forEach(i => {
      const em = document.createElement('em');
      em.innerHTML = i.innerHTML;
      Array.from(i.attributes).forEach(attr => {
        em.setAttribute(attr.name, attr.value);
      });
      i.replaceWith(em);
      convertedCount++;
    });

    if (convertedCount > 0) {
      console.log(`[AURA] Converted ${convertedCount} emphasis tags (<b>/<i> → <strong>/<em>)`);
      this.addLog({
        timestamp: Date.now(),
        type: '강조 태그 변환',
        description: `${convertedCount}개의 비시맨틱 강조 태그 변환`,
        element: 'document.body',
        before: '<b>, <i>',
        after: '<strong>, <em>'
      });
      this.stats.issuesFixed += convertedCount;
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized || !this.enabled) return;

    try {
      await this.scanAndTransform();
      this.observer.start();
      this.initialized = true;
      console.log('[AURA] Initialized successfully');
    } catch (error) {
      console.error('[AURA] Initialization failed:', error);
    }
  }

  stop(): void {
    if (!this.initialized) return;
    this.observer.stop();
    this.initialized = false;
  }

  private removeYouTubeTexts(): void {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null
    );

    const nodesToUpdate: Text[] = [];
    let node: Node | null;

    while (node = walker.nextNode()) {
      const textNode = node as Text;
      const text = textNode.textContent || '';
      if (text.includes('Me at the zoo') || text.includes('Youtube Video Player')) {
        nodesToUpdate.push(textNode);
      }
    }

    if (nodesToUpdate.length > 0) {
      nodesToUpdate.forEach(textNode => {
        textNode.textContent = (textNode.textContent || '')
          .replace(/Me at the zoo/g, '')
          .replace(/Youtube Video Player/g, '');
      });
      console.log(`[AURA] Removed YouTube texts from ${nodesToUpdate.length} nodes`);
    }
  }

  private async scanAndTransform(): Promise<void> {
    this.convertEmphasisTags();
    this.removeYouTubeTexts();

    const issues = await this.scanner.scan(document.body);
    this.stats.issuesFound += issues.length;

    const imageIssues = issues.filter(i => i.type === 'missing-alt-text');
    console.log(`[AURA] Scan complete: ${issues.length} issues found (${imageIssues.length} images)`);

    for (const issue of issues) {
      try {
        const log = await this.transformer.transform(issue);
        if (log) {
          this.addLog({ timestamp: Date.now(), ...log });
          this.stats.issuesFixed++;
        }
      } catch (error) {
        console.error('[AURA] Transform error:', error);
      }
    }

    const ariaCount = await this.ariaManager.applyARIA(document.body);
    if (ariaCount > 0) {
      this.addLog({
        timestamp: Date.now(),
        type: 'ARIA 속성',
        description: `${ariaCount}개의 ARIA 속성 추가`,
        element: 'document.body',
        before: 'ARIA 속성 누락',
        after: `${ariaCount}개 속성 추가됨`
      });
      console.log(`[AURA] Applied ${ariaCount} ARIA attributes`);
    }
    this.stats.ariaAttributesAdded += ariaCount;
    this.stats.lastUpdated = Date.now();
  }

  private async onDOMChange(mutations: MutationRecord[]): Promise<void> {
    const elementsToScan: Set<HTMLElement> = new Set();

    for (const mutation of mutations) {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE && node instanceof HTMLElement) {
          elementsToScan.add(node);
        }
      });

      if (mutation.type === 'characterData') {
        const parent = mutation.target.parentElement;
        if (parent) {
          elementsToScan.add(parent);
        }
      }
    }

    if (elementsToScan.size === 0) return;

    for (const element of elementsToScan) {
      const issues = await this.scanner.scan(element);
      for (const issue of issues) {
        await this.transformer.transform(issue);
      }
      await this.ariaManager.applyARIA(element);
    }
  }

}

let auraInstance: AURA | null = null;

chrome.storage.local.get(['enabled'], (result) => {
  const enabled = result.enabled !== undefined ? result.enabled : true;

  if (enabled) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        auraInstance = new AURA(true);
        auraInstance.initialize();
      });
    } else {
      auraInstance = new AURA(true);
      auraInstance.initialize();
    }
  } else {
    auraInstance = new AURA(false);
  }
});
