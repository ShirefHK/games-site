# Auto-play demo (games)

Every canvas game has a **▶ Auto-play demo** button, so a visitor can watch a game running before trying it.

- **Code:** the auto-play section of `games/howto.js`.
- **Where:** bottom-right, above the **Fullscreen** and **? How to play** buttons. It is off by default.
- **How it plays:** it sends random input taken from that game's own controls table in `howto/<game>.md`:
  - arrow keys, `W A S D` and `Space` when the guide lists them
  - random clicks (or click-drags) on the board when the guide lists *Click* or *Drag*
  - for driving games (the guide mentions gas, accelerate or thrust) it holds **↑** and steers left and right
  - it presses `R` once every 45 s when the game has a restart key, so a finished game starts again
- **Honest limits:** this is random play, not an AI. Arcade and mouse games look alive; word, Sudoku-style and logic puzzles mostly just show the cursor selecting cells.
- **Hand-over:** a real key press, click or touch pauses it for 6 seconds. The *Stop auto-play* button turns it off.
- **Not shown for:** Quiz (no canvas) and any game whose guide lists no keys or mouse input.
- **Verified:** in a headless browser, Tetris, 2048, Racing, Asteroids and Tron received about 53 random key events over 9 seconds, and Minesweeper and Chess about 53 random clicks.
