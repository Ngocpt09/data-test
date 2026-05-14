const { runScenario } = require('../../client');

runScenario(__dirname, [
  '1-purchase.json',
  '2-grace-period.json',
  '3-on-hold.json',
  '4-recover.json',
]);