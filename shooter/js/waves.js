import { Walker, Flanker, Brute } from './enemies.js';

// Each wave: array of {ctor, count}
const LEVELS = [
  {
    waves: [
      [{ ctor: Walker, count: 5 }],
      [{ ctor: Walker, count: 8 }],
      [{ ctor: Walker, count: 10 }],
    ]
  },
  {
    waves: [
      [{ ctor: Walker, count: 6 }, { ctor: Flanker, count: 2 }],
      [{ ctor: Walker, count: 5 }, { ctor: Flanker, count: 4 }],
      [{ ctor: Walker, count: 4 }, { ctor: Flanker, count: 6 }],
    ]
  },
  {
    waves: [
      [{ ctor: Walker, count: 6 }, { ctor: Flanker, count: 2 }, { ctor: Brute, count: 1 }],
      [{ ctor: Walker, count: 5 }, { ctor: Flanker, count: 4 }, { ctor: Brute, count: 1 }],
      [{ ctor: Walker, count: 4 }, { ctor: Flanker, count: 4 }, { ctor: Brute, count: 2 }],
      [{ ctor: Flanker, count: 6 }, { ctor: Brute, count: 2 }],
    ]
  }
];

export const LEVEL_COUNT = LEVELS.length;

export class WaveSpawner {
  constructor(levelIndex) {
    this.levelData = LEVELS[levelIndex];
    this.waveIndex = 0;
    this.enemies = [];
    this.spawnQueue = [];
    this.spawnTimer = 0;
    this.spawnInterval = 0.5;
    this.betweenWave = false;
    this.betweenTimer = 0;
    this.done = false;
    this._loadWave();
  }

  get totalWaves() { return this.levelData.waves.length; }
  get currentWave() { return this.waveIndex + 1; }

  _loadWave() {
    this.spawnQueue = [];
    for (const { ctor, count } of this.levelData.waves[this.waveIndex]) {
      for (let i = 0; i < count; i++) this.spawnQueue.push(ctor);
    }
    // Shuffle
    for (let i = this.spawnQueue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.spawnQueue[i], this.spawnQueue[j]] = [this.spawnQueue[j], this.spawnQueue[i]];
    }
    this.spawnTimer = 0;
  }

  update(dt) {
    if (this.done) return;

    if (this.betweenWave) {
      this.betweenTimer -= dt;
      if (this.betweenTimer <= 0) {
        this.betweenWave = false;
        this._loadWave();
      }
      return;
    }

    // Spawn queued enemies
    if (this.spawnQueue.length > 0) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        const Ctor = this.spawnQueue.shift();
        this.enemies.push(new Ctor());
        this.spawnTimer = this.spawnInterval;
      }
    }

    // Clean dead
    this.enemies = this.enemies.filter(e => e.alive);

    // Wave cleared?
    if (this.spawnQueue.length === 0 && this.enemies.length === 0) {
      this.waveIndex++;
      if (this.waveIndex >= this.levelData.waves.length) {
        this.done = true;
      } else {
        this.betweenWave = true;
        this.betweenTimer = 2.0;
      }
    }
  }
}
