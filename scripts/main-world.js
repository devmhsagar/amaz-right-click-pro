/**
 * Amaz Right Click Pro - Main World Script
 * Injected at document_start in the MAIN world to patch prototypes before any website scripts load.
 */

(function () {
  'use strict';

  if (window.__AMAZ_RIGHT_CLICK_INSTALLED__) return;
  window.__AMAZ_RIGHT_CLICK_INSTALLED__ = true;

  // Active configuration
  const config = {
    enabled: true,
    absoluteMode: false,
    allowRightClick: true,
    allowCopy: true,
    allowPaste: true,
    allowSelect: true,
    allowShortcuts: true,
    allowNewTab: true,
    suppressAlerts: true
  };

  window.__AMAZ_RIGHT_CLICK_STATE__ = config;

  let isProtectedEventActive = false;

  const PROTECTED_EVENTS = new Set([
    'contextmenu',
    'copy',
    'cut',
    'paste',
    'beforecopy',
    'beforecut',
    'beforepaste',
    'selectstart',
    'selectionchange',
    'dragstart',
    'drag'
  ]);

  const BLOCKED_PROPERTIES = [
    'oncontextmenu',
    'oncopy',
    'oncut',
    'onpaste',
    'onselectstart',
    'ondragstart'
  ];

  /* -------------------------------------------------------------
   * 1. Patch Event.prototype.preventDefault
   * ----------------------------------------------------------- */
  const originalPreventDefault = Event.prototype.preventDefault;
  Event.prototype.preventDefault = function () {
    if (config.enabled) {
      const type = this.type;

      // 1. Bypass Ctrl+Click / Shift+Click / Middle-Click on links to allow opening in New Tab (e-GP fix)
      if (config.allowNewTab && (type === 'click' || type === 'auxclick' || type === 'mousedown' || type === 'mouseup')) {
        if (this.ctrlKey || this.metaKey || this.shiftKey || this.button === 1) {
          // Never allow site to prevent opening in a new tab!
          return;
        }
      }

      // 2. Bypass contextmenu prevention
      if (type === 'contextmenu' && config.allowRightClick) {
        return;
      }

      // 3. Bypass clipboard prevention (copy/cut)
      if ((type === 'copy' || type === 'cut') && config.allowCopy) {
        return;
      }

      // 4. Bypass paste prevention (vital for e-GP forms)
      if ((type === 'paste' || type === 'beforepaste') && config.allowPaste) {
        return;
      }

      // 5. Bypass text selection & drag prevention
      if ((type === 'selectstart' || type === 'selectionchange' || type === 'dragstart') && config.allowSelect) {
        return;
      }

      // 6. Bypass mouse button 2 (right-click) prevention in mousedown/mouseup/click
      if ((type === 'mousedown' || type === 'mouseup' || type === 'click' || type === 'pointerdown' || type === 'pointerup') && this.button === 2 && config.allowRightClick) {
        return;
      }

      // 7. Bypass shortcut prevention (Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A, F12, etc.)
      if ((type === 'keydown' || type === 'keyup' || type === 'keypress') && config.allowShortcuts) {
        const key = this.key ? this.key.toLowerCase() : '';
        const code = this.code || '';
        const isCtrlOrMeta = this.ctrlKey || this.metaKey;

        if (isCtrlOrMeta && (key === 'c' || key === 'v' || key === 'x' || key === 'a' || code === 'Insert')) {
          return;
        }

        if (key === 'f12' || (isCtrlOrMeta && (key === 'u' || (this.shiftKey && (key === 'i' || key === 'j' || key === 'c'))))) {
          return;
        }
      }
    }

    return originalPreventDefault.apply(this, arguments);
  };

  /* -------------------------------------------------------------
   * 2. Patch Event.prototype.stopPropagation & stopImmediatePropagation
   * ----------------------------------------------------------- */
  const originalStopPropagation = Event.prototype.stopPropagation;
  const originalStopImmediatePropagation = Event.prototype.stopImmediatePropagation;

  Event.prototype.stopPropagation = function () {
    if (config.enabled && config.absoluteMode && PROTECTED_EVENTS.has(this.type)) {
      return;
    }
    return originalStopPropagation.apply(this, arguments);
  };

  Event.prototype.stopImmediatePropagation = function () {
    if (config.enabled && config.absoluteMode && PROTECTED_EVENTS.has(this.type)) {
      return;
    }
    return originalStopImmediatePropagation.apply(this, arguments);
  };

  /* -------------------------------------------------------------
   * 3. Patch EventTarget.prototype.addEventListener & removeEventListener
   * ----------------------------------------------------------- */
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  const originalRemoveEventListener = EventTarget.prototype.removeEventListener;
  const listenerMap = new WeakMap();

  EventTarget.prototype.addEventListener = function (type, listener, options) {
    if (config.enabled && typeof listener === 'function') {
      const lowerType = String(type).toLowerCase();

      // Only wrap protected events (contextmenu, copy, cut, paste, selectstart, dragstart)
      if (PROTECTED_EVENTS.has(lowerType)) {
        const wrapped = function (e) {
          try {
            isProtectedEventActive = true;
            const res = listener.apply(this, arguments);
            isProtectedEventActive = false;
            // Catch jQuery "return false" which triggers preventDefault & stopPropagation
            return res === false ? undefined : res;
          } catch (err) {
            isProtectedEventActive = false;
          }
        };
        listenerMap.set(listener, wrapped);
        return originalAddEventListener.call(this, type, wrapped, options);
      }
    }

    return originalAddEventListener.apply(this, arguments);
  };

  EventTarget.prototype.removeEventListener = function (type, listener, options) {
    if (typeof listener === 'function') {
      const wrapped = listenerMap.get(listener);
      if (wrapped) {
        return originalRemoveEventListener.call(this, type, wrapped, options);
      }
    }
    return originalRemoveEventListener.apply(this, arguments);
  };

  /* -------------------------------------------------------------
   * 4. Neutralize Property Setters on Prototypes
   * ----------------------------------------------------------- */
  function patchPrototypeProperties(proto) {
    for (const prop of BLOCKED_PROPERTIES) {
      try {
        let storedVal = null;
        Object.defineProperty(proto, prop, {
          configurable: true,
          enumerable: true,
          get() {
            if (!config.enabled) return storedVal;
            return null;
          },
          set(val) {
            storedVal = val;
            if (config.enabled) {
              return true; // Ignore blocker assignment
            }
            return val;
          }
        });
      } catch (e) { }
    }
  }

  if (typeof HTMLElement !== 'undefined' && HTMLElement.prototype) {
    patchPrototypeProperties(HTMLElement.prototype);
  }
  if (typeof Document !== 'undefined' && Document.prototype) {
    patchPrototypeProperties(Document.prototype);
  }
  if (typeof Window !== 'undefined' && Window.prototype) {
    patchPrototypeProperties(Window.prototype);
  }

  /* -------------------------------------------------------------
   * 5. Suppress Blocker Alert Dialogs
   * ----------------------------------------------------------- */
  const originalAlert = window.alert;
  const originalConfirm = window.confirm;
  const originalPrompt = window.prompt;

  function isBlockerMessage(msg) {
    const lower = String(msg).toLowerCase();
    return (
      lower.includes('new tab') ||
      lower.includes('security reason') ||
      lower.includes('right click') ||
      lower.includes('not allowed') ||
      lower.includes('disabled')
    );
  }

  window.alert = function (msg) {
    if (config.enabled && config.suppressAlerts) {
      if (isProtectedEventActive || isBlockerMessage(msg)) {
        console.warn('[Amaz Right Click Pro] Suppressed website blocker alert:', msg);
        return;
      }
    }
    return originalAlert.apply(this, arguments);
  };

  window.confirm = function (msg) {
    if (config.enabled && config.suppressAlerts) {
      if (isProtectedEventActive || isBlockerMessage(msg)) {
        console.warn('[Amaz Right Click Pro] Suppressed website blocker confirm:', msg);
        return true;
      }
    }
    return originalConfirm.apply(this, arguments);
  };

  window.prompt = function (msg, def) {
    if (config.enabled && config.suppressAlerts) {
      if (isProtectedEventActive || isBlockerMessage(msg)) {
        return def || '';
      }
    }
    return originalPrompt.apply(this, arguments);
  };

  /* -------------------------------------------------------------
   * 6. Selection Protection
   * ----------------------------------------------------------- */
  if (typeof Selection !== 'undefined' && Selection.prototype) {
    const originalRemoveAllRanges = Selection.prototype.removeAllRanges;
    const originalEmpty = Selection.prototype.empty;

    Selection.prototype.removeAllRanges = function () {
      if (config.enabled && isProtectedEventActive) {
        return;
      }
      return originalRemoveAllRanges.apply(this, arguments);
    };

    if (originalEmpty) {
      Selection.prototype.empty = function () {
        if (config.enabled && isProtectedEventActive) {
          return;
        }
        return originalEmpty.apply(this, arguments);
      };
    }
  }

  /* -------------------------------------------------------------
   * 7. Listen for messages from ISOLATED world (content.js)
   * ----------------------------------------------------------- */
  window.addEventListener('message', function (event) {
    if (event.source !== window || !event.data || event.data.source !== 'AMAZ_RIGHT_CLICK_EXT') {
      return;
    }

    if (event.data.action === 'UPDATE_CONFIG' && event.data.payload) {
      Object.assign(config, event.data.payload);
      window.__AMAZ_RIGHT_CLICK_STATE__ = config;
    } else if (event.data.action === 'PING_MAIN_WORLD') {
      window.postMessage({
        source: 'AMAZ_RIGHT_CLICK_MAIN',
        action: 'PONG_MAIN_WORLD',
        config: config
      }, '*');
    }
  });

})();
