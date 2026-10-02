/**
 * Amaz Right Click Pro - Content Script (Isolated World)
 * Ultra-lightweight DOM sweeper, Ctrl+Click / New Tab unblocker, and settings sync.
 */

(function () {
  'use strict';

  if (window.__AMAZ_CONTENT_SCRIPT_LOADED__) return;
  window.__AMAZ_CONTENT_SCRIPT_LOADED__ = true;

  const currentHost = window.location.hostname.toLowerCase();
  const isEprocure = currentHost.includes('eprocure.gov.bd');

  let config = {
    enabled: true,
    absoluteMode: false,
    allowRightClick: true,
    allowCopy: true,
    allowPaste: true,
    allowSelect: true,
    allowShortcuts: true,
    allowNewTab: true,
    suppressAlerts: true,
    disabledSites: []
  };

  function isSiteDisabled() {
    return Array.isArray(config.disabledSites) && config.disabledSites.includes(currentHost);
  }

  function isActive() {
    return config.enabled && !isSiteDisabled();
  }

  async function loadConfig() {
    try {
      const stored = await chrome.storage.local.get(null);
      if (stored && Object.keys(stored).length > 0) {
        config = { ...config, ...stored };
      }
      applyState();
    } catch (err) {
      console.warn('[Amaz Right Click Pro] Storage load error:', err);
    }
  }

  function syncWithMainWorld() {
    window.postMessage({
      source: 'AMAZ_RIGHT_CLICK_EXT',
      action: 'UPDATE_CONFIG',
      payload: {
        ...config,
        enabled: isActive()
      }
    }, '*');
  }

  /* -------------------------------------------------------------
   * Targeted & High-Performance DOM Sweeper (Zero CPU waste)
   * ----------------------------------------------------------- */
  const BLOCKER_ATTRS = [
    'oncontextmenu',
    'oncopy',
    'oncut',
    'onpaste',
    'onselectstart',
    'ondragstart',
    'onmousedown',
    'onmouseup',
    'unselectable'
  ];

  const BLOCKER_SELECTOR = '[oncontextmenu], [oncopy], [oncut], [onpaste], [onselectstart], [ondragstart], [onmousedown], [unselectable], a[onclick]';

  function cleanElement(el) {
    if (!el || el.nodeType !== Node.ELEMENT_NODE) return;

    for (let i = 0; i < BLOCKER_ATTRS.length; i++) {
      const attr = BLOCKER_ATTRS[i];
      if (el.hasAttribute(attr)) {
        el.removeAttribute(attr);
      }
      try {
        if (el[attr] !== null) el[attr] = null;
      } catch (e) { }
    }

    // Special treatment for inputs and textareas (Vital for e-GP tender forms)
    const tagName = el.tagName ? el.tagName.toLowerCase() : '';
    if (tagName === 'input' || tagName === 'textarea' || el.isContentEditable) {
      if (el.hasAttribute('onpaste')) el.removeAttribute('onpaste');
      if (el.hasAttribute('oncopy')) el.removeAttribute('oncopy');
      if (el.hasAttribute('oncut')) el.removeAttribute('oncut');
    }

    // Clean inline onclick on links that try to block Ctrl+Click or New Tab
    if (tagName === 'a') {
      const onclickAttr = el.getAttribute('onclick');
      if (onclickAttr && (
        onclickAttr.includes('New Tab') ||
        onclickAttr.includes('security reason') ||
        onclickAttr.includes('return false')
      )) {
        el.removeAttribute('onclick');
      }
    }
  }

  // Fast targeted sweeper: only touches elements that have blocker attributes
  function sweepTargetedBlockers(rootNode = document) {
    if (!isActive()) return;

    if (document.documentElement) cleanElement(document.documentElement);
    if (document.body) cleanElement(document.body);

    const matches = rootNode.querySelectorAll ? rootNode.querySelectorAll(BLOCKER_SELECTOR) : [];
    for (let i = 0; i < matches.length; i++) {
      cleanElement(matches[i]);
    }
  }

  /* -------------------------------------------------------------
   * Lightweight Debounced MutationObserver
   * ----------------------------------------------------------- */
  let observer = null;
  let debounceTimer = null;

  function handleMutations(mutations) {
    if (!isActive()) return;

    for (let i = 0; i < mutations.length; i++) {
      const mutation = mutations[i];
      if (mutation.type === 'attributes') {
        cleanElement(mutation.target);
      } else if (mutation.type === 'childList') {
        for (let j = 0; j < mutation.addedNodes.length; j++) {
          const node = mutation.addedNodes[j];
          if (node.nodeType === Node.ELEMENT_NODE) {
            cleanElement(node);
            const sub = node.querySelectorAll ? node.querySelectorAll(BLOCKER_SELECTOR) : [];
            for (let k = 0; k < sub.length; k++) {
              cleanElement(sub[k]);
            }
          }
        }
      }
    }
  }

  function startObserver() {
    if (observer) observer.disconnect();
    if (!isActive()) return;

    observer = new MutationObserver((mutations) => {
      // Use requestAnimationFrame debounce so mutations never freeze UI
      if (debounceTimer) cancelAnimationFrame(debounceTimer);
      debounceTimer = requestAnimationFrame(() => {
        handleMutations(mutations);
      });
    });

    const target = document.documentElement || document;
    observer.observe(target, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: BLOCKER_ATTRS.concat(['onclick'])
    });
  }

  function stopObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    if (debounceTimer) {
      cancelAnimationFrame(debounceTimer);
      debounceTimer = null;
    }
  }

  /* -------------------------------------------------------------
   * Capture-Phase Listeners: Ctrl+Click / New Tab & Context Menu
   * ----------------------------------------------------------- */
  function setupCaptureEventListeners() {
    // 1. Ctrl + Click / New Tab Unblocker (e-GP fix)
    const handleLinkCtrlClick = (e) => {
      if (!isActive() || !config.allowNewTab) return;

      // If user holds Ctrl, Cmd, Shift, or Middle Click (button 1)
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) {
        const anchor = e.target.closest ? e.target.closest('a') : null;
        if (anchor && anchor.href && !anchor.href.startsWith('javascript:')) {
          // Stop website script from blocking new tab
          e.stopImmediatePropagation();
        }
      }
    };

    window.addEventListener('click', handleLinkCtrlClick, { capture: true, passive: false });
    window.addEventListener('auxclick', handleLinkCtrlClick, { capture: true, passive: false });
    window.addEventListener('mousedown', handleLinkCtrlClick, { capture: true, passive: false });
    window.addEventListener('mouseup', handleLinkCtrlClick, { capture: true, passive: false });

    // 2. Right Click (Context Menu)
    window.addEventListener('contextmenu', (e) => {
      if (!isActive() || !config.allowRightClick) return;
      if (config.absoluteMode) {
        e.stopPropagation();
      }
    }, { capture: true, passive: false });

    // 3. Selection & Clipboard
    window.addEventListener('selectstart', (e) => {
      if (!isActive() || !config.allowSelect) return;
      if (config.absoluteMode) e.stopPropagation();
    }, { capture: true, passive: false });

    window.addEventListener('copy', (e) => {
      if (!isActive() || !config.allowCopy) return;
      if (config.absoluteMode) e.stopPropagation();
    }, { capture: true, passive: false });

    window.addEventListener('cut', (e) => {
      if (!isActive() || !config.allowCopy) return;
      if (config.absoluteMode) e.stopPropagation();
    }, { capture: true, passive: false });

    window.addEventListener('paste', (e) => {
      if (!isActive() || !config.allowPaste) return;
      if (config.absoluteMode) e.stopPropagation();
    }, { capture: true, passive: false });

    // 4. Keyboard Shortcuts: Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A, F12
    window.addEventListener('keydown', (e) => {
      if (!isActive() || !config.allowShortcuts) return;

      const key = e.key ? e.key.toLowerCase() : '';
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      if (isCtrlOrMeta && (key === 'c' || key === 'v' || key === 'x' || key === 'a')) {
        if (config.absoluteMode) e.stopPropagation();
      }

      if (key === 'f12' || (isCtrlOrMeta && (key === 'u' || (e.shiftKey && (key === 'i' || key === 'j'))))) {
        if (config.absoluteMode) e.stopPropagation();
      }
    }, { capture: true, passive: false });
  }

  /* -------------------------------------------------------------
   * In-Page Toast Notification
   * ----------------------------------------------------------- */
  function showToast(title, description, duration = 3200) {
    if (window.top !== window) return;

    let toast = document.getElementById('amaz-unlocker-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'amaz-unlocker-toast';
      toast.className = 'amaz-unlocker-toast';
      toast.innerHTML = `
        <div class="amaz-toast-icon">✓</div>
        <div style="flex: 1;">
          <div class="amaz-toast-title" id="amaz-toast-title"></div>
          <div class="amaz-toast-desc" id="amaz-toast-desc"></div>
        </div>
        <button class="amaz-toast-close" id="amaz-toast-close">&times;</button>
      `;
      document.body.appendChild(toast);
      document.getElementById('amaz-toast-close').addEventListener('click', () => {
        toast.classList.add('amaz-toast-hide');
      });
    }

    document.getElementById('amaz-toast-title').textContent = title;
    document.getElementById('amaz-toast-desc').textContent = description;
    toast.classList.remove('amaz-toast-hide');

    if (window.__toastTimeout) clearTimeout(window.__toastTimeout);
    window.__toastTimeout = setTimeout(() => {
      if (toast) toast.classList.add('amaz-toast-hide');
    }, duration);
  }

  /* -------------------------------------------------------------
   * State Management (Apply or Cleanly Revert)
   * ----------------------------------------------------------- */
  function applyState() {
    const active = isActive();
    syncWithMainWorld();

    if (active) {
      // Add scoped class to html so styles apply
      if (document.documentElement) {
        document.documentElement.classList.add('amaz-unlocked');
      }
      sweepTargetedBlockers();
      startObserver();
    } else {
      // Extension is OFF: completely remove unlock styles and disconnect observer!
      if (document.documentElement) {
        document.documentElement.classList.remove('amaz-unlocked');
      }
      stopObserver();
    }
  }

  /* -------------------------------------------------------------
   * Messaging
   * ----------------------------------------------------------- */
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (!request || !request.action) return;

    if (request.action === 'GET_STATUS') {
      sendResponse({
        config: config,
        hostname: currentHost,
        isEprocure: isEprocure,
        isSiteDisabled: isSiteDisabled(),
        isTopFrame: (window.top === window)
      });
      return true;
    }

    if (request.action === 'UPDATE_CONFIG') {
      config = { ...config, ...request.payload };
      applyState();
      sendResponse({ success: true, config: config });
      return true;
    }

    if (request.action === 'FORCE_UNLOCK') {
      config.enabled = true;
      applyState();
      sweepTargetedBlockers();

      const msg = isEprocure
        ? 'e-GP Unlocked: Right-Click, Ctrl+Click (New Tab), Copy & Paste are fully enabled!'
        : 'All Right-Click, Selection & Copy/Paste restrictions have been removed!';

      showToast('✨ Amaz Right Click Pro', msg, 3500);
      sendResponse({ success: true });
      return true;
    }
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local') {
      for (const [key, change] of Object.entries(changes)) {
        config[key] = change.newValue;
      }
      applyState();
    }
  });

  /* -------------------------------------------------------------
   * Initialization
   * ----------------------------------------------------------- */
  setupCaptureEventListeners();
  loadConfig();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      applyState();
    });
  } else {
    applyState();
  }

})();
