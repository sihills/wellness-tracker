# Wellness Tracker v3 — installable app

This is the same 0–5, 24-symptom, tailored-trigger Wellness Tracker as v2. The change in v3 focuses on matching Life Tracker's standalone Android app installation experience.

## Android installation (app drawer icon without Chrome badge)

1. **Back up data first:** In your existing Wellness Tracker, open **Data → Download complete backup (JSON)**. Keep it somewhere private. Updating the website does not normally delete saved data, but do not clear its storage.
2. Unzip this package and upload **every file at the top level** of your GitHub `wellness-tracker` repository, replacing any previous versions. In particular, `manifest.webmanifest`, `sw.js`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` and `apple-touch-icon.png` must be next to `index.html`. Old `icons/` folder from v2 may be left there but is no longer used.
3. Wait for the GitHub Pages deployment. Open `https://sihills.github.io/wellness-tracker/` **directly in Chrome on Android**, not the GitHub preview or a browser inside another app.
4. Refresh once or twice after the new version appears. In the app, open **Data → Check installation setup**. All items should be ✓. A failed check indicates an upload, deployment or connection issue; fix it before installing.
5. Select **Install app** from Chrome's ⋮ menu (or tap the **Install app** button in the app header if Chrome displays it). Accept the installation prompt. It may take a short time to appear in Android's app drawer. Check **Settings → Apps → Wellness Tracker**.
6. Once installed successfully, remove any old Chrome-badged home-screen **shortcut**. Do not clear Chrome site data, as that holds health logs and settings.

**Do not use a basic 'Create shortcut' option** if you want an app drawer entry without the Chrome badge. If Chrome will only create a shortcut, the device/browser has not produced the standalone Android WebAPK; app code cannot force that operation. The installation checks help narrow down a missing asset or manifest issue.

## What changed from v2

- Main app icons now sit in the **repository root**, just like Life Tracker. This removes the extra `icons/` folder dependency, which is easy to miss during uploads.
- The manifest has the same important standalone settings as Life Tracker; both 192 and 512px icons and a maskable icon are supplied.
- The service worker uses a fresh v3 cache and handles offline pages.
- The install prompt appears in the header when Chrome offers installation, as it does in Life Tracker.
- **Data → Check installation setup** confirms HTTPS, manifest, icon availability and service worker activation.

All symptom logs, favourites, saved conditions and profiles retain the **same local storage key** and structure as v2. The app package includes no private diagnoses or medication records. Keep your separate medical profile/backups off GitHub.

## Limits

A website cannot guarantee or force Android to create a WebAPK. Installation requires a compatible browser/device and the published URL to be reachable over HTTPS. If Chrome lacks the Install app action even though checks pass, wait, interact with the app, reload and try the Chrome menu again.
