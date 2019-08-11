const socket = io();

// Elements
const messageForm = document.querySelector('#messageForm');
const messageFormBtn = messageForm.querySelector('#sendMsgBtn');
const messageFormInput = messageForm.querySelector('#message');
const sendLocationBtn = document.querySelector('#sendLocation');
const messages = document.querySelector('#messages');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const linkTemplate = document.querySelector('#link-template').innerHTML;

socket.on('message', ({ text, createdAt }) => {
	console.log(text);
	const html = Mustache.render(messageTemplate, {
		msg       : text,
		createdAt : moment(createdAt).format('h:mm a')
	});
	messages.insertAdjacentHTML('beforeend', html);
});

socket.on('locationMessage', ({ url, createdAt }) => {
	console.log(url);
	const html = Mustache.render(linkTemplate, {
		url,
		createdAt : moment(createdAt).format('h:mm a')
	});
	messages.insertAdjacentHTML('beforeend', html);
});

messageForm.addEventListener('submit', (e) => {
	e.preventDefault();
	const msg = messageForm.message.value;

	messageFormBtn.setAttribute('disabled', 'disabled');

	socket.emit('sendMessage', msg, (error) => {
		messageFormBtn.removeAttribute('disabled');
		messageFormInput.value = '';
		messageFormInput.focus();

		if (error) {
			return console.log(error);
		}
		console.log('The message was delivered!');
	});
});

sendLocationBtn.addEventListener('click', () => {
	if (!navigator.geolocation) {
		return alert('Geolocation is not supported by your browser');
	}

	sendLocationBtn.setAttribute('disabled', 'disabled');
	navigator.geolocation.getCurrentPosition((position) => {
		socket.emit(
			'sendLocation',
			{
				latitude  : position.coords.latitude,
				longitude : position.coords.longitude
			},
			(ack) => {
				sendLocationBtn.removeAttribute('disabled');
				console.log(ack);
			}
		);
	});
});
