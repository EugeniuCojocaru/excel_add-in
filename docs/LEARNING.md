## Code Style: No Stacked Ternaries | 2026-05-24
- Never use nested/stacked ternary operators. Use if/else if/else instead.
- Why it matters: stacked ternaries are hard to follow and review, especially when branching on multiple conditions.

## Refactoring Rule | 2026-05-22
- When renaming or refactoring a setting/value in a context (e.g. SettingsContext), always grep for all references to the old name across the codebase and update every consumer file as well.
- Why it matters: partial renames cause runtime bugs where consumers still read the old key and get `undefined`.
