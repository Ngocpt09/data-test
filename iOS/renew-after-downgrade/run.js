const { runScenario } = require('../../client');

runScenario(__dirname, [
    '1-purchase.json', 
    '2-downgrade.json',
    '3-renew.json',
    '4-upgrade.json',
    '5-downgrade.json',
    '6-did-fail-renew.json',
    '7-renew-recover.json',
    '8-upgrade.json'
]);
