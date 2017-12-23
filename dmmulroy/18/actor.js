const fs = require('fs');
const path = require('path');

const input = fs.readFileSync(path.join(__dirname, 'input.txt'), 'utf8');

const instructions = input
  .trim()
  .split('\n')
  .map(row => row.split(' '));

class Actor {
  constructor(id) {
    this.id = id;
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
        console.log(
          'Checking mailmox for Actor',
          this.id,
          'length:',
          this.mailbox.length
        );
        if (this.mailbox.length > 0) resolve(this.mailbox.shift());
      }, 1);
    });
  }

  async processInstructions() {
    try {
      let sendCount = 0;
      let register = { p: this.id };
      let recoveredFrequency = 0;

      for (let idx = 0; idx < instructions.length; idx++) {
        if (this.id === 1) console.log('idx', idx);
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

            console.log('Actor', this.id, 'sending value:', sendValue);
            process.send({ id: this.id, value: sendValue });
            sendCount++;
            break;
          case 'jgz':
            if (register[registerKey] > 0) idx += Number(value) - 1;
            break;
          case 'rcv':
            console.log('Actor:', this.id, 'rcv - 0');
            register[registerKey] = await this.dequeueMailbox();
            console.log('Actor:', this.id, 'rcv - 1');
            break;
          default:
            throw new Error(`Something went wrong: ${op}`);
            break;
        }
      }
      process.send({ id: this.id, sendCount });
    } catch (err) {}
  }
}

new Actor(Number(process.argv[2]));
