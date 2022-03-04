const uuid = (Math.random() + 1).toString(36).substring(7);
const url = location.href.replace('https', 'wss');
const connection = new WebSocket(`${url}ws?uuid=${uuid}`);

connection.onopen = () => {
  console.log('connected');
};

connection.onclose = () => {
  console.error('disconnected');
};

connection.onerror = error => {
  console.error('failed to connect', error);
};

connection.onmessage = event => {
  console.log('received', event.data);
  let li = document.createElement('li');
  li.innerText = event.data;
  document.querySelector('#chat').append(li);
};

document.querySelector('form').addEventListener('submit', event => {
  event.preventDefault();
  let message = document.querySelector('#message').value;
  connection.send(message);
  document.querySelector('#message').value = '';
});