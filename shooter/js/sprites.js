// All pixel art drawn via fillRect — no images.
// Sprites are defined on a small pixel grid then rendered at 2x scale.

const S = 2; // scale factor

function px(ctx, color, gx, gy, w = 1, h = 1) {
  ctx.fillStyle = color;
  ctx.fillRect(gx * S, gy * S, w * S, h * S);
}

// Draw centered at (cx, cy), rotated by angle radians
function withTransform(ctx, cx, cy, angle, fn) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  fn();
  ctx.restore();
}

export function drawPlayer(ctx, cx, cy, angle, frame, flashRed) {
  withTransform(ctx, cx, cy, angle, () => {
    const c = flashRed ? '#ff4444' : '#7ec8e3';
    const skin = flashRed ? '#ff8888' : '#f4c89a';
    const gun = flashRed ? '#ff4444' : '#aaaaaa';

    // Body (centered: -4 to +4 on x, -8 to +8 on y at 1px scale)
    // Head
    px(ctx, skin, -2, -8, 4, 3);
    // Torso
    px(ctx, c, -3, -5, 6, 5);
    // Legs — frame 0 or 1 for walk
    if (frame === 0) {
      px(ctx, '#3a5f8a', -3, 0, 2, 4);
      px(ctx, '#3a5f8a', 1, 0, 2, 4);
    } else {
      px(ctx, '#3a5f8a', -3, 1, 2, 4);
      px(ctx, '#3a5f8a', 1, -1, 2, 4);
    }
    // Gun arm (points right = forward direction)
    px(ctx, skin, 3, -4, 2, 2);
    px(ctx, gun, 5, -4, 4, 2);
  });
}

export function drawWalker(ctx, cx, cy, frame) {
  const angle = 0;
  withTransform(ctx, cx, cy, angle, () => {
    // Shambling zombie silhouette — green tones
    const body = '#3d7a3d';
    const dark = '#254d25';
    const eye = '#ff3333';

    // Head
    px(ctx, body, -3, -7, 6, 5);
    px(ctx, eye, -1, -6, 1, 1);
    px(ctx, eye, 2, -6, 1, 1);
    // Torso
    px(ctx, dark, -3, -2, 6, 4);
    // Arms (one raised for shamble)
    if (frame === 0) {
      px(ctx, body, -5, -4, 2, 3);
      px(ctx, body, 3, -6, 2, 3);
    } else {
      px(ctx, body, -5, -6, 2, 3);
      px(ctx, body, 3, -4, 2, 3);
    }
    // Legs
    px(ctx, dark, -3, 2, 2, 4);
    px(ctx, dark, 1, 2, 2, 4);
  });
}

export function drawFlanker(ctx, cx, cy, frame) {
  withTransform(ctx, cx, cy, 0, () => {
    // Slim, crouched purple runner
    const c = '#9b59b6';
    const dark = '#6c3483';
    const eye = '#00ffff';

    // Head (small)
    px(ctx, c, -2, -6, 4, 3);
    px(ctx, eye, 0, -5, 1, 1);
    // Crouched torso
    px(ctx, dark, -3, -3, 6, 3);
    // Legs — exaggerated run
    if (frame === 0) {
      px(ctx, c, -3, 0, 2, 5);
      px(ctx, c, 1, 1, 2, 4);
    } else {
      px(ctx, c, -3, 1, 2, 4);
      px(ctx, c, 1, 0, 2, 5);
    }
  });
}

export function drawBrute(ctx, cx, cy, frame) {
  withTransform(ctx, cx, cy, 0, () => {
    // Wide, hulking red figure
    const c = '#c0392b';
    const dark = '#922b21';
    const armor = '#555';

    // Head
    px(ctx, c, -4, -10, 8, 6);
    px(ctx, '#ff0000', -2, -8, 2, 2);
    px(ctx, '#ff0000', 2, -8, 2, 2);
    // Torso
    px(ctx, dark, -5, -4, 10, 6);
    px(ctx, armor, -4, -3, 8, 4);
    // Arms — breathing bob
    const yoff = frame === 0 ? 0 : 1;
    px(ctx, c, -8, -4 + yoff, 3, 5);
    px(ctx, c, 5, -4 + yoff, 3, 5);
    // Legs
    px(ctx, dark, -4, 2, 3, 5);
    px(ctx, dark, 1, 2, 3, 5);
  });
}

export function drawBullet(ctx, cx, cy) {
  ctx.save();
  ctx.shadowColor = '#ffff88';
  ctx.shadowBlur = 8;
  ctx.fillStyle = '#ffff00';
  ctx.beginPath();
  ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawParticle(ctx, p) {
  ctx.globalAlpha = p.life / p.maxLife;
  ctx.fillStyle = p.color;
  ctx.fillRect(p.x, p.y, 4, 4);
  ctx.globalAlpha = 1;
}

export function drawHeart(ctx, cx, cy, filled) {
  ctx.fillStyle = filled ? '#e74c3c' : '#444';
  // Simple pixel heart
  const offsets = [
    [-3,-2],[-2,-3],[-1,-3],[0,-2],[1,-3],[2,-3],[3,-2],
    [-3,-1],[-2,-1],[-1,-1],[0,-1],[1,-1],[2,-1],[3,-1],
    [-2,0],[-1,0],[0,0],[1,0],[2,0],
    [-1,1],[0,1],[1,1],
    [0,2],
  ];
  for (const [dx, dy] of offsets) {
    ctx.fillRect(cx + dx * 2, cy + dy * 2, 2, 2);
  }
}
