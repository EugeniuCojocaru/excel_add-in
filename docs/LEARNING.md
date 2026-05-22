## Refactoring Rule | 2026-05-22
- When renaming or refactoring a setting/value in a context (e.g. SettingsContext), always grep for all references to the old name across the codebase and update every consumer file as well.
- Why it matters: partial renames cause runtime bugs where consumers still read the old key and get `undefined`.
