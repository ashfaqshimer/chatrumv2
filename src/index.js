const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicPath = path.join(__dirname, '../public');

app.use(express.static(publicPath));

io.on('connection', (socket) => {
	console.log('New websocket connection');
	socket.emit('connected', 'Welcome!');
	// socket.emit('countUpdated', count);
	// socket.on('increment', () => {
	// 	count++;
	// 	io.emit('countUpdated', count);
	// });
});

// Server listening port
server.listen(process.env.PORT, () => {
	console.log('Server listening on port', process.env.PORT);
});
