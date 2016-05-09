import _ from 'lodash';
import promisify from 'es6-promisify';
import fs from 'fs';
import yaml from 'yaml-parser';
import findParentDir from 'find-parent-dir';
import {basename, join} from 'path';

const readFile = promisify(fs.readFile);

// default config
const config = {
  database: {
    // knex config
    client: 'pg',
    connection: {
      host: 'localhost',
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

export async function findConfig(filename = '.migr8.yaml', cwd = process.cwd()) {
  const dir = await promisify(findParentDir)(cwd, filename);
  return dir ? join(dir, filename) : null;
}

export async function loadConfig(path) {
  const content = await readFile(path);
  const filename = basename(path);
  const newConfig = yaml.safeLoad(content, {filename});
  return mergeConfig(newConfig);
}

export function getConfig() {
  return config;
}
