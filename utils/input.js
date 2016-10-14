'use strict';

const fs = require('fs');

const defaults = require('./defaults');

module.exports = {
  expandWildcard(name, secrets) {
    const regex = new RegExp(`^${name.replace(defaults.WILDCARD_CHAR, '.*')}$`);
    const found = {};
    const filtered = secrets.filter(secret => {
      const matches = regex.test(secret.name) && !found[secret.name];
      found[secret.name] = true;
      return matches;
    });
    return filtered;
  },

  valueOrFilename(string) {
    return Promise.resolve()
      .then(() => {
        if (string == '-') {
          return this.stdInPromise();
        } else if (string.charAt(0) == '@') {
          return fs.readFileSync(string.slice(1), 'utf8');
        }
        return string;
      })
  },

  stdInPromise() {
    return new Promise((resolve, reject) => {
      process.stdin.setEncoding('utf8');
      process.stdin.once('data', text => {
        text = text.trim();
        process.stdin.end();
        return resolve(text);
      });

      process.stdin.on('error', reject);
    });
  },

  convertKeyValuePairs(pairs) {
    if (pairs.length == 0) {
      return undefined;
    }
    const context = {};
    pairs.forEach(pair => {
      const split = pair.split(/=(.+)?/);
      context[split[0]] = split[1];
    });
    return context;
  },

};
