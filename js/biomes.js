// Prostředí, překážky a obtížnost. Jen data, bez kreslení.

export const BIOMES = [
  { id: 'meadow', sky: ['#BDE6F7', '#EAF8FB'], sun: '#FFE58A', hill: '#BFE5A3', ground: '#8FD16F', dots: ['#FFFFFF', '#FFD432', '#FF8FC0'], decor: 'tree', decorStep: 620, decorH: 300,
    obstacles: [{ art: 'stone', w: 100, h: 74 }, { art: 'bush', w: 110, h: 84 }, { art: 'hedgehog', w: 100, h: 66 }] },
  { id: 'forest', sky: ['#A9D8C6', '#E3F4DF'], sun: '#FFF0B0', hill: '#6DB67C', ground: '#5FA65A', dots: ['#8A5A33', '#FFD432', '#E23B3B'], decor: 'pine', decorStep: 240, decorH: 340,
    obstacles: [{ art: 'log', w: 120, h: 66 }, { art: 'mushroom', w: 90, h: 92 }, { art: 'stump', w: 96, h: 78 }] },
  { id: 'beach', sky: ['#7FD3F2', '#D8F4F7'], sun: '#FFD95A', hill: '#58BFE0', ground: '#F4DDA0', dots: ['#FFFFFF', '#F7C77C', '#FF8FC0'], decor: 'palm', decorStep: 700, decorH: 320,
    obstacles: [{ art: 'crab', w: 104, h: 70 }, { art: 'sandcastle', w: 110, h: 94 }, { art: 'shell', w: 90, h: 70 }] },
  { id: 'snow', sky: ['#C7DCF2', '#F2F8FC'], sun: '#FFFFFF', hill: '#E6F0F8', ground: '#FAFDFF', dots: ['#CFE2F2', '#BCD6EC', '#E6F0F8'], decor: 'snowpine', decorStep: 330, decorH: 320, snow: true,
    obstacles: [{ art: 'snowman', w: 96, h: 104 }, { art: 'snowballs', w: 104, h: 84 }, { art: 'gift2', w: 90, h: 80 }] },
  { id: 'city', sky: ['#FFD2B8', '#FFF1DE'], sun: '#FFB25A', hill: '#D6C7D8', ground: '#B9BEC6', dots: ['#FFFFFF', '#D5D9DE', '#FFD432'], decor: 'building', decorStep: 300, decorH: 420,
    obstacles: [{ art: 'cone', w: 84, h: 86 }, { art: 'crate', w: 96, h: 84 }, { art: 'hydrant', w: 76, h: 90 }] },
  { id: 'dusk', sky: ['#24325E', '#5A5FA0'], sun: '#F8E27C', hill: '#39477E', ground: '#3F6B5A', dots: ['#FFD432', '#BFE5A3', '#FFFFFF'], decor: 'pine', decorStep: 420, decorH: 300, stars: true,
    obstacles: [{ art: 'stone', w: 100, h: 74 }, { art: 'mushroom', w: 90, h: 92 }, { art: 'stump', w: 96, h: 78 }] },
];

export const DIFFICULTIES = {
  easy: { label: 'Lehká', speed: 140, gap: 1.4, birds: 0, hint: 1, show: 2 },
  normal: { label: 'Střední', speed: 160, gap: 1, birds: 0.25, hint: 2, show: 3 },
  hard: { label: 'Těžká', speed: 200, gap: 0.72, birds: 0.6, hint: 3, show: 4 },
};

// Pořadí, v jakém dítě vylepšení dostává. Vylepšení zůstanou do konce hry.
export const UPGRADES = ['fly', 'big', 'rainbow', 'friend', 'bubble', 'basket', 'flowers', 'magnet', 'sparkle', 'butterfly', 'friend', 'music', 'friend'];
export const MAX_FRIENDS = 3;

// owned = vylepšení, která dítě v této hře má. friends = kamarádi z vylepšení, pets = trvalí kamarádi.
// Kamarád přijde jen tehdy, když je pro něj místo.
export function nextUpgrade(owned, friends, pets = 0) {
  const left = [...UPGRADES];
  const take = (u) => { const i = left.indexOf(u); if (i >= 0) left.splice(i, 1); };
  owned.filter((u) => u !== 'friend').forEach(take);
  for (let i = 0; i < friends; i++) take('friend');
  return left.find((u) => u !== 'friend' || friends + pets < MAX_FRIENDS) ?? 'party';
}
