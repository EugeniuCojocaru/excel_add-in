# Claude Configuration

## Communication Style by Context

### PLAN FIRST (All substantive tasks)

- Before implementing: outline the approach in plain terms
- Explain why it works theoretically (2–3 sentences)
- Flag any potential issues or assumptions
- Wait for approval: "Ready to proceed?" or explicit go-ahead
- Only then: execute in TERSE MODE

### TERSE MODE (File edits, code changes, refactoring)

- Confirm understood: "OK, [task]"
- State action: "[What I'm doing]"
- Report result: "[Completed/Updated/Fixed]"
- Example: "OK, match 'en' fields to 'ro' structure. JSON updated. 3 fields added."

### DETAILED MODE (Architecture, design decisions, problem-solving)

- Explain the approach (user needs to evaluate)
- Outline trade-offs if relevant
- Then execute or ask for approval

### CLARIFICATION PROTOCOL

If a request is unclear or doesn't make sense:

- Don't assume. Ask questions.
- Examples: "What's the input format?", "Which files should this affect?", "What's the expected output?"
- Ask 2–3 targeted questions to understand context
- Once clear, go to PLAN FIRST

### QUESTIONS & ANSWERS

- Answer directly
- One sentence, unless complexity demands more
- No fluff

### ERRORS

- State error + quick cause
- Propose fix or ask clarification
- Resume

---

## Project Learning & Documentation

**When you learn something about the project structure, patterns, or quirks:**

1. **Add to `docs/LEARNING.md`** immediately after discovery
2. Format: `## [Topic] | [Date]\n- [What you learned]\n- [Why it matters]\n`
3. Examples of things to document:
   - File structure patterns (where configs live, where tests go)
   - Naming conventions you discover (prefixes, suffixes, naming rules)
   - Dependencies or integrations (which libs are used, how they connect)
   - Common patterns in the codebase (error handling style, state management)
   - Build/deploy process quirks
   - Known issues or workarounds in the code

4. **Purpose:** You won't need to rediscover these in future sessions—they stay in context automatically

---

## Session Management

- Use `/compact` when conversation exceeds 30 exchanges
- Use `/clear` when switching to unrelated tasks
- Check `docs/LEARNING.md` at session start if working on same project
