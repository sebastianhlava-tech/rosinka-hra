// Tvorba postavičky, maminky a tatínka: nahoře karty, pod nimi druhy a barvy.
import { artSvg, svgToDataUrl } from './art.js';
import { categoriesFor, characterFor, characterLocked, hasColor, normalizeCharacter, optionCount, paletteFor, partSvg, randomCharacter } from './character.js';
import { chime } from './voice.js';

const TITLES = { child: 'Rosinka', mom: 'Maminka', dad: 'Tatínek' };
const TAB_ICONS = { face: 0, hair: 0, dress: 0, shoes: 0, hat: 2, glasses: 1, necklace: 2, back: 1, hand: 1, paint: 2, eyes: 1, mouth: 2, hairclip: 2, pattern: 1, costume: 1, socks: 2 };
const GROUPS = [['me', 'Já'], ['clothes', 'Oblečení']];

// owned = věci koupené v krámku (kostýmy). Bez nich jsou zamčené, pokud rodič neodemkl vše.
export function openCreator(root, kind, character, onDone, owned = [], unlockAll = false) {
  let choice = normalizeCharacter(character);
  const cats = categoriesFor(kind);
  let cat = cats[0].id;
  let group = 'me';
  const locked = (c, i) => !unlockAll && characterLocked(c, i, owned);

  root.innerHTML = `
    <div class="creator-left">
      <h2>${TITLES[kind]}</h2>
      <div class="creator-stage"><img class="creator-preview" alt=""></div>
      <div class="creator-actions">
        <button class="creator-dice"><img src="${svgToDataUrl(artSvg('dice'))}" alt="Náhodně"></button>
        <button class="creator-done"><img src="${svgToDataUrl(artSvg('check'))}" alt="Hotovo"></button>
      </div>
    </div>
    <div class="creator-right">
      <div class="creator-groups">${GROUPS.map(([id, label]) => `<button data-group="${id}">${label}</button>`).join('')}</div>
      <div class="creator-tabs"></div>
      <div class="creator-options"></div>
      <div class="creator-colors"></div>
    </div>`;

  const preview = root.querySelector('.creator-preview');
  const tabs = root.querySelector('.creator-tabs');
  const options = root.querySelector('.creator-options');
  const colors = root.querySelector('.creator-colors');

  const showFigure = () => {
    preview.src = svgToDataUrl(characterFor(kind, choice));
    preview.classList.remove('hop');
    void preview.offsetWidth;
    preview.classList.add('hop');
  };

  const showColors = () => {
    colors.classList.toggle('off', !hasColor(cat, choice[cat]));
    colors.querySelectorAll('button').forEach((b) => {
      b.classList.toggle('picked', choice.colors[cat] === b.dataset.color);
    });
  };

  const showOptions = () => {
    const count = optionCount(cat, kind);
    options.innerHTML = '';
    options.style.gridTemplateColumns = `repeat(${Math.ceil(count / 2)}, 1fr)`;
    for (let i = 0; i < count; i++) {
      const b = document.createElement('button');
      b.classList.toggle('picked', choice[cat] === i);
      b.classList.toggle('locked', locked(cat, i));
      b.innerHTML = partSvg(cat, i, kind, choice);
      b.addEventListener('click', () => {
        if (locked(cat, i)) return chime(220);
        choice[cat] = i;
        chime(520 + i * 40);
        options.querySelector('.picked')?.classList.remove('picked');
        b.classList.add('picked');
        showColors();
        showFigure();
      });
      options.append(b);
    }
  };

  const paintColors = () => {
    colors.innerHTML = '';
    paletteFor(cat).forEach((color) => {
      const b = document.createElement('button');
      b.dataset.color = color;
      b.style.background = color;
      b.addEventListener('click', () => {
        // Druhé ťuknutí vrátí původní barvu. Kůže barvu mít musí.
        if (choice.colors[cat] === color && cat !== 'face') delete choice.colors[cat];
        else choice.colors[cat] = color;
        chime(700);
        showOptions();
        showColors();
        showFigure();
      });
      colors.append(b);
    });
  };

  const openTab = () => {
    group = cats.find((c) => c.id === cat).group;
    root.querySelectorAll('[data-group]').forEach((b) => b.classList.toggle('active', b.dataset.group === group));
    const inGroup = cats.filter((c) => c.group === group).length;
    tabs.style.gridTemplateColumns = `repeat(${inGroup}, 1fr)`;
    tabs.querySelectorAll('button').forEach((b) => {
      b.hidden = cats.find((c) => c.id === b.dataset.cat).group !== group;
      b.classList.toggle('active', b.dataset.cat === cat);
    });
    paintColors();
    showOptions();
    showColors();
  };

  root.querySelectorAll('[data-group]').forEach((b) => b.addEventListener('click', () => {
    cat = cats.find((c) => c.group === b.dataset.group).id;
    chime(560);
    openTab();
  }));

  cats.forEach(({ id, label }) => {
    const b = document.createElement('button');
    b.dataset.cat = id;
    b.innerHTML = `${partSvg(id, TAB_ICONS[id], kind)}<span>${label}</span>`;
    b.addEventListener('click', () => {
      cat = id;
      chime(600);
      openTab();
    });
    tabs.append(b);
  });

  root.querySelector('.creator-dice').addEventListener('click', () => {
    choice = randomCharacter(kind, choice);
    chime(880);
    openTab();
    showFigure();
  });
  root.querySelector('.creator-done').addEventListener('click', () => onDone(choice));
  openTab();
  showFigure();
}
