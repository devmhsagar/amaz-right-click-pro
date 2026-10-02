/**
 * Amaz Right Click Pro - Background Service Worker
 * Manages defaults, context menus, badge indicators, and extension lifecycle.
 */

const DEFAULT_SETTINGS = {
  enabled: true,
  absoluteMode: false,
  allowRightClick: true,
  allowNewTab: true,
  allowCopy: true,
  allowPaste: true,
  allowSelect: true,
  allowShortcuts: true,
  suppressAlerts: true,
  disabledSites: []
};

// Initialize settings on installation
chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.local.get(null);
  const toSet = {};

  for (const [key, val] of Object.entries(DEFAULT_SETTINGS)) {
    if (existing[key] === undefined) {
      toSet[key] = val;
    }
  }

  if (Object.keys(toSet).length > 0) {
    await chrome.storage.local.set(toSet);
  }

  // Create context menu items
  chrome.contextMenus.removeAll(async () => {
    chrome.contextMenus.create({
      id: 'unlock_page',
      title: '🔓 Amaz Pro: Force Unlock Page',
      contexts: ['all']
    });

    chrome.contextMenus.create({
      id: 'toggle_absolute',
      title: '⚡ Amaz Pro: Toggle Absolute Mode',
      contexts: ['action']
    });
  });

  await updateBadge();
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab || !tab.id) return;

  if (info.menuItemId === 'unlock_page') {
    try {
      await chrome.tabs.sendMessage(tab.id, { action: 'FORCE_UNLOCK' });
    } catch (err) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id, allFrames: true },
          func: () => {
            const el = document.getElementById('amaz-unlocker-toast');
            if (el) el.classList.remove('amaz-toast-hide');
            window.postMessage({ source: 'AMAZ_RIGHT_CLICK_EXT', action: 'UPDATE_CONFIG', payload: { enabled: true } }, '*');
          }
        });
      } catch (e) {
        console.warn('Could not inject script:', e);
      }
    }
  } else if (info.menuItemId === 'toggle_absolute') {
    const { absoluteMode = false } = await chrome.storage.local.get('absoluteMode');
    const newMode = !absoluteMode;
    await chrome.storage.local.set({ absoluteMode: newMode });
    try {
      await chrome.tabs.sendMessage(tab.id, { action: 'UPDATE_CONFIG', payload: { absoluteMode: newMode } });
    } catch (err) { }
    await updateBadge();
  }
});

// Update Action badge based on settings
async function updateBadge() {
  const { enabled = true, absoluteMode = false } = await chrome.storage.local.get(['enabled', 'absoluteMode']);

  if (!enabled) {
    await chrome.action.setBadgeText({ text: 'OFF' });
    await chrome.action.setBadgeBackgroundColor({ color: '#64748b' });
  } else if (absoluteMode) {
    await chrome.action.setBadgeText({ text: 'ABS' });
    await chrome.action.setBadgeBackgroundColor({ color: '#f59e0b' });
  } else {
    await chrome.action.setBadgeText({ text: 'ON' });
    await chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
  }
}

chrome.storage.onChanged.addListener(async (changes, areaName) => {
  if (areaName === 'local') {
    if (changes.enabled || changes.absoluteMode) {
      await updateBadge();
    }
  }
});
