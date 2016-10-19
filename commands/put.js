'use strict';

const putDesc = '\n' +
'credential: the name of the credential to store\n' +
'value: the value of the credential to store ' +
'or, if beginning with the \'@\' character, ' +
'the filename of the file containing ' +
'the value, or pass \'-\' to read the value ' +
'from stdin\n' +
'context: encryption context key/value pairs ' +
'associated with the credential in the form ' +
'of \'key=value\'';

module.exports = function(opts) {

  opts.yargs.command('put <credential> <value> [context...]', putDesc, {
    k: {
      alias: 'key',
      nargs: 1,
      description: 'the KMS key-id of the master key ' +
      'to use. See the README for more ' +
      'information. Defaults to alias/credstash'
    },
    v: {
      alias: 'version',
      nargs: 1,
      default: 1,
      description: 'Put a specific version of the ' +
      'credential (update the credential; ' +
      'defaults to version `1`).'
    },
    a: {
      alias: 'autoversion',
      boolean: true,
      description: 'Automatically increment the version of ' +
      'the credential to be stored. This option ' +
      'causes the `-v` flag to be ignored. ' +
      '(This option will fail if the currently stored ' +
      'version is not numeric.)'
    }
  }, argv => {
    const name = argv.credential;
    const value = argv.value;
    const context = opts.convertKeyValuePairs(argv.context);
    const auto = argv.autoversion;

    return opts.getCredstash(argv)
      .then(credstash => Promise.all([
        credstash,
        opts.valueOrFilename(value),
        auto ? credstash.incrementVersion({ name }) : argv.version
      ]))
      .then(results => results[0].putSecret({
        name,
        secret: results[1],
        version: results[2],
        context
      }))
      .then(() => console.log(`${name} has been stored`));
  });
};
