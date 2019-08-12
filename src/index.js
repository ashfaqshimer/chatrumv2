const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { getUser, addUser, getUsersInRoom, removeUser } = require('./utils/users');

const publicPath = path.join(__dirname, '../public');

app.use(express.static(publicPath));

io.on('connection', (socket) => {
	socket.on('join', ({ username, room }, callback) => {
		const { error, user } = addUser({ id: socket.id, username, room });

		if (error) {
			return callback(error);
		}

		socket.join(user.room);

		socket.emit('message', generateMessage('admin', 'Welcome!'));
		socket.broadcast
			.to(user.room)
			.emit('message', generateMessage('admin', `${user.username} has joined!`));
		io.to(user.room).emit('roomData', {
			room  : user.room,
			users : getUsersInRoom(user.room)
		});
		callback();
	});

	socket.on('sendMessage', (msg, callback) => {
		const user = getUser(socket.id);

		const filter = new Filter();

		if (filter.isProfane(msg)) {
			return callback('Profanity is not allowed');
		}

		io.to(user.room).emit('message', generateMessage(user.username, msg));
		callback();
	});

	socket.on('disconnect', () => {
		const user = removeUser(socket.id);

		if (user) {
			io
				.to(user.room)
				.emit('message', generateMessage('admin', `${user.username} has left!`));
			io.to(user.room).emit('roomData', {
				room  : user.room,
				users : getUsersInRoom(user.room)
			});
		}
	});

	socket.on('sendLocation', (location, callback) => {
		const user = getUser(socket.id);

		io
			.to(user.room)
			.emit(
				'locationMessage',
				generateLocationMessage(
					user.username,
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
