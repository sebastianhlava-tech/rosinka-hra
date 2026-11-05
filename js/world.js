// Svět na Canvasu: chůze, skok, překážky, hvězdy, dárky, vylepšení a čas hry.
import { artSvg, loadImage } from './art.js';
import { BIOMES } from './biomes.js';
import { SHOPS } from './shop.js';

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
const EAT_TIME = 25;
const BALLOON_GRAVITY = 0.68;
const HIGH_STAR = 530;
const APPLE_GAP = [700, 1100];
const RAINBOW_TIME = 14;
const FLASH_TIME = 1.4;
const PARTY_TIME = 5;
const BG_SIZE = 120;
const BG_ANIMALS = [...new Set(BIOMES.flatMap((b) => b.animals ?? []))];
const SHOP_FIRST = 60;
const SHOP_EVERY = 120;
const SHOP_W = 300;
const ART = [...new Set([...BIOMES.flatMap((b) => [b.decor, ...b.obstacles.map((o) => o.art)]), ...Object.values(SHOPS).map((s) => s.seller), 'stall'])];
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
    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const art = this.running && !this.paused && this.animalAt(e.clientX / innerWidth * this.viewW, e.clientY / innerHeight * VIEW_H);
      if (art) this.handlers.onAnimalTap?.(art);
      this.tap();
    });
  }

  async load(characterMarkup) {
    this.hero = await loadImage(characterMarkup);
    if (this.images.gift) return;
    await Promise.all([...new Set([...ART, ...BG_ANIMALS, 'gift', 'star', 'bird', 'flower', 'apple', 'basket', 'umbrella'])].map(async (key) => {
      this.images[key] = bake(await loadImage(artSvg(key)));
    }));
  }

  resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    this.canvas.width = document.documentElement.clientWidth * dpr;
    this.canvas.height = document.documentElement.clientHeight * dpr;
    this.scale = this.canvas.height / VIEW_H;
    this.viewW = this.canvas.width / this.scale;
  }

  // firstBiome = místo, které dítě vybralo na mapě výletu.
  start(minutes, level, difficulty, firstBiome = 0) {
    this.firstBiome = firstBiome;
    this.weather = 'sun';
    this.rainbowLeft = 0;
    this.flash = 0;
    this.nextFlash = 8;
    this.nextDrop = 0;
    this.bgAnimal = null;
    this.nextAnimal = 12;
    this.partyLeft = 0;
    this.balloons = [];
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
    this.tempFriends = 0;
    this.trail = [];
    this.flowers = [];
    this.sparks = [];
    this.bumpLeft = 0;
    this.stones = [];
    this.birds = [];
    this.stars = [];
    this.gift = null;
    this.shop = null;
    this.nextShop = SHOP_FIRST;
    this.hand = null;
    this.handKind = null;
    this.handLeft = 0;
    this.apples = [];
    this.nextApple = 0;
    this.appleCount = 0;
    this.flowerCount = 0;
    this.highTurn = 0;
    this.nextStone = 800;
    this.nextGift = GIFT_FIRST;
    this.nextStar = 1000;
    this.nextFlower = 0;
    this.biome = firstBiome;
    this.weather = this.handlers.pickWeather?.(BIOMES[firstBiome]) ?? 'sun';
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
    else if (this.y === 0) this.jump();
  }

  hop() {
    this.state = 'walk';
    if (this.has('fly')) this.vy = FLAP;
    else this.jump();
  }

  jump() {
    this.vy = JUMP;
    this.handlers.onJump?.();
  }

  resumeAfterQuestion() {
    this.state = 'walk';
  }

  // Věc z krámku: jídlo se postupně sní, balónek nadnáší, lucerna svítí.
  async setHand(item) {
    this.hand = item ? bake(await loadImage(artSvg(item.art))) : null;
    this.handKind = item?.kind ?? null;
    this.handArt = item?.art ?? null;
    this.handLeft = item?.kind === 'eat' ? EAT_TIME : 0;
  }

  // Trvalí kamarádi běží od začátku hry.
  setPets(images) {
    this.friends = images.slice(0, FRIEND_PLACES.length);
  }

  async giveUpgrade(kind, friendArt, maxFriends) {
    if (kind === 'party') this.burst();
    else this.upgrades.add(kind);
    if (kind === 'umbrella') this.weather = this.forcedWeather() ?? this.weather;
    if (kind === 'friend' && this.friends.length < maxFriends) {
      this.friends.push(await loadImage(artSvg(friendArt)));
      this.tempFriends = (this.tempFriends ?? 0) + 1;
    }
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
    // Krámek: asi jednou za 2 minuty, jen když je co koupit. Kolem něj nejsou překážky ani dárek.
    if (!this.shop && this.elapsed >= this.nextShop) {
      this.nextShop = this.elapsed + SHOP_EVERY;
      if (this.handlers.canShop?.()) {
        const x = Math.max(edge, (this.gift?.x ?? 0) + 600);
        this.shop = { x, biome: BIOMES[this.biome].id, done: false };
        this.nextGift = Math.max(this.nextGift, x + SHOP_W + 900);
        this.nextStone = Math.max(this.nextStone, x + SHOP_W + 500);
        this.stones = this.stones.filter((s) => s.x + s.w < x - 300);
      }
    }
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
      // S létáním nebo velikostí je každá druhá řada hvězd vysoko v oblacích.
      const high = (this.has('fly') || this.has('big')) && this.highTurn++ % 2;
      const low = 270 + Math.random() * 110;
      for (let i = 0; i < 5; i++) this.stars.push({ x: this.nextStar + i * 90, a: high ? HIGH_STAR : low + Math.sin(i * 0.8) * 50 });
      this.nextStar += STAR_GAP;
    }
    // Košík: na zemi leží jablka. Rosinka je sbírá a hlas počítá.
    if (this.has('basket') && edge >= this.nextApple) {
      const x = Math.max(edge, this.nextApple);
      if (!this.stones.some((s) => Math.abs(s.x - x) < 200)) this.apples.push({ x });
      this.nextApple = x + between(APPLE_GAP);
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
      this.vy -= GRAVITY * (this.handArt === 'balloon' ? BALLOON_GRAVITY : 1) * dt;
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
        // Velká Rosinka překážku překročí sama.
        if (this.has('big')) {
          if (this.y === 0) this.vy = 520;
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
    const a = this.y + (HERO_H * this.size) / 2;
    const reachY = 130 * this.size;
    this.stars = this.stars.filter((s) => {
      if (s.x < this.dist - 100) return false;
      const dx = x - s.x;
      const dy = a - s.a;
      if (this.has('magnet') && Math.hypot(dx, dy) < MAGNET_REACH) {
        s.x += dx * Math.min(1, dt * 5);
        s.a += dy * Math.min(1, dt * 5);
      }
      // Kamarádi chytí nízké hvězdy, které Rosinka minula.
      const petX = this.friends.map((_, i) => this.dist + HERO_X + FRIEND_PLACES[i] + 55);
      const pet = s.a < 260 && s.x < x - 60 && petX.find((px) => Math.abs(px - s.x) < 50);
      if (!pet && (Math.abs(dx) > 90 || Math.abs(dy) > reachY)) return true;
      this.handlers.onStar();
      for (let i = 0; i < 5; i++) this.spark(s.x, GROUND - s.a, '#FFD432');
      return false;
    });
  }

  checkApples() {
    const x = this.dist + HERO_X + HERO_W / 2;
    this.apples = this.apples.filter((p) => {
      if (p.x < this.dist - 100) return false;
      if (Math.abs(x - p.x) > 70 || this.y > 120) return true;
      this.appleCount++;
      for (let i = 0; i < 6; i++) this.spark(p.x, GROUND - 40, '#E23B3B');
      this.handlers.onApple?.(this.appleCount);
      return false;
    });
  }

  eat(dt) {
    if (this.handKind !== 'eat' || !this.hand) return;
    this.handLeft -= dt;
    if (this.handLeft > 0) return;
    this.hand = null;
    this.handKind = null;
    this.handArt = null;
    for (let i = 0; i < 12; i++) this.spark(this.dist + HERO_X + 110, GROUND - this.y - 150, RAINBOW[i % 6]);
    this.handlers.onAte?.();
  }

  checkGift() {
    const heroRight = this.dist + HERO_X + HERO_W - 20;
    if (this.gift && heroRight >= this.gift.x) {
      this.gift = null;
      this.state = 'question';
      this.handlers.onGift();
    }
  }

  checkShop() {
    if (!this.shop) return;
    if (this.shop.x + SHOP_W < this.dist - 100) this.shop = null;
    else if (!this.shop.done && this.dist + HERO_X + HERO_W >= this.shop.x + 70) {
      this.shop.done = true;
      this.state = 'shop';
      this.handlers.onShop(this.shop.biome);
    }
  }

  changeBiome() {
    const next = (Math.floor(this.dist / BIOME_LENGTH) + this.firstBiome) % BIOMES.length;
    if (next === this.biome) return;
    this.oldBiome = this.biome;
    this.biome = next;
    this.fade = FADE_TIME;
    this.appleCount = 0;
    this.bgAnimal = null;
    const wasRain = this.weather === 'rain' || this.weather === 'storm';
    this.weather = this.forcedWeather() ?? this.handlers.pickWeather?.(BIOMES[next]) ?? 'sun';
    // Po dešti je vždy duha.
    if (wasRain && this.weather !== 'rain' && this.weather !== 'storm') this.rainbowLeft = RAINBOW_TIME;
    this.handlers.onBiome(BIOMES[next].id, this.rainbowLeft > 0 ? 'rainbow' : this.weather);
  }

  // Deštník: když neprší, začne pršet, aby měl k čemu být.
  forcedWeather() {
    if (!this.has('umbrella') || BIOMES[this.biome].id === 'snow' || BIOMES[this.biome].id === 'dusk') return null;
    return this.weather === 'storm' ? 'storm' : 'rain';
  }

  // Počasí: kapky pod deštníkem se mění na hvězdy, bouřka občas jemně blikne.
  updateWeather(dt) {
    this.rainbowLeft = Math.max(0, (this.rainbowLeft ?? 0) - dt);
    const wet = this.weather === 'rain' || this.weather === 'storm';
    if (wet && this.has('umbrella') && this.elapsed >= (this.nextDrop ?? 0)) {
      this.stars.push({ x: this.dist + HERO_X + 260 + Math.random() * 200, a: 140 + Math.random() * 60 });
      this.nextDrop = this.elapsed + 1.6;
    }
    if (this.weather === 'storm') {
      this.flash = Math.max(0, (this.flash ?? 0) - dt);
      if (this.elapsed >= (this.nextFlash ?? 8)) {
        this.flash = FLASH_TIME;
        this.nextFlash = this.elapsed + 10 + Math.random() * 6;
        this.handlers.onThunder?.();
      }
    }
  }

  // Zvířátko v pozadí: nejvýš jedno, další až po 15–20 s. Za ťuknutí není odměna.
  updateAnimal() {
    if (!this.handlers.bgAnimals?.()) return;
    const near = this.dist * 0.5;
    if (this.bgAnimal && this.bgAnimal.x - near < -200) {
      this.bgAnimal = null;
      this.nextAnimal = this.elapsed + 15 + Math.random() * 5;
    }
    if (this.bgAnimal || this.elapsed < (this.nextAnimal ?? 12)) return;
    const list = BIOMES[this.biome].animals ?? [];
    if (!list.length) return;
    this.bgAnimal = { art: list[Math.floor(Math.random() * list.length)], x: near + this.viewW + 80 };
  }

  animalAt(x, y) {
    const a = this.bgAnimal;
    if (!a) return null;
    const sx = a.x - this.dist * 0.5;
    return x >= sx && x <= sx + BG_SIZE && y >= GROUND - BG_SIZE - 20 && y <= GROUND ? a.art : null;
  }

  // Oslava: balónky letí nahoru a konfety. Trvá 5 sekund.
  celebrate() {
    this.partyLeft = PARTY_TIME;
    this.balloons = Array.from({ length: 9 }, (_, i) => ({ x: 120 + (i * 137) % Math.max(400, this.viewW - 240), y: VIEW_H + 60 + (i % 3) * 90, c: RAINBOW[i % 6], v: 110 + (i % 4) * 25 }));
    this.burst();
  }

  growFlowers() {
    if (!this.has('flowers') || this.y > 0 || this.dist < this.nextFlower) return;
    this.flowers.push({ x: this.dist + HERO_X + 20, age: 0, size: 50 + Math.random() * 30 });
    this.nextFlower = this.dist + 150;
    // Každá pátá kytička nechá před Rosinkou vyrůst hvězdu.
    if (++this.flowerCount % 5 === 0) this.stars.push({ x: this.dist + HERO_X + 320, a: 180 });
    if (this.flowers.length > 16) this.flowers.shift();
  }

  update(dt) {
    this.elapsed += dt;
    const target = this.has('big') ? 1.4 : 1;
    this.size += (target - this.size) * Math.min(1, dt * 3);
    this.fade = Math.max(0, this.fade - dt);

    if (this.state === 'question' || this.state === 'shop') return;

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
      this.checkShop();
      this.checkApples();
      this.eat(dt);
      this.growFlowers();
      this.updateWeather(dt);
      this.updateAnimal();
      if (this.has('sparkle') && Math.random() < dt * 14) this.spark(this.dist + HERO_X + 40, GROUND - this.y - 60 - Math.random() * 120, RAINBOW[Math.floor(Math.random() * 6)], 6);
    }

    this.flowers.forEach((f) => { f.age += dt; });
    this.wind = (this.wind ?? 0) + dt * (this.weather === 'wind' ? 90 : 0);
    this.partyLeft = Math.max(0, (this.partyLeft ?? 0) - dt);
    this.balloons?.forEach((b) => { b.y -= b.v * dt; });
    if (this.partyLeft > 0 && Math.random() < dt * 6) this.spark(this.dist + Math.random() * this.viewW, 120 + Math.random() * 200, RAINBOW[Math.floor(Math.random() * 6)], 8, 1.4);
    this.sparks.forEach((p) => { p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 200 * dt; });
    this.sparks = this.sparks.filter((p) => p.age < p.life);

    if (this.has('rainbow')) {
      this.trail.push({ x: this.dist + HERO_X + 30, y: GROUND - this.y - 30 });
      if (this.trail.length > 70) this.trail.shift();
    }

    if (this.elapsed >= this.limit && this.state === 'walk') {
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
    if (this.weather !== 'rain' && this.weather !== 'storm') {
      c.fillStyle = b.sun;
      c.beginPath();
      c.arc(this.viewW - 170, 120, 62, 0, Math.PI * 2);
      c.fill();
    }
    // Duha po dešti: velký oblouk na obloze, pomalu zmizí.
    if (this.rainbowLeft > 0) {
      c.globalAlpha = Math.min(1, this.rainbowLeft / 3) * 0.55;
      RAINBOW.forEach((colour, i) => {
        c.strokeStyle = colour;
        c.lineWidth = 16;
        c.beginPath();
        c.arc(this.viewW / 2, GROUND + 60, 520 - i * 16, Math.PI, 0);
        c.stroke();
      });
      c.globalAlpha = 1;
    }
    const grey = this.weather === 'rain' || this.weather === 'storm';
    c.fillStyle = b.stars ? 'rgba(255,255,255,.18)' : grey ? 'rgba(200,206,214,.95)' : 'rgba(255,255,255,.9)';
    for (let i = 0; i < 4; i++) {
      const span = this.viewW + 400;
      const x = ((i * 430 - this.dist * 0.08 - (this.wind ?? 0)) % span + span) % span - 200;
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
    // Zvířátko v pozadí: menší a světlejší než věci v popředí, jen pomalu kývá hlavou.
    const a = this.bgAnimal;
    if (a && b === BIOMES[this.biome] && (this.state === 'walk' || this.state === 'bump')) {
      const nod = Math.sin(this.elapsed * 1.5) * 4;
      c.globalAlpha = 0.85;
      c.drawImage(this.images[a.art], a.x - near, GROUND - BG_SIZE + 6 + nod, BG_SIZE, BG_SIZE);
      c.globalAlpha = 1;
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
    if (this.weather === 'snow') {
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

  // Přední vrstva počasí a oslavy.
  drawWeather(c) {
    const w = this.weather;
    if (w === 'storm') {
      c.fillStyle = 'rgba(40,52,84,.22)';
      c.fillRect(0, 0, this.viewW, VIEW_H);
      // Záblesk je pomalý a slabý: nejvýš 22 % bílé.
      if (this.flash > 0) {
        c.fillStyle = `rgba(255,255,255,${(Math.sin((this.flash / FLASH_TIME) * Math.PI) * 0.22).toFixed(3)})`;
        c.fillRect(0, 0, this.viewW, VIEW_H);
      }
    }
    if (w === 'rain' || w === 'storm') {
      c.strokeStyle = 'rgba(120,160,210,.6)';
      c.lineWidth = 3;
      c.beginPath();
      for (let i = 0; i < 70; i++) {
        const x = ((i * 97 - this.elapsed * 60) % this.viewW + this.viewW) % this.viewW;
        const y = (i * 53 + this.elapsed * 520) % VIEW_H;
        c.moveTo(x, y);
        c.lineTo(x - 6, y + 22);
      }
      c.stroke();
      c.fillStyle = 'rgba(120,160,210,.35)';
      for (let i = -1; i < this.viewW / 600 + 2; i++) {
        const n = Math.floor(this.dist / 600) + i;
        c.beginPath();
        c.ellipse(n * 600 + 300 - this.dist, GROUND + 30, 70, 10, 0, 0, Math.PI * 2);
        c.fill();
      }
    }
    if (w === 'wind') {
      ['#8FD16F', '#FFB52E', '#E2701A'].forEach((colour, k) => {
        c.fillStyle = colour;
        for (let i = 0; i < 6; i++) {
          const x = (((i * 311 + k * 97) - this.elapsed * 260) % (this.viewW + 200) + this.viewW + 200) % (this.viewW + 200) - 100;
          const y = 140 + ((i * 89 + k * 61) % 380) + Math.sin(this.elapsed * 2 + i) * 30;
          c.beginPath();
          c.ellipse(x, y, 12, 6, this.elapsed * 3 + i, 0, Math.PI * 2);
          c.fill();
        }
      });
    }
    this.balloons?.forEach((b) => {
      if (b.y < -120) return;
      c.strokeStyle = '#999';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(b.x, b.y + 46);
      c.lineTo(b.x + Math.sin(b.y / 40) * 8, b.y + 110);
      c.stroke();
      c.fillStyle = b.c;
      c.beginPath();
      c.ellipse(b.x, b.y, 34, 44, 0, 0, Math.PI * 2);
      c.fill();
    });
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
    if (this.shop) {
      const x = this.shop.x - this.dist;
      const seller = this.images[SHOPS[this.shop.biome].seller];
      const nod = Math.sin(this.elapsed * 2) * 4;
      c.drawImage(seller, x + 90, GROUND - 216 + nod, 120, 120);
      c.drawImage(this.images.stall, x, GROUND - SHOP_W, SHOP_W, SHOP_W);
    }
    this.stars.forEach((s) => {
      const size = 62 + Math.sin(this.elapsed * 3 + s.x) * 6;
      c.drawImage(this.images.star, s.x - this.dist - size / 2, GROUND - s.a - size / 2, size, size);
    });
    this.stones.forEach((s) => c.drawImage(this.images[s.art], s.x - this.dist - 8, GROUND - s.h - 8, s.w + 16, s.h + 16));
    this.birds.forEach((b) => {
      const flap = Math.sin(this.elapsed * 6) * 8;
      c.drawImage(this.images.bird, b.x - this.dist, GROUND - b.a - 50 + flap, 100, 100);
    });
    this.apples.forEach((p) => c.drawImage(this.images.apple, p.x - this.dist - 32, GROUND - 70, 64, 64));
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

    // Lucerna: teplé světlo kolem Rosinky.
    if (this.handArt === 'lantern') {
      const gx = HERO_X + HERO_W / 2;
      const gy = GROUND - this.y - h / 2;
      const glow = c.createRadialGradient(gx, gy, 20, gx, gy, 260);
      glow.addColorStop(0, 'rgba(255,229,138,.55)');
      glow.addColorStop(1, 'rgba(255,229,138,0)');
      c.fillStyle = glow;
      c.fillRect(gx - 260, gy - 260, 520, 520);
    }

    // S hudbou kamarádi tancují.
    const dance = this.has('music') ? 2 : 1;
    this.friends.forEach((friend, i) => {
      const hop = Math.abs(Math.sin(this.elapsed * 5 * dance + i)) * 14 * dance;
      c.drawImage(friend, HERO_X + FRIEND_PLACES[i], GROUND - 110 - hop, 110, 110);
    });

    c.save();
    c.translate(HERO_X + HERO_W / 2, GROUND - this.y + 12 - bob);
    c.rotate(tilt);
    c.drawImage(this.hero, -w / 2, -h, w, h);
    if (this.hand) {
      // Jídlo se postupně zmenšuje, jak ho Rosinka jí.
      const left = this.handKind === 'eat' ? 0.4 + 0.6 * Math.max(0, this.handLeft / EAT_TIME) : 1;
      const s = 96 * this.size * left;
      const lift = this.handArt === 'balloon' ? h * 0.45 : 0;
      c.drawImage(this.hand, w * 0.18 + (96 * this.size - s) / 2, -h * 0.62 - lift + (96 * this.size - s), s, s);
      if (lift) {
        c.strokeStyle = '#888';
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(w * 0.18 + 48 * this.size, -h * 0.62 - lift + 96 * this.size);
        c.lineTo(w * 0.3, -h * 0.5);
        c.stroke();
      }
    }
    // Deštník drží v ruce vedle hlavy, aby rukojeť nešla přes obličej.
    if (this.has('umbrella') && (this.weather === 'rain' || this.weather === 'storm')) {
      const u = w * 1.15;
      c.drawImage(this.images.umbrella, w * 0.46 - u / 2, -h * 0.98 - u * 0.5, u, u);
    }
    if (this.has('basket')) c.drawImage(this.images.basket, -w * 0.62, -h * 0.32, 70 * this.size, 70 * this.size);
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

  // Peněženka nahoře uprostřed: do 10 jako jednotlivé hvězdy, potom hvězda s číslem pro rodiče.
  drawWallet(c) {
    const n = this.wallet ?? 0;
    if (!n) return;
    const size = 46;
    const shown = Math.min(n, 10);
    const w = n > 10 ? size * 2.6 : shown * size + 16;
    const x = (this.viewW - w) / 2;
    const grow = 1 + Math.max(0, this.walletPulse ?? 0) * 0.25;
    c.fillStyle = 'rgba(255,255,255,.75)';
    c.beginPath();
    if (c.roundRect) c.roundRect(x - 8, 14, w + 16, size + 20, 30);
    else c.rect(x - 8, 14, w + 16, size + 20);
    c.fill();
    if (n > 10) {
      c.drawImage(this.images.star, x + 8, 24, size * grow, size * grow);
      c.fillStyle = '#6b5536';
      c.font = 'bold 40px system-ui, sans-serif';
      c.fillText(String(n), x + size + 18, 62);
      return;
    }
    for (let i = 0; i < shown; i++) {
      const s = i === shown - 1 ? size * grow : size;
      c.drawImage(this.images.star, x + 8 + i * size + (size - s) / 2, 24 + (size - s) / 2, s, s);
    }
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
    this.drawWeather(c);
    this.walletPulse = Math.max(0, (this.walletPulse ?? 0) - dt * 2);
    this.drawWallet(c);
    if (this.running) requestAnimationFrame((n) => this.frame(n));
  }
}
