import { drawWalker, drawFlanker, drawBrute, drawParticle } from './sprites.js';

function spawnEdge() {
  const side = Math.floor(Math.random() * 4);
  if (side === 0) return { x: Math.random() * 800, y: -20 };
  if (side === 1) return { x: 820, y: Math.random() * 600 };
  if (side === 2) return { x: Math.random() * 800, y: 620 };
  return { x: -20, y: Math.random() * 600 };
}

class Enemy {
  constructor(type, x, y, hp, speed, radius, score) {
    this.type = type;
    this.x = x; this.y = y;
    this.hp = hp; this.maxHp = hp;
    this.speed = speed;
    this.radius = radius;
    this.score = score;
    this.alive = true;
    this.frameTimer = 0;
    this.frame = 0;
  }

  tickFrame(dt) {
    this.frameTimer += dt;
    if (this.frameTimer > 0.25) { this.frame ^= 1; this.frameTimer = 0; }
  }
}

export class Walker extends Enemy {
  constructor() {
    const p = spawnEdge();
    super('walker', p.x, p.y, 1, 70, 12, 100);
  }
  update(dt, px, py) {
    this.tickFrame(dt);
    const dx = px - this.x, dy = py - this.y;
    const d = Math.hypot(dx, dy) || 1;
    this.x += (dx / d) * this.speed * dt;
    this.y += (dy / d) * this.speed * dt;
  }
  draw(ctx) { drawWalker(ctx, this.x, this.y, this.frame); }
}

export class Flanker extends Enemy {
  constructor() {
    const p = spawnEdge();
    super('flanker', p.x, p.y, 1, 140, 10, 150);
    this.orbitAngle = Math.random() * Math.PI * 2;
    this.orbitRadius = 130 + Math.random() * 40;
    this.dashing = false;
    this.dashTimer = 0;
    this.dashInterval = 2 + Math.random() * 2;
  }
  update(dt, px, py) {
    this.tickFrame(dt);
    const dx = px - this.x, dy = py - this.y;
    const dist = Math.hypot(dx, dy) || 1;

    this.dashTimer += dt;
    if (this.dashTimer > this.dashInterval) {
      this.dashing = true;
      setTimeout(() => { this.dashing = false; this.dashTimer = 0; }, 500);
      this.dashTimer = 0;
    }

    if (this.dashing || dist > this.orbitRadius * 1.5) {
      // Rush toward player
      this.x += (dx / dist) * this.speed * dt;
      this.y += (dy / dist) * this.speed * dt;
    } else {
      // Orbit
      this.orbitAngle += dt * 1.2;
      const tx = px + Math.cos(this.orbitAngle) * this.orbitRadius;
      const ty = py + Math.sin(this.orbitAngle) * this.orbitRadius;
      const ox = tx - this.x, oy = ty - this.y;
      const od = Math.hypot(ox, oy) || 1;
      this.x += (ox / od) * this.speed * dt;
      this.y += (oy / od) * this.speed * dt;
    }
  }
  draw(ctx) { drawFlanker(ctx, this.x, this.y, this.frame); }
}

export class Brute extends Enemy {
  constructor() {
    const p = spawnEdge();
    super('brute', p.x, p.y, 4, 45, 18, 400);
  }
  update(dt, px, py) {
    this.tickFrame(dt);
    const dx = px - this.x, dy = py - this.y;
    const d = Math.hypot(dx, dy) || 1;
    this.x += (dx / d) * this.speed * dt;
    this.y += (dy / d) * this.speed * dt;
  }
  draw(ctx) { drawBrute(ctx, this.x, this.y, this.frame); }
}

export class ParticleSystem {
  constructor() { this.particles = []; }

  burst(x, y, color) {
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 40 + Math.random() * 80;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 0.4, maxLife: 0.4,
        color
      });
    }
  }

  update(dt) {
    for (const p of this.particles) p.life -= dt, p.x += p.vx * dt, p.y += p.vy * dt;
    this.particles = this.particles.filter(p => p.life > 0);
  }

  draw(ctx) {
    for (const p of this.particles) drawParticle(ctx, p);
  }
}
