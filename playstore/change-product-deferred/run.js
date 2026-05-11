const { runScenario } = require('../../client');

runScenario(__dirname, [
  '1-purchase-plus.json',
  '2-purchase-pro.json',
  '3-expired-plus.json',
  '4-renew-pro.json',
  // '5-renew-pro-2.json',
  // '6-renew-failed.json',
]);
