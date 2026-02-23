# Safari Blank White Page Bug — Reference Document

## Status
⚠️ **Unresolved — parked for later**

## The Symptom
In **Safari only** (confirmed working in Brave/Chrome), navigating between pages in a specific pattern causes `index.html` to render as a **completely white blank page** with no content, no background, no errors in the console.

**Reproduction sequence:**
1. Hard reload `index.html`
2. Click "Approach" nav link → goes to `approach.html`
3. Click logo → returns to `index.html` ✅ works
4. Click "Approach" nav link → goes to `approach.html`
5. Click logo → returns to `index.html` ❌ **BREAKS — completely white page**

## What We Know
- **Safari-specific**: Brave, Chrome, Firefox unaffected
- **Not the back button**: User is clicking logo/nav links only, not browser back
- **No console errors**: Safari Web Inspector console shows nothing
- **Completely white**: Not dark with invisible elements — the body background itself doesn't render
- **Fresh navigations**: Each logo click is `<a href="index.html">`, not bfcache back/forward

## Root Cause Theories (Unconfirmed)

### Theory A — Safari bfcache on link navigation (most likely)
Safari sometimes sets `event.persisted = true` in `pageshow` even when navigating via link clicks (not back button), if the page was previously stored in bfcache. If a `window.location.reload()` is called inside `pageshow`, this creates a reload/white-flash cycle that manifests as a blank page.

### Theory B — Render-blocking GSAP CDN script
`gsap.min.js` was previously in `<head>` as a synchronous, render-blocking script. If Safari re-validates or re-fetches it from `cdnjs.cloudflare.com` on the 2nd or 3rd navigation, the page sits blank white while waiting. **Partially addressed** — GSAP was moved to end of `<body>` in the current code.

### Theory C — Safari rendering/compositing bug
After multiple navigations to the same URL within a session, Safari may encounter a GPU compositing or paint issue that causes an empty frame to be shown. Less likely, harder to fix.

## What Was Tried (All Failed)
1. Changed logo `href="index.html"` → `href="#"` with `onclick="return false"` on `index.html` — prevents self-reload on home page, but doesn't fix multi-page navigation
2. Added `pageshow` handler with `window.location.reload()` when `event.persisted === true` — actually may have WORSENED the issue by triggering reloads on link navigation
3. Added inline `<style>body { background: #000a1f; }</style>` to `<head>` — page still shows white (background not rendering at all, suggesting a deeper issue)
4. Moved GSAP from `<head>` to end of `<body>` — eliminates render-blocking, but issue persisted

## Current State of `index.html` (as of parking)
```html
<head>
    <!-- No GSAP here — moved to body -->
    <link rel="stylesheet" href="styles.css">
    <link rel="stylesheet" href="dashboard-v2.css">
    <style>
        body { background: #000a1f; }  /* inline safety net */
        .nav { opacity: 1; }
        .nav-logo { pointer-events: auto; }
    </style>
</head>
<body class="dashboard-body">
    <!-- ... page content ... -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
    <script src="dashboard.js"></script>
    <script src="portfolio-data.js"></script>
    <script src="bento-rotation-v2.js"></script>
</body>
```

Logo on `index.html`: `<a href="#" onclick="return false;" class="nav-logo" ...>`
Logo on all other pages: `<a href="index.html" class="nav-logo" ...>` (unchanged)

## Recommended Next Debugging Steps

1. **Safari Web Inspector → Network tab** (not just Console): reproduce the blank page and check the HTTP status + response size for `index.html` on the failing request. A 0-byte response would confirm a server/caching issue.

2. **Check the address bar URL** when it goes blank — is it `approach.html` (navigation failed entirely) or `index.html` (page loaded but rendered white)?

3. **Test with `file://` protocol** — open `index.html` directly in Safari without a dev server. If it doesn't break → the dev server is the culprit, not the browser.

4. **Try disabling bfcache** — add to `index.html` `<head>`:
   ```html
   <meta http-equiv="Cache-Control" content="no-store">
   ```
   If this fixes it → Safari bfcache is the confirmed cause.

5. **Self-host GSAP** — copy `gsap.min.js` locally instead of CDN. If this fixes it → CDN re-fetch latency was the cause.

6. **Check Safari version** — some versions have documented bfcache bugs with repeated same-URL navigation patterns.

## Files Involved
- `index.html` — primary file with the bug
- `dashboard.js` — `initEntryAnimations()` uses `gsap.from()` which sets `.clock-item` and `.dashboard-stat` to `opacity: 0` immediately on load
- `bento-rotation-v2.js` — card rotation system (likely not the cause)
- `dashboard-v2.css` — `.dashboard-body { height: 100vh; overflow: hidden; }`
