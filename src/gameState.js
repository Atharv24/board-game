const {
  BOARD_SIZE,
  SNAKES,
  LADDERS,
  PLAYER_COLORS,
  NUM_MAX_PLAYERS,
  PLAYER_CLASSES
} = require('./constants');

class GameState {
  constructor() {
    this.players = [];
    this.currentTurnIndex = 0;
    this.gameStarted = false;
    this.pendingBullyAction = null;
  }

  addPlayer(socketId, name) {
    if (this.gameStarted) {
      return { success: false, error: 'Game already in progress.' };
    }
    if (this.players.length >= NUM_MAX_PLAYERS) {
      return { success: false, error: 'Max player count reached.' };
    }

    const player = {
      id: socketId,
      name: (name && name.trim()) ? name.trim() : `Player ${this.players.length + 1}`,
      position: 1,
      color: PLAYER_COLORS[this.players.length % PLAYER_COLORS.length],
      class: PLAYER_CLASSES.BULLY
    };

    this.players.push(player);
    return { success: true, player };
  }

  removePlayer(socketId) {
    if (this.pendingBullyAction &&
       (this.pendingBullyAction.bullyId === socketId || this.pendingBullyAction.targetId === socketId)) {
      this.pendingBullyAction = null;
    }

    this.players = this.players.filter(p => p.id !== socketId);
    if (this.players.length === 0) {
      this.gameStarted = false;
      this.currentTurnIndex = 0;
    } else if (this.currentTurnIndex >= this.players.length) {
      this.currentTurnIndex = 0;
    }
  }

  startGame() {
    if (this.players.length > 0) {
      this.gameStarted = true;
      return true;
    }
    return false;
  }

  getCurrentPlayer() {
    return this.players[this.currentTurnIndex] || null;
  }

  rollDice(socketId) {
    if (!this.gameStarted || this.players.length === 0) {
      return { success: false, error: 'Game not running.' };
    }
    if (this.pendingBullyAction) {
      return { success: false, error: 'Bully action is currently pending.' };
    }

    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer || socketId !== currentPlayer.id) {
      return { success: false, error: 'Not your turn.' };
    }

    const roll = Math.floor(Math.random() * 6) + 1;
    let nextPos = currentPlayer.position + roll;

    // Exact roll required to reach or stay <= BOARD_SIZE
    if (nextPos <= BOARD_SIZE) {
      if (SNAKES[nextPos]) {
        nextPos = SNAKES[nextPos];
      } else if (LADDERS[nextPos]) {
        nextPos = LADDERS[nextPos];
      }
      currentPlayer.position = nextPos;
    }

    let winner = null;
    if (currentPlayer.position === BOARD_SIZE) {
      winner = currentPlayer;
    }

    // Check Bully condition
    let bullyPrompt = null;
    if (!winner && currentPlayer.class?.name === 'BULLY') {
      const victim = this.players.find(p => p.id !== currentPlayer.id && p.position === currentPlayer.position);
      if (victim) {
        this.pendingBullyAction = {
          bullyId: currentPlayer.id,
          targetId: victim.id
        };
        bullyPrompt = {
          bullyId: currentPlayer.id,
          bullyName: currentPlayer.name,
          targetId: victim.id,
          targetName: victim.name
        };
      }
    }

    if (!bullyPrompt) {
      this.advanceTurn();
    }

    return {
      success: true,
      roll,
      player: currentPlayer.name,
      winner,
      bullyPrompt
    };
  }

  handleBullyAction(socketId, action) {
    if (!this.pendingBullyAction) {
      return { success: false, error: 'No bully action pending.' };
    }
    if (socketId !== this.pendingBullyAction.bullyId) {
      return { success: false, error: 'Only the bully can take this action.' };
    }
    if (action !== 'PUSH' && action !== 'PULL') {
      return { success: false, error: 'Invalid action type.' };
    }

    const bully = this.players.find(p => p.id === this.pendingBullyAction.bullyId);
    const victim = this.players.find(p => p.id === this.pendingBullyAction.targetId);

    if (!bully || !victim) {
      this.pendingBullyAction = null;
      this.advanceTurn();
      return { success: false, error: 'Involved players are no longer in game.' };
    }

    const actionRoll = Math.floor(Math.random() * 6) + 1;
    let nextPos = victim.position;
    if (action === 'PUSH') {
      nextPos = Math.min(BOARD_SIZE, nextPos + actionRoll);
    } else if (action === 'PULL') {
      nextPos = Math.max(1, nextPos - actionRoll);
    }

    // Apply snake/ladder on victim
    if (SNAKES[nextPos]) {
      nextPos = SNAKES[nextPos];
    } else if (LADDERS[nextPos]) {
      nextPos = LADDERS[nextPos];
    }
    victim.position = nextPos;

    let winner = null;
    if (victim.position === BOARD_SIZE) {
      winner = victim;
    }

    this.pendingBullyAction = null;
    this.advanceTurn();

    return {
      success: true,
      bullyName: bully.name,
      victimName: victim.name,
      action,
      actionRoll,
      victimPosition: victim.position,
      winner
    };
  }

  advanceTurn() {
    if (this.players.length > 0) {
      this.currentTurnIndex = (this.currentTurnIndex + 1) % this.players.length;
    }
  }

  getPublicState() {
    return {
      players: this.players,
      currentTurnIndex: this.currentTurnIndex,
      gameStarted: this.gameStarted,
      hasPendingBullyAction: !!this.pendingBullyAction
    };
  }
}

module.exports = GameState;
