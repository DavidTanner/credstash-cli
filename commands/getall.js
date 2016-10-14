'use strict';

const yaml = require('js-yaml');

const getAllDesc = `${'Get all credentials from ' +
'the store'}
context: ${'encryption context key/value pairs ' +
'associated with the credential in the form ' +
'of \'key=value\''}`;

module.exports = function(opts) {
  return opts.yargs
    .command('getall [context...]', getAllDesc, {
      v: {
        alias: 'version',
        nargs: 1,
        default: '',
        description: 'Get a specific version of the ' +
        'credential (defaults to the latest version)'
      },
      f: {
        alias: 'format',
        nargs: 1,
        choices: ['json', 'csv', 'yaml', 'dotenv'],
        default: 'json',
        description: 'Output format. json(default), ' +
        'yaml, dotenv, or csv.'
      }
    }, argv => {
      let context = opts.convertKeyValuePairs(argv.context);
      let format = argv.format;
      return opts.getCredstash(argv)
        .then(credstash => {
          return credstash.getAllSecrets(argv.version, context)
        })
        .then(secrets => {
          if (format == 'json') {
            console.log(JSON.stringify(secrets, null, 2));
          } else if (format == 'csv') {
            const output = Object.keys(secrets).map(key => [`"${key}"`, `"${secrets[key]}"`].join('='));
            console.log(output.join('\n'));
          } else if (format == 'yaml') {
            console.log(yaml.safeDump(secrets));
          } else if (format == 'dotenv') {
            const output = Object.keys(secrets).map(key => [key, secrets[key]].join(','));
            console.log(output.join('\n'));
          }
        });
    });
};
