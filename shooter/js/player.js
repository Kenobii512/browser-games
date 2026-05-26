import { drawPlayer } from './sprites.js';

const SPEED = 180;
const SHOOT_COOLDOWN = 0.25;
const IFRAMES = 1.0;

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.hp = 3;
    this.maxHp = 3;
    this.shootTimer = 0;
    this.iframeTimer = 0;
    this.frameTimer = 0;
    this.frame = 0;
    this.moving = false;
    this.flashTimer = 0;
  }

  update(dt, keys, mouse, bullets) {
    // Movement
    let dx = 0, dy = 0;
    if (keys['ArrowLeft'])  dx -= 1;
    if (keys['ArrowRight']) dx += 1;
    if (keys['ArrowUp'])    dy -= 1;
    if (keys['ArrowDown'])  dy += 1;
    this.moving = dx !== 0 || dy !== 0;
    if (this.moving) {
      const len = Math.hypot(dx, dy);
      this.x += (dx / len) * SPEED * dt;
      this.y += (dy / len) * SPEED * dt;
      this.x = Math.max(10, Math.min(790, this.x));
      this.y = Math.max(10, Math.min(590, this.y));
      this.frameTimer += dt;
      if (this.frameTimer > 0.2) { this.frame ^= 1; this.frameTimer = 0; }
    }

    // Aim
    this.angle = Math.atan2(mouse.y - this.y, mouse.x - this.x);

    // Shoot
    this.shootTimer -= dt;
    if (mouse.down && this.shootTimer <= 0) {
      bullets.fire(this.x, this.y, this.angle);
      this.shootTimer = SHOOT_COOLDOWN;
    }

    // Timers
    this.iframeTimer = Math.max(0, this.iframeTimer - dt);
    this.flashTimer = Math.max(0, this.flashTimer - dt);
  }

  hit() {
    if (this.iframeTimer > 0) return false;
    this.hp--;
    this.iframeTimer = IFRAMES;
    this.flashTimer = 0.15;
    return true;
  }

  draw(ctx) {
    drawPlayer(ctx, this.x, this.y, this.angle, this.frame, this.flashTimer > 0);
  }
}
