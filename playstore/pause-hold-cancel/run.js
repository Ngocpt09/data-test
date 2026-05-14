const { runScenario } = require('../../client');

runScenario(__dirname, [
  '1-purchase.json',
  '2-pause-scheduled.json',
  '3-paused.json',
  '4-payment-failed.json',
  '5-cancel.json',
]);