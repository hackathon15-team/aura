
export class DOMUtils {
  static batchUpdate(callback: () => void): void {
    requestAnimationFrame(() => {
      callback();
    });
  }

  static isVisible(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);

    return (
      rect.width > 0 &&
      rect.height > 0 &&
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0'
    );
  }

  static getFocusableElements(container: HTMLElement): HTMLElement[] {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    return Array.from(container.querySelectorAll(selector)) as HTMLElement[];
  }

  static generateId(prefix = 'elem'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  static getCleanTextContent(element: HTMLElement): string {
    const clone = element.cloneNode(true) as HTMLElement;

    clone.querySelectorAll('script, style').forEach(el => el.remove());

    return clone.textContent?.trim() || '';
  }

  static isInteractive(element: HTMLElement): boolean {
    const interactiveTags = ['button', 'a', 'input', 'select', 'textarea'];
    const tagName = element.tagName.toLowerCase();

    return (
      interactiveTags.includes(tagName) ||
      element.hasAttribute('onclick') ||
      element.hasAttribute('role') ||
      element.tabIndex >= 0
    );
  }

  static getContrastRatio(color1: string, color2: string): number {
    const lum1 = this.getLuminance(color1);
    const lum2 = this.getLuminance(color2);

    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  private static getLuminance(color: string): number {
    const rgb = this.parseColor(color);
    if (!rgb) return 0;

    const [r, g, b] = rgb.map(val => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  private static parseColor(color: string): [number, number, number] | null {
    const temp = document.createElement('div');
    temp.style.color = color;
    document.body.appendChild(temp);

    const computed = window.getComputedStyle(temp).color;
    document.body.removeChild(temp);

    const match = computed.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (match) {
      return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
    }

    return null;
  }
}
