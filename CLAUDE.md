# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the Games

Both games are zero-dependency static HTML — no build step, no package manager.

**Tic-tac-toe:** Open `index.html` directly in a browser (`file://` works fine).

**SECTOR ZERO shooter:** Must be served over HTTP because it uses ES modules (`type="module"`).

```
npx serve shooter
# then open http://localhost:3000
```

## Repository Structure

```
index.html          — standalone tic-tac-toe game (single file, no JS imports)
shooter/            — SECTOR ZERO top-down shooter
  index.html        — canvas shell, loads js/main.js as module entry point
  style.css
  js/
    main.js         — top-level state machine: 'menu' | 'game'; owns the rAF loop
    game.js         — Game class: inner state machine, update/draw orchestration
    player.js       — Player class: movement, aiming, shooting, iframes
    enemies.js      — Walker, Flanker, Brute classes + ParticleSystem
    bullets.js      — BulletPool (fixed pool of 60, reused)
    waves.js        — WaveSpawner + LEVELS config (3 levels × N waves)
    sprites.js      — All pixel-art drawing via ctx.fillRect at 2× scale
    ui.js           — drawMenu, drawHUD, drawLevelComplete, drawGameOver, drawWin
```

## Shooter Architecture

**Two-level state machine:**
- `main.js` owns `'menu'` vs `'game'` — Enter key transitions from menu into a new `Game` instance
- `game.js` (`Game` class) owns `'playing'` | `'levelComplete'` | `'gameOver'` | `'win'`

**Game loop:** `requestAnimationFrame` in `main.js`, delta-time capped at 50ms, passed into `game.update(dt)` then `game.draw()`.

**Adding a new enemy type:** Define a class extending `Enemy` in `enemies.js`, add it to the `LEVELS` wave config in `waves.js`. The spawner, bullet collision, and particle system all work off the shared `{ alive, hp, x, y, radius, type }` shape.

**Sprites:** `sprites.js` exports one draw function per entity. All drawing uses `ctx.fillRect` on a virtual pixel grid at scale factor `S = 2`. Sprites are centered at `(cx, cy)` using `withTransform` (save/translate/rotate/restore).

**Scoring constants** live in `game.js` (`SCORE_TABLE`, `WAVE_BONUS`, `LEVEL_BONUS`).

**Wave progression:** `WaveSpawner` in `waves.js` — enemies are queued and spawned one at a time at `spawnInterval` (0.5s). A wave clears when the queue is empty and all enemies are dead. A 2s pause (`betweenTimer`) separates waves.

## Git Workflow

This project uses Git with commits pushed to GitHub after every meaningful change. Commit messages follow the pattern `type: short description` (e.g. `feat:`, `fix:`, `chore:`).
