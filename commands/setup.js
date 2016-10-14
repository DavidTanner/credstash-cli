'use strict';

module.exports = function(opts) {
  return opts.yargs.command('setup', 'setup the credential store', {},
    argv => opts.getCredstash(argv)
      .then(credstash => {
        credstash.createDdbTable();
      })
  );
};
