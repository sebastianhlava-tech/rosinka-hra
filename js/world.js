// Svět na Canvasu: chůze, skok, překážky, hvězdy, dárky, vylepšení a čas hry.
import { artSvg, loadImage } from './art.js';
import { BIOMES } from './biomes.js';

const VIEW_H = 800;
const GROUND = 650;
const HERO_X = 260;
const HERO_W = 150;
const HERO_H = 240;
const JUMP = 760;
const GRAVITY = 1100;
const HIT_LEFT = 50;
const HIT_RIGHT = 100;
const GIFT_FIRST = 1600;
const GIFT_GAP = [4800, 6400];
const BUMP_WAIT = 3;
const FLAP = 470;
const FLY_GRAVITY = 950;
const FLY_FALL = 430;
const FLY_TOP = 400;
const BIOME_LENGTH = 7000;
const FADE_TIME = 2;
const STAR_GAP = 1100;
const MAGNET_REACH = 460;
const MAX_SPARKS = 120;
const FRIEND_PLACES = [-130, -235, 170];
const ART = [...new Set(BIOMES.flatMap((b) => [b.decor, ...b.obstacles.map((o) => o.art)]))];
const RAINBOW = ['#E23B3B', '#FF8A1F', '#FFD432', '#3DAA4E', '#2F6FDE', '#8E4EC6'];

const between = ([a, b]) => a + Math.random() * (b - a);

// Hotový obrázek v paměti. iPad ho kreslí rychleji než SVG.
function bake(img) {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  canvas.getContext('2d').drawImage(img, 0, 0, 400, 400);
  return canvas;
}

export class World {
  constructor(canvas, handlers) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.handlers = handlers;
    this.friends = [];
    this.images = {};
    this.running = false;
    this.paused = false;
    this.last = 0;
    this.resize();
    addEventListener('resize', () => this.resize());
    canvas.addEventListener('pointerdown', (e) => { e.preventDefault(); this.tap(); });
  }

  async load(characterMarkup) {
    this.hero = await loadImage(characterMarkup);
    if (this.images.gift) return;
    await Promise.all([...ART, 'gift', 'star', 'bird', 'flower'].map(async (key) => {
      this.images[key] = bake(await loadImage(artSvg(key)));
    }));
  }

  resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    this.canvas.width = innerWidth * dpr;
    this.canvas.height = innerHeight * dpr;
    this.scale = this.canvas.height / VIEW_H;
    this.viewW = this.canvas.width / this.scale;
  }

  start(minutes, level, difficulty) {
    this.level = level;
    this.difficulty = difficulty;
    this.limit = minutes ? minutes * 60 : Infinity;
    this.elapsed = 0;
    this.dist = 0;
    this.state = 'walk';
    this.y = 0;
    this.vy = 0;
    this.size = 1;
    this.upgrades = new Set();
    this.friends = [];
    this.trail = [];
    this.flowers = [];
    this.sparks = [];
    this.bumpLeft = 0;
    this.stones = [];
    this.birds = [];
    this.stars = [];
    this.gift = null;
    this.nextStone = 800;
    this.nextGift = GIFT_FIRST;
    this.nextStar = 1000;
    this.nextFlower = 0;
    this.biome = 0;
    this.oldBiome = null;
    this.fade = 0;
    this.running = true;
    this.paused = false;
    this.last = performance.now();
    requestAnimationFrame((t) => this.frame(t));
  }

  stop() {
    this.running = false;
  }

  setLevel(level) {
    this.level = level;
  }

  has(kind) {
    return this.upgrades?.has(kind);
  }

  owned() {
    return [...(this.upgrades ?? [])];
  }

  tap() {
    if (!this.running || this.paused) return;
    if (this.has('music')) this.handlers.onNote();
    if (this.state === 'bump') return this.hop();
    if (this.state !== 'walk') return;
    if (this.has('fly')) this.vy = FLAP;
    else if (this.y === 0) this.vy = JUMP;
  }

  hop() {
    this.state = 'walk';
    this.vy = this.has('fly') ? FLAP : JUMP;
  }

  resumeAfterQuestion() {
    this.state = 'walk';
  }

  async giveUpgrade(kind, friendArt, maxFriends) {
    if (kind === 'party') this.burst();
    else this.upgrades.add(kind);
    if (kind === 'friend' && this.friends.length < maxFriends) this.friends.push(await loadImage(artSvg(friendArt)));
  }

  spark(x, y, colour, size = 7, life = 0.9) {
    if (this.sparks.length >= MAX_SPARKS) this.sparks.shift();
    this.sparks.push({ x, y, vx: (Math.random() - 0.5) * 160, vy: -60 - Math.random() * 120, colour, size, life, age: 0 });
  }

  burst() {
    for (let i = 0; i < 50; i++) this.spark(this.dist + 200 + Math.random() * 500, 200 + Math.random() * 200, RAINBOW[i % 6], 9, 1.6);
  }

  stoneGap() {
    return (1500 - this.level * 55) * this.difficulty.gap * (0.85 + Math.random() * 0.3);
  }

  spawn() {
    const edge = this.dist + this.viewW + 150;
    if (edge >= this.nextGift) {
      this.gift = { x: this.nextGift, y: 0 };
      this.nextGift += between(GIFT_GAP);
    }
    if (edge >= this.nextStone) {
      const free = Math.abs(this.nextStone - (this.gift?.x ?? -9999)) > 400 && Math.abs(this.nextStone - this.nextGift) > 400;
      if (free) {
        const list = BIOMES[this.biome].obstacles;
        const kind = list[Math.floor(Math.random() * list.length)];
        const grow = 1 + this.level * 0.015;
        this.stones.push({ x: this.nextStone, art: kind.art, w: kind.w * grow, h: kind.h * grow, done: false });
        if (Math.random() < this.difficulty.birds) this.birds.push({ x: this.nextStone + 300, a: 300 + Math.random() * 90, done: false });
      }
      this.nextStone += this.stoneGap();
    }
    if (edge >= this.nextStar) {
      const low = 270 + Math.random() * 110;
      for (let i = 0; i < 5; i++) this.stars.push({ x: this.nextStar + i * 90, a: low + Math.sin(i * 0.8) * 50 });
      this.nextStar += STAR_GAP;
    }
    this.stones = this.stones.filter((s) => s.x > this.dist - 200);
    this.birds = this.birds.filter((b) => b.x > this.dist - 200);
  }

  moveHero(dt) {
    if (this.has('fly')) {
      this.vy = Math.max(this.vy - FLY_GRAVITY * dt, -FLY_FALL);
      this.y += this.vy * dt;
      if (this.y > FLY_TOP) { this.y = FLY_TOP; this.vy = 0; }
      if (this.y < 0) { this.y = 0; this.vy = 0; }
      return;
    }
    if (this.y > 0 || this.vy > 0) {
      this.vy -= GRAVITY * dt;
      this.y = Math.max(0, this.y + this.vy * dt);
      if (this.y === 0) this.vy = 0;
    }
  }

  checkStones() {
    const left = this.dist + HERO_X;
    for (const s of this.stones) {
      if (s.done) continue;
      const touching = left + HIT_RIGHT >= s.x + 8 && left + HIT_LEFT <= s.x + s.w - 8;
      if (s.x + s.w < left + HIT_LEFT) s.done = true;
      if (touching && this.y < s.h - 22) {
        s.done = true;
        if (this.has('bubble')) {
          for (let i = 0; i < 8; i++) this.spark(s.x + s.w / 2, GROUND - s.h, '#9BD6F2');
          continue;
        }
        this.vy = 0;
        this.y = 0;
        this.state = 'bump';
        this.bumpLeft = BUMP_WAIT;
        this.handlers.onBump();
        return;
      }
    }
  }

  checkBirds() {
    const left = this.dist + HERO_X;
    for (const b of this.birds) {
      if (b.done || this.has('bubble')) continue;
      const near = left + HIT_RIGHT >= b.x && left + HIT_LEFT <= b.x + 90;
      if (near && b.a > this.y && b.a < this.y + HERO_H) {
        b.done = true;
        this.vy = -180;
        this.handlers.onNote?.();
      }
    }
  }

  checkStars(dt) {
    const x = this.dist + HERO_X + HERO_W / 2;
    const a = this.y + HERO_H / 2;
    this.stars = this.stars.filter((s) => {
      if (s.x < this.dist - 100) return false;
      const dx = x - s.x;
      const dy = a - s.a;
      if (this.has('magnet') && Math.hypot(dx, dy) < MAGNET_REACH) {
        s.x += dx * Math.min(1, dt * 5);
        s.a += dy * Math.min(1, dt * 5);
      }
      if (Math.abs(dx) > 90 || Math.abs(dy) > 130) return true;
      this.handlers.onStar();
      for (let i = 0; i < 5; i++) this.spark(s.x, GROUND - s.a, '#FFD432');
      return false;
    });
  }

  checkGift() {
    const heroRight = this.dist + HERO_X + HERO_W - 20;
    if (this.gift && heroRight >= this.gift.x) {
      this.gift = null;
      this.state = 'question';
      this.handlers.onGift();
    }
  }

  changeBiome() {
    const next = Math.floor(this.dist / BIOME_LENGTH) % BIOMES.length;
    if (next === this.biome) return;
    this.oldBiome = this.biome;
    this.biome = next;
    this.fade = FADE_TIME;
    this.handlers.onBiome(BIOMES[next].id);
  }

  growFlowers() {
    if (!this.has('flowers') || this.y > 0 || this.dist < this.nextFlower) return;
    this.flowers.push({ x: this.dist + HERO_X + 20, age: 0, size: 50 + Math.random() * 30 });
    this.nextFlower = this.dist + 150;
    if (this.flowers.length > 16) this.flowers.shift();
  }

  update(dt) {
    this.elapsed += dt;
    const target = this.has('big') ? 1.4 : 1;
    this.size += (target - this.size) * Math.min(1, dt * 3);
    this.fade = Math.max(0, this.fade - dt);

    if (this.state === 'question') return;

    if (this.state === 'bump') {
      this.bumpLeft -= dt;
      if (this.bumpLeft <= 0) this.hop();
    } else if (this.state === 'walk') {
      this.dist += this.difficulty.speed * dt;
      this.moveHero(dt);
      this.changeBiome();
      this.spawn();
      this.checkStones();
      this.checkBirds();
      this.checkStars(dt);
      this.checkGift();
      this.growFlowers();
      if (this.has('sparkle') && Math.random() < dt * 14) this.spark(this.dist + HERO_X + 40, GROUND - this.y - 60 - Math.random() * 120, RAINBOW[Math.floor(Math.random() * 6)], 6);
    }

    this.flowers.forEach((f) => { f.age += dt; });
    this.sparks.forEach((p) => { p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 200 * dt; });
    this.sparks = this.sparks.filter((p) => p.age < p.life);

    if (this.has('rainbow')) {
      this.trail.push({ x: this.dist + HERO_X + 30, y: GROUND - this.y - 30 });
      if (this.trail.length > 70) this.trail.shift();
    }

    if (this.elapsed >= this.limit && this.state !== 'question') {
      this.state = 'night';
      this.running = false;
      this.handlers.onTimeUp();
    }
  }

  drawSky(c, b) {
    const g = c.createLinearGradient(0, 0, 0, GROUND);
    g.addColorStop(0, b.sky[0]);
    g.addColorStop(1, b.sky[1]);
    c.fillStyle = g;
    c.fillRect(0, 0, this.viewW, VIEW_H);
    if (b.stars) {
      c.fillStyle = '#fff';
      for (let i = 0; i < 40; i++) c.fillRect((i * 173) % this.viewW, (i * 97) % 380, 4, 4);
    }
    c.fillStyle = b.sun;
    c.beginPath();
    c.arc(this.viewW - 170, 120, 62, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = b.stars ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.9)';
    for (let i = 0; i < 4; i++) {
      const span = this.viewW + 400;
      const x = ((i * 430 - this.dist * 0.08) % span + span) % span - 200;
      const y = 90 + (i % 3) * 70;
      [[0, 0, 42], [50, -14, 52], [104, 0, 40]].forEach(([dx, dy, r]) => {
        c.beginPath();
        c.arc(x + dx, y + dy, r, 0, Math.PI * 2);
        c.fill();
      });
    }
  }

  drawGround(c, b) {
    c.fillStyle = b.hill;
    for (let i = -1; i < this.viewW / 500 + 2; i++) {
      const x = i * 500 - (this.dist * 0.3) % 500;
      c.beginPath();
      c.ellipse(x, GROUND + 20, 330, 150, 0, Math.PI, 0);
      c.fill();
    }
    const near = this.dist * 0.5;
    for (let i = -1; i < this.viewW / b.decorStep + 2; i++) {
      const n = Math.floor(near / b.decorStep) + i;
      const size = b.decorH * (0.8 + ((n * 7) % 5 + 5) % 5 * 0.06);
      c.drawImage(this.images[b.decor], n * b.decorStep - near, GROUND + 8 - size, size, size);
    }
    c.fillStyle = b.ground;
    c.fillRect(0, GROUND, this.viewW, VIEW_H - GROUND);
    for (let i = -1; i < this.viewW / 170 + 2; i++) {
      const n = Math.floor(this.dist / 170) + i;
      const x = n * 170 - this.dist;
      c.fillStyle = b.dots[((n % 3) + 3) % 3];
      c.beginPath();
      c.arc(x, GROUND + 50 + ((n * 37) % 60 + 60) % 60, 8, 0, Math.PI * 2);
      c.fill();
    }
    if (b.snow) {
      c.fillStyle = '#fff';
      for (let i = 0; i < 36; i++) {
        const x = ((i * 137 + Math.sin(this.elapsed + i) * 30) % this.viewW + this.viewW) % this.viewW;
        const y = (i * 71 + this.elapsed * (50 + i % 5 * 12)) % VIEW_H;
        c.beginPath();
        c.arc(x, y, 5 + i % 3, 0, Math.PI * 2);
        c.fill();
      }
    }
  }

  drawWorld(c, b) {
    this.drawSky(c, b);
    this.drawGround(c, b);
  }

  drawThings(c) {
    this.flowers.forEach((f) => {
      const s = f.size * Math.min(1, f.age * 2);
      c.drawImage(this.images.flower, f.x - this.dist - s / 2, GROUND + 14 - s, s, s);
    });
    this.trail.forEach((p, i) => {
      const fade = i / this.trail.length;
      RAINBOW.forEach((colour, band) => {
        c.fillStyle = colour;
        c.globalAlpha = fade * 0.7;
        c.fillRect(p.x - this.dist, p.y - 30 + band * 10, 7, 10);
      });
    });
    c.globalAlpha = 1;
    this.stars.forEach((s) => {
      const size = 62 + Math.sin(this.elapsed * 3 + s.x) * 6;
      c.drawImage(this.images.star, s.x - this.dist - size / 2, GROUND - s.a - size / 2, size, size);
    });
    this.stones.forEach((s) => c.drawImage(this.images[s.art], s.x - this.dist - 8, GROUND - s.h - 8, s.w + 16, s.h + 16));
    this.birds.forEach((b) => {
      const flap = Math.sin(this.elapsed * 6) * 8;
      c.drawImage(this.images.bird, b.x - this.dist, GROUND - b.a - 50 + flap, 100, 100);
    });
    if (this.gift) {
      const bob = Math.sin(this.elapsed * 2) * 6;
      c.drawImage(this.images.gift, this.gift.x - this.dist, GROUND - 130 + bob, 120, 120);
    }
  }

  drawSparks(c) {
    this.sparks.forEach((p) => {
      c.globalAlpha = 1 - p.age / p.life;
      c.fillStyle = p.colour;
      c.beginPath();
      c.arc(p.x - this.dist, p.y, p.size, 0, Math.PI * 2);
      c.fill();
    });
    c.globalAlpha = 1;
  }

  drawButterflies(c, cx, cy) {
    ['#FF8FC0', '#FFD432', '#8E4EC6'].forEach((colour, i) => {
      const a = this.elapsed * 1.6 + i * 2.1;
      const x = cx + Math.cos(a) * 130;
      const y = cy + Math.sin(a * 1.3) * 90;
      const wing = 10 + Math.abs(Math.sin(this.elapsed * 12)) * 12;
      c.fillStyle = colour;
      c.beginPath();
      c.ellipse(x - wing / 2, y, wing / 2, 13, 0, 0, Math.PI * 2);
      c.ellipse(x + wing / 2, y, wing / 2, 13, 0, 0, Math.PI * 2);
      c.fill();
    });
  }

  drawHero(c) {
    const moving = this.state === 'walk' && this.y === 0;
    const bob = moving ? Math.abs(Math.sin(this.elapsed * 7)) * 8 : 0;
    const w = HERO_W * this.size;
    const h = HERO_H * this.size;
    const tilt = moving ? Math.sin(this.elapsed * 7) * 0.03 : 0;

    c.fillStyle = 'rgba(0,0,0,.12)';
    c.beginPath();
    c.ellipse(HERO_X + HERO_W / 2, GROUND + 8, 60 * this.size * (1 - Math.min(this.y, 300) / 500), 11, 0, 0, Math.PI * 2);
    c.fill();

    this.friends.forEach((friend, i) => {
      const hop = Math.abs(Math.sin(this.elapsed * 5 + i)) * 14;
      c.drawImage(friend, HERO_X + FRIEND_PLACES[i], GROUND - 110 - hop, 110, 110);
    });

    c.save();
    c.translate(HERO_X + HERO_W / 2, GROUND - this.y + 12 - bob);
    c.rotate(tilt);
    c.drawImage(this.hero, -w / 2, -h, w, h);
    c.restore();

    const middle = GROUND - this.y - h / 2;
    if (this.has('bubble')) {
      c.fillStyle = 'rgba(155,214,242,.22)';
      c.strokeStyle = 'rgba(255,255,255,.85)';
      c.lineWidth = 6;
      c.beginPath();
      c.ellipse(HERO_X + HERO_W / 2, middle, h * 0.42, h * 0.62, 0, 0, Math.PI * 2);
      c.fill();
      c.stroke();
    }
    if (this.has('butterfly')) this.drawButterflies(c, HERO_X + HERO_W / 2, middle);
  }

  frame(t) {
    if (!this.running) return;
    const dt = Math.max(0, Math.min((t - this.last) / 1000, 0.05));
    this.last = t;
    const portrait = innerHeight > innerWidth;
    if (!this.paused && !portrait) this.update(dt);

    const c = this.ctx;
    c.setTransform(this.scale, 0, 0, this.scale, 0, 0);
    if (this.fade > 0) {
      this.drawWorld(c, BIOMES[this.oldBiome]);
      c.globalAlpha = 1 - this.fade / FADE_TIME;
    }
    this.drawWorld(c, BIOMES[this.biome]);
    c.globalAlpha = 1;
    this.drawThings(c);
    this.drawHero(c);
    this.drawSparks(c);
    if (this.running) requestAnimationFrame((n) => this.frame(n));
  }
}
