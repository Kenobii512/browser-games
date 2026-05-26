import { drawHeart } from './sprites.js';

const W = 800, H = 600;

function retro(ctx, text, x, y, size, color, align = 'center') {
  ctx.font = `bold ${size}px monospace`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
}

function dim(ctx, alpha = 0.6) {
  ctx.fillStyle = `rgba(0,0,0,${alpha})`;
  ctx.fillRect(0, 0, W, H);
}

export function drawMenu(ctx, blink) {
  dim(ctx, 1);

  // Title glow
  ctx.shadowColor = '#00ffff';
  ctx.shadowBlur = 30;
  retro(ctx, 'SECTOR ZERO', W / 2, 200, 72, '#00ffff');
  ctx.shadowBlur = 0;

  retro(ctx, 'Arrow keys to move  ·  Mouse to aim  ·  Click to shoot', W / 2, 280, 18, '#7ec8e3');

  if (blink) retro(ctx, 'PRESS ENTER TO START', W / 2, 380, 26, '#ffffff');

  retro(ctx, 'v1.0', W / 2, H - 20, 14, '#333');
}

export function drawHUD(ctx, player, spawner, levelNum, score) {
  // Hearts
  for (let i = 0; i < player.maxHp; i++) {
    drawHeart(ctx, 30 + i * 30, 28, i < player.hp);
  }

  // Level + wave
  retro(ctx, `LEVEL ${levelNum}`, W / 2, 22, 18, '#ffffff');
  if (spawner.betweenWave) {
    retro(ctx, 'WAVE CLEAR!', W / 2, 46, 14, '#00ff88');
  } else {
    retro(ctx, `WAVE ${spawner.currentWave} / ${spawner.totalWaves}`, W / 2, 46, 14, '#aaaaaa');
  }

  // Score
  retro(ctx, `SCORE  ${score}`, W - 20, 22, 18, '#ffff00', 'right');
}

export function drawWaveAnnounce(ctx, waveNum, total) {
  retro(ctx, `WAVE ${waveNum} / ${total}`, W / 2, H / 2, 36, '#ffffff');
}

export function drawLevelComplete(ctx, levelNum, score) {
  dim(ctx, 0.7);
  ctx.shadowColor = '#00ff88';
  ctx.shadowBlur = 20;
  retro(ctx, `LEVEL ${levelNum} COMPLETE`, W / 2, H / 2 - 40, 48, '#00ff88');
  ctx.shadowBlur = 0;
  retro(ctx, `SCORE: ${score}`, W / 2, H / 2 + 20, 28, '#ffffff');
  retro(ctx, 'PRESS ENTER TO CONTINUE', W / 2, H / 2 + 70, 20, '#aaaaaa');
}

export function drawGameOver(ctx, score) {
  dim(ctx, 0.8);
  ctx.shadowColor = '#e74c3c';
  ctx.shadowBlur = 30;
  retro(ctx, 'GAME OVER', W / 2, H / 2 - 40, 64, '#e74c3c');
  ctx.shadowBlur = 0;
  retro(ctx, `SCORE: ${score}`, W / 2, H / 2 + 20, 28, '#ffffff');
  retro(ctx, 'PRESS ENTER TO RETRY', W / 2, H / 2 + 70, 22, '#aaaaaa');
}

export function drawWin(ctx, score) {
  dim(ctx, 0.8);
  ctx.shadowColor = '#f1c40f';
  ctx.shadowBlur = 30;
  retro(ctx, 'YOU WIN!', W / 2, H / 2 - 50, 72, '#f1c40f');
  ctx.shadowBlur = 0;
  retro(ctx, `FINAL SCORE: ${score}`, W / 2, H / 2 + 20, 30, '#ffffff');
  retro(ctx, 'PRESS ENTER TO PLAY AGAIN', W / 2, H / 2 + 80, 22, '#aaaaaa');
}

export function drawBackground(ctx) {
  ctx.fillStyle = '#0d0d1a';
  ctx.fillRect(0, 0, W, H);
  // Subtle grid
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
}
