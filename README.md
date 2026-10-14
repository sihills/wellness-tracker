# Wellness Tracker v6 — Most common symptoms

See [CHANGELOG.md](CHANGELOG.md) for the version history.

This release replaces manual symptom **Favourites** with an automatically populated **Most common** category on the Today tab.

## What changes
- The Most common category displays up to **eight symptoms**, ranked by the number of times each has been logged **across all saved history**. Ties favour the symptom recorded most recently. Severity does not affect ranking.
- Most common updates immediately when a symptom entry is added, edited or deleted, or when a backup is restored. Custom symptoms can appear here, unless they are hidden.
- With no symptom history, the app opens on **All** and the Most common category has an explanatory empty state.
- Search always checks all currently available symptoms, not only Most common.
- Manual favourite tick boxes and Reset favourites are removed from Health. **Manage symptoms** still allows creating/editing/hiding custom symptoms.
- Symptom categories, symptom notes, 0–5 severity, optional durations, history, health profile, exports and all other features remain available.

## Update your installed app
1. In Wellness Tracker, choose **Data → Download complete backup (JSON)** and store it privately.
2. Extract this ZIP and upload the files to the **root** of the same `wellness-tracker` GitHub repository, replacing files with matching names.
3. Allow GitHub Pages to publish; open the already-installed Wellness Tracker while online, then close and reopen if a cached version appears.
4. **Do not uninstall** the app or clear website data. You should not have to reinstall it.

The existing PWA name, ID, manifest, icons and `wellnessTracker_v1_private_data` storage key are unchanged. Historical favourite settings may remain in old backups, but are ignored and do not change or delete symptom logs.

This application is for personal records, not diagnosis or treatment advice.
