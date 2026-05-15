const { runScenario } = require('../../client');

runScenario(__dirname, ['1-downgrade.json', '2-renew.json']);
