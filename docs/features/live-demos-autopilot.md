# Live demos (autopilot)

Each of the 8 portfolio demos in `demos/` runs itself the moment it loads, so a visitor sees it working without touching anything.

- **Code:** `demos/engine-live.js` (loaded with `defer` by every demo page, after `engine-motion.js`).
- **How it works:** it drives the demo's *own* controls (sliders and buttons) from a timer, so the demo logic is unchanged.
- **Badge:** a **● LIVE · autopilot** pill sits bottom-right with an uptime clock.
  - Click it to switch autopilot off or on.
  - It reads **PAUSED · you have control** while you interact.
- **Hand-over:** any real click, key press, scroll or slider drag pauses the autopilot. It resumes after 9 seconds without input.
- **Reduced motion:** if the visitor's system asks for reduced motion, autopilot starts switched off.
- **Hidden tab:** nothing runs while the tab is hidden.

## What each demo does on its own

| Demo | Autopilot behaviour |
| --- | --- |
| Mesh Weight | Sweeps the instance-count slider up and down (about 16 s per cycle) and cycles the mesh-complexity buttons every 7 s |
| Room Fit | Slowly changes room width and depth, clicks *Shuffle Layout* every 5 s and switches Bedroom / Living Room every 14 s |
| Shop Sync | Adds three shoppers at start, then adds or removes one every ~2.6 s so the multiplayer log keeps moving |
| Talk Loop | When the avatar is idle, sends a random preset phrase every ~7.5 s so the mic → STT → API → TTS pipeline and lip-sync keep playing |
| Block Runner | Clears the program, builds a random 3–5 block program, presses *Run*, waits for the robot to finish, then repeats |
| Exposure Room | Sweeps the intensity slider and cycles the scenario buttons every 11 s |
| Rig Console | Moves the pump slider and starts a recording session after ~2.5 s |
| Advergame Set | Starts the catch game, steers the paddle toward the lowest falling drop, and switches game cabinet every 16 s |

## Add autopilot to a new demo

1. Add `<script src="engine-live.js" defer></script>` to the page.
2. Add an entry to `PILOTS` in `engine-live.js`, keyed by the file name without `.html`. It returns a function that is called about 20 times a second with the elapsed milliseconds.
3. Use the helpers: `setRange(el, 0..1)`, `click(el)`, `cycle(selector, state)`, `every(ms, fn)` and `wave(t, period)`.
