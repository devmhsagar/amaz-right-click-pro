/**
 * Amaz Right Click Pro - Popup Script
 * Single Unified Master Switch & Settings Sync
 */

document.addEventListener('DOMContentLoaded', async () => {
  // DOM Elements
  const masterToggle = document.getElementById('masterToggle');
  const toggleRightClick = document.getElementById('toggleRightClick');
  const toggleNewTab = document.getElementById('toggleNewTab');
  const toggleCopy = document.getElementById('toggleCopy');
  const togglePaste = document.getElementById('togglePaste');
  const toggleSelect = document.getElementById('toggleSelect');
  const toggleShortcuts = document.getElementById('toggleShortcuts');
  const toggleAbsoluteMode = document.getElementById('toggleAbsoluteMode');
  
  const siteDomain = document.getElementById('siteDomain');
  const siteStatusBadge = document.getElementById('siteStatusBadge');
  const siteStatusText = document.getElementById('siteStatusText');
  const egpBanner = document.getElementById('egpBanner');
  const forceUnlockBtn = document.getElementById('forceUnlockBtn');
  const statusPulse = document.getElementById('statusPulse');
  const footerStatus = document.getElementById('footerStatus');

  let currentTab = null;
  let currentHost = '';

  // Get active tab info
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs && tabs.length > 0) {
      currentTab = tabs[0];
      if (currentTab.url) {
        try {
          const parsed = new URL(currentTab.url);
          currentHost = parsed.hostname;
        } catch (e) {
          currentHost = '';
        }
      }
    }
  } catch (err) {
    console.warn('Error querying tab:', err);
  }

  // Update site info
  if (currentHost) {
    siteDomain.textContent = currentHost;
    if (currentHost.includes('eprocure.gov.bd')) {
      egpBanner.style.display = 'flex';
    } else {
      egpBanner.style.display = 'none';
    }
  } else {
    siteDomain.textContent = 'Special Page';
    egpBanner.style.display = 'none';
  }

  // Load stored settings
  const defaults = {
    enabled: true,
    absoluteMode: false,
    allowRightClick: true,
    allowNewTab: true,
    allowCopy: true,
    allowPaste: true,
    allowSelect: true,
    allowShortcuts: true,
    suppressAlerts: true
  };

  const stored = await chrome.storage.local.get(defaults);

  // Sync checkboxes
  masterToggle.checked = stored.enabled;
  toggleRightClick.checked = stored.allowRightClick;
  if (toggleNewTab) toggleNewTab.checked = stored.allowNewTab;
  toggleCopy.checked = stored.allowCopy;
  togglePaste.checked = stored.allowPaste;
  toggleSelect.checked = stored.allowSelect;
  toggleShortcuts.checked = stored.allowShortcuts;
  toggleAbsoluteMode.checked = stored.absoluteMode;

  updateGlobalUI(stored.enabled);

  // Helper to save and dispatch updates
  async function saveSetting(key, value) {
    const update = {};
    update[key] = value;
    await chrome.storage.local.set(update);
    dispatchConfigToTab(update);
  }

  async function dispatchConfigToTab(payload) {
    if (!currentTab || !currentTab.id) return;
    try {
      await chrome.tabs.sendMessage(currentTab.id, {
        action: 'UPDATE_CONFIG',
        payload: payload
      });
    } catch (err) {
      // Content script may not be loaded on internal pages
    }
  }

  function updateGlobalUI(isEnabled) {
    if (isEnabled) {
      statusPulse.classList.remove('inactive');
      footerStatus.textContent = 'System Active & Protecting';
      footerStatus.style.color = '#34d399';

      if (siteStatusBadge) {
        siteStatusBadge.classList.remove('paused');
        siteStatusText.textContent = currentHost.includes('eprocure.gov.bd') ? 'e-GP Protected' : 'Active';
      }
    } else {
      statusPulse.classList.add('inactive');
      footerStatus.textContent = 'Extension Paused (OFF)';
      footerStatus.style.color = '#94a3b8';

      if (siteStatusBadge) {
        siteStatusBadge.classList.add('paused');
        siteStatusText.textContent = 'Paused';
      }
    }
  }

  // Single Master Toggle Listener
  masterToggle.addEventListener('change', async () => {
    const val = masterToggle.checked;
    await saveSetting('enabled', val);
    updateGlobalUI(val);
  });

  toggleRightClick.addEventListener('change', async () => {
    await saveSetting('allowRightClick', toggleRightClick.checked);
  });

  if (toggleNewTab) {
    toggleNewTab.addEventListener('change', async () => {
      await saveSetting('allowNewTab', toggleNewTab.checked);
    });
  }

  toggleCopy.addEventListener('change', async () => {
    await saveSetting('allowCopy', toggleCopy.checked);
  });

  togglePaste.addEventListener('change', async () => {
    await saveSetting('allowPaste', togglePaste.checked);
  });

  toggleSelect.addEventListener('change', async () => {
    await saveSetting('allowSelect', toggleSelect.checked);
  });

  toggleShortcuts.addEventListener('change', async () => {
    await saveSetting('allowShortcuts', toggleShortcuts.checked);
  });

  toggleAbsoluteMode.addEventListener('change', async () => {
    await saveSetting('absoluteMode', toggleAbsoluteMode.checked);
  });

  // Force Unlock Button Click
  forceUnlockBtn.addEventListener('click', async () => {
    if (!currentTab || !currentTab.id) return;

    const originalContent = forceUnlockBtn.innerHTML;
    forceUnlockBtn.innerHTML = '<span class="btn-icon">✓</span><span class="btn-text">Unlocked!</span>';
    forceUnlockBtn.style.background = 'linear-gradient(135deg, #059669, #10b981)';

    try {
      await chrome.tabs.sendMessage(currentTab.id, { action: 'FORCE_UNLOCK' });
    } catch (e) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: currentTab.id, allFrames: true },
          func: () => {
            const el = document.getElementById('amaz-unlocker-toast');
            if (el) el.classList.remove('amaz-toast-hide');
            window.postMessage({ source: 'AMAZ_RIGHT_CLICK_EXT', action: 'UPDATE_CONFIG', payload: { enabled: true } }, '*');
          }
        });
      } catch (err) {
        console.warn('Script injection failed:', err);
      }
    }

    setTimeout(() => {
      forceUnlockBtn.innerHTML = originalContent;
      forceUnlockBtn.style.background = '';
    }, 1600);
  });

});
