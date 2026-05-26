import { Game } from './game.js';
import { drawMenu } from './ui.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let state = 'menu'; // 'menu' | 'game'
let game = null;
let blinkTimer = 0;
let blink = true;
let lastTime = 0;

window.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    if (state === 'menu') {
      state = 'game';
      game = new Game(canvas);
    } else if (game) {
      game.handleEnter();
    }
  }
  // Prevent arrow key scrolling
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
    e.preventDefault();
  }
});

function loop(ts) {
  const dt = Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;

  if (state === 'menu') {
    blinkTimer += dt;
    if (blinkTimer > 0.5) { blink = !blink; blinkTimer = 0; }
    drawMenu(ctx, blink);
  } else if (game) {
    game.update(dt);
    game.draw();
  }

  requestAnimationFrame(loop);
}

requestAnimationFrame(ts => { lastTime = ts; requestAnimationFrame(loop); });
