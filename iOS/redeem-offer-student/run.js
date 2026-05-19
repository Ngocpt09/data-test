const { runScenario } = require('../../client');

runScenario(__dirname, [
  '1-purchase-trial.json',
  '2-redeem-offer.json',
]);
