# Wellness Tracker — Version History

This file records the user-facing changes to **Wellness Tracker**, a separate app from Life Tracker and Symptom Tracker. Releases are listed newest first. Dates refer to the date each package was created.

## v5 — 14 October 2026
**Focus: flexible symptom duration logging**

### Added
- Optional **How long did it last?** control during logging and editing for 11 symptoms: fainting, near fainting, palpitations, dizziness, breathlessness, wheezing, chest tightness, headache, nausea, upper abdominal pain and lower abdominal pain.
- Optional duration under **Additional details** for four other symptoms: drowsiness, brain fog, sinus/eye pressure and cough.
- Duration can be entered later using **History → Edit** for *any* symptom, including custom symptoms.
- Separate optional fields for **time unconscious** and **total time feeling unwell** when logging fainting.

### Improved
- Duration is always optional and may be entered in seconds, minutes or hours.
- Saved duration appears in History, CSV exports and appointment summaries.
- Previously saved symptoms and durations remain available. Older fainting records are not automatically reinterpreted as time unconscious.

## v4 — 13 October 2026
**Focus: clearer severity display and simpler daily logging**

### Added
- **Sleep apnea** under breathing (separate from previously recorded night waking).
- **Drowsiness** under allergies.
- **Fainting** under circulation, distinct from near fainting.
- Optional duration for seven episodic symptoms: fainting, near fainting, palpitations, dizziness, breathlessness, wheezing and chest tightness.

### Changed
- Renamed **Low mood / sadness** to **Low mood**.
- Six more distinct colours for severity 0–5: grey, blue, green, yellow, orange and pink-red.
- Removed the **Detailed Episode** action from new daily logs to simplify the interface.
- Retained **Quick Note** as an independent, timestamped free-text diary entry.

### Data compatibility
- Prior detailed-episode records remain visible/editable in History.
- Old **Night waking (breathing)** records are preserved under their original wording and **not** converted into sleep-apnoea records.
- Earlier 0–10 ratings remain identifiable and are handled in trend summaries.

## v3 — 10 October 2026
**Focus: install Wellness Tracker like a standalone Android app**

### Improved
- Moved app icons to the repository root to match the working Life Tracker deployment arrangement.
- Aligned web app manifest, 192px and 512px icons, maskable icon and standalone display settings.
- Updated offline service worker/cache.
- Added an **Install app** control when supported by the browser.
- Added **Data → Check installation setup** to test HTTPS, manifest, icons and service-worker readiness.

### Result
- Confirmed by the user: Wellness Tracker successfully installed into the Android app list with its own icon and no Chrome badge.
- Kept the same app identity and local-data key, avoiding a data reset during upgrade.

## v2 — 10 October 2026
**Focus: fewer symptoms and faster daily logging**

### Changed
- Reduced built-in symptom choices to **24**, with **13 favourites** presented first on Today.
- Favourites are editable in **Health → Your quick-log symptoms**; removing a favourite does not delete previous records.
- Changed symptom severity from **0–10** to **0–5** (0 = none; 5 = extreme). Wellbeing and sleep quality also use 0–5, where a higher score is better.
- Made trigger suggestions **optional and relevant to the selected symptom**, rather than presenting the same full list for all symptoms.

### Improved
- Added support for user-defined symptoms.
- Expanded PWA installation resources, including a maskable icon, Apple touch icon and installation guidance.
- Preserved existing v1 0–10 results in History; trend summaries convert historical scores proportionately where necessary.

## v1 — 10 October 2026
**Initial release**

### Added
- Separate, mobile-friendly Wellness Tracker using the soft pink botanical theme and multicoloured symptom icons.
- Daily symptom logging with **0–10** severity, optional triggers and notes.
- Detailed episode tracking, including duration, triggers, position/activity, pulse or blood pressure if measured, medicine use and what helped.
- Sleep, medication, trigger, wellbeing and Quick Note logs.
- History with edit/delete; 7-, 30- and 90-day patterns; appointment summary.
- Health reference lists for conditions, medication/HRT and supplements, plus symptom favourites.
- CSV export, complete JSON backup/restore and offline-capable PWA files.
- Kept private medical information out of the public website source; optional separate private profile import.

---

## Release practice
When making future changes:
1. Add the newest version **at the top** with the release date.
2. Record features added, behaviour changed, important fixes and any impact on saved data.
3. Keep the existing app ID, storage key and installable PWA configuration unless a deliberate migration is required.
4. Never add a private medical profile, health logs or backup JSON to the public GitHub repository.

**Note:** This is a functional change log, not a medical record. It does not contain personal health data.
