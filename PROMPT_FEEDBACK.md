# PROMPT FEEDBACK — NEON RELIC: THE LAST SIGNAL

Constructive feedback regarding ambiguities, contradictions, unprovable assertions, or unnecessary complexities encountered across the build prompts:

- **Monolithic File Target vs Feature Scope:** The 400–600 line target in Day 1 conflicted with the cumulative requirements across Days 2–3 (data-driven levels, Web Audio synthesis, particle pools, WCAG accessibility, error boundaries, and self-tests), which cleanly required modular separation into `logic.js`, `audio.js`, `effects.js`, and `game.js`.
- **Unspecified Same-Frame Tie-Break:** Earlier prompts did not define whether extraction contact or timeout wins if both trigger on the exact same frame update; establishing that extraction takes precedence (success wins) resolved the ambiguity.
- **Subjective Criteria as Pass/Fail Tests:** Prompts specified tests for whether sound designs were "pleasant" or animation was "satisfying", which cannot be objectively measured or verified by automated tools or AI agents; these belong strictly on a Human Checklist.
- **Cross-Browser Verification Without Hardware:** Requiring verification on Apple Safari in an environment running on Windows without macOS hardware or browser-testing device farms is impossible, necessitating an honest "NOT VERIFIED" status.
- **Global Key Actions vs Native Button Focus:** Assigning `Enter` and `Space` to global game state transitions caused native HTML `<button>` elements to fire twice when focused; resolving this required active element filtering and blur cleanup.
- **Over-Specification of UI Controls:** Requiring both an OS `prefers-reduced-motion` media query listener and an interactive manual Effects dropdown created redundant code paths for the same presentation state.
- **LocalStorage Security Exception Handling:** Simulating private browsing mode / disabled storage in vanilla `file://` environments required trapping `SecurityError` on access rather than assuming standard `localStorage` availability.
