// Prostředí, překážky a obtížnost. Jen data, bez kreslení.
// animals = zvířátka v pozadí (nejvýš jedno na obrazovce), weather = jaké počasí tu může být.

export const BIOMES = [
  { id: 'meadow', sky: ['#BDE6F7', '#EAF8FB'], sun: '#FFE58A', hill: '#BFE5A3', ground: '#8FD16F', dots: ['#FFFFFF', '#FFD432', '#FF8FC0'], decor: 'tree', decorStep: 620, decorH: 300,
    obstacles: [{ art: 'stone', w: 100, h: 74 }, { art: 'bush', w: 110, h: 84 }, { art: 'hedgehog', w: 100, h: 66 }],
    animals: ['rabbit', 'duck'], weather: ['sun', 'sun', 'rain', 'wind', 'storm'] },
  { id: 'farm', sky: ['#C4E7F7', '#F1FAF4'], sun: '#FFE58A', hill: '#CFE7A8', ground: '#A9D46F', dots: ['#FFFFFF', '#F2C94C', '#C99A5B'], decor: 'barn', decorStep: 900, decorH: 300,
    obstacles: [{ art: 'hay', w: 110, h: 80 }, { art: 'bucket', w: 84, h: 84 }, { art: 'fence', w: 120, h: 80 }],
    animals: ['cow', 'sheep', 'hen', 'pig'], weather: ['sun', 'sun', 'rain', 'wind'] },
  { id: 'forest', sky: ['#A9D8C6', '#E3F4DF'], sun: '#FFF0B0', hill: '#6DB67C', ground: '#5FA65A', dots: ['#8A5A33', '#FFD432', '#E23B3B'], decor: 'pine', decorStep: 240, decorH: 340,
    obstacles: [{ art: 'log', w: 120, h: 66 }, { art: 'mushroom', w: 90, h: 92 }, { art: 'stump', w: 96, h: 78 }],
    animals: ['hedgehog', 'rabbit'], weather: ['sun', 'rain', 'wind', 'storm'] },
  { id: 'zoo', sky: ['#BFE8E0', '#F4FBF1'], sun: '#FFD95A', hill: '#A8D8A0', ground: '#D9C48A', dots: ['#FFFFFF', '#B58F4C', '#3DAA4E'], decor: 'cage', decorStep: 520, decorH: 260,
    obstacles: [{ art: 'stone', w: 100, h: 74 }, { art: 'pond', w: 130, h: 60 }, { art: 'bush', w: 110, h: 84 }],
    animals: ['giraffe', 'elephant', 'monkey', 'lion'], weather: ['sun', 'sun', 'rain'] },
  { id: 'beach', sky: ['#7FD3F2', '#D8F4F7'], sun: '#FFD95A', hill: '#58BFE0', ground: '#F4DDA0', dots: ['#FFFFFF', '#F7C77C', '#FF8FC0'], decor: 'palm', decorStep: 700, decorH: 320,
    obstacles: [{ art: 'crab', w: 104, h: 70 }, { art: 'sandcastle', w: 110, h: 94 }, { art: 'shell', w: 90, h: 70 }],
    animals: ['crab'], weather: ['sun', 'sun', 'wind'] },
  { id: 'castle', sky: ['#D5D9F5', '#F6F2FB'], sun: '#FFE58A', hill: '#B9C7E6', ground: '#9CC67A', dots: ['#FFFFFF', '#FF8FC0', '#FFD432'], decor: 'castle', decorStep: 820, decorH: 340,
    obstacles: [{ art: 'gate', w: 100, h: 100 }, { art: 'shield', w: 84, h: 90 }, { art: 'sandcastle', w: 110, h: 94 }],
    animals: ['horse'], weather: ['sun', 'sun', 'wind', 'rain'] },
  { id: 'snow', sky: ['#C7DCF2', '#F2F8FC'], sun: '#FFFFFF', hill: '#E6F0F8', ground: '#FAFDFF', dots: ['#CFE2F2', '#BCD6EC', '#E6F0F8'], decor: 'snowpine', decorStep: 330, decorH: 320,
    obstacles: [{ art: 'snowman', w: 96, h: 104 }, { art: 'snowballs', w: 104, h: 84 }, { art: 'gift2', w: 90, h: 80 }],
    animals: ['rabbit'], weather: ['snow'] },
  { id: 'playground', sky: ['#BDE6F7', '#FFF6E5'], sun: '#FFD95A', hill: '#BFE5A3', ground: '#8FD16F', dots: ['#FFFFFF', '#FF8FC0', '#2F6FDE'], decor: 'swing', decorStep: 640, decorH: 260,
    obstacles: [{ art: 'ball', w: 84, h: 84 }, { art: 'bucket', w: 84, h: 84 }, { art: 'sandbox', w: 130, h: 80 }],
    animals: ['dog', 'cat'], weather: ['sun', 'sun', 'wind', 'rain'] },
  { id: 'city', sky: ['#FFD2B8', '#FFF1DE'], sun: '#FFB25A', hill: '#D6C7D8', ground: '#B9BEC6', dots: ['#FFFFFF', '#D5D9DE', '#FFD432'], decor: 'building', decorStep: 300, decorH: 420,
    obstacles: [{ art: 'cone', w: 84, h: 86 }, { art: 'crate', w: 96, h: 84 }, { art: 'hydrant', w: 76, h: 90 }],
    animals: ['dog', 'cat'], weather: ['sun', 'rain', 'wind'] },
  { id: 'dusk', sky: ['#24325E', '#5A5FA0'], sun: '#F8E27C', hill: '#39477E', ground: '#3F6B5A', dots: ['#FFD432', '#BFE5A3', '#FFFFFF'], decor: 'pine', decorStep: 420, decorH: 300, stars: true,
    obstacles: [{ art: 'stone', w: 100, h: 74 }, { art: 'mushroom', w: 90, h: 92 }, { art: 'stump', w: 96, h: 78 }],
    animals: ['cat'], weather: ['sun'] },
];

export const biomeIndex = (id) => Math.max(0, BIOMES.findIndex((b) => b.id === id));

export const DIFFICULTIES = {
  easy: { label: 'Lehká', speed: 140, gap: 1.4, birds: 0, hint: 1, show: 2 },
  normal: { label: 'Střední', speed: 160, gap: 1, birds: 0.25, hint: 2, show: 3 },
  hard: { label: 'Těžká', speed: 200, gap: 0.72, birds: 0.6, hint: 3, show: 4 },
};

// Pořadí, v jakém dítě vylepšení dostává. Vylepšení zůstanou do konce hry.
export const UPGRADES = ['fly', 'big', 'rainbow', 'friend', 'bubble', 'basket', 'umbrella', 'flowers', 'magnet', 'sparkle', 'butterfly', 'friend', 'music', 'friend'];
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

// Počasí pro místo. Bouřku může rodič vypnout. rng kvůli testům.
export function pickWeather(biome, stormOff = false, rng = Math.random) {
  const list = biome.weather.filter((w) => !(stormOff && w === 'storm'));
  return list[Math.floor(rng() * list.length)] ?? 'sun';
}
