const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const { generateMessage, generateLocationMessage } = require('./utils/messages');
const publicPath = path.join(__dirname, '../public');

app.use(express.static(publicPath));

io.on('connection', (socket) => {
	socket.emit('message', generateMessage('Welcome!'));
	socket.broadcast.emit('message', generateMessage('A new user has joined!'));

	socket.on('sendMessage', (msg, callback) => {
		const filter = new Filter();
		if (filter.isProfane(msg)) {
			return callback('Profanity is not allowed');
		}
		io.emit('message', generateMessage(msg));
		callback('Delivered!');
	});

	socket.on('disconnect', () => {
		io.emit('message', generateMessage('A user has left!'));
	});

	socket.on('sendLocation', (location, callback) => {
		io.emit(
			'locationMessage',
			generateLocationMessage(
				`https://google.com/maps?q=${location.latitude},${location.longitude}`
			)
		);
		callback('Location shared!');
	});
});

// Server listening port
server.listen(process.env.PORT, () => {
	console.log('Server listening on port', process.env.PORT);
});
