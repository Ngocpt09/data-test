const { runScenario } = require('../../client');

runScenario(__dirname, [
  // '1-purchase.json',
  // '2-pause-scheduled.json',
  '3-cancel-pause(resume).json',
]);
