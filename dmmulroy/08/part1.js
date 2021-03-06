const fs = require('fs');
const path = require('path');

const input = fs.readFileSync(path.join(__dirname, 'input.txt'), 'utf8');

const evaluateCondition = (
  comparisonOperator,
  comparisonRegister,
  comparisonValue
) => {
  switch (comparisonOperator) {
    case '>':
      return Number(comparisonRegister) > Number(comparisonValue);
    case '<':
      return Number(comparisonRegister) < Number(comparisonValue);
    case '>=':
      return Number(comparisonRegister) >= Number(comparisonValue);
    case '<=':
      return Number(comparisonRegister) <= Number(comparisonValue);
    case '!=':
      return Number(comparisonRegister) !== Number(comparisonValue);
    case '==':
      return Number(comparisonRegister) === Number(comparisonValue);
    default:
      return false;
  }
};

const sanitizedInput = input
  .trim()
  .split('\n')
  .reduce((prev, curr, idx, arr) => {
    const [
      register,
      action,
      amount,
      _,
      comparisonRegister,
      comparisonOperator,
      comparisonValue
    ] = curr.split(' ');

    if (!prev[register]) {
      prev[register] = 0;
    }

    if (!prev[comparisonRegister]) {
      prev[comparisonRegister] = 0;
    }

    const evaluation = evaluateCondition(
      comparisonOperator,
      prev[comparisonRegister],
      comparisonValue
    );

    if (!evaluation && idx !== arr.length - 1) return prev;

    if (action === 'inc') {
      prev[register] += Number(amount);
    } else {
      prev[register] -= Number(amount);
    }

    return prev;
  }, {});

const answer = Math.max(...Object.values(sanitizedInput));

console.log('answer', answer);
