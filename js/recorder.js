// Nahrávání věta po větě: ukáže chybějící věty a po každé větu přehraje.
import { SENTENCES } from './questions.js';
import { hasClip, say, startRecording, stopVoice } from './voice.js';

const NAMES = { mom: 'Maminka', dad: 'Tatínek' };

function missing(kind, level) {
  const rank = (s) => (s.level === 0 ? 0 : s.level === level ? 1 : 2 + s.level);
  return SENTENCES.filter((s) => !hasClip(kind, s.id)).sort((a, b) => rank(a) - rank(b));
}

export function openRecorder(root, kind, level, onClose) {
  const queue = missing(kind, level);
  let at = 0;
  let stop = null;
  let message = '';

  const leave = async () => {
    if (stop) await stop();
    stopVoice();
    onClose();
  };

  const frame = (body) => {
    const done = SENTENCES.length - queue.length + at;
    root.innerHTML = `
      <div class="recorder-box">
        <header><b>Nahrává: ${NAMES[kind]}</b><button class="close">Zavřít</button></header>
        <div class="recorder-bar"><i style="width:${(done / SENTENCES.length) * 100}%"></i></div>
        <div>Hotovo ${done} z ${SENTENCES.length}</div>
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
    root.querySelector('.listen').onclick = () => say(s.id, kind);
    say(s.id, kind);
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
        stop = await startRecording(kind, s.id);
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
