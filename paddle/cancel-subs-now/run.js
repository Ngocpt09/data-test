const { runScenario } = require('../../client');

runScenario(__dirname, [
  '1-subscription-updated(skip).json',
  '2-subscription-cancel.json',
]);
