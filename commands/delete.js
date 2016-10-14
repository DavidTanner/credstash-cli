'use strict';

module.exports = function (opts) {

  const deleteDesc = '';

  opts.yargs.command('delete <credential>', deleteDesc, {},
    argv => {
      const credential = argv.credential;
      return opts.getCredstash(argv)
        .then(credstash => credstash.deleteSecrets({ name: credential })
          .then(res => console.log('Complete'))
        );
    }
  )
};
