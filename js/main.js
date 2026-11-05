// Start hry a přepínání obrazovek.
import { artSvg, shapeTint, svgToDataUrl } from './art.js';
import { DIFFICULTIES, MAX_FRIENDS, nextUpgrade } from './biomes.js';
import { characterFor } from './character.js';
import { openCreator } from './creator.js';
import { bindCornerHold, openParent } from './parent.js';
import { pickQuestion, playLevel, recordAnswer } from './questions.js';
import { characterOf, loadState, saveState } from './storage.js';
import { chime, initVoice, isSpeaking, kidSound, say, setChimes, setLang, setSpeaker, stopVoice, unlockAudio } from './voice.js';
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
  onBiome: (id) => say(`place-${id}`),
  onStar: () => chime(1040),
  onNote: () => chime(NOTES[noteTurn++ % NOTES.length]),
});

function show(id) {
  ['start', 'creator', 'game', 'night'].forEach((s) => { $(s).hidden = s !== id; });
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
  show('start');
}

function goToBed() {
  state.locked = state.lockNight;
  save();
  stopVoice();
  $('night-hero').src = portrait('child');
  setFamily('night');
  show('night');
  say('night');
}

function showCreator(kind, after) {
  show('creator');
  openCreator($('creator'), kind, characterOf(state, kind), (choice) => {
    state.characters[kind] = choice;
    save();
    after();
  });
}

async function play() {
  unlockAudio();
  setSpeaker(state.guide === 'dad' ? 'dad' : 'mom');
  await world.load(markup('child'));
  show('game');
  world.start(state.minutes, playLevel(state.progress), DIFFICULTIES[state.difficulty]);
}

function renderChoices(q, onPick) {
  const host = $('choices');
  host.innerHTML = '';
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
    recordAnswer(state.progress, q.item.id, wrong === 0);
    world.setLevel(playLevel(state.progress));
    save();
    document.querySelectorAll('.choice').forEach((b) => { b.disabled = true; });
    rightButton().classList.add('glow');
    chime(880);
    await say(`praise-${1 + Math.floor(Math.random() * 3)}`);
    // V režimu Obojí po české pochvale zazní anglické slovo.
    if (state.lang === 'both' && q.answerId) await say(`word-${q.answerId}`, undefined, 'en');
    $('question').hidden = true;
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
  const kind = nextUpgrade(world.owned(), world.friends.length);
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
      state.locked = false;
      save();
      showStart();
    },
    changeCharacter: (kind) => {
      close();
      world.stop();
      stopVoice();
      $('question').hidden = true;
      showCreator(kind, () => (state.locked ? goToBed() : showStart()));
    },
  });
}

setChimes(state.sounds);
setLang(state.lang);
$('night').addEventListener('click', () => { if (!state.locked) showStart(); });
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

initVoice();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});

if (state.locked) goToBed();
else if (!state.characters.child) showCreator('child', () => showCreator('mom', () => showCreator('dad', showStart)));
else showStart();
