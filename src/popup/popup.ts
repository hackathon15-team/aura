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
  enabled: boolean;
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.id) {
      showError('탭 정보를 가져올 수 없습니다.');
      return;
    }

    chrome.tabs.sendMessage(
      tab.id,
      { type: 'GET_STATS' },
      (response: AccessibilityStats) => {
        if (chrome.runtime.lastError) {
          showError('확장 프로그램이 이 페이지에서 작동하지 않습니다.');
          return;
        }

        if (response) {
          updateToggleState(response.enabled);
          if (response.enabled) {
            showContent();
            displayStats(response);
            displayLogs(response.logs);
          } else {
            hideContent();
          }
        } else {
          showError('통계를 가져올 수 없습니다.');
        }
      }
    );

    const toggleBtn = document.getElementById('toggle-enabled') as HTMLInputElement;
    if (toggleBtn) {
      toggleBtn.addEventListener('change', () => {
        chrome.tabs.sendMessage(
          tab.id!,
          { type: 'TOGGLE_ENABLED' },
          () => {
            setTimeout(() => {
              chrome.tabs.reload(tab.id!);
            }, 100);
          }
        );
      });
    }

    const logsHeader = document.getElementById('logs-header');
    if (logsHeader) {
      logsHeader.addEventListener('click', (e) => {
        const logsSection = document.querySelector('.logs-section');
        if (logsSection) {
          logsSection.classList.toggle('expanded');
        }
      });
    }

    const clearBtn = document.getElementById('clear-logs');
    if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        chrome.tabs.sendMessage(tab.id!, { type: 'CLEAR_LOGS' }, () => {
          const logsContainer = document.getElementById('logs-container');
          if (logsContainer) {
            logsContainer.innerHTML = '<div class="no-logs">아직 수정 내역이 없습니다.</div>';
          }
        });
      });
    }
  } catch (error) {
    showError('오류가 발생했습니다.');
  }
});

function displayStats(stats: AccessibilityStats): void {
  const issuesFoundEl = document.getElementById('issues-found');
  const fixedCountEl = document.getElementById('fixed-count');
  const ariaCountEl = document.getElementById('aria-count');

  if (issuesFoundEl) issuesFoundEl.textContent = stats.issuesFound.toString();
  if (fixedCountEl) fixedCountEl.textContent = stats.issuesFixed.toString();
  if (ariaCountEl) ariaCountEl.textContent = stats.ariaAttributesAdded.toString();
}

function displayLogs(logs: ModificationLog[]): void {
  const logsContainer = document.getElementById('logs-container');
  if (!logsContainer) return;

  if (logs.length === 0) {
    logsContainer.innerHTML = '<div class="no-logs">아직 수정 내역이 없습니다.</div>';
    return;
  }

  logsContainer.innerHTML = '';

  logs.forEach(log => {
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';

    const time = new Date(log.timestamp);
    const timeStr = time.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    logEntry.innerHTML = `
      <div class="log-header">
        <span class="log-type">${escapeHtml(log.type)}</span>
        <span class="log-time">${timeStr}</span>
      </div>
      <div class="log-description">${escapeHtml(log.description)}</div>
      <div class="log-element" title="${escapeHtml(log.element)}">${escapeHtml(log.element)}</div>
      <div class="log-change">
        <span class="log-change-label">변경 전:</span>
        <span class="log-change-value before">${escapeHtml(log.before)}</span>
        <span class="log-change-label">변경 후:</span>
        <span class="log-change-value after">${escapeHtml(log.after)}</span>
      </div>
    `;

    logsContainer.appendChild(logEntry);
  });
}

function showContent(): void {
  document.body.classList.remove('disabled-mode');
}

function hideContent(): void {
  document.body.classList.add('disabled-mode');
}

function showError(message: string): void {
  const issuesFoundEl = document.getElementById('issues-found');
  const fixedCountEl = document.getElementById('fixed-count');
  const ariaCountEl = document.getElementById('aria-count');

  if (issuesFoundEl) issuesFoundEl.textContent = '0';
  if (fixedCountEl) fixedCountEl.textContent = '0';
  if (ariaCountEl) ariaCountEl.textContent = '0';

  const logsContainer = document.getElementById('logs-container');
  if (logsContainer) {
    logsContainer.innerHTML = `<div class="no-logs">${message}</div>`;
  }
}

function updateToggleState(enabled: boolean): void {
  const toggleBtn = document.getElementById('toggle-enabled') as HTMLInputElement;

  if (toggleBtn) {
    toggleBtn.checked = enabled;
  }
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
