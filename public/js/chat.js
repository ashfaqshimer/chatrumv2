const socket = io();

socket.on('connected', (msg) => {
	console.log(msg);
});

// socket.on('countUpdated', (count) => {
// 	console.log('Count has been updated', count);
// });

// const incrementBtn = document.querySelector('#increment');

// incrementBtn.addEventListener('click', () => {
// 	socket.emit('increment');
// });
