// Start hry a přepínání obrazovek.
import { artSvg, characterFor, svgToDataUrl } from './art.js';
import { openCreator } from './creator.js';
import { bindCornerHold, openParent } from './parent.js';
import { pickQuestion, recordAnswer } from './questions.js';
import { characterOf, loadState, saveState } from './storage.js';
import { chime, initVoice, say, setSpeaker, stopVoice, unlockAudio } from './voice.js';
import { World } from './world.js';

const UPGRADES = ['big', 'fly', 'rainbow', 'friend'];
const HINT_AFTER = 2;
const SHOW_AFTER = 3;

const $ = (id) => document.getElementById(id);
const state = loadState();
const save = () => saveState(state);
let upgradeTurn = 0;
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

const world = new World($('canvas'), {
  onGift: askQuestion,
  onBump: () => { chime(220); say('bum'); },
  onTimeUp: goToBed,
});

function show(id) {
  ['start', 'creator', 'game', 'night'].forEach((s) => { $(s).hidden = s !== id; });
}

function showStart() {
  $('start-hero').src = portrait('child');
  setFamily('start');
  show('start');
}

function goToBed() {
  state.locked = true;
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
  world.start(state.minutes, state.progress.level);
}

function renderChoices(q, onPick) {
  const host = $('choices');
  host.innerHTML = '';
  host.dataset.count = q.choices.length;
  q.choices.forEach((choice) => {
    const b = document.createElement('button');
    b.className = 'choice';
    b.dataset.right = choice.id === q.answerId;
    b.innerHTML = artSvg(choice.art);
    b.addEventListener('click', () => onPick(b));
    host.append(b);
  });
}

function askQuestion() {
  chime(780);
  const q = pickQuestion(state.progress);
  let wrong = 0;
  let finished = false;
  const rightButton = () => document.querySelector('.choice[data-right="true"]');

  const finish = async () => {
    finished = true;
    recordAnswer(state.progress, q.item.id, wrong === 0);
    world.setLevel(state.progress.level);
    save();
    document.querySelectorAll('.choice').forEach((b) => { b.disabled = true; });
    rightButton().classList.add('glow');
    chime(880);
    await say(`praise-${1 + Math.floor(Math.random() * 3)}`);
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
    if (wrong >= SHOW_AFTER) {
      document.querySelectorAll('.choice').forEach((b) => { b.disabled = b !== rightButton(); });
      rightButton().classList.add('pulse');
      await say(q.item.id);
      return finish();
    }
    if (wrong >= HINT_AFTER) rightButton().classList.add('pulse');
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
  const kind = UPGRADES[upgradeTurn++ % UPGRADES.length];
  const friend = q.choices.find((c) => c.cat === 'animal')?.art ?? 'dog';
  await world.giveUpgrade(kind, friend);
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
    save,
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

$('play').addEventListener('click', play);
$('play').querySelector('img').src = svgToDataUrl(artSvg('play'));
$('ear').querySelector('img').src = svgToDataUrl(artSvg('ear'));
$('night-bed').src = svgToDataUrl(artSvg('bed'));
$('rotate').querySelector('img').src = svgToDataUrl(artSvg('tablet'));
bindCornerHold($('corner'), openParentPanel);
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('contextmenu', (e) => e.preventDefault());

initVoice();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});

if (state.locked) goToBed();
else if (!state.characters.child) showCreator('child', () => showCreator('mom', () => showCreator('dad', showStart)));
else showStart();
