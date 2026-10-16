# Landing page

`index.html` is the front door of the site.

- **Hero:** gradient headline with a rotating last word (Explore, Build, Learn, Compete), a typewriter role line, four buttons (Play games, Cube solver, Portfolio demos, GitHub), count-up stats and four floating game screenshots.
- **How it works:** three cards that explain pick a game, read the quick guide, then play (and reopen help with `?`).
- **Featured games:** six large cards (Tetris, Chess, Minesweeper, 2048, Sudoku, Tron) with the main controls shown as keycaps.
- **Below that:** the portfolio demos, the full searchable game grid (70 games), the Puzzles section and the console.
- **Theme:** the portfolio look, with the dark and light layouts switched by the `◐ Layout` button.
- **Fix included:** the page's stylesheet had an unclosed `:root[data-theme=dark]` rule that stopped most of the CSS from applying. It is now closed.
