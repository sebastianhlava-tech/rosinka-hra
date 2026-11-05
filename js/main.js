// Start hry a přepínání obrazovek.
import { artSvg, loadImage, shapeTint, svgToDataUrl } from './art.js';
import { SPECIES_IDS, newPet, petSvg } from './pets.js';
import { openPetCreator } from './petcreator.js';
import { BIOMES, DIFFICULTIES, MAX_FRIENDS, nextUpgrade, pickWeather } from './biomes.js';
import { characterFor } from './character.js';
import { openCreator } from './creator.js';
import { bindCornerHold, openParent } from './parent.js';
import { ALL_ITEMS, itemStatus, pickQuestion, playLevel, recordAnswer, worldTask } from './questions.js';
import { ANSWER_STARS, ROOM_ITEMS, addRunStar, addStars } from './shop.js';
import { openShop } from './shopview.js';
import { characterOf, loadState, saveState } from './storage.js';
import { chime, initVoice, isSpeaking, kidSound, say, setChimes, setLang, setSpeaker, stopVoice, syncVoices, unlockAudio } from './voice.js';
import { World } from './world.js';

const NOTES = [523, 587, 659, 784, 880];

const $ = (id) => document.getElementById(id);
const state = loadState();
const save = () => saveState(state);
let noteTurn = 0;
let awake = null;
let guideTurn = 0;

const markup = (kind) => characterFor(kind, characterOf(state, kind));
const portrait = (kind) => svgToDataUrl(markup(kind));

function setFamily(prefix) {
  $(`${prefix}-mom`).src = portrait('mom');
  $(`${prefix}-dad`).src = portrait('dad');
}

function nextGuide() {
  if (state.guide !== 'both') return state.guide;
  return guideTurn++ % 2 ? 'dad' : 'mom';
}

// Hlas Rosinky při skoku zazní nejvýš jednou za 2 sekundy a nikdy přes hlas rodiče.
let kidJumpAt = 0;
const world = new World($('canvas'), {
  onGift: async () => { await kidSound('gift'); askQuestion(); },
  onJump: () => {
    if (Date.now() - kidJumpAt < 2000 || isSpeaking()) return;
    if (kidSound('jump')) kidJumpAt = Date.now();
  },
  onBump: () => { chime(220); if (!kidSound('bump')) say('bum'); },
  onTimeUp: goToBed,
  onBiome: async (id, weather) => {
    await say(`place-${id}`);
    if (weather !== 'sun' && weather !== 'snow' && world.state === 'walk') say(`weather-${weather}`);
  },
  pickWeather: (biome) => pickWeather(biome, state.stormOff),
  onThunder: () => chime(98),
  bgAnimals: () => state.bgAnimals,
  onAnimalTap: (art) => { if (!isSpeaking()) say(`bg-${art}`); },
  onStar: () => {
    chime(1040);
    if (addRunStar(state)) earned();
  },
  canShop: () => state.shops && state.stars >= 1,
  onShop: (biome) => openShop($('shop'), biome, state, async (item) => {
    save();
    world.wallet = state.stars;
    if (item?.kind === 'hand' || item?.kind === 'eat') await world.setHand(item);
    if (item?.kind === 'pet') await showPets();
    if (item?.kind === 'wear') await world.load(markup('child'));
    if (item) world.burst();
    world.resumeAfterQuestion();
  }),
  onAte: () => say('yum'),
  onApple: (n) => { chime(880 + n * 60); if (n <= 5) say(`apples-${n}`); },
  onNote: () => chime(NOTES[noteTurn++ % NOTES.length]),
});

// Trvalí kamarádi běží s Rosinkou od začátku hry.
async function showPets() {
  world.setPets(await Promise.all(state.pets.map((p) => loadImage(petSvg(p)))));
}

// Po postupu ve stopě dostane dítě trvalého kamaráda (nejvýš 3).
async function giftPet(animalArt) {
  if (state.pets.length >= MAX_FRIENDS) return false;
  const known = SPECIES_IDS.indexOf(animalArt);
  const used = state.pets.map((p) => p.species);
  const species = known >= 0 && !used.includes(known) ? known : SPECIES_IDS.findIndex((_, i) => !used.includes(i));
  state.pets.push(newPet(Math.max(0, species)));
  save();
  await showPets();
  return true;
}

// Nová hvězdička v peněžence: krátce se zvětší a cinkne.
function earned() {
  save();
  world.wallet = state.stars;
  world.walletPulse = 1;
  chime(1320);
}

function show(id) {
  ['start', 'map', 'creator', 'game', 'night'].forEach((s) => { $(s).hidden = s !== id; });
  $('parent-btn').hidden = id === 'creator';
  $('parent-btn').classList.toggle('quiet', id === 'game');
  if (id === 'game') keepAwake();
  else releaseAwake();
}

// Když to iPad umí, během hry nezhasne obrazovku.
async function keepAwake() {
  try {
    awake = await navigator.wakeLock?.request('screen');
  } catch {
    awake = null;
  }
}

function releaseAwake() {
  awake?.release().catch(() => {});
  awake = null;
}

// iPad umí stránku přiblížit a zaseknout. Když se to stane, vrátíme ji zpět
// a do té doby povolíme oddálení dvěma prsty.
const zoomed = () => (window.visualViewport?.scale ?? 1) > 1.01;

function watchZoom() {
  document.documentElement.classList.toggle('zoomed', zoomed());
}

function resetZoom() {
  const meta = document.querySelector('meta[name=viewport]');
  const content = meta.content;
  meta.content = content.replace('initial-scale=1', 'initial-scale=1.01');
  requestAnimationFrame(() => {
    meta.content = content;
    scrollTo(0, 0);
    watchZoom();
  });
}

function showStart() {
  $('start-hero').src = portrait('child');
  setFamily('start');
  $('start-pets').innerHTML = state.pets.map((p, i) => `<button data-pet="${i}"><img src="${svgToDataUrl(petSvg(p))}" alt=""></button>`).join('');
  $('start-cake').hidden = !isBirthday();
  show('start');
}

// Ťuknutí na kamaráda na úvodní obrazovce ho otevře k úpravě.
function showPetCreator(i, after) {
  show('creator');
  openPetCreator($('creator'), state.pets[i] ?? newPet(state.pets.length), state.petItems, (pet) => {
    state.pets[i] = pet;
    save();
    after();
  });
}

function goToBed() {
  state.locked = state.lockNight;
  save();
  stopVoice();
  $('night-hero').src = portrait('child');
  setFamily('night');
  renderRoom();
  $('night-task').innerHTML = `<b>Úkol do světa (pro rodiče)</b>${worldTask(state.progress)}`;
  show('night');
  say('night');
}

// Pokojíček: věci z krámku na poličce. Ťuknutí na věc ji nechá poskočit.
function renderRoom() {
  $('room-shelf').innerHTML = ROOM_ITEMS.filter((it) => state.room.includes(it.id))
    .map((it) => `<button class="room-item">${artSvg(it.art)}</button>`).join('');
  $('room-shelf').hidden = !state.room.length;
}

// Album samolepek: každý naučený pojem je samolepka. Ostatní místa čekají.
function openAlbum() {
  $('album-grid').innerHTML = ALL_ITEMS.filter((i) => i.art).map((i) => (itemStatus(state.progress, i) === 'known'
    ? `<button class="sticker">${artSvg(i.art, '#2F6FDE')}</button>`
    : '<span class="sticker empty"></span>')).join('');
  $('album').hidden = false;
}

function bounce(e) {
  const b = e.target.closest('.room-item, .sticker');
  if (!b || b.classList.contains('empty')) return;
  b.classList.remove('hop');
  void b.offsetWidth;
  b.classList.add('hop');
}

function showCreator(kind, after) {
  show('creator');
  openCreator($('creator'), kind, characterOf(state, kind), (choice) => {
    state.characters[kind] = choice;
    save();
    after();
  }, state.wardrobe, state.unlockAll);
}

const today = () => new Date().toLocaleDateString('sv');
const isBirthday = () => state.birthday === today();

// Výlet: na začátku si dítě vybere jedno ze 3 míst. Odtud jde výlet dál a končí doma v postýlce.
function showMap() {
  const picks = BIOMES.map((_, i) => i).filter((i) => BIOMES[i].id !== 'dusk').sort(() => Math.random() - 0.5).slice(0, 3);
  $('map-places').innerHTML = picks.map((i) => {
    const b = BIOMES[i];
    const animal = b.animals?.[0];
    return `<button data-biome="${i}" style="background: linear-gradient(${b.sky[0]}, ${b.sky[1]} 70%, ${b.ground} 70%)">
      <span class="map-decor">${artSvg(b.decor)}</span>${animal ? `<span class="map-animal">${artSvg(animal)}</span>` : ''}</button>`;
  }).join('');
  show('map');
  say('map');
}

async function play() {
  unlockAudio();
  setSpeaker(state.guide === 'dad' ? 'dad' : 'mom');
  await world.load(markup('child'));
  showMap();
}

async function startTrip(biome) {
  stopVoice();
  show('game');
  world.start(state.minutes, playLevel(state.progress), DIFFICULTIES[state.difficulty], biome);
  world.wallet = state.stars;
  await showPets();
  if (isBirthday()) {
    world.celebrate();
    await say('birthday');
  }
  say(`place-${BIOMES[biome].id}`);
}

// Tělo: dítě ťukne na svou postavičku. Platí nejbližší část těla, aby stačilo ťuknout přibližně.
// Místa jsou v souřadnicích postavičky (200 × 320, nahoře −20).
const BODY_SPOTS = {
  nose: [[100, 112]], eyes: [[76, 98], [124, 98]], mouth: [[100, 128]], ears: [[38, 106], [162, 106]],
  hands: [[30, 216], [170, 216]], feet: [[78, 286], [122, 286]], tummy: [[100, 206]],
};

function renderBody(q, onPick) {
  const host = $('choices');
  host.dataset.count = 'body';
  host.innerHTML = `<div class="body-pick"><img src="${portrait('child')}" alt=""></div>`;
  const box = host.firstElementChild;
  const marks = {};
  for (const [part, spots] of Object.entries(BODY_SPOTS)) {
    marks[part] = spots.map(([x, y]) => {
      const m = document.createElement('button');
      m.className = 'choice body-spot';
      m.dataset.part = part;
      m.dataset.right = `body-${part}` === q.answerId;
      m.style.left = `${(x / 200) * 100}%`;
      m.style.top = `${((y + 20) / 320) * 100}%`;
      box.append(m);
      return m;
    });
  }
  box.addEventListener('click', (e) => {
    const r = box.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 200;
    const y = ((e.clientY - r.top) / r.height) * 320 - 20;
    let best = null;
    let dist = Infinity;
    for (const [part, spots] of Object.entries(BODY_SPOTS)) {
      spots.forEach(([sx, sy], i) => {
        const d = Math.hypot(sx - x, sy - y);
        if (d < dist) { dist = d; best = marks[part][i]; }
      });
    }
    if (best) onPick(best);
  });
}

function renderChoices(q, onPick) {
  const host = $('choices');
  host.innerHTML = '';
  if (q.item.cat === 'body') return renderBody(q, onPick);
  host.dataset.count = q.choices.length;
  const tint = shapeTint();
  q.choices.forEach((choice) => {
    const b = document.createElement('button');
    b.className = 'choice';
    b.dataset.right = choice.id === q.answerId;
    b.innerHTML = artSvg(choice.art, tint);
    b.addEventListener('click', () => onPick(b));
    host.append(b);
  });
}

function askQuestion() {
  chime(780);
  const q = pickQuestion(state.progress);
  const { hint, show: showAfter } = DIFFICULTIES[state.difficulty];
  let wrong = 0;
  let finished = false;
  const rightButton = () => document.querySelector('.choice[data-right="true"]');

  const finish = async () => {
    finished = true;
    const { levelUp } = recordAnswer(state.progress, q.item.id, wrong === 0);
    world.setLevel(playLevel(state.progress));
    addStars(state, ANSWER_STARS);
    earned();
    document.querySelectorAll('.choice').forEach((b) => { b.disabled = true; });
    rightButton().classList.add('glow');
    chime(880);
    await say(`praise-${1 + Math.floor(Math.random() * 3)}`);
    // V režimu Obojí po české pochvale zazní anglické slovo.
    if (state.lang === 'both' && q.answerId) await say(`word-${q.answerId}`, undefined, 'en');
    $('question').hidden = true;
    const animal = q.choices.find((c) => c.cat === 'animal')?.art;
    if (levelUp) {
      world.celebrate();
      await say('level-party');
    }
    if (levelUp && await giftPet(animal)) {
      world.burst();
      await say('pet-new');
    }
    giveUpgrade(q);
  };

  const onPick = async (button) => {
    if (finished) return;
    if (button.dataset.right === 'true') return finish();
    wrong++;
    button.classList.remove('wiggle');
    void button.offsetWidth;
    button.classList.add('wiggle');
    if (wrong >= showAfter) {
      document.querySelectorAll('.choice').forEach((b) => { b.disabled = b !== rightButton(); });
      rightButton().classList.add('pulse');
      await say(q.item.id);
      return finish();
    }
    if (wrong >= hint) rightButton().classList.add('pulse');
    await say('retry');
    if (!finished) say(q.item.id);
  };

  $('ear').onclick = () => say(q.item.id);
  renderChoices(q, onPick);
  const guide = nextGuide();
  setSpeaker(guide);
  $('guide').src = portrait(guide);
  $('question').hidden = false;
  say(q.item.id);
}

async function giveUpgrade(q) {
  const kind = nextUpgrade(world.owned(), world.tempFriends, state.pets.length);
  const friend = q.choices.find((c) => c.cat === 'animal')?.art ?? 'dog';
  await world.giveUpgrade(kind, friend, MAX_FRIENDS);
  world.resumeAfterQuestion();
  say(`up-${kind}`);
}

function openParentPanel() {
  const root = $('parent');
  if (!root.hidden) return;
  world.paused = true;
  const close = () => {
    root.hidden = true;
    root.innerHTML = '';
    world.paused = false;
  };
  openParent(root, state, {
    save: () => { setChimes(state.sounds); setLang(state.lang); save(); },
    close,
    newGame: () => {
      close();
      world.stop();
      stopVoice();
      $('question').hidden = true;
      $('shop').hidden = true;
      state.locked = false;
      save();
      showStart();
    },
    changeCharacter: (kind) => {
      close();
      world.stop();
      stopVoice();
      $('question').hidden = true;
      $('shop').hidden = true;
      showCreator(kind, () => (state.locked ? goToBed() : showStart()));
    },
    editPet: (i) => {
      close();
      world.stop();
      stopVoice();
      $('question').hidden = true;
      $('shop').hidden = true;
      showPetCreator(i, () => (state.locked ? goToBed() : showStart()));
    },
  });
}

setChimes(state.sounds);
setLang(state.lang);
$('night').addEventListener('click', (e) => {
  if (e.target.closest('#room-shelf, #album-btn, #night-task')) return;
  if (!state.locked) showStart();
});
$('room-shelf').addEventListener('click', bounce);
$('start-pets').addEventListener('click', (e) => {
  const b = e.target.closest('[data-pet]');
  if (b) showPetCreator(Number(b.dataset.pet), showStart);
});
$('map-places').addEventListener('click', (e) => {
  const b = e.target.closest('[data-biome]');
  if (b) startTrip(Number(b.dataset.biome));
});
$('start-cake').src = svgToDataUrl(artSvg('cake'));
$('album-grid').addEventListener('click', bounce);
$('album-btn').addEventListener('click', openAlbum);
$('album-close').addEventListener('click', () => { $('album').hidden = true; });
$('album-btn').querySelector('img').src = svgToDataUrl(artSvg('book'));
$('album-close').querySelector('img').src = svgToDataUrl(artSvg('check'));
document.addEventListener('visibilitychange', () => { if (!document.hidden && !$('game').hidden) keepAwake(); });
$('play').addEventListener('click', play);
$('parent-btn').addEventListener('click', openParentPanel);
$('play').querySelector('img').src = svgToDataUrl(artSvg('play'));
$('ear').querySelector('img').src = svgToDataUrl(artSvg('ear'));
$('night-bed').src = svgToDataUrl(artSvg('bed'));
$('rotate').querySelector('img').src = svgToDataUrl(artSvg('tablet'));
bindCornerHold($('corner'), openParentPanel);
document.addEventListener('gesturestart', (e) => { if (!zoomed()) e.preventDefault(); });
visualViewport?.addEventListener('resize', watchZoom);
document.addEventListener('focusout', resetZoom);
addEventListener('orientationchange', resetZoom);
document.addEventListener('contextmenu', (e) => e.preventDefault());

// Když je v iPadu heslo k hlasům, hra si potichu stáhne novější hlasy z webu.
initVoice().then(async () => {
  if (!state.voicePassword) return;
  try {
    const got = await syncVoices(state.voicePassword, state.voicesVersion);
    if (got) { state.voicesVersion = got.version; save(); }
  } catch {
    // Bez internetu nebo se špatným heslem zůstanou hlasy, které už v iPadu jsou.
  }
});
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});

if (state.locked) goToBed();
else if (!state.characters.child) showCreator('child', () => showCreator('mom', () => showCreator('dad', showStart)));
else showStart();
