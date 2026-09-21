const http = require('http');
const { Server } = require('socket.io');
const createApp = require('./src/app');
const GameState = require('./src/gameState');
const registerSocketHandlers = require('./src/socketHandlers');

const app = createApp();
const server = http.createServer(app);
const io = new Server(server);
const game = new GameState();

registerSocketHandlers(io, game);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
