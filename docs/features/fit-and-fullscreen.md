# Fit to window + fullscreen

Games were drawn at their native size (Tetris is 320×480), which looked small on a desktop screen.

- **Code:** the fit section of `games/howto.js`.
- **Fit to window:** the canvas scales up or down to fill the window and keeps its proportions. It re-fits when the window is resized and when a game changes its own canvas size.
- **Fullscreen button:** **⛶ Fullscreen** (bottom-right) uses the browser Fullscreen API and hides the top bar. Press **Esc** or the *Exit fullscreen* button to leave.
- **Mouse accuracy:** the shared game code (`mousePos` in `common.js`) converts clicks using the canvas's displayed size, so scaled games still click in the right place.
- **Not applied to:** Quiz, which has no canvas.
