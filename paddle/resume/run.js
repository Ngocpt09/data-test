const { runScenario } = require('../../client');

runScenario(__dirname, [
  '1-subscription-resumed(parse).json',
  '2-subscription-updated(skip).json',
]);
