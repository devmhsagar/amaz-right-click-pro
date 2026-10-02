# Chrome Web Store Listing — Amaz Right Click Pro

> Last Updated: 2026-10-02

## Store Listing

**Extension Name** [REQUIRED]
Amaz Right Click Pro

**Short Description** [REQUIRED]
Force enable right-click, Ctrl+Click (New Tab), text selection, and copy/paste on restricted sites including e-GP tender portals.

**Detailed Description** [REQUIRED]
Amaz Right Click Pro restores your freedom to right-click, select text, copy, cut, paste, and open links in new tabs on any website—even on the most aggressively protected government tender portals, financial websites, and online forms.

Specifically engineered and optimized for e-GP Bangladesh (eprocure.gov.bd) and similar e-procurement platforms, this extension eliminates the frustration of disabled right-click, blocked new tabs ("Due to security reason, New Tab is not allowed"), blocked paste in tender form inputs, and unselectable BOQ tables.

Key Features:
- Force Enable Right Click: Opens the native browser context menu and enables Inspect Element anywhere.
- Unblock Ctrl+Click / New Tab: Bypasses site restrictions that block opening links in a new tab (specifically fixing eprocure.gov.bd tender links).
- Unblock Copy & Cut: Copy text, rate tables, and tender notice details without restrictions.
- Unblock Paste into Forms: Allows Ctrl+V and right-click paste into tender financial fields, bank guarantee inputs, and forms that disable pasting.
- Text Selection & Drag: Removes user-select: none CSS barriers, enabling seamless highlighting and dragging.
- Ultra-Lightweight & Zero-Lag: Optimized targeted DOM sweeper runs in under 1ms, ensuring zero CPU drain and no browser lag.
- Clean Turn-Off State: Instantly reverts all CSS and observers when toggled off.
- Absolute Mode (Deep Unlock): Extreme bypass mode that neutralizes aggressive script-level traps, event stoppers, and transparent blocking overlays.
- Dedicated e-GP Tender Assistant: Automatically detects eprocure.gov.bd and ensures tender submission forms are ready for instant data pasting.

How to Use:
1. Install and pin the extension icon in Chrome.
2. Navigate to any restricted page or tender portal (e.g. eprocure.gov.bd).
3. Right-click, select text, Ctrl+Click to open links in new tabs, and paste into form fields freely!
4. Click the extension icon to toggle specific features or activate Absolute Mode for stubborn websites.

Privacy & Security:
This extension operates 100% locally on your computer. It never collects, stores, or transmits your personal data, tender credentials, or browsing history.

**Category** [REQUIRED]
Productivity

**Single Purpose** [REQUIRED]
Unlocks right-click context menus, new tab links, text selection, and copy-paste functionality on restricted web pages.

**Primary Language** [REQUIRED]
English

---

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|---|---|---|---|
| Store Icon [REQUIRED] | 128×128 PNG | ✅ Ready | icons/icon-128.png |
| Screenshot 1 [REQUIRED] | 1280×800 | ⬜ Not created | screenshots/screenshot-1.png |
| Screenshot 2 [RECOMMENDED] | 1280×800 | ⬜ Not created | screenshots/screenshot-2.png |

---

## Permissions Justification

| Permission | Type | Justification |
|---|---|---|
| `storage` | permissions | Saves user preferences such as feature toggles, Absolute Mode, and per-site disabled domains locally on device. |
| `activeTab` | permissions | Accesses the current tab when the user clicks the extension popup or context menu to apply immediate unlock actions. |
| `scripting` | permissions | Executes DOM unblocking scripts on the active tab when requested via the "Force Unlock" action. |
| `contextMenus` | permissions | Adds a convenient right-click context menu option to trigger instant unlocking on any page. |
| `<all_urls>` | host_permissions | Necessary to unblock right-click, new tab links, and copy/paste restrictions across any website, tender portal, and nested iframe. |

---

## Privacy & Data Use

### Data Collection
**Does the extension collect user data?** No.

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

---

## Distribution
**Visibility**: Public
**Regions**: All regions
**Pricing**: Free

## Developer Info
**Publisher Name**: Amaz Soft
**Support Contact**: support@amazsoft.com

---

## Version History

| Version | Date | Changes | Status |
|---|---|---|---|
| 1.1.0 | 2026-10-02 | Added Ctrl+Click New Tab bypass for e-GP, ultra-lightweight performance optimizations, clean disable state, and renamed to Amaz Right Click Pro. | Draft |
| 1.0.0 | 2026-10-02 | Initial release with dual-world hook architecture, paste unblocking, and e-GP tender optimization. | Draft |
