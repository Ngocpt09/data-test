const { runScenario } = require('../../client');

runScenario(__dirname, [
  '1-subscription-activated.json',
  '2-subscription-created(parse).json',
]);
