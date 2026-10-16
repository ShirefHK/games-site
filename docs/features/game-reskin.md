# Game re-skin (new colours, sprites and shapes)

Every game was given a new look so it no longer resembles the originals: a "synthwave night" palette (deep violet, hot pink, cyan, mint, amber) shared with the portfolio.

## What changed

**1. Colours in code (all 70 games).** `tools/reskin-colors.js` finds every colour string (hex, `rgb()`, `rgba()`, `hsl()`) inside the games' obfuscated string tables and the shared files (`gridkit.js`, `sudoku-ui.js`, `rect-ui.js`, `loop-ui.js`, `sudoku-core.js`) and remaps it through `tools/palette.js` (about 440 colours).
- Hues move to the new palette: red → pink, green → mint, yellow → amber, blue → indigo.
- Grays and paper-cream become violet and lavender, so Sudoku-style boards are lavender instead of cream.

**2. Redrawn sprites and shapes** (`tools/reskin-assets.py`), same sizes and frame layouts so the games run unchanged:

| Game | New artwork |
| --- | --- |
| Tetris | Neon-glass tiles, night grid background, glowing board frame and score panel |
| Xonix | New spiky neon mine enemy (it still spins), neon tiles, neon GAME OVER banner |
| Snake | Mint gem body, pink diamond food, dark violet cells |
| Match-3 (Bejeweled) | Seven different gem shapes (orb, hexagon, diamond, triangle, star, square, octagon), neon corner-bracket cursor, new background |
| 15-Puzzle | Glass violet tiles with glowing numbers |
| Car Racing | New top-down neon car |
| Doodle Jump | New alien character, neon capsule platforms, night background |
| Arkanoid | Five glass blocks, glowing ball and paddle, grid background |
| Asteroids | Faceted crystal rocks (16 rotation frames each), nebula star field |

**3. Re-coloured artwork.** Images that were not redrawn go through the same palette, with a stronger synthwave gradient-map for photo-like ones: Outrun, Volleyball, Tron, Mahjong and the Car Racing track. Chess board, pieces, Minesweeper tiles, Pipe Puzzle, explosions and the spaceship are also re-coloured.

## Notes
- The scripts are meant to run **once**. Each leaves a marker (`tools/.colors-done`, `tools/.assets-done`) and refuses to run again without `--force`, because running again would remap the colours a second time.
- To undo, use git: `git checkout -- games` (before committing).
- Games drawn purely in code with colours built at runtime (for example `hsl()` values calculated per piece) keep some of their original hues.
- Round 2 redrew Chess, Minesweeper, Pipe Puzzle and Volleyball and darkened the light puzzle boards; see [game-redesign-all.md](game-redesign-all.md).
