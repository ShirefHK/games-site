# How-to-play guides

Every game has a guide with its goal, controls, step-by-step instructions and tips.

- **Source files:** `howto/<NN Game Name>.md`, 70 files. Edit these to change a guide.
- **Format:** `# Title`, then `## Goal`, `## Controls` (a table), `## How to play` (numbered) and `## Tips` (bullets).
- **Build:** run `node tools/build-howto.js` after editing. It writes `games/howto-data.js`, so the guides also work from `file://` and GitHub Pages.
- **In the game:** `games/howto.js` shows the guide as an overlay with keycap-style controls.
  - It opens on a visitor's first visit to each game.
  - Reopen it with the **? How to play** button or the `?` key.
  - While it is open the game ignores keys. **Esc**, **Enter** or **Got it** closes it.
- **Where the controls came from:** the games' own code and on-page hint text. Some games have no built-in help, so those guides are less certain: Cogs, Pfeile, Squaring, Strike5, Tetris Attack and Xonix. Check these in play and correct the `.md` file if anything is off.
