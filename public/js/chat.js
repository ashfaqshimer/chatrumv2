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
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoScroll = () => {
	// New message element
	const newMessage = messages.lastElementChild;

	// Height of the new message
	const newMessageStyles = getComputedStyle(newMessage);
	const newMessageMargin = parseInt(newMessageStyles.marginBottom);
	const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

	// Visible height
	const visibleHeight = messages.offsetHeight;

	// Height of messages container
	const containerHeight = messages.scrollHeight;

	// How far scrolled
	const scrollOffset = messages.scrollTop + visibleHeight;

	if (containerHeight - newMessageHeight <= scrollOffset) {
		messages.scrollTop = messages.scrollHeight;
	}
};

socket.on('message', ({ username, text, createdAt }) => {
	const html = Mustache.render(messageTemplate, {
		username,
		msg       : text,
		createdAt : moment(createdAt).format('h:mm a')
	});
	messages.insertAdjacentHTML('beforeend', html);
	autoScroll();
});

socket.on('locationMessage', ({ username, url, createdAt }) => {
	console.log(url);
	const html = Mustache.render(linkTemplate, {
		username,
		url,
		createdAt : moment(createdAt).format('h:mm a')
	});
	messages.insertAdjacentHTML('beforeend', html);
	autoScroll();
});

socket.on('roomData', ({ room, users }) => {
	const html = Mustache.render(sidebarTemplate, {
		room,
		users
	});
	document.querySelector('#sidebar').innerHTML = html;
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
			return alert(error);
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

socket.emit('join', { username, room }, (error) => {
	if (error) {
		alert(error);
		location.href = '/';
	}
});
