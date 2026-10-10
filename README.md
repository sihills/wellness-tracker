# Wellness Tracker

A separate, phone-friendly Wellness Tracker app, based on the earlier pink botanical Symptom Tracker styling. It uses multicoloured symptom icons in a two-column mobile / three-column desktop layout.

## What's included

- **Today:** favourite symptoms and searchable categories; 11-point severity scale (0–10); optional notes and triggers; quick logs for episodes, sleep, medication, triggers, wellbeing and notes.
- **Detailed episodes:** date and time, severity, duration, triggers, position/activity, optional pulse and blood pressure readings (only if measured), night waking, medications used and what helped.
- **History:** filterable timeline with edit and delete.
- **Patterns:** 7-, 30- and 90-day log summaries; severity-over-time chart; most logged symptoms and recorded triggers; 30-day appointment summary download.
- **Health:** editable condition, medication, HRT and supplement reference lists; favourite symptom selection.
- **Data:** CSV export, full JSON backup and restore, local-data reset. No account or backend; no tracking or remote calls. Optional installation/offline PWA support.

## Publishing to GitHub Pages

1. Create a **new** repository, e.g. `wellness-tracker`. Keep it separate from `symptom-tracker` and `life-tracker`.
2. Upload **all** the ZIP's contents into the root of this new repository. Preserve the `icons/` subfolder.
3. In **Settings → Pages**, choose **Deploy from a branch**, branch **main**, folder **/(root)** and save.
4. Your app should then appear at `https://YOUR-USERNAME.github.io/wellness-tracker/`. On supported phones, use the browser menu **Add to home screen / Install app**.
5. Your private entries stay in that browser's storage for this website, **not** in GitHub. Back up regularly using **Data → Download complete backup (JSON)**. Do not add exported backup files to the public repository.

## Importing your private medical profile (important)

The app source deliberately **does not contain your medical history or medication list**. GitHub Pages repositories and published JavaScript may be public, so publishing health information in the app source would expose it.

Your separately supplied file, `Wellness_Tracker_PRIVATE_Profile_Starter.json`, contains the conditions, medications and supplements from your notes. **Do not put this JSON file into the GitHub repository or app ZIP.** After opening the new app, go to **Data → Restore from a backup** and select this private file on your phone. This imports the profile into **your local browser only** and leaves the public website source free of your health details. It replaces anything already recorded in that browser, so do it before logging entries. Verify the recorded treatments and dosing with a healthcare professional.


This app uses a unique storage key and does not import, overwrite or modify earlier tracker records.

## Important safety notes

Wellness Tracker is for personal observations, not diagnosis or emergency care. Severe breathing difficulty, fainting, or chest pain warrants urgent medical attention. The medicine/condition details are user-supplied reference notes and include dosing details to verify against prescriptions. The app does not recommend treatment changes.

## Updating

When uploading a new release, replace the app source files in the same GitHub repository. If the service worker caches an older copy, close and reopen the page, or refresh the site. **Never clear site data as a first troubleshooting step** unless you have a current backup.
