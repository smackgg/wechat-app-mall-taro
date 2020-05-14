const { CLIEngine } = require('eslint');

const cli = new CLIEngine({});

module.exports = {
  '*.{ts,tsx,js,jsx}': (files) =>
    'eslint --max-warnings=0 --fix ' + files.filter((file) => !cli.isPathIgnored(file)).join(' ')
};
