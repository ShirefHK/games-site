# Redesign every game (plan + status)

Goal: no game keeps its original look. Round 1 re-coloured all 70 games and redrew 9 of them (see [game-reskin.md](game-reskin.md)). Round 2, described here, covers everything that was left.

## What "all" means, group by group

| Group | Games | Approach |
| --- | --- | --- |
| Sprite games, redrawn in round 1 | Tetris, Xonix, Snake, Match-3, 15-Puzzle, Car Racing, Doodle Jump, Arkanoid, Asteroids | Done in round 1 |
| Sprite games, still the original shapes | Chess, Minesweeper, Pipe Puzzle, Volleyball, Outrun, Mahjong | Redraw the pieces, tiles, pipes and characters |
| Light "paper" puzzle boards | Sudoku family (all 14), Picross, SquareLogic, Crosstext, Binary Puzzle, Chiiki, Dampfross, Dominosteine, Endview, Galaxien, Hidoku, Kakuro, Kendoku, Knossos, Kuhweide, Loopy, Pfeile, Shikaku, Slitherlink, Squaring, Squiggly, Sterne, Minesweeper | Flip from cream paper to a dark neon board |
| Text in every canvas | All 70 | Replace the system font with Poppins |
| Page chrome | All 70 | Portfolio theme (`games/theme.css`) |

## Status (done)

| Group | Result |
| --- | --- |
| Chess | New piece set: glowing glyph pieces (pink side, cyan side) on the pink and violet board |
| Minesweeper | New 12-tile sheet: neon numbers, glass hidden tile, spiky mine, pink flag |
| Pipe Puzzle | Pipes redrawn as glowing neon tubes, new computer (off and on) and server icons |
| Volleyball | New glowing ball and rounder blob characters with an eye (the game still tints them red and green) |
| Light puzzle boards (35 games) | Flipped to dark neon boards |
| Plain colour literals | 185 more colours written directly in the code (such as `'#fff'`, `'#111'` and the cream paper) were missed in round 1 and are now mapped |
| Font | Poppins is now in front of the system font in canvas text |
| Landing thumbnails | All 70 retaken from the new games |

## How the light-to-dark flip works
- Light backgrounds become deep violet, dark ink becomes light lavender, pastel region fills become deep tinted fills.
- Saturated marks (reds, greens, blues) keep their colour.
- Only files that are really light-themed are flipped, chosen from screenshots. Games that were already dark are left alone.

## Scripts added in round 2
- `tools/reskin-assets2.py` redraws Chess, Minesweeper, Pipe Puzzle and Volleyball (marker `tools/.assets2-done`).
- `tools/reskin-dark.js` flips the light boards and swaps the font (marker `tools/.dark-done`).
- `tools/reskin-literals.js` maps the plain colour literals (marker `tools/.literals-done`).
- `tools/flip.js` is the shared light-to-dark colour maths.
- Run order from a fresh checkout: `reskin-colors.js`, `reskin-assets.py`, `reskin-assets2.py`, `reskin-dark.js`, `reskin-literals.js`. Each runs once only.

## What is still the original shape
- **56 code-drawn games:** the puzzle boards keep their original layout and shapes. Grid lines, cage outlines and hexagons are produced by the game logic, which is minified. They now have a new colour scheme, a dark board, Poppins text and the portfolio frame, but not new geometry.
- **Re-coloured only, not redrawn:** the Outrun road sprites, the Mahjong tile faces, the Asteroids spaceship and the Car Racing track map.
- **Kakuro:** the cells you fill in stay light lavender while the clue squares are dark.
