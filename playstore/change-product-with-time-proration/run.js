const { runScenario } = require('../../client');

runScenario(__dirname, [
  '1-purchase-plus.json',
  '2-purchase-pro.json',
  '3-expired-plus.json',
]);
