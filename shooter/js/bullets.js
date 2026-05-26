import { drawBullet } from './sprites.js';

const POOL_SIZE = 60;
const SPEED = 500;

export class BulletPool {
  constructor() {
    this.bullets = Array.from({ length: POOL_SIZE }, () => ({ active: false, x: 0, y: 0, vx: 0, vy: 0 }));
  }

  fire(x, y, angle) {
    const b = this.bullets.find(b => !b.active);
    if (!b) return;
    b.active = true;
    b.x = x;
    b.y = y;
    b.vx = Math.cos(angle) * SPEED;
    b.vy = Math.sin(angle) * SPEED;
  }

  update(dt, enemies, onKill) {
    for (const b of this.bullets) {
      if (!b.active) continue;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.x < 0 || b.x > 800 || b.y < 0 || b.y > 600) {
        b.active = false;
        continue;
      }
      for (const e of enemies) {
        if (!e.alive) continue;
        const dx = b.x - e.x, dy = b.y - e.y;
        if (Math.hypot(dx, dy) < e.radius) {
          b.active = false;
          e.hp--;
          if (e.hp <= 0) {
            e.alive = false;
            onKill(e);
          }
          break;
        }
      }
    }
  }

  draw(ctx) {
    for (const b of this.bullets) {
      if (b.active) drawBullet(ctx, b.x, b.y);
    }
  }
}
