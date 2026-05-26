import { Player } from './player.js';
import { BulletPool } from './bullets.js';
import { ParticleSystem } from './enemies.js';
import { WaveSpawner, LEVEL_COUNT } from './waves.js';
import {
  drawBackground, drawHUD, drawLevelComplete,
  drawGameOver, drawWin
} from './ui.js';

const SCORE_TABLE = { walker: 100, flanker: 150, brute: 400 };
const WAVE_BONUS = 500;
const LEVEL_BONUS = 1000;

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.keys = {};
    this.mouse = { x: 400, y: 300, down: false };
    this.reset();
    this._bindInput();
  }

  reset() {
    this.player = new Player(400, 300);
    this.bullets = new BulletPool();
    this.particles = new ParticleSystem();
    this.levelIndex = 0;
    this.score = 0;
    this.spawner = new WaveSpawner(this.levelIndex);
    this.state = 'playing'; // 'playing' | 'levelComplete' | 'gameOver' | 'win'
    this.transitionTimer = 0;
  }

  _bindInput() {
    window.addEventListener('keydown', e => { this.keys[e.key] = true; });
    window.addEventListener('keyup',   e => { this.keys[e.key] = false; });
    this.canvas.addEventListener('mousemove', e => {
      const r = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - r.left;
      this.mouse.y = e.clientY - r.top;
    });
    this.canvas.addEventListener('mousedown', e => { if (e.button === 0) this.mouse.down = true; });
    this.canvas.addEventListener('mouseup',   e => { if (e.button === 0) this.mouse.down = false; });
  }

  onKill(enemy) {
    this.score += SCORE_TABLE[enemy.type] ?? 0;
    const color = enemy.type === 'brute' ? '#c0392b' : enemy.type === 'flanker' ? '#9b59b6' : '#3d7a3d';
    this.particles.burst(enemy.x, enemy.y, color);
  }

  update(dt) {
    if (this.state === 'playing') {
      this.player.update(dt, this.keys, this.mouse, this.bullets);
      this.spawner.update(dt);
      this.bullets.update(dt, this.spawner.enemies, e => this.onKill(e));
      this.particles.update(dt);

      // Enemy contact
      for (const e of this.spawner.enemies) {
        if (!e.alive) continue;
        e.update(dt, this.player.x, this.player.y);
        const dx = this.player.x - e.x, dy = this.player.y - e.y;
        if (Math.hypot(dx, dy) < e.radius + 10) {
          if (this.player.hit()) {
            // Knock enemy back
            const d = Math.hypot(dx, dy) || 1;
            e.x -= (dx / d) * 30;
            e.y -= (dy / d) * 30;
          }
        }
      }

      if (this.player.hp <= 0) {
        this.state = 'gameOver';
      } else if (this.spawner.done) {
        this.score += WAVE_BONUS;
        this.score += LEVEL_BONUS;
        this.state = 'levelComplete';
        this.transitionTimer = 0;
      }

    } else if (this.state === 'levelComplete') {
      this.transitionTimer += dt;
      if (this.transitionTimer > 2.5 && this.keys['Enter']) {
        this._nextLevel();
      }
    }
  }

  _nextLevel() {
    this.levelIndex++;
    if (this.levelIndex >= LEVEL_COUNT) {
      this.state = 'win';
    } else {
      this.spawner = new WaveSpawner(this.levelIndex);
      this.player.hp = this.player.maxHp; // restore health between levels
      this.state = 'playing';
    }
  }

  draw() {
    const ctx = this.ctx;
    drawBackground(ctx);

    if (this.state === 'playing' || this.state === 'levelComplete') {
      // Draw enemies
      for (const e of this.spawner.enemies) e.draw(ctx);
      this.bullets.draw(ctx);
      this.particles.draw(ctx);
      this.player.draw(ctx);
      drawHUD(ctx, this.player, this.spawner, this.levelIndex + 1, this.score);
    }

    if (this.state === 'levelComplete') {
      drawLevelComplete(ctx, this.levelIndex + 1, this.score);
    } else if (this.state === 'gameOver') {
      drawGameOver(ctx, this.score);
    } else if (this.state === 'win') {
      drawWin(ctx, this.score);
    }
  }

  handleEnter() {
    if (this.state === 'gameOver') this.reset();
    else if (this.state === 'win') this.reset();
    else if (this.state === 'levelComplete' && this.transitionTimer > 0.5) this._nextLevel();
  }
}
