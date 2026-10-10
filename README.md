# Wellness Tracker v2

A separate, mobile-friendly Progressive Web App (PWA). Keeps the simple pink botanical design and multicoloured symptom icons.

## What's changed

- **Simpler symptoms:** 24 built-in options; 13 favourites on the Today screen. Tap **Show all** to browse the full list. Edit favourites under **Health → Your quick-log symptoms**; unticking never removes history. Add custom symptoms there too.
- **0–5 scale:** 0 none, 1 very mild, 2 mild, 3 moderate, 4 severe, 5 extreme. Wellbeing/sleep-quality scores also use 0–5, but higher is better. Existing v1 ratings recorded on a 0–10 scale remain identified as /10 in history and are converted proportionately for summary charts; editing an old entry saves it on the new 0–5 scale.
- **Relevant optional triggers:** only appropriate suggestions appear for each symptom, and are collapsed by default. Detailed episodes show triggers matched to the episode type. Custom symptoms can opt into suggested triggers based on their category. Standalone trigger logging still offers the full list.
- **Install support:** full web app manifest with dedicated 192px/512px icons, separate maskable icon and Apple touch icon, standalone display mode and offline service worker. See **Data → Install Wellness Tracker** for guidance and an installation button on supported Android browsers.
- History, 7/30/90-day trends, episode details, condition/medication/supplement profile, CSV export, full JSON backup/restore and appointment summary remain.

## Publishing / updating on GitHub Pages

1. On GitHub, open your *separate* `wellness-tracker` repository. If this is your first upload, create that repository and enable **Settings → Pages → Deploy from branch → main / (root)**.
2. Unzip **Wellness_Tracker_App_v2.zip** and upload **all its contents** to the repository root. Replace existing files with the same names. **Include every file in `icons/`** and `manifest.webmanifest` and `sw.js`. Do not upload the ZIP itself as a single file.
3. Open `https://YOUR-USERNAME.github.io/wellness-tracker/`. On an existing installation, refresh and close/reopen the app after deploying to get the new service worker assets.
4. **To install on Android:** open the website in **Chrome** (not a preview embedded in another app); open Chrome's ⋮ menu and choose **Install app** if available. Alternatively go to **Data** in the tracker and tap **Install Wellness Tracker** if the button appears. On **iPhone:** open the website in **Safari**, tap **Share → Add to Home Screen → Add**.
5. **If you have a Chrome-badged shortcut:** that usually means the phone created a browser shortcut rather than installed the standalone PWA. Remove that shortcut, reopen the published site in a supported browser, wait a moment while its service worker activates, and use **Install app** if the option is offered. Icon/standalone behaviour is ultimately controlled by the browser and phone OS; app code cannot force an OS to hide a badge from a simple shortcut.

**Before clearing site data, reinstalling, or changing a repository URL, save a backup** under **Data → Download complete backup (JSON)**. Local entries are tied to the browser/site origin, not to the GitHub repository contents. Replacing source files in the same Pages URL does not normally erase local data. The new app is entirely separate from Life Tracker and Symptom Tracker.

## Private health profile

The source ZIP deliberately contains **no private diagnoses or medication details**. If desired, import the separate `Wellness_Tracker_PRIVATE_Profile_Starter.json` under **Data → Restore from a backup** *before* entering records. **Do not upload private JSON backups to GitHub**. Restoring a JSON backup replaces existing local records and settings (including favourites).

## Data and safety

Entries are stored in the browser via `localStorage`. No login, analytics, cloud account or backend. Export regularly and keep health-related backups private. The app is a personal notebook and not an emergency or diagnostic service. Severe breathlessness, fainting, and chest pain warrant urgent medical attention. Medicine doses in private imported notes should be verified with a clinician/pharmacist.
