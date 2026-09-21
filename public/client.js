import { BoardRenderer } from './js/boardRenderer.js';
import { UIManager } from './js/uiManager.js';

class GameClient {
  constructor() {
    this.socket = io();
    this.socketId = null;
    this.isGameStarted = false;

    this.ui = new UIManager({
      setupScreen: document.getElementById('setup-screen'),
      gameScreen: document.getElementById('game-screen'),
      usernameInput: document.getElementById('username'),
      joinBtn: document.getElementById('join-btn'),
      startBtn: document.getElementById('start-btn'),
      rollBtn: document.getElementById('roll-btn'),
      playerList: document.getElementById('player-list'),
      turnIndicator: document.getElementById('turn-indicator'),
      log: document.getElementById('log'),
      bullyControls: document.getElementById('bully-controls'),
      bullyPromptText: document.getElementById('bully-prompt-text'),
      pushBtn: document.getElementById('push-btn'),
      pullBtn: document.getElementById('pull-btn')
    });

    this.board = new BoardRenderer(
      document.getElementById('board'),
      document.getElementById('board-overlay'),
      document.getElementById('board-container')
    );

    this.init();
  }

  init() {
    this.attachDomEvents();
    this.attachSocketEvents();
  }

  attachDomEvents() {
    // Join lobby
    this.ui.el.joinBtn.addEventListener('click', () => {
      const name = this.ui.el.usernameInput.value.trim();
      if (!name) {
        this.ui.el.usernameInput.focus();
        return;
      }
      this.socket.emit('joinGame', name);
      this.socketId = this.socket.id;
      this.ui.showGameScreen();
      this.board.build();
    });

    // Enter key on username input
    this.ui.el.usernameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.ui.el.joinBtn.click();
      }
    });

    // Start game
    this.ui.el.startBtn.addEventListener('click', () => {
      this.socket.emit('startGame');
    });

    // Roll dice
    this.ui.el.rollBtn.addEventListener('click', () => {
      this.socket.emit('rollDice');
    });

    // Bully Push / Pull
    this.ui.el.pushBtn.addEventListener('click', () => {
      this.socket.emit('bullyAction', { action: 'PUSH' });
      this.ui.hideBullyPrompt();
    });

    this.ui.el.pullBtn.addEventListener('click', () => {
      this.socket.emit('bullyAction', { action: 'PULL' });
      this.ui.hideBullyPrompt();
    });

    // Window resize
    window.addEventListener('resize', () => {
      if (this.ui.el.gameScreen.style.display !== 'none') {
        this.board.drawConnections();
      }
    });
  }

  attachSocketEvents() {
    this.socket.on('connect', () => {
      this.socketId = this.socket.id;
    });

    this.socket.on('updateGameState', (state) => {
      this.isGameStarted = state.gameStarted;
      this.board.renderTokens(state.players);
      this.ui.updatePlayerList(state.players);
      this.ui.updateTurnState({
        players: state.players,
        currentTurnIndex: state.currentTurnIndex,
        gameStarted: state.gameStarted,
        socketId: this.socketId
      });
    });

    this.socket.on('diceRolled', ({ player, roll, players, currentTurnIndex, winner, bullyPrompt }) => {
      this.ui.logMessage(`${player} rolled a ${roll}!`);
      this.board.renderTokens(players);
      this.ui.updatePlayerList(players);

      if (winner) {
        this.ui.showGameOver(winner.name);
        return;
      }

      if (bullyPrompt) {
        this.ui.showBullyPrompt({
          isBully: this.socketId === bullyPrompt.bullyId,
          bullyName: bullyPrompt.bullyName,
          targetName: bullyPrompt.targetName
        });
      } else {
        this.ui.hideBullyPrompt();
        this.ui.updateTurnState({
          players,
          currentTurnIndex,
          gameStarted: true,
          socketId: this.socketId
        });
      }
    });

    this.socket.on('bullyActionResult', ({ bullyName, victimName, action, actionRoll, victimPosition, players, currentTurnIndex, winner }) => {
      this.ui.hideBullyPrompt();
      this.ui.logMessage(`${bullyName} used ${action} on ${victimName} (Rolled a ${actionRoll})! ${victimName} moved to ${victimPosition}.`);
      this.board.renderTokens(players);
      this.ui.updatePlayerList(players);

      if (winner) {
        this.ui.showGameOver(winner.name);
      } else {
        this.ui.updateTurnState({
          players,
          currentTurnIndex,
          gameStarted: true,
          socketId: this.socketId
        });
      }
    });

    this.socket.on('errorMsg', (message) => {
      this.ui.logMessage(message, true);
      if (!this.isGameStarted && this.ui.el.playerList.children.length === 0) {
        this.ui.showSetupScreen();
        alert(message);
      }
    });
  }
}

// Instantiate client when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new GameClient();
});
