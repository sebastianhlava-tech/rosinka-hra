// Rodičovská část: vstup, nastavení, přehled učení, nahrávání hlasu.
import { SENTENCES, TRACKS, isOff, itemName, itemStatus, newProgress, setStage, stageOf } from './questions.js';
import { DIFFICULTIES } from './biomes.js';
import { speciesName } from './pets.js';
import { openRecorder } from './recorder.js';
import { KID_SOUNDS, aiCount, exportRecordings, hasClip, importVoices, kidSound, removeAiVoices, removeClip, say, startRecording, stopVoice, syncVoices } from './voice.js';

const HOLD_MS = 3000;
const LANGS = [['cs', 'Čeština'], ['both', 'Čeština + anglická slovíčka'], ['en', 'English']];
let recLang = 'cs';

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
    if (Number(input.value) === a + b) { input.blur(); onPass(); }
    else input.value = '';
  };
}

function stageSelect(p, t) {
  const now = isOff(p, t.id) ? 0 : stageOf(p, t.id);
  // Písmena a číslice se samy neotevřou: dokud je rodič nezapne, jsou vypnuté.
  const off = isOff(p, t.id) || (t.manual && now === 0);
  const closed = now === 0 && !off ? '<option value="-1" selected>Otevře se samo</option>' : '';
  const steps = t.stages.map((_, i) => `<option value="${i + 1}" ${i + 1 === now ? 'selected' : ''}>Stupeň ${i + 1} z ${t.stages.length}</option>`).join('');
  return `<select data-track="${t.id}">${closed}<option value="0" ${off ? 'selected' : ''}>Vypnuto</option>${steps}</select>`;
}

function learningHtml(progress) {
  const labels = { known: 'umí', learning: 'učí se', new: 'ještě ne' };
  return TRACKS.map((t) => {
    const cells = t.stages.flatMap((st) => st.items).map((item) => {
      const status = itemStatus(progress, item);
      const word = itemName(item);
      return `<span class="tag ${status}" title="${labels[status]}">${word}</span>`;
    }).join('');
    return `<p><b>${t.label}</b> ${stageSelect(progress, t)}<br>${cells}</p>`;
  }).join('');
}

function voiceRow(s, kind, play = () => say(s.id, kind, s.lang)) {
  const row = document.createElement('div');
  row.className = 'voice-row';
  const draw = () => {
    row.innerHTML = `
      <span class="voice-mark">${hasClip(kind, s.key) ? '✓' : '○'}</span>
      <span class="voice-text">${s.text}</span>
      <button class="rec">Nahrát</button>
      <button class="play" ${hasClip(kind, s.key) ? '' : 'disabled'}>Přehrát</button>
      <button class="del" ${hasClip(kind, s.key) ? '' : 'disabled'}>Smazat</button>`;
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
        stop = await startRecording(kind, s.key);
        rec.textContent = 'Stop';
        rec.classList.add('recording');
      } catch {
        rec.textContent = 'Mikrofon nejde';
      }
    };
    row.querySelector('.play').onclick = play;
    row.querySelector('.del').onclick = async () => { await removeClip(kind, s.key); draw(); };
  };
  draw();
  return row;
}

function voiceSection(root, progress, kind) {
  const host = root.querySelector('.voice-list');
  host.innerHTML = '';
  const groups = [{ label: 'Společné věty', id: 'common' }, { label: 'Krámek', id: 'shop' }, ...TRACKS.map((t) => ({ label: t.label, id: t.id }))];
  for (const g of groups) {
    const box = document.createElement('details');
    box.open = g.id === 'common';
    box.innerHTML = `<summary>${g.label}</summary>`;
    SENTENCES.filter((s) => s.group === g.id && s.lang === recLang && (g.id === 'common' || g.id === 'shop' || stageOf(progress, g.id) >= s.stage))
      .forEach((s) => box.append(voiceRow(s, kind)));
    host.append(box);
  }
}

function panel(root, state, api) {
  const minutes = [[3, '3 minuty'], [5, '5 minut'], [10, '10 minut'], [20, '20 minut'], [0, 'Bez konce']]
    .map(([m, label]) => `<option value="${m}" ${m === state.minutes ? 'selected' : ''}>${label}</option>`).join('');
  const langs = LANGS.map(([v, label]) => `<option value="${v}" ${v === state.lang ? 'selected' : ''}>${label}</option>`).join('');
  const guides = [['both', 'Střídají se'], ['mom', 'Maminka'], ['dad', 'Tatínek']]
    .map(([v, label]) => `<option value="${v}" ${v === state.guide ? 'selected' : ''}>${label}</option>`).join('');
  const segments = Object.entries(DIFFICULTIES)
    .map(([v, d]) => `<button data-difficulty="${v}" class="${v === state.difficulty ? 'on' : ''}">${d.label}</button>`).join('');
  const mine = SENTENCES.filter((s) => s.lang === recLang);
  const recorded = (kind) => mine.filter((s) => hasClip(kind, s.key)).length;
  root.innerHTML = `
    <div class="parent-panel">
      <header><h2>Pro rodiče</h2><button class="close">Zavřít</button></header>
      <section class="actions">
        <button class="primary new-game">Začít znovu</button>
        <button class="change-child">Změnit Rosinku</button>
        <button class="change-mom">Změnit maminku</button>
        <button class="change-dad">Změnit tatínka</button>
      </section>
      <section class="actions pets">
        ${state.pets.map((p, i) => `<button data-pet="${i}">Upravit kamaráda: ${speciesName(p)}</button>`).join('')}
        ${state.pets.length < 3 ? `<button data-pet="${state.pets.length}">Přidat kamaráda</button>` : ''}
      </section>
      <section class="settings">
        <label>Dobrou noc po <select class="minutes">${minutes}</select></label>
        <label>Obtížnost <span class="segments">${segments}</span></label>
        <label>Jazyk <select class="lang">${langs}</select></label>
        <label>Průvodce <select class="guide">${guides}</select></label>
        <label><input type="checkbox" class="lock-night" ${state.lockNight ? 'checked' : ''}> Po Dobrou noc zamknout</label>
        <label><input type="checkbox" class="sounds" ${state.sounds ? 'checked' : ''}> Zvuky hry</label>
        <label><input type="checkbox" class="shops" ${state.shops ? 'checked' : ''}> Krámky (hvězdiček: ${state.stars})</label>
        <label><input type="checkbox" class="unlock-all" ${state.unlockAll ? 'checked' : ''}> Odemknout všechny kostýmy</label>
        <label><input type="checkbox" class="bg-animals" ${state.bgAnimals ? 'checked' : ''}> Zvířátka v pozadí</label>
        <label><input type="checkbox" class="storm" ${state.stormOff ? '' : 'checked'}> Bouřka</label>
        <label><input type="checkbox" class="birthday" ${state.birthday === new Date().toLocaleDateString('sv') ? 'checked' : ''}> Dnes má narozeniny</label>
        <button class="reset">Smazat postup</button>
      </section>
      <section><h3>Nahrát hlas</h3>
        <p>Ťukni na svoje jméno. Hra ti ukáže větu po větě. Stačí říct větu a ťuknout na Stop.</p>
        <label>Věty <select class="rec-lang"><option value="cs" ${recLang === 'cs' ? 'selected' : ''}>česky</option><option value="en" ${recLang === 'en' ? 'selected' : ''}>anglicky</option></select></label>
        <div class="voice-cards">
          <button class="record-mom">Nahrává maminka<small>Hotovo ${recorded('mom')} z ${mine.length}</small></button>
          <button class="record-dad">Nahrává tatínek<small>Hotovo ${recorded('dad')} z ${mine.length}</small></button>
        </div>
        <details class="voice-all"><summary>Všechny věty</summary>
          <label>Nahrává <select class="recorder"><option value="mom">Maminka</option><option value="dad">Tatínek</option></select></label>
          <div class="voice-list"></div>
        </details>
      </section>
      <section><h3>Hlas Rosinky</h3>
        <p>Krátké zvuky, které Rosinka řekne ve hře. Jsou jen v tomto iPadu a nikam se neposílají. Co nenahraješ, zní jako dřív.</p>
        <div class="kid-list"></div>
      </section>
      <section><h3>Hlas z ElevenLabs</h3>
        <p>Hra mluví tímto hlasem: nejdřív vaše nahrávka, potom hlas z ElevenLabs, nakonec hlas tabletu.</p>
        <p>Načtené věty: maminka ${aiCount('mom')} z ${SENTENCES.length}, tatínek ${aiCount('dad')} z ${SENTENCES.length}.</p>
        <p>Hlasy jsou na webu zamčené heslem. Zadej heslo jednou. Hra si potom nové hlasy stáhne sama při spuštění.</p>
        <div class="actions">
          <label>Heslo k hlasům <input type="text" class="voice-pw" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" value="${state.voicePassword ?? ''}"></label>
          <button class="primary sync">Stáhnout hlasy</button>
        </div>
        <details><summary>Bez internetu nebo bez hesla</summary>
        <div class="actions">
          <button class="export-mom">Stáhnout nahrávky maminky</button>
          <button class="export-dad">Stáhnout nahrávky tatínka</button>
          <button class="primary import">Načíst hlasy</button>
          <button class="ai-del">Smazat hlasy z ElevenLabs</button>
          <input type="file" class="import-file" accept=".zip,.mp3,audio/*" multiple hidden>
        </div>
        </details>
        <p class="ai-msg"></p>
      </section>
      <section><h3>Co už umí</h3><p>Stopa se posune sama. Tady ji můžeš posunout, nebo vypnout.</p><div class="learning">${learningHtml(state.progress)}</div></section>
    </div>`;

  const $ = (s) => root.querySelector(s);
  $('.close').onclick = api.close;
  $('.new-game').onclick = api.newGame;
  ['child', 'mom', 'dad'].forEach((kind) => { $(`.change-${kind}`).onclick = () => api.changeCharacter(kind); });
  root.querySelectorAll('[data-pet]').forEach((b) => { b.onclick = () => api.editPet(Number(b.dataset.pet)); });
  $('.lock-night').onchange = (e) => { state.lockNight = e.target.checked; api.save(); };
  $('.sounds').onchange = (e) => { state.sounds = e.target.checked; api.save(); };
  $('.shops').onchange = (e) => { state.shops = e.target.checked; api.save(); };
  $('.unlock-all').onchange = (e) => { state.unlockAll = e.target.checked; api.save(); };
  $('.bg-animals').onchange = (e) => { state.bgAnimals = e.target.checked; api.save(); };
  $('.storm').onchange = (e) => { state.stormOff = !e.target.checked; api.save(); };
  $('.birthday').onchange = (e) => { state.birthday = e.target.checked ? new Date().toLocaleDateString('sv') : ''; api.save(); };
  $('.guide').onchange = (e) => { state.guide = e.target.value; api.save(); };
  $('.minutes').onchange = (e) => { state.minutes = Number(e.target.value); api.save(); };
  $('.lang').onchange = (e) => { state.lang = e.target.value; api.save(); };
  $('.learning').onchange = (e) => {
    const track = e.target.dataset.track;
    const value = Number(e.target.value);
    if (!track || value < 0) return;
    setStage(state.progress, track, value);
    api.save();
    $('.learning').innerHTML = learningHtml(state.progress);
  };
  $('.rec-lang').onchange = (e) => { recLang = e.target.value; panel(root, state, api); };
  root.querySelectorAll('[data-difficulty]').forEach((b) => {
    b.onclick = (e) => {
      e.preventDefault();
      state.difficulty = b.dataset.difficulty;
      api.save();
      root.querySelectorAll('[data-difficulty]').forEach((x) => x.classList.toggle('on', x === b));
    };
  });
  ['mom', 'dad'].forEach((kind) => {
    $(`.record-${kind}`).onclick = () => openRecorder(root, kind, recLang, state.progress, () => panel(root, state, api));
  });
  const message = (text) => { $('.ai-msg').textContent = text; };
  ['mom', 'dad'].forEach((kind) => {
    $(`.export-${kind}`).onclick = async () => {
      const zip = await exportRecordings(kind);
      if (!zip) return message('Zatím tu nejsou žádné nahrávky.');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(zip);
      a.download = `rosinka-${kind === 'mom' ? 'maminka' : 'tatinek'}-nahravky.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 60000);
    };
  });
  $('.sync').onclick = async () => {
    const pw = $('.voice-pw').value.trim();
    if (!pw) return message('Nejdřív zadej heslo.');
    message('Stahuji hlasy…');
    try {
      const got = await syncVoices(pw, '');
      state.voicePassword = pw;
      state.voicesVersion = got.version;
      api.save();
      panel(root, state, api);
      root.querySelector('.ai-msg').textContent = `Hotovo. Počet načtených vět: ${got.count}.`;
    } catch (e) {
      message(e.name === 'OperationError' ? 'Heslo nesedí. Zkontroluj ho.' : 'Hlasy nejdou stáhnout. Zkontroluj internet.');
    }
  };
  $('.import').onclick = () => $('.import-file').click();
  $('.import-file').onchange = async (e) => {
    message('Načítám…');
    try {
      const n = await importVoices([...e.target.files]);
      if (!n) return message('V souboru nejsou hlasy pro tuto hru.');
      panel(root, state, api);
      root.querySelector('.ai-msg').textContent = `Hotovo. Počet načtených vět: ${n}.`;
    } catch {
      message('Soubor nejde přečíst. Zkus ZIP ze skriptu make-voices.');
    }
  };
  $('.ai-del').onclick = async () => {
    if (!confirm('Smazat hlasy z ElevenLabs? Vaše vlastní nahrávky zůstanou.')) return;
    await removeAiVoices();
    panel(root, state, api);
  };
  $('.reset').onclick = () => {
    if (!confirm('Opravdu smazat postup v učení? Nahrávky hlasu zůstanou.')) return;
    state.progress = newProgress();
    api.save();
    panel(root, state, api);
  };
  KID_SOUNDS.forEach((s) => $('.kid-list').append(voiceRow(s, 'kid', () => { stopVoice(); kidSound(s.key); })));
  $('.recorder').onchange = (e) => voiceSection(root, state.progress, e.target.value);
  voiceSection(root, state.progress, 'mom');
}

export function openParent(root, state, api) {
  recLang = state.lang === 'en' ? 'en' : 'cs';
  root.hidden = false;
  gate(root, () => panel(root, state, api), api.close);
}
