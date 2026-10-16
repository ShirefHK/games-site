# Features

Everything added to the portfolio + games site, one file per feature.

| Feature | What it does | File |
| --- | --- | --- |
| Landing page | Hero, how-it-works steps, featured games | [landing-page.md](landing-page.md) |
| How-to-play guides | Goal, controls, steps and tips for all 70 games | [how-to-play-guides.md](how-to-play-guides.md) |
| Fit to window + fullscreen | Games scale up to fill the screen | [fit-and-fullscreen.md](fit-and-fullscreen.md) |
| Portfolio theme for games | Every game page matches the portfolio style | [portfolio-theme-games.md](portfolio-theme-games.md) |
| Auto-play demo (games) | Games play themselves with random input | [game-autoplay.md](game-autoplay.md) |
| Live demos (autopilot) | The 8 portfolio demos run themselves | [live-demos-autopilot.md](live-demos-autopilot.md) |
| Game re-skin | New colours, sprites and shapes for every game | [game-reskin.md](game-reskin.md) |
| Redesign every game | Round 2: remaining sprites redrawn, light boards made dark | [game-redesign-all.md](game-redesign-all.md) |
| Puzzle gallery | Images for the cube solver puzzles | [puzzle-gallery.md](puzzle-gallery.md) |

## File map

```
index.html                 landing page (hero, featured, demos, games, puzzles)
howto/*.md                 70 how-to-play guides (source of truth)
tools/build-howto.js       bundles howto/*.md into games/howto-data.js
games/howto.js             overlay, fit/fullscreen, auto-play (loaded by every game)
games/howto-data.js        generated; do not edit by hand
games/theme.css            portfolio theme for all game pages
demos/engine-theme.css     portfolio theme for the 8 demos
demos/engine-motion.js     reveal / glow motion for the demos
demos/engine-live.js       autopilot for the demos
tools/palette.js, reskin-*.js/py  colour + sprite re-skin scripts (run once)
thumbs/*.jpg, *.svg        game screenshots and puzzle images
docs/features/*.md         these docs
```
