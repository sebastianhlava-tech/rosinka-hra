// Tvorba kamaráda: stejné okno jako tvorba postavičky. Zamčené doplňky se koupí v krámku.
import { artSvg, svgToDataUrl } from './art.js';
import { FUR, PET_CATEGORIES, petLocked, petOptionCount, petPartSvg, petSvg, randomPet } from './pets.js';
import { chime } from './voice.js';

export function openPetCreator(root, pet, owned, onDone) {
  let choice = { ...pet };
  let cat = PET_CATEGORIES[0].id;

  root.innerHTML = `
    <div class="creator-left">
      <h2>Kamarád</h2>
      <div class="creator-stage"><img class="creator-preview pet-preview" alt=""></div>
      <div class="creator-actions">
        <button class="creator-dice"><img src="${svgToDataUrl(artSvg('dice'))}" alt="Náhodně"></button>
        <button class="creator-done"><img src="${svgToDataUrl(artSvg('check'))}" alt="Hotovo"></button>
      </div>
    </div>
    <div class="creator-right">
      <div class="creator-tabs" style="grid-template-columns: repeat(${PET_CATEGORIES.length}, 1fr)"></div>
      <div class="creator-options"></div>
      <div class="creator-colors"></div>
    </div>`;

  const preview = root.querySelector('.creator-preview');
  const tabs = root.querySelector('.creator-tabs');
  const options = root.querySelector('.creator-options');
  const colors = root.querySelector('.creator-colors');

  const showPet = () => {
    preview.src = svgToDataUrl(petSvg(choice));
    preview.classList.remove('hop');
    void preview.offsetWidth;
    preview.classList.add('hop');
  };

  const showOptions = () => {
    const count = petOptionCount(cat);
    options.innerHTML = '';
    options.style.gridTemplateColumns = `repeat(${Math.ceil(count / 2)}, 1fr)`;
    for (let i = 0; i < count; i++) {
      const b = document.createElement('button');
      const locked = petLocked(cat, i, owned);
      b.classList.toggle('picked', choice[cat] === i);
      b.classList.toggle('locked', locked);
      b.innerHTML = petPartSvg(cat, i, choice);
      b.addEventListener('click', () => {
        if (locked) return chime(220);
        choice[cat] = i;
        if (cat === 'species') choice.color = null;
        chime(520 + i * 40);
        showOptions();
        showPet();
      });
      options.append(b);
    }
    colors.classList.toggle('off', cat !== 'species');
  };

  FUR.forEach((color) => {
    const b = document.createElement('button');
    b.style.background = color;
    b.addEventListener('click', () => {
      choice.color = choice.color === color ? null : color;
      chime(700);
      showOptions();
      showPet();
    });
    colors.append(b);
  });

  const openTab = () => {
    tabs.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b.dataset.cat === cat));
    showOptions();
  };

  PET_CATEGORIES.forEach(({ id, label }) => {
    const b = document.createElement('button');
    b.dataset.cat = id;
    b.innerHTML = `${petPartSvg(id, id === 'species' ? choice.species : 1, choice)}<span>${label}</span>`;
    b.addEventListener('click', () => { cat = id; chime(600); openTab(); });
    tabs.append(b);
  });

  root.querySelector('.creator-dice').addEventListener('click', () => {
    choice = randomPet(owned);
    chime(880);
    openTab();
    showPet();
  });
  root.querySelector('.creator-done').addEventListener('click', () => onDone(choice));
  openTab();
  showPet();
}
