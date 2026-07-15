---
name: library-architecture
description: The house architecture and coding style for everything under src/libraries (math, utils, i18n, ...). Invoke when adding to or refactoring library modules — statistics, interpretation, summary/Excel output, or any pure logic layer. Encodes the Config → Steps → Orchestrator → Barrel pattern, dependency injection via options, typed JSDoc contracts, and the row-builder output dialect. Reference implementation: src/libraries/math.
---

# Library Architecture

The canonical implementation of this pattern is **`src/libraries/math`**. Read it before
writing code. Everything below is that pattern abstracted so it applies to non-numeric
layers too (interpretation, summary output, Excel formatting).

## Architecture — four layers, never collapsed

```
config    → one shared source of infra           (math/config.js: the `math` instance)
steps     → pure single-responsibility functions (math/helpers/*.js)
orchestrator → thin composer, numbered stages     (math/use_cases/*.js)
barrel    → export * re-exports                   (index.js)
```

1. **Config** — one module owns shared setup; import it, never re-create it
   (`import math from "../config"`). There is exactly one instance.
2. **Steps** — each helper does *one* thing and is a pure function of its arguments.
   No orchestration, no reaching into globals. This is where the real work lives.
3. **Orchestrator** — a thin public entry point. It wires steps together in **numbered
   stages** and is the **only** layer allowed to touch the input/output boundary
   (see Rule A). If an orchestrator grows long, the fix is *more steps*, not inline logic.
4. **Barrel** — `index.js` re-exports with `export * from "./..."`. Every new module gets
   added to its barrel.

**Where new code goes:** put each stage of work in a step; compose steps in an
orchestrator. Never inline a computation or a section-builder that could be a named step.

## Four cross-cutting rules

### A. One internal representation, converted only at the edges
Pick a single representation and keep it all the way through; convert only where values
enter or leave.
- *Numeric layer:* BigNumber internally → `toUINumber(...)` at the `return`.
- *Presentation layer:* the wrapped `{ value, color }` stat internally → formatted into a
  `toUIData` row only where the row is emitted.

The converter is **injected**, never imported (`toUINumber`, `fillFor`, `t`). Apply it at
the boundary only — never sprinkle conversions through the middle of a step.

### B. Dependencies injected via a trailing options object, with defaults
Signatures end with a destructured options bag carrying defaults:
```js
(data, alpha = 0.05, { toUINumber }) => { ... }
(stats, t, { mode = "STUDENT", fillFor = () => null } = {}) => { ... }
```
Cross-cutting collaborators — `t` (i18n), `fillFor`, `toUINumber`, `mode` — are passed in.
Every function stays pure and testable. Defaults make helpers callable in isolation.

### C. Every export carries a typed JSDoc contract
Each exported (and each non-trivial internal) function gets a JSDoc block with `@param`
and a **fully written-out inline `@returns` shape**:
```js
/**
 * @param {{ value: number }[]} slopes
 * @param {(stat: {value:number}) => object|null} fillFor
 * @returns {{ row: any[], format: (object|null)[] }[]}
 */
```
Orchestrators that face the domain open with a one-line **Romanian** description, then the
typed tags (see `math/use_cases/regression.js`).

### D. Composition is narrated
- Numbered step comments (`// 1.`, `// 2.`, ...) walk through the orchestrator's stages.
- **Romanian** for domain/narrative comments; **English** for technical/statistical notes.
- Explain *why* wherever there's a subtlety.
- **No stacked / nested ternaries** — use `if / else if / else`. (See `docs/LEARNING.md`.)

## Naming

- Export **named arrow functions**: `export const buildXSection = (...) => { ... }`.
- Prefix step helpers by role:
  `compute*` / `solve*` (calculation), `build*` (assemble structure/rows),
  `get*` (derive a value or section), `set*` (in-place mutation), `to*` (representation
  change).
- Keep domain-notation variable names (`X_T_X`, `ssRes`, `df`, `k`, `slopes`, `b0`).

## Output-layer dialect (interpretation / summary / Excel)

The one thing the numeric layer doesn't show: presentation steps don't return a scalar
object — they **return an array of rows** and the orchestrator **accumulates** them.

- A step builds *one section* and returns `row[]`, where each row is
  `toUIData(cells, formats)`.
- The orchestrator concatenates sections: `section.forEach((r) => push/addRow(r))`.
- Formats come from `EXCEL_FORMATS`; per-cell fills from the injected `fillFor(stat)`.
  Merge a fill into a base format immutably (`withFill` in `interpretation/regression.js`)
  — never mutate a shared format object.
- Row/column bookkeeping (`maxColumns`, `dataToWrite`) belongs in a single tiny helper,
  not repeated per call site.

So an over-long output orchestrator refactors to: `buildRegressionStats`,
`buildAnova`, `buildCoefficients`, `buildVif`, `buildCorrelationMatrix`,
`buildExecutiveSummary` — each `(stats, t, { fillFor, ... }) → row[]` — and a shell that
concatenates them in numbered order.

## Checklist before you finish

- [ ] Work split across steps; orchestrator is thin and reads as numbered stages.
- [ ] Single internal representation; conversion only at the boundary via an injected fn.
- [ ] Collaborators injected through a trailing options bag with defaults.
- [ ] JSDoc with inline `@returns` shape on every export.
- [ ] Numbered comments; correct comment language; **zero stacked ternaries**.
- [ ] New modules added to their `index.js` barrel.
- [ ] Tests in `src/tests/<module>.test.js` using `@math`/`@utils` aliases, granular
      one-assertion cases with hand-computed fixtures (see existing tests).
- [ ] Behavior unchanged unless the task says otherwise — refactors don't alter output.

## Reference exemplars

- `src/libraries/math/helpers/regression_steps.js` — step style + JSDoc.
- `src/libraries/math/use_cases/regression.js` — orchestration, numbered stages, boundary.
- `src/libraries/utils/interpretation/regression.js` — output-layer steps + `withFill`.
- `src/libraries/utils/ui.js` — `toUIData`, boundary converters.
