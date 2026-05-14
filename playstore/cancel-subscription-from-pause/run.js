const { runScenario } = require('../../client');

runScenario(__dirname, [
  '1-purchase.json',
  '2-pause-scheduled.json',
  '3-paused.json',
  '4-cancel-subscription.json',
  '5-expired.json',
]);
