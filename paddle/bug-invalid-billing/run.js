const { runScenario } = require('../../client');

runScenario(__dirname, [
  '1-purchase-month-pro.json',
  '2-auto-renew-disabled.json',
  '3-expired.json',
  '4-purchase-month-pro.json',
  '5-revoked.json',
]);
