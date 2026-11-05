// Nahrávání věta po větě: ukáže chybějící věty a po každé větu přehraje.
import { SENTENCES, stageOf } from './questions.js';
import { hasClip, say, startRecording, stopVoice } from './voice.js';

const NAMES = { mom: 'Maminka', dad: 'Tatínek' };

// Nejdřív společné věty, pak to, co se dítě právě učí, nakonec zbytek.
function missing(kind, lang, progress) {
  const rank = (s) => (s.group === 'common' || s.group === 'shop' ? 0 : s.stage <= stageOf(progress, s.group) ? s.stage : 10 + s.stage);
  return SENTENCES.filter((s) => s.lang === lang && !hasClip(kind, s.key)).sort((a, b) => rank(a) - rank(b));
}

export function openRecorder(root, kind, lang, progress, onClose) {
  const total = SENTENCES.filter((s) => s.lang === lang).length;
  const queue = missing(kind, lang, progress);
  let at = 0;
  let stop = null;
  let message = '';

  const leave = async () => {
    if (stop) await stop();
    stopVoice();
    onClose();
  };

  const frame = (body) => {
    const done = total - queue.length + at;
    root.innerHTML = `
      <div class="recorder-box">
        <header><b>Nahrává: ${NAMES[kind]}${lang === 'en' ? ' (anglicky)' : ''}</b><button class="close">Zavřít</button></header>
        <div class="recorder-bar"><i style="width:${(done / total) * 100}%"></i></div>
        <div>Hotovo ${done} z ${total}</div>
        ${body}
      </div>`;
    root.querySelector('.close').onclick = leave;
  };

  const next = () => { at++; message = ''; ask(); };

  function review(s) {
    frame(`
      <p class="recorder-text">${s.text}</p>
      <div class="recorder-row">
        <button class="primary good">Dobré, další</button>
        <button class="again">Znovu</button>
        <button class="listen">Přehrát</button>
      </div>`);
    root.querySelector('.good').onclick = next;
    root.querySelector('.again').onclick = ask;
    root.querySelector('.listen').onclick = () => say(s.id, kind, s.lang);
    say(s.id, kind, s.lang);
  }

  function ask() {
    const s = queue[at];
    if (!s) {
      frame('<p class="recorder-text">Všechny věty jsou nahrané.</p><button class="primary finish">Hotovo</button>');
      root.querySelector('.finish').onclick = leave;
      return;
    }
    frame(`
      <p class="recorder-text">${s.text}</p>
      <button class="recorder-main">Nahrát</button>
      <div class="recorder-row"><button class="skip">Přeskočit</button></div>
      <p>${message}</p>`);
    const main = root.querySelector('.recorder-main');
    root.querySelector('.skip').onclick = next;
    main.onclick = async () => {
      if (stop) {
        const finish = stop;
        stop = null;
        main.disabled = true;
        await finish();
        review(s);
        return;
      }
      try {
        stopVoice();
        stop = await startRecording(kind, s.key);
        main.textContent = 'Stop';
        main.classList.add('recording');
      } catch {
        message = 'Mikrofon nejde. V Nastavení iPadu povol mikrofon pro Safari a zkus to znovu.';
        ask();
      }
    };
  }

  ask();
}
