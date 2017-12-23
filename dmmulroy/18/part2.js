const fs = require('fs');
const path = require('path');
const { fork } = require('child_process');

const input = fs.readFileSync(path.join(__dirname, 'input.txt'), 'utf8');

const sanitizedInput = input
  .trim()
  .split('\n')
  .map(row => row.split(' '));

const Actor0 = fork('actor.js', [0, sanitizedInput]);
const Actor1 = fork('actor.js', [1, sanitizedInput]);

Actor0.on('message', msg => {
  if (msg['sendCount']) {
    console.log('output:', msg['sendCount']);
    process.exit();
  } else {
    Actor1.send(msg);
  }
});

Actor1.on('message', msg => {
  Actor1.send(msg);
});

Actor0.send({ start: true });
Actor1.send({ start: true });
