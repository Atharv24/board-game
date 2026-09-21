export class UIManager {
  constructor(elements) {
    this.el = elements;
  }

  showGameScreen() {
    this.el.setupScreen.style.display = 'none';
    this.el.gameScreen.style.display = 'flex';
  }

  showSetupScreen() {
    this.el.setupScreen.style.display = 'block';
    this.el.gameScreen.style.display = 'none';
  }

  updatePlayerList(players) {
    this.el.playerList.innerHTML = '';
    players.forEach(p => {
      const item = document.createElement('div');
      item.innerText = `${p.name} (Pos: ${p.position})`;
      item.style.color = p.color;
      item.style.fontWeight = 'bold';
      this.el.playerList.appendChild(item);
    });
  }

  updateTurnState({ players, currentTurnIndex, gameStarted, socketId }) {
    if (!gameStarted || players.length === 0) {
      this.el.turnIndicator.innerText = 'Waiting for game to start...';
      this.el.rollBtn.disabled = true;
      this.el.startBtn.style.display = 'block';
      return;
    }

    this.el.startBtn.style.display = 'none';
    const activePlayer = players[currentTurnIndex];
    if (!activePlayer) return;

    const isMyTurn = socketId === activePlayer.id;
    this.el.turnIndicator.innerText = isMyTurn ? 'Your turn!' : `Turn: ${activePlayer.name}`;
    this.el.rollBtn.disabled = !isMyTurn;
  }

  showBullyPrompt({ isBully, bullyName, targetName }) {
    this.el.rollBtn.disabled = true;
    if (isBully) {
      this.el.bullyPromptText.innerText = `You landed on ${targetName}! PUSH or PULL?`;
      this.el.bullyControls.style.display = 'block';
      this.el.turnIndicator.innerText = 'Bully Action Required!';
    } else {
      this.el.bullyControls.style.display = 'none';
      this.el.turnIndicator.innerText = `${bullyName} is deciding whether to PUSH or PULL ${targetName}...`;
    }
  }

  hideBullyPrompt() {
    this.el.bullyControls.style.display = 'none';
  }

  logMessage(message, isError = false) {
    if (isError) {
      this.el.log.innerHTML = `<span style="color: #e74c3c;">⚠️ ${message}</span>`;
    } else {
      this.el.log.innerText = message;
    }
  }

  showGameOver(winnerName) {
    alert(`${winnerName} wins the game!`);
    this.el.rollBtn.disabled = true;
    this.el.turnIndicator.innerText = `Game Over - Winner: ${winnerName}`;
    this.hideBullyPrompt();
  }
}
