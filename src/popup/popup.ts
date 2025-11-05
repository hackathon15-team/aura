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
            displayStats(response);
            displayLogs(response.logs);
          } else {
            showDisabled();
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

    const clearBtn = document.getElementById('clear-logs');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
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

function showDisabled(): void {
  const issuesFoundEl = document.getElementById('issues-found');
  const fixedCountEl = document.getElementById('fixed-count');
  const ariaCountEl = document.getElementById('aria-count');

  if (issuesFoundEl) issuesFoundEl.textContent = '-';
  if (fixedCountEl) fixedCountEl.textContent = '-';
  if (ariaCountEl) ariaCountEl.textContent = '-';

  const logsContainer = document.getElementById('logs-container');
  if (logsContainer) {
    logsContainer.innerHTML = '<div class="no-logs">확장 프로그램이 비활성화되어 있습니다.</div>';
  }
}

function showError(message: string): void {
  const statusEl = document.querySelector('.status strong');
  if (statusEl) {
    statusEl.textContent = '오류';
    (statusEl as HTMLElement).style.color = '#e74c3c';
  }

  const statusTextEl = document.querySelector('.status p');
  if (statusTextEl) {
    statusTextEl.textContent = message;
  }

  const issuesFoundEl = document.getElementById('issues-found');
  const fixedCountEl = document.getElementById('fixed-count');
  const ariaCountEl = document.getElementById('aria-count');

  if (issuesFoundEl) issuesFoundEl.textContent = '0';
  if (fixedCountEl) fixedCountEl.textContent = '0';
  if (ariaCountEl) ariaCountEl.textContent = '0';
}

function updateToggleState(enabled: boolean): void {
  const toggleBtn = document.getElementById('toggle-enabled') as HTMLInputElement;
  const statusBox = document.querySelector('.status');
  const statusText = document.getElementById('status-text');
  const statusDescription = document.getElementById('status-description');

  if (toggleBtn) {
    toggleBtn.checked = enabled;
  }

  if (statusBox) {
    if (enabled) {
      statusBox.classList.remove('disabled');
      if (statusText) statusText.textContent = '활성화됨';
      if (statusDescription) statusDescription.textContent = '현재 페이지의 접근성을 개선하고 있습니다.';
    } else {
      statusBox.classList.add('disabled');
      if (statusText) statusText.textContent = '비활성화됨';
      if (statusDescription) statusDescription.textContent = '접근성 개선이 중지되었습니다.';
    }
  }
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
