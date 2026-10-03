/**
 * Amaz Right Click Pro - Background Service Worker
 * Per-site badge tracking, context menus, and storage initialization.
 */

const DEFAULT_SETTINGS = {
  enabled: true,
  globalMode: false,
  enabledSites: ['eprocure.gov.bd'],
  absoluteMode: false,
  allowRightClick: true,
  allowNewTab: true,
  allowCopy: true,
  allowPaste: true,
  allowSelect: true,
  allowShortcuts: true,
  suppressAlerts: true
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

  // Ensure eprocure.gov.bd is in enabledSites
  if (Array.isArray(existing.enabledSites)) {
    if (!existing.enabledSites.includes('eprocure.gov.bd')) {
      toSet.enabledSites = [...existing.enabledSites, 'eprocure.gov.bd'];
    }
  } else {
    toSet.enabledSites = ['eprocure.gov.bd'];
  }

  if (Object.keys(toSet).length > 0) {
    await chrome.storage.local.set(toSet);
  }

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

  await updateBadgeForActiveTab();
});

// Helper to determine if a domain is active
function isDomainActive(hostname, settings) {
  if (!settings.enabled) return false;
  if (settings.globalMode) return true;
  if (!hostname || !Array.isArray(settings.enabledSites)) return false;
  const host = hostname.toLowerCase().trim();
  return settings.enabledSites.some(site => {
    const s = site.toLowerCase().trim();
    return host === s || host.endsWith('.' + s);
  });
}

// Update Action badge for the currently focused tab
async function updateBadgeForActiveTab(tabId) {
  try {
    let targetTab = null;
    if (tabId) {
      targetTab = await chrome.tabs.get(tabId).catch(() => null);
    }
    if (!targetTab) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      targetTab = tab;
    }

    if (!targetTab || !targetTab.url) {
      await chrome.action.setBadgeText({ text: '' });
      return;
    }

    let hostname = '';
    try {
      hostname = new URL(targetTab.url).hostname;
    } catch (e) {
      await chrome.action.setBadgeText({ text: '' });
      return;
    }

    const settings = await chrome.storage.local.get(DEFAULT_SETTINGS);
    const active = isDomainActive(hostname, settings);

    if (active) {
      if (settings.absoluteMode) {
        await chrome.action.setBadgeText({ text: 'ABS', tabId: targetTab.id });
        await chrome.action.setBadgeBackgroundColor({ color: '#f59e0b', tabId: targetTab.id });
      } else {
        await chrome.action.setBadgeText({ text: 'ON', tabId: targetTab.id });
        await chrome.action.setBadgeBackgroundColor({ color: '#10b981', tabId: targetTab.id });
      }
    } else {
      await chrome.action.setBadgeText({ text: '', tabId: targetTab.id });
    }
  } catch (err) {
    // Ignore transient errors on system pages
  }
}

// Update badge when user switches tabs
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await updateBadgeForActiveTab(activeInfo.tabId);
});

// Update badge when a tab changes URL or reloads
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' || changeInfo.url) {
    await updateBadgeForActiveTab(tabId);
  }
});

// Update badge when settings change
chrome.storage.onChanged.addListener(async (changes, areaName) => {
  if (areaName === 'local') {
    await updateBadgeForActiveTab();
  }
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
      } catch (e) { }
    }
  } else if (info.menuItemId === 'toggle_absolute') {
    const { absoluteMode = false } = await chrome.storage.local.get('absoluteMode');
    const newMode = !absoluteMode;
    await chrome.storage.local.set({ absoluteMode: newMode });
    try {
      await chrome.tabs.sendMessage(tab.id, { action: 'UPDATE_CONFIG', payload: { absoluteMode: newMode } });
    } catch (err) { }
    await updateBadgeForActiveTab(tab.id);
  }
});
