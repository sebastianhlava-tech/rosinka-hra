// Louka na Canvasu: chůze, skok, kameny, dárky, upgrady a čas hry.
import { artSvg, loadImage } from './art.js';

const VIEW_H = 800;
const GROUND = 650;
const SPEED = 160;
const HERO_X = 260;
const HERO_W = 150;
const HERO_H = 240;
const JUMP = 760;
const GRAVITY = 1100;
const STONE_W = 90;
const HIT_LEFT = 50;
const HIT_RIGHT = 100;
const GIFT_FIRST = 1600;
const GIFT_GAP = [4800, 6400];
const BUMP_WAIT = 3;
const UPGRADE_TIME = 15;
const HOVER = 230;
const FLY_TOP = 350;
const RAINBOW = ['#E23B3B', '#FF8A1F', '#FFD432', '#3DAA4E', '#2F6FDE', '#8E4EC6'];

const between = ([a, b]) => a + Math.random() * (b - a);

export class World {
  constructor(canvas, { onGift, onBump, onTimeUp }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.handlers = { onGift, onBump, onTimeUp };
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
    if (!this.images.stone) {
      this.images.stone = await loadImage(artSvg('stone'));
      this.images.gift = await loadImage(artSvg('gift'));
    }
  }

  resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    this.canvas.width = innerWidth * dpr;
    this.canvas.height = innerHeight * dpr;
    this.scale = this.canvas.height / VIEW_H;
    this.viewW = this.canvas.width / this.scale;
  }

  start(minutes, level) {
    this.level = level;
    this.limit = minutes * 60;
    this.elapsed = 0;
    this.dist = 0;
    this.state = 'walk';
    this.y = 0;
    this.vy = 0;
    this.size = 1;
    this.upgrade = null;
    this.upgradeLeft = 0;
    this.friend = null;
    this.trail = [];
    this.bumpLeft = 0;
    this.stones = [];
    this.gift = null;
    this.nextStone = 800;
    this.nextGift = GIFT_FIRST;
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

  tap() {
    if (!this.running || this.paused) return;
    if (this.state === 'bump') return this.hop();
    if (this.state !== 'walk') return;
    if (this.upgrade === 'fly') this.vy = Math.min(this.vy + 420, 480);
    else if (this.y === 0) this.vy = JUMP;
  }

  hop() {
    this.state = 'walk';
    this.vy = JUMP;
  }

  resumeAfterQuestion() {
    this.state = 'walk';
  }

  async giveUpgrade(kind, friendArt) {
    this.upgrade = kind;
    this.upgradeLeft = UPGRADE_TIME;
    if (kind === 'friend') this.friend = await loadImage(artSvg(friendArt));
  }

  stoneGap() {
    return (1500 - this.level * 55) * (0.85 + Math.random() * 0.3);
  }

  spawn() {
    const edge = this.dist + this.viewW + 150;
    if (edge >= this.nextGift) {
      this.gift = { x: this.nextGift, y: 0 };
      this.nextGift += between(GIFT_GAP);
    }
    if (edge >= this.nextStone) {
      const free = Math.abs(this.nextStone - (this.gift?.x ?? -9999)) > 400 && Math.abs(this.nextStone - this.nextGift) > 400;
      if (free) this.stones.push({ x: this.nextStone, h: 62 + this.level * 2, done: false });
      this.nextStone += this.stoneGap();
    }
    this.stones = this.stones.filter((s) => s.x > this.dist - 200);
  }

  moveHero(dt) {
    if (this.upgrade === 'fly') {
      this.vy -= GRAVITY * 0.35 * dt;
      this.y += this.vy * dt;
      if (this.y < HOVER && this.vy < 0) { this.y += (HOVER - this.y) * Math.min(1, dt * 3); this.vy = 0; }
      if (this.y > FLY_TOP) { this.y = FLY_TOP; this.vy = 0; }
      return;
    }
    if (this.y > 0 || this.vy > 0) {
      this.vy -= GRAVITY * dt;
      this.y = Math.max(0, this.y + this.vy * dt);
      if (this.y === 0) this.vy = 0;
    }
  }

  checkStones() {
    const left = this.dist + HERO_X - 0;
    for (const s of this.stones) {
      if (s.done) continue;
      const touching = left + HIT_RIGHT >= s.x + 8 && left + HIT_LEFT <= s.x + STONE_W - 8;
      if (s.x + STONE_W < left + HIT_LEFT) s.done = true;
      if (touching && this.y < 40) {
        s.done = true;
        this.vy = 0;
        this.y = 0;
        this.state = 'bump';
        this.bumpLeft = BUMP_WAIT;
        this.handlers.onBump();
        return;
      }
    }
  }

  checkGift() {
    const heroRight = this.dist + HERO_X + HERO_W - 20;
    if (this.gift && heroRight >= this.gift.x) {
      this.gift = null;
      this.state = 'question';
      this.handlers.onGift();
    }
  }

  tickUpgrade(dt) {
    if (!this.upgrade) return;
    this.upgradeLeft -= dt;
    if (this.upgradeLeft <= 0) {
      if (this.upgrade === 'fly') this.vy = 0;
      this.upgrade = null;
      this.friend = null;
    }
  }

  update(dt) {
    this.elapsed += dt;
    const target = this.upgrade === 'big' ? 1.5 : 1;
    this.size += (target - this.size) * Math.min(1, dt * 3);

    if (this.state === 'question') return;
    this.tickUpgrade(dt);

    if (this.state === 'bump') {
      this.bumpLeft -= dt;
      if (this.bumpLeft <= 0) this.hop();
    } else if (this.state === 'walk') {
      this.dist += SPEED * dt;
      this.moveHero(dt);
      this.spawn();
      this.checkStones();
      this.checkGift();
    }

    if (this.upgrade === 'rainbow') {
      this.trail.push({ x: this.dist + HERO_X + 30, y: GROUND - this.y - 30 });
      if (this.trail.length > 90) this.trail.shift();
    } else if (this.trail.length) {
      this.trail.shift();
    }

    if (this.elapsed >= this.limit && this.state !== 'question') {
      this.state = 'night';
      this.running = false;
      this.handlers.onTimeUp();
    }
  }

  drawSky(c) {
    const g = c.createLinearGradient(0, 0, 0, GROUND);
    g.addColorStop(0, '#BDE6F7');
    g.addColorStop(1, '#EAF8FB');
    c.fillStyle = g;
    c.fillRect(0, 0, this.viewW, VIEW_H);
    c.fillStyle = '#FFE58A';
    c.beginPath();
    c.arc(this.viewW - 170, 120, 62, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = 'rgba(255,255,255,.9)';
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

  drawGround(c) {
    c.fillStyle = '#BFE5A3';
    for (let i = -1; i < this.viewW / 500 + 2; i++) {
      const x = i * 500 - (this.dist * 0.3) % 500;
      c.beginPath();
      c.ellipse(x, GROUND + 20, 330, 150, 0, Math.PI, 0);
      c.fill();
    }
    c.fillStyle = '#8FD16F';
    c.fillRect(0, GROUND, this.viewW, VIEW_H - GROUND);
    const colours = ['#FFFFFF', '#FFD432', '#FF8FC0'];
    for (let i = -1; i < this.viewW / 170 + 2; i++) {
      const n = Math.floor(this.dist / 170) + i;
      const x = n * 170 - this.dist;
      c.fillStyle = colours[((n % 3) + 3) % 3];
      c.beginPath();
      c.arc(x, GROUND + 50 + ((n * 37) % 60 + 60) % 60, 8, 0, Math.PI * 2);
      c.fill();
    }
  }

  drawThings(c) {
    this.trail.forEach((p, i) => {
      const fade = i / this.trail.length;
      RAINBOW.forEach((colour, band) => {
        c.fillStyle = colour;
        c.globalAlpha = fade * 0.7;
        c.fillRect(p.x - this.dist, p.y - 30 + band * 10, 7, 10);
      });
    });
    c.globalAlpha = 1;
    this.stones.forEach((s) => c.drawImage(this.images.stone, s.x - this.dist - 5, GROUND - s.h - 10, STONE_W + 10, s.h + 28));
    if (this.gift) {
      const bob = Math.sin(this.elapsed * 2) * 6;
      c.drawImage(this.images.gift, this.gift.x - this.dist, GROUND - 130 + bob, 120, 120);
    }
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

    if (this.friend) {
      const hop = Math.abs(Math.sin(this.elapsed * 5)) * 14;
      c.drawImage(this.friend, HERO_X - 130, GROUND - 110 - hop, 110, 110);
    }

    c.save();
    c.translate(HERO_X + HERO_W / 2, GROUND - this.y + 12 - bob);
    c.rotate(tilt);
    c.drawImage(this.hero, -w / 2, -h, w, h);
    c.restore();
  }

  frame(t) {
    if (!this.running) return;
    const dt = Math.min((t - this.last) / 1000, 0.05);
    this.last = t;
    const portrait = innerHeight > innerWidth;
    if (!this.paused && !portrait) this.update(dt);

    const c = this.ctx;
    c.setTransform(this.scale, 0, 0, this.scale, 0, 0);
    this.drawSky(c);
    this.drawGround(c);
    this.drawThings(c);
    this.drawHero(c);
    if (this.running) requestAnimationFrame((n) => this.frame(n));
  }
}
