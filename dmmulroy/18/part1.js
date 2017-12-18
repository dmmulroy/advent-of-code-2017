const fs = require('fs');
const path = require('path');

const input = fs.readFileSync(path.join(__dirname, 'input.txt'), 'utf8');

const sanitizedInput = input.split('\n').map(row => row.split(' '));

const calcRecoveredFrequency = instructions => {
  let register = {};
  let recoveredFrequency = 0;

  for (let idx = 0; idx < instructions.length; idx++) {
    const [op, registerKey, value] = instructions[idx];

    if (!register[registerKey]) register[registerKey] = 0;

    switch (op) {
      case 'set':
        register[registerKey] = register[value]
          ? register[value]
          : Number(value);
        break;
      case 'add':
        register[registerKey] = register[value]
          ? register[value] + register[registerKey]
          : Number(value) + register[registerKey];
        break;
      case 'mul':
        register[registerKey] = register[value]
          ? register[value] * register[registerKey]
          : Number(value) * register[registerKey];
        break;
      case 'mod':
        register[registerKey] = register[value]
          ? register[registerKey] % register[value]
          : register[registerKey] % Number(value);
        break;
      case 'snd':
        recoveredFrequency = register[registerKey];
        break;
      case 'jgz':
        if (register[registerKey] > 0) idx += Number(value) - 1;
        break;
      case 'rcv':
        if (recoveredFrequency > 0) return recoveredFrequency;
        break;
      default:
        throw new Error('Something went wrong');
        break;
    }
  }
};

console.log('output:', calcRecoveredFrequency(sanitizedInput));
