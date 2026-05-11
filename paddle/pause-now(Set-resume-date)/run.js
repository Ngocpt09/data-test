const { runScenario } = require('../../client');

runScenario(__dirname, [
  '1-subscription-updated.json',
  '2-subscription-paused.json',
]);
