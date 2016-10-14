'use strict';

function padString(string, length) {
  const padding = Array.from({ length }, () => ' ').join('');
  return (string + padding).slice(0, length);
}

const listDesc = 'list credentials and ' +
'their versions';

module.exports = function(opts) {
  return opts.yargs.command('list', listDesc, {},
    argv => opts.getCredstash(argv)
        .then(credstash => {
          return credstash.listSecrets();
        })
        .then(secrets => {
          let longest = 0;
          secrets.forEach(next => longest = longest > next.name.length ? longest : next.name.length);
          secrets.forEach(next => console.log(`${padString(next.name, longest)} -- version ${next.version}`));
        })
  );

};
