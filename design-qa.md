# Design QA

- Source visual truth: `C:/Users/user/AppData/Local/Temp/codex-clipboard-8aba34d6-35d6-422e-bdb1-99f764bf5af3.png`
- Supporting character reference: `C:/Users/user/AppData/Local/Temp/codex-clipboard-7ebd2020-07d8-48e7-a118-b03c699f0def.png`
- Implementation screenshot: `D:/Codex/ansan-gangseo-social-arcade/new-chat/outputs/home-mobile-intro-entry.png`
- Viewport: 430 × 932 CSS px, device scale 1
- State: initial home hub before opening Game Introduction
- Source pixels: 853 × 1920; implementation capture: 430 × 932

## Full-view comparison evidence

The implementation follows the selected portrait hierarchy: school/course header, large game title, story briefing, recommended mission, mission navigation and fixed bottom navigation. Navy, teal and gold tokens match the reference direction. The captured implementation initially showed CSS fallback figures because expression-specific PNG requests failed before hydration; the asset priority was corrected so each character now requests its transparent default PNG first.

## Focused-region evidence

The reference character board was used for the four implemented ACT 1 identities. Character art and all dialogue/copy remain separate layers. PNG alpha channels were verified independently. A revised browser capture could not be completed after the local browser connection began blocking newly opened localhost tabs.

## Findings

- P2 — Revised PNG placement and the new Game Introduction overlay need a final browser-rendered comparison at the same viewport.
  - Fix made: default PNG now loads before optional expression assets; the introduction is a scrollable modal with four character cards.
  - Remaining blocker: local browser tabs returned `ERR_BLOCKED_BY_CLIENT` after the development server restarted.

## Comparison history

1. First capture found fallback character art in the home hero.
2. The character source order was corrected to load known default PNG assets first.
3. A same-viewport recapture was attempted but browser access to the restarted local server was blocked.

## Primary interactions checked

- Initial home rendered successfully before browser access was interrupted.
- Game Introduction trigger and close action are covered by semantic button/dialog markup but still need browser interaction confirmation.
- Console errors before the restart: none.

final result: blocked
