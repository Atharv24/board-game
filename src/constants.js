// Board layout and rule constants
const BOARD_SIZE = 100;
const SNAKES = Object.freeze({
  16: 6,
  47: 26,
  49: 11,
  56: 53,
  62: 19,
  64: 60,
  87: 24,
  93: 73,
  95: 75,
  98: 78
});

const LADDERS = Object.freeze({
  1: 38,
  4: 14,
  9: 31,
  21: 42,
  28: 84,
  36: 44,
  51: 67,
  71: 91,
  80: 100
});

const PLAYER_COLORS = Object.freeze(['#e74c3c', '#3498db', '#2ecc71', '#f1c40f']);
const NUM_MAX_PLAYERS = 2;

const PLAYER_CLASSES = Object.freeze({
  VANILLA: { id: 0, name: 'VANILLA' },
  BULLY: { id: 1, name: 'BULLY' }
});

module.exports = {
  BOARD_SIZE,
  SNAKES,
  LADDERS,
  PLAYER_COLORS,
  NUM_MAX_PLAYERS,
  PLAYER_CLASSES
};
