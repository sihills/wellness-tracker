# Wellness Tracker v4 — symptoms and duration update

This update keeps the **same installable PWA setup** as v3 (same manifest, icons, application ID, URL scope and local-storage key). Do not uninstall your already installed Wellness Tracker, or clear site data.

## Changes
- Symptom severity 0–5 now uses six distinct colours: grey, blue, green, yellow, orange and rose.
- Sleep apnea is available under Breathing. This is a new tracking item distinct from **Night waking (breathing)** in earlier records, which remain correctly labelled in history. Sleep apnea is not the same as waking at night; it describes a specific sleep-breathing condition.
- Low mood replaces Low mood / sadness.
- Drowsiness is under Allergies; Fainting is under Circulation. Near fainting remains a separate item.
- Optional duration for Fainting, Near fainting, Palpitations, Dizziness, Breathlessness, Wheezing and Chest tightness; choose seconds, minutes or hours. Leave blank and add via Edit later.
- Removed the **new** Detailed episode action to simplify daily tracking. Previous detailed-episode records remain intact and editable through History.
- Quick Note stays a timestamped, free-text diary item, independent of any particular symptom.

## How to update
1. **Back up first:** Data → Download complete backup (JSON). Keep it private.
2. Unzip and upload all files to your existing GitHub Pages `wellness-tracker` repository root, replacing files with the same name.
3. Keep the same repository and URL. Your existing installed app should update when the service worker refreshes. You may need to close the app fully and reopen it twice, especially offline.
4. Do **not** uninstall the installed app or clear site/browser storage. Both can risk losing locally stored records. No JSON profile re-import is needed.
5. New files continue to include *no private personal health profile*; such information remains in local storage on the device.

## Note about old records
This update deliberately preserves legacy 0–10 ratings and detailed episode data, and maps historical 0–10 ratings to equivalent 0–5 ratings when analysing trends. Previously logged night breathing symptoms will **not** silently be reclassified as sleep apnea.
