// Rodičovská část: vstup, nastavení, přehled učení, nahrávání hlasu.
import { LEVELS, SENTENCES, itemStatus, newProgress, setLevel } from './questions.js';
import { hasClip, removeClip, say, startRecording, stopVoice } from './voice.js';

const HOLD_MS = 3000;

export function bindCornerHold(corner, onOpen) {
  let timer = null;
  const cancel = () => clearTimeout(timer);
  corner.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    timer = setTimeout(onOpen, HOLD_MS);
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach((n) => corner.addEventListener(n, cancel));
}

function gate(root, onPass, onClose) {
  const a = 3 + Math.floor(Math.random() * 7);
  const b = 3 + Math.floor(Math.random() * 7);
  root.innerHTML = `
    <div class="parent-gate">
      <h2>Pro rodiče</h2>
      <p>Kolik je ${a} + ${b}?</p>
      <input type="number" inputmode="numeric" aria-label="Výsledek">
      <div><button class="primary">Vstoupit</button> <button class="close">Zpět</button></div>
    </div>`;
  const input = root.querySelector('input');
  root.querySelector('.close').onclick = onClose;
  root.querySelector('.primary').onclick = () => {
    if (Number(input.value) === a + b) onPass();
    else input.value = '';
  };
}

function learningHtml(progress) {
  const labels = { known: 'umí', learning: 'učí se', new: 'ještě ne' };
  return LEVELS.map((level, i) => {
    const cells = level.items.map((item) => {
      const status = itemStatus(progress, item);
      const word = item.text.replace(/^(Kde je|Kde jsou|Kdo dělá) /, '').replace('?', '');
      return `<span class="tag ${status}" title="${labels[status]}">${word}</span>`;
    }).join('');
    return `<p><b>Úroveň ${i + 1}:</b> ${cells}</p>`;
  }).join('');
}

function voiceRow(s, kind) {
  const row = document.createElement('div');
  row.className = 'voice-row';
  const draw = () => {
    row.innerHTML = `
      <span class="voice-mark">${hasClip(kind, s.id) ? '✓' : '○'}</span>
      <span class="voice-text">${s.text}</span>
      <button class="rec">Nahrát</button>
      <button class="play" ${hasClip(kind, s.id) ? '' : 'disabled'}>Přehrát</button>
      <button class="del" ${hasClip(kind, s.id) ? '' : 'disabled'}>Smazat</button>`;
    let stop = null;
    const rec = row.querySelector('.rec');
    rec.onclick = async () => {
      if (stop) {
        rec.disabled = true;
        await stop();
        draw();
        return;
      }
      try {
        stopVoice();
        stop = await startRecording(kind, s.id);
        rec.textContent = 'Stop';
        rec.classList.add('recording');
      } catch {
        rec.textContent = 'Mikrofon nejde';
      }
    };
    row.querySelector('.play').onclick = () => say(s.id, kind);
    row.querySelector('.del').onclick = async () => { await removeClip(kind, s.id); draw(); };
  };
  draw();
  return row;
}

function voiceSection(root, level, kind) {
  const host = root.querySelector('.voice-list');
  host.innerHTML = '';
  const groups = [{ label: 'Společné věty', level: 0 }, ...LEVELS.map((_, i) => ({ label: `Úroveň ${i + 1}`, level: i + 1 }))];
  for (const g of groups) {
    const box = document.createElement('details');
    box.open = g.level === 0 || g.level === level;
    box.innerHTML = `<summary>${g.label}</summary>`;
    SENTENCES.filter((s) => s.level === g.level).forEach((s) => box.append(voiceRow(s, kind)));
    host.append(box);
  }
}

function panel(root, state, api) {
  const minutes = [3, 5, 10].map((m) => `<option value="${m}" ${m === state.minutes ? 'selected' : ''}>${m} minut</option>`).join('');
  const levels = LEVELS.map((_, i) => `<option value="${i + 1}" ${i + 1 === state.progress.level ? 'selected' : ''}>${i + 1}</option>`).join('');
  const guides = [['both', 'Střídají se'], ['mom', 'Maminka'], ['dad', 'Tatínek']]
    .map(([v, label]) => `<option value="${v}" ${v === state.guide ? 'selected' : ''}>${label}</option>`).join('');
  root.innerHTML = `
    <div class="parent-panel">
      <header><h2>Pro rodiče</h2><button class="close">Zavřít</button></header>
      <section class="actions">
        <button class="primary new-game">Nová hra</button>
        <button class="change-child">Změnit Rosinku</button>
        <button class="change-mom">Změnit maminku</button>
        <button class="change-dad">Změnit tatínka</button>
      </section>
      <section class="settings">
        <label>Délka hry <select class="minutes">${minutes}</select></label>
        <label>Úroveň <select class="level">${levels}</select></label>
        <label>Průvodce <select class="guide">${guides}</select></label>
        <button class="reset">Smazat postup</button>
      </section>
      <section><h3>Co už umí</h3><div class="learning">${learningHtml(state.progress)}</div></section>
      <section><h3>Nahrání hlasu</h3>
        <p>Každý nahrává svoje věty. Stačí věty pro aktuální úroveň. Chybí-li věta, hraje nahrávka druhého rodiče, potom hlas tabletu.</p>
        <label>Nahrává <select class="recorder"><option value="mom">Maminka</option><option value="dad">Tatínek</option></select></label>
        <div class="voice-list"></div>
      </section>
    </div>`;

  const $ = (s) => root.querySelector(s);
  $('.close').onclick = api.close;
  $('.new-game').onclick = api.newGame;
  ['child', 'mom', 'dad'].forEach((kind) => { $(`.change-${kind}`).onclick = () => api.changeCharacter(kind); });
  $('.guide').onchange = (e) => { state.guide = e.target.value; api.save(); };
  $('.minutes').onchange = (e) => { state.minutes = Number(e.target.value); api.save(); };
  $('.level').onchange = (e) => {
    setLevel(state.progress, Number(e.target.value));
    api.save();
    $('.learning').innerHTML = learningHtml(state.progress);
  };
  $('.reset').onclick = () => {
    if (!confirm('Opravdu smazat postup v učení? Nahrávky hlasu zůstanou.')) return;
    state.progress = newProgress();
    api.save();
    panel(root, state, api);
  };
  $('.recorder').onchange = (e) => voiceSection(root, state.progress.level, e.target.value);
  voiceSection(root, state.progress.level, 'mom');
}

export function openParent(root, state, api) {
  root.hidden = false;
  gate(root, () => panel(root, state, api), api.close);
}
