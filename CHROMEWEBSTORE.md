# Chrome Web Store Listing — Amaz Right Click Pro

> Last Updated: 2026-10-03

## Store Listing

**Extension Name** [REQUIRED]
Amaz Right Click Pro

**Short Description** [REQUIRED]
Per-site right-click, Ctrl+Click (New Tab), clean copy/paste, and tender form unlocker.

**Detailed Description** [REQUIRED]
Amaz Right Click Pro restores your freedom to right-click, select text, copy, cut, paste, and open links in new tabs on any website—with intelligent per-site activation, clean single-copy clipboard handling, and dedicated e-GP tender form optimizations.

Key Features:
- Per-Site Activation: Stays completely inactive on standard websites. Activate only on specific websites where you need it with a single click.
- Clean Copy (No Duplication): Advanced DataTransfer coordination ensures text is copied cleanly once without duplicate repetitions.
- Force Enable Right Click: Opens the native browser context menu and enables Inspect Element anywhere.
- Unblock Ctrl+Click / New Tab: Bypasses restrictions that block opening links in a new tab (specifically fixing eprocure.gov.bd tender links).
- Unblock Paste into Forms: Allows Ctrl+V and right-click paste into tender financial fields, bank guarantee inputs, and forms that disable pasting.
- Ultra-Lightweight & Zero-Lag: Targeted attribute sweeper runs in under 1ms with zero continuous loops or background CPU drain.
- Clear Visual Hierarchy: Sub-feature switches are automatically disabled when the extension is inactive on a site.
- Dedicated e-GP Tender Assistant: Pre-configured for eprocure.gov.bd for instant, seamless tender submissions.

How to Use:
1. Install and pin the extension icon in Chrome.
2. When on a restricted site (or eprocure.gov.bd), click the extension icon and turn ON "Enable on this site".
3. Right-click, select text, Ctrl+Click to open links in new tabs, and paste into form fields freely!

Privacy & Security:
This extension operates 100% locally on your computer. It never collects, stores, or transmits your personal data, tender credentials, or browsing history.

**Category** [REQUIRED]
Productivity

**Single Purpose** [REQUIRED]
Unlocks right-click context menus, new tab links, text selection, and copy-paste functionality on user-specified restricted web pages.

**Primary Language** [REQUIRED]
English

---

## Permissions Justification

| Permission | Type | Justification |
|---|---|---|
| `storage` | permissions | Saves user preferences such as per-site enabled domain lists and feature toggles locally on device. |
| `activeTab` | permissions | Accesses the current tab when the user clicks the extension popup or context menu to apply immediate unlock actions. |
| `scripting` | permissions | Executes DOM unblocking scripts on the active tab when requested via the "Force Unlock" action. |
| `contextMenus` | permissions | Adds a convenient right-click context menu option to trigger instant unlocking on any page. |
| `<all_urls>` | host_permissions | Necessary to unblock right-click, new tab links, and copy/paste restrictions across user-selected websites and nested tender iframes. |

---

## Version History

| Version | Date | Changes | Status |
|---|---|---|---|
| 1.2.0 | 2026-10-03 | Implemented Per-Site Activation model, fixed duplicate text copy bug, resolved sub-switch disabling when site is off, and optimized zero-loop performance. | Draft |
| 1.1.0 | 2026-10-02 | Added Ctrl+Click New Tab bypass for e-GP, ultra-lightweight performance optimizations, clean disable state, and renamed to Amaz Right Click Pro. | Draft |
| 1.0.0 | 2026-10-02 | Initial release. | Draft |
