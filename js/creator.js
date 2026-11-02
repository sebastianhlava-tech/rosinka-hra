// Tvorba postavičky, maminky a tatínka: 5 řad, v každé 5 velkých obrázků.
import { CATEGORIES, artSvg, characterFor, optionCount, partSvg, svgToDataUrl } from './art.js';
import { chime } from './voice.js';

const TITLES = { child: 'Rosinka', mom: 'Maminka', dad: 'Tatínek' };

export function openCreator(root, kind, character, onDone) {
  const choice = { ...character };
  root.innerHTML = `
    <div class="creator-left">
      <h2>${TITLES[kind]}</h2>
      <img class="creator-preview" alt="">
      <button class="creator-done"><img src="${svgToDataUrl(artSvg('check'))}" alt="Hotovo"></button>
    </div>
    <div class="creator-rows"></div>`;

  const preview = root.querySelector('.creator-preview');
  const rows = root.querySelector('.creator-rows');
  const refresh = () => {
    preview.src = svgToDataUrl(characterFor(kind, choice));
    rows.querySelectorAll('button').forEach((b) => {
      b.classList.toggle('picked', choice[b.dataset.cat] === Number(b.dataset.i));
    });
  };

  for (const cat of CATEGORIES) {
    const row = document.createElement('div');
    const count = optionCount(cat, kind);
    row.className = count > 5 ? 'creator-row scroll' : 'creator-row';
    for (let i = 0; i < count; i++) {
      const b = document.createElement('button');
      b.dataset.cat = cat;
      b.dataset.i = i;
      b.innerHTML = partSvg(cat, i, kind);
      b.addEventListener('click', () => {
        choice[cat] = i;
        chime(520 + i * 60);
        refresh();
      });
      row.append(b);
    }
    rows.append(row);
  }

  root.querySelector('.creator-done').addEventListener('click', () => onDone(choice));
  refresh();
  rows.querySelectorAll('.picked').forEach((b) => b.scrollIntoView({ inline: 'center', block: 'nearest' }));
}
