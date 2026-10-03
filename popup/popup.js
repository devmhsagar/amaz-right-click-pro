/**
 * Amaz Right Click Pro - Popup Script
 * Per-site activation model with visual sub-switch disabling when site is inactive.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // DOM Elements
  const siteToggle = document.getElementById('siteToggle');
  const siteActivationCard = document.getElementById('siteActivationCard');
  const siteDomain = document.getElementById('siteDomain');
  const offNotice = document.getElementById('offNotice');
  const featuresContainer = document.getElementById('featuresContainer');

  const toggleRightClick = document.getElementById('toggleRightClick');
  const toggleNewTab = document.getElementById('toggleNewTab');
  const toggleCopy = document.getElementById('toggleCopy');
  const togglePaste = document.getElementById('togglePaste');
  const toggleSelect = document.getElementById('toggleSelect');
  const toggleShortcuts = document.getElementById('toggleShortcuts');
  const toggleAbsoluteMode = document.getElementById('toggleAbsoluteMode');
  
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
          currentHost = parsed.hostname.toLowerCase().trim();
        } catch (e) {
          currentHost = '';
        }
      }
    }
  } catch (err) {
    console.warn('[Amaz Right Click Pro] Tab query error:', err);
  }

  // Update site domain display
  if (currentHost) {
    siteDomain.textContent = currentHost;
  } else {
    siteDomain.textContent = 'Special Page';
  }

  // Default configuration
  const defaults = {
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

  const stored = await chrome.storage.local.get(defaults);

  // Check if current site is active
  function isCurrentSiteActive(settings) {
    if (!settings.enabled) return false;
    if (settings.globalMode) return true;
    if (!currentHost || !Array.isArray(settings.enabledSites)) return false;
    return settings.enabledSites.some(site => {
      const s = site.toLowerCase().trim();
      return currentHost === s || currentHost.endsWith('.' + s);
    });
  }

  // Sync checkboxes
  toggleRightClick.checked = stored.allowRightClick;
  if (toggleNewTab) toggleNewTab.checked = stored.allowNewTab;
  toggleCopy.checked = stored.allowCopy;
  togglePaste.checked = stored.allowPaste;
  toggleSelect.checked = stored.allowSelect;
  toggleShortcuts.checked = stored.allowShortcuts;
  toggleAbsoluteMode.checked = stored.absoluteMode;

  // Initial UI Render
  updateSiteActivationUI(isCurrentSiteActive(stored));

  function updateSiteActivationUI(isActive) {
    siteToggle.checked = isActive;

    if (isActive) {
      siteActivationCard.classList.add('active');
      offNotice.style.display = 'none';
      featuresContainer.classList.remove('disabled-features');
      
      // Enable inputs in features list
      setFeaturesDisabled(false);

      statusPulse.classList.remove('inactive');
      siteStatusBadge.classList.remove('paused');

      const isEprocure = currentHost.includes('eprocure.gov.bd');
      if (isEprocure) {
        siteStatusText.textContent = 'e-GP Mode Active';
        egpBanner.style.display = 'flex';
      } else {
        siteStatusText.textContent = 'Active (This Site)';
        egpBanner.style.display = 'none';
      }

      footerStatus.textContent = 'System Active & Protecting';
      footerStatus.style.color = '#34d399';
    } else {
      siteActivationCard.classList.remove('active');
      offNotice.style.display = 'block';
      featuresContainer.classList.add('disabled-features');

      // Disable inputs in features list
      setFeaturesDisabled(true);

      statusPulse.classList.add('inactive');
      siteStatusBadge.classList.add('paused');
      siteStatusText.textContent = 'Inactive (This Site)';
      egpBanner.style.display = 'none';

      footerStatus.textContent = 'Extension Off on this Site';
      footerStatus.style.color = '#94a3b8';
    }
  }

  function setFeaturesDisabled(disabled) {
    toggleRightClick.disabled = disabled;
    if (toggleNewTab) toggleNewTab.disabled = disabled;
    toggleCopy.disabled = disabled;
    togglePaste.disabled = disabled;
    toggleSelect.disabled = disabled;
    toggleShortcuts.disabled = disabled;
    toggleAbsoluteMode.disabled = disabled;
  }

  // Main Site Activation Toggle Listener
  siteToggle.addEventListener('change', async () => {
    if (!currentHost) return;
    const shouldEnable = siteToggle.checked;
    const current = await chrome.storage.local.get(defaults);
    const sites = Array.isArray(current.enabledSites) ? [...current.enabledSites] : [];
    const index = sites.findIndex(s => s.toLowerCase().trim() === currentHost);

    if (shouldEnable) {
      if (index === -1) sites.push(currentHost);
    } else {
      if (index > -1) sites.splice(index, 1);
    }

    await chrome.storage.local.set({ enabledSites: sites });
    updateSiteActivationUI(shouldEnable);

    // Notify tab
    if (currentTab && currentTab.id) {
      try {
        await chrome.tabs.sendMessage(currentTab.id, {
          action: 'UPDATE_CONFIG',
          payload: { enabledSites: sites }
        });
      } catch (err) { }
    }
  });

  // Helper to save sub-feature settings
  async function saveFeatureSetting(key, value) {
    const update = {};
    update[key] = value;
    await chrome.storage.local.set(update);
    if (currentTab && currentTab.id) {
      try {
        await chrome.tabs.sendMessage(currentTab.id, {
          action: 'UPDATE_CONFIG',
          payload: update
        });
      } catch (err) { }
    }
  }

  toggleRightClick.addEventListener('change', () => saveFeatureSetting('allowRightClick', toggleRightClick.checked));
  if (toggleNewTab) toggleNewTab.addEventListener('change', () => saveFeatureSetting('allowNewTab', toggleNewTab.checked));
  toggleCopy.addEventListener('change', () => saveFeatureSetting('allowCopy', toggleCopy.checked));
  togglePaste.addEventListener('change', () => saveFeatureSetting('allowPaste', togglePaste.checked));
  toggleSelect.addEventListener('change', () => saveFeatureSetting('allowSelect', toggleSelect.checked));
  toggleShortcuts.addEventListener('change', () => saveFeatureSetting('allowShortcuts', toggleShortcuts.checked));
  toggleAbsoluteMode.addEventListener('change', () => saveFeatureSetting('absoluteMode', toggleAbsoluteMode.checked));

  // Force Unlock Button Click
  forceUnlockBtn.addEventListener('click', async () => {
    if (!currentTab || !currentTab.id) return;

    // Ensure site is enabled
    if (currentHost) {
      const current = await chrome.storage.local.get(defaults);
      const sites = Array.isArray(current.enabledSites) ? [...current.enabledSites] : [];
      if (!sites.includes(currentHost)) {
        sites.push(currentHost);
        await chrome.storage.local.set({ enabledSites: sites });
      }
      updateSiteActivationUI(true);
    }

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
