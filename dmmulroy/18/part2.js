const fs = require('fs');
const path = require('path');
const { fork } = require('child_process');

const input = fs.readFileSync(path.join(__dirname, 'input.txt'), 'utf8');

const sanitizedInput = input.split('\n').map(row => row.split(' '));

const Actor1 = fork('actor.js', [0, sanitizedInput]);
const Actor2 = fork('actor.js', [1, sanitizedInput]);

Actor1.on('message', msg => {
  console.log('actor1 msg', msg);
  if (msg['sendCount']) {
    console.log('output:', msg['sendCount']);
    process.exit();
  } else {
    Actor2.send(msg);
  }
});

Actor2.on('message', msg => {
  console.log('actor2 msg', msg);
  Actor2.send(msg);
});

Actor1.send({ start: true });
Actor2.send({ start: true });
