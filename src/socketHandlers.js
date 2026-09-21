function registerSocketHandlers(io, game) {
  io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Join game lobby
    socket.on('joinGame', (name) => {
      const result = game.addPlayer(socket.id, name);
      if (!result.success) {
        socket.emit('errorMsg', result.error);
        return;
      }
      io.emit('updateGameState', game.getPublicState());
    });

    // Start game
    socket.on('startGame', () => {
      if (game.startGame()) {
        io.emit('updateGameState', game.getPublicState());
      }
    });

    // Roll dice
    socket.on('rollDice', () => {
      const result = game.rollDice(socket.id);
      if (!result.success) {
        if (result.error) socket.emit('errorMsg', result.error);
        return;
      }

      const state = game.getPublicState();
      io.emit('diceRolled', {
        player: result.player,
        roll: result.roll,
        players: state.players,
        currentTurnIndex: state.currentTurnIndex,
        winner: result.winner,
        bullyPrompt: result.bullyPrompt
      });
    });

    // Bully action (PUSH or PULL)
    socket.on('bullyAction', (data) => {
      const action = data?.action;
      const result = game.handleBullyAction(socket.id, action);
      if (!result.success) {
        if (result.error) socket.emit('errorMsg', result.error);
        return;
      }

      const state = game.getPublicState();
      io.emit('bullyActionResult', {
        bullyName: result.bullyName,
        victimName: result.victimName,
        action: result.action,
        actionRoll: result.actionRoll,
        victimPosition: result.victimPosition,
        players: state.players,
        currentTurnIndex: state.currentTurnIndex,
        winner: result.winner
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`Player disconnected: ${socket.id}`);
      game.removePlayer(socket.id);
      io.emit('updateGameState', game.getPublicState());
    });
  });
}

module.exports = registerSocketHandlers;
