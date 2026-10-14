# Wellness Tracker v5 — optional symptom durations

This is an in-place update to the existing **Wellness Tracker v4**, preserving its installable Android/iPhone PWA identity, icons, manifest, URL scope, and local browser-storage key. It does not include a personal medical profile. Do not uninstall the app to update.

## What's new
- **11 priority symptoms:** Fainting, near fainting, palpitations, dizziness, breathlessness, wheezing, chest tightness, headache, nausea, upper abdominal pain, lower abdominal pain. A collapsed optional **How long did it last?** field appears when logging or editing them.
- **4 occasional symptoms:** Drowsiness, brain fog, sinus / eye pressure, cough. Optional duration lives under **Additional details**.
- **Every other symptom:** No duration prompt when logging. Open the entry in **History → Edit** to add a duration if useful. Works for user-added symptoms too.
- **Fainting:** Separately tracks **time unconscious (if known)** and **total time feeling unwell**, so these aren't conflated. Both are optional and editable later.
- Duration can be recorded in seconds, minutes or hours. If blank, the app stores no duration.
- Entries, CSV export and appointment summaries show saved durations. Existing durations, symptom records and legacy detailed episodes remain accessible. Older fainting durations are **not** retroactively labelled as time unconscious unless explicitly updated.

## Update your installed app
1. Open Wellness Tracker → **Data → Download complete backup (JSON)**; store privately.
2. Extract this ZIP and upload all its contents into the ROOT of the **same** wellness-tracker GitHub repository, replacing same-named files. Do not change the repository or URL.
3. Once GitHub Pages publishes the update, open the existing app icon while online; close and reopen if an older cached version appears. No reinstall needed.
4. Do not delete the app or clear website data; existing local entries and your health profile stay on the device.

*This app is for personal records, not diagnosis. After a fainting event, time unconscious may not be known and should never be guessed.*
