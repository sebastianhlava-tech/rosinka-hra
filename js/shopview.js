// Okno krámku: dítě ťukne na věc, potom ťuká hvězdičky na pult. Hlas počítá.
// Když je hvězdiček dost, prodavač poděkuje a dá věc. Nic se neztratí.
import { artSvg } from './art.js';
import { SHOPS, buy, shopItems } from './shop.js';
import { say } from './voice.js';

const MAX_SHOWN = 10;
const starIcon = artSvg('star');

export function openShop(root, biome, state, onDone) {
  const shop = SHOPS[biome];
  const items = shopItems(biome, state);
  let chosen = null;
  let paid = 0;
  let busy = false;

  root.innerHTML = `
    <div class="shop-seller">${artSvg(shop.seller)}</div>
    <button class="shop-skip" aria-label="Dál">${artSvg('arrow')}</button>
    <div class="shop-counter"></div>
    <div class="shop-wallet"></div>`;
  const counter = root.querySelector('.shop-counter');
  const wallet = root.querySelector('.shop-wallet');

  const draw = () => {
    counter.innerHTML = items.map((it) => `
      <button class="shop-item ${it === chosen ? 'chosen' : ''} ${it.price > state.stars ? 'dear' : ''}" data-id="${it.id}">
        <span class="shop-art">${artSvg(it.art)}</span>
        <span class="shop-price">${Array.from({ length: it.price }, (_, i) => `<i class="${it === chosen && i < paid ? 'paid' : ''}">${starIcon}</i>`).join('')}</span>
      </button>`).join('');
    const left = Math.min(state.stars - paid, MAX_SHOWN);
    wallet.innerHTML = Array.from({ length: left }, () => `<button class="shop-star">${starIcon}</button>`).join('');
  };

  const close = (item) => {
    root.hidden = true;
    root.innerHTML = '';
    onDone(item);
  };

  counter.onclick = (e) => {
    const b = e.target.closest('.shop-item');
    if (!b || busy) return;
    const it = items.find((i) => i.id === b.dataset.id);
    paid = 0;
    if (it.price > state.stars) {
      chosen = null;
      draw();
      say('need-more');
      return;
    }
    chosen = it;
    draw();
    say(`price-${it.id}`);
  };

  wallet.onclick = async (e) => {
    if (!e.target.closest('.shop-star') || busy) return;
    if (!chosen) return say(`shop-${biome}`);
    paid++;
    draw();
    if (paid < chosen.price) return say(`tally-${paid}`);
    busy = true;
    await say(`tally-${paid}`);
    buy(state, chosen.id);
    root.querySelector('.shop-item.chosen')?.classList.add('bought');
    await say('thanks');
    if (chosen.wear) await say(`wear-${chosen.id}`);
    close(chosen);
  };

  root.querySelector('.shop-skip').onclick = () => { if (!busy) close(null); };

  draw();
  root.hidden = false;
  say(`shop-${biome}`);
}
