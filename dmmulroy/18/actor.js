const fs = require('fs');
const path = require('path');

const input = fs.readFileSync(path.join(__dirname, 'input.txt'), 'utf8');

const sanitizedInput = input
  .trim()
  .split('\n')
  .map(row => row.split(' '));

class Actor {
  static getInstructions() {
    return sanitizedInput;
  }

  constructor(id) {
    this.id = id;
    this.instructions = Actor.getInstructions();
    this.mailbox = [];

    this.enqueueMailbox = this.enqueueMailbox.bind(this);
    process.on('message', msg => {
      if (msg['value']) {
        this.enqueueMailbox(msg['value']);
      } else if (msg['start']) {
        this.processInstructions();
      }
    });
  }

  setSendCallback(cb) {
    this.sendCallback = cb;
  }

  enqueueMailbox(item) {
    this.mailbox.push(item);
  }

  dequeueMailbox() {
    return new Promise((resolve, reject) => {
      setInterval(() => {
        if (this.mailbox.length > 0) resolve(this.mailbox.shift());
      }, 100);
    });
  }

  async processInstructions() {
    try {
      let sendCount = 0;
      let { instructions } = this;
      let register = { p: this.id };
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
            const sendValue = register[registerKey]
              ? register[registerKey]
              : Number(value);

            console.log('Actor', this.id, 'sending', sendValue);

            process.send({ id: this.id, value: sendValue });
            sendCount++;
            break;
          case 'jgz':
            if (register[registerKey] > 0) idx += Number(value) - 1;
            break;
          case 'rcv':
            console.log('Actor', this.id, 'receiving');
            register[registerKey] = await this.dequeueMailbox();
            break;
          default:
            throw new Error(`Something went wrong: ${op}`);
            break;
        }
      }
      process.send({ id: this.id, sendCount });
    } catch (err) {
      console.log('Actor', this.id, 'Error:', err);
    }
  }
}

new Actor(process.argv[2]);
