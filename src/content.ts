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

  private async scanAndTransform(): Promise<void> {
    const issues = await this.scanner.scan(document.body);
    this.stats.issuesFound += issues.length;

    const imageIssues = issues.filter(i => i.type === 'missing-alt-text');
    console.log(`[AURA] Scan complete: ${issues.length} issues found${imageIssues.length > 0 ? ` (${imageIssues.length} images)` : ''}`);

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
    const addedNodes: Node[] = [];
    for (const mutation of mutations) {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          addedNodes.push(node);
        }
      });
    }

    if (addedNodes.length === 0) return;

    for (const node of addedNodes) {
      if (node instanceof HTMLElement) {
        const issues = await this.scanner.scan(node);
        for (const issue of issues) {
          await this.transformer.transform(issue);
        }
        await this.ariaManager.applyARIA(node);
      }
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
