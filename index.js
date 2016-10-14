'use strict';

process.env.DEBUG = 'credstash';

const yargs = require('yargs');
const fs = require('fs');
const path = require('path');
const Credstash = require('nodecredstash');

const defaults = require('./utils/defaults');
const input = require('./utils/input');
const promise = require('./utils/promise');


let AWS;
try {
  AWS = require('nodecredstash/node_modules/aws-sdk');
} catch (e) {
  AWS = require('aws-sdk');
}

try {
  AWS.config.loadFromPath('~/.aws/config');
} catch (e) {

}


function getCredstash(argv) {
  const options = { table: argv.table, kmsKey: argv.key, awsOpts: {} };

  return Promise.resolve()
    .then(() => {

      if (!AWS.config.region) {
        options.awsOpts.region = argv.region || process.env.AWS_DEFAULT_REGION || defaults.DEFAULT_REGION
      }

      if (argv.profile) {
        AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: argv.profile });
      }
      if (argv.arn) {
        const sts = new AWS.STS(options.awsOpts);
        return new Promise((resolve, reject) => {
          sts.assumeRoleAsync({
            RoleArn: argv.arn,
            RoleSessionName: 'AssumeRoleCredstashSession1'
          }, (err, role) => {
            if (err) {
              return reject(err);
            }
            AWS.config.update({
              accessKeyId: role.AccessKeyId,
              secretAccessKey: role.SecretAccessKey,
              sessionToken: role.SessionToken
            });
            return resolve();
          });
        });
      }
    })
    .then(() => new Credstash(options));
}


yargs
  .usage(`Usage: credstash <command> [options]`)
  .option('r', {
    alias: 'region',
    nargs: 1,
    global: true,
    describe: 'the AWS region in which to operate. ' +
    'If a region is not specified, credstash ' +
    'will use the value of the ' +
    'AWS_DEFAULT_REGION env variable, ' +
    'or if that is not set, the value in ' +
    '`~/.aws/config`. As a last resort, ' +
    'it will use ' + defaults.DEFAULT_REGION
  })
  .option('t', {
    alias: 'table',
    nargs: 1,
    global: true,
    describe: 'DynamoDB table to use for ' +
    'credential storage'
  })
  .option('p', {
    alias: 'profile',
    nargs: 1,
    global: true,
    describe: 'Credential profile to use when ' +
    'connecting to AWS'
  })
  .option('n', {
    alias: 'arn',
    nargs: 1,
    global: true,
    describe: 'AWS IAM ARN for AssumeRole'
  });

const files = fs.readdirSync('./commands/');
const opts = {yargs, defaults, getCredstash};

Object.assign(opts,
  input,
  promise
);

files.forEach(file => {
  const fileDir = `./commands/${file}`;
  require(fileDir)(opts);
});

const argv = yargs
  .recommendCommands()
  .help('h')
  .alias('h', 'help')
  .argv;
