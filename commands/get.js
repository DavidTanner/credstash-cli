'use strict';


function get(opts) {
  const getDesc = 'Get a credential from the store\n' +
    'credential: the name of the credential to get.' +
    `Using the wildcard character '${opts.defaults.WILDCARD_CHAR}' will ` +
    'search for credentials that match the ' +
    'pattern\n' +
    'context: encryption context key/value pairs ' +
    'associated with the credential in the form ' +
    'of "key=value"';

  opts.yargs.command('get <credential> [context...]', getDesc, {
      line: {
        boolean: true,
        default: true,
        description: 'Don\'t append newline to returned ' +
        'value (useful in scripts or with ' +
        'binary files)'
      },
      v: {
        alias: 'version',
        default: '',
        description: 'Get a specific version of the ' +
        'credential (defaults to the latest version)'
      }
    },
    argv => {
      const rawName = argv.credential;
      const context = opts.convertKeyValuePairs(argv.context);
      const version = argv.version || undefined;

      function printSecret(secret) {
        argv['line'] ? console.log(secret) : process.stdout.write(secret);
      }

      return opts.getCredstash(argv)
        .then(credstash => {

          if (rawName.indexOf(opts.defaults.WILDCARD_CHAR) >= 0) {
            const secrets = {};
            return credstash.listSecrets()
              .then(list => opts.expandWildcard(rawName, list))
              .then(filtered => opts.mapPromise(filtered, stash =>
                credstash.getSecret({ name: stash.name, version: version || stash.version, context })
                  .then(secret => {
                    secrets[stash.name] = secret;
                  })
              ))
              .then(() => printSecret(JSON.stringify(secrets)));
          } else {
            return credstash.getSecret({ name: rawName, version, context })
              .then(printSecret);
          }
        });
    });
}

module.exports = get;
