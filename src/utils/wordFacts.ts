/**
 * wordFacts.ts
 *
 * Multiple fun facts per word. getRandomFact(word) returns a different
 * fact each time the result card is shown.
 */

const WORD_FACTS: Record<string, string[]> = {
  apple: [
    'Apples float in water because they are 25% air! 🌊',
    'There are over 7,500 varieties of apples grown worldwide! 🍎',
    'It takes about 4–5 years for an apple tree to produce its first fruit! 🌳',
    'Apple seeds contain a tiny amount of cyanide — but you\'d need thousands to feel anything! 🌱',
  ],
  banana: [
    'Bananas are technically berries, but strawberries are not! 🤯',
    'Bananas are slightly radioactive due to their potassium content! ☢️',
    'A cluster of bananas is called a hand, and a single banana is called a finger! 🖐️',
    'Bananas ripen faster when kept together — the gas they release speeds up the process! 💨',
  ],
  cherry: [
    'It takes about 5 years for a cherry tree to produce fruit! 🌳',
    'There are more than 1,000 varieties of cherries in the world! 🍒',
    'Cherries can help improve your sleep because they naturally contain melatonin! 😴',
    'The average cherry tree produces around 7,000 cherries per year! 🎉',
  ],
  grape: [
    'Grapes can be green, red, black, yellow, or purple! 🎨',
    'There are about 8,000 grape varieties grown in over 60 countries! 🌍',
    'Grapes explode when you put them in the microwave! 💥',
    'The ancient Egyptians grew grapes over 6,000 years ago! ⏳',
  ],
  lemon: [
    'Lemons contain more sugar than strawberries! 🍬',
    'A lemon tree can produce up to 600 lemons per year! 🍋',
    'Lemons can kill bacteria and were used as a natural disinfectant before modern medicine! 🦠',
    'If you rub a lemon on a mirror it gets crystal clear and fog-free! ✨',
  ],
  mango: [
    'Mangoes belong to the same family as cashews and pistachios! 🥜',
    'Mangoes are the most eaten fruit in the world! 🌏',
    'A mango tree can live and produce fruit for over 300 years! 🌲',
    'In India, the mango is the national fruit and a symbol of love! ❤️',
  ],
  orange: [
    'Oranges were originally green before humans bred sweeter versions! 🌿',
    'Brazil produces more oranges than any other country in the world! 🇧🇷',
    'The white part inside an orange peel is called the pith and is rich in fibre! 💪',
    'Oranges never ripen after being picked from the tree! ⏱️',
  ],
  pineapple: [
    'A pineapple plant takes 2 years to grow just one pineapple! ⏳',
    'Pineapples are not a single fruit — they are made of many smaller berries! 🍓',
    'Hawaii is famous for pineapples but they were originally from South America! 🌎',
    'Pineapples contain an enzyme that slowly dissolves your tongue as you eat them! 👅',
  ],
  strawberry: [
    'Strawberries have about 200 tiny seeds on the outside! 🔢',
    'Strawberries are the only fruit with seeds on the outside! 🌟',
    'There is a museum dedicated entirely to strawberries in Belgium! 🏛️',
    'Strawberries can be white or yellow — and some taste like pineapple! 🍍',
  ],
  watermelon: [
    "Watermelons are 92% water — that's how they got their name! 💧",
    'In Japan, square watermelons are grown so they fit more easily in fridges! 🟥',
    'Watermelon is both a fruit and a vegetable since it belongs to the cucumber family! 🥒',
    'Every part of a watermelon is edible, including the green rind! 🌿',
  ],
};

/** Returns a random fun fact for the given word */
export function getRandomFact(word: string): string {
  const facts = WORD_FACTS[word.toLowerCase()];
  if (!facts || facts.length === 0) return 'This is a fun word to discover! ✨';
  return facts[Math.floor(Math.random() * facts.length)];
}
