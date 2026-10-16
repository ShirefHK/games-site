# Portfolio theme for games

All 70 game pages now share the portfolio's look: purple glow background, Preahvihear headings, Poppins text and rounded glass panels.

- **Code:** `games/theme.css`, linked at the end of `<head>` in every `games/*/index.html`. Selectors start with `html body …` so they win over the small style block that `common.js` injects.
- **Top bar:** a sticky glass pill with a shimmering gradient title and a **← All games** pill button.
- **Playfield:** the canvas gets rounded corners and a glowing purple frame, and fades in on load.
- **Hint line:** the text under the canvas is a bordered pill.
- **Quiz:** the Quiz page has its own markup, so the theme maps its colour variables to the portfolio palette and restyles its cards, buttons and inputs.
- **Light and dark:** it follows the portfolio's `◐ Layout` choice (`localStorage.theme`), then the system setting. `games/howto.js` copies the saved choice onto the page.
- **Reduced motion:** the title shimmer and fade-in are switched off.

**What the theme does not change:** the artwork inside each canvas (tiles, boards, backgrounds). That is drawn by the game code, so a Sudoku board is still cream-coloured inside its purple frame.
