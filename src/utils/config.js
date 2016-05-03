import _ from 'lodash';
import promisify from 'es6-promisify';
import fs from 'fs';
import yaml from 'yaml-parser';

const readFile = promisify(fs.readFile);

// default config
const config = {
  database: {
    // knex config
    client: 'pg',
    connection: {
      host: 'localhost',
      user: 'test',
      password: '',
      database: 'testing',
    },
  },

  // driver: how to execute migrations
  driver: {
    type: 'sql',
  },

  // storage: how to store current database state
  storage: {
    type: 'sql',
    tableName: '_migrations',
  },

  // migrations: how to find migrations
  migrations: {
    pattern: '**.sql',
    path: process.cwd(),
  },
};

export function mergeConfig(newConfig) {
  return _.merge(config, newConfig);
}

export async function loadConfig(filename) {
  const content = await readFile(filename);
  const newConfig = yaml.safeLoad(content, {filename});
  return mergeConfig(newConfig);
}

export function getConfig() {
  return config;
}
