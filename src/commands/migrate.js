import fs from 'fs';
import _ from 'lodash';
import promisify from 'es6-promisify';
import invariant from 'invariant';

import getMigrations from '../utils/getMigrations';
import {runQueue} from '../utils/runQueue';
import * as strategies from '../strategies';
import * as storages from '../storages';
import {getConfig} from '../utils/config';
import {db} from '../utils/database';

async function getStorage() {
  const {
    storage: {type, ...config},
  } = getConfig();

  return await storages[type](config);
}

function createMigrateFunction(direction) {
  invariant(direction === 'up' || direction === 'down', `Invalid direction: ${direction}.`);

  return async (migrations, options) => {
    const allMigrations = await getMigrations(options);
    const allMigrationsMap = _.transform(allMigrations, (o, value) => {
      o[value.id] = value;
    }, {});

    let migrationsToRun;

    if (options.all) {
      migrationsToRun = allMigrations;
    } else {
      migrationsToRun = migrations.map((id) => {
        // check if exists
        if (!allMigrationsMap[id]) {
          throw new Error(`Migration not found: ${id}`);
        }
        return allMigrationsMap[id];
      });
    }

    const queue = migrationsToRun.map((migration) => ({migration, direction}));
    const storage = await getStorage();
    await runQueue(queue, storage, options);
  };
}

export function parseTransactionMode(value) {
  if (/^(o(ff)?|false|no|0)$/i.test(value)) return 'off';
  if (/^(d(iscrete)?|separate|each|many)$/i.test(value)) return 'discrete';
  if (/^(c(ombined)?|group(ed)?|single|one|true|yes|1)$/i.test(value)) return 'combined';
  throw new Error(`Not a transaction mode: ${value}.`);
}

export function parseStrategy(value) {
  if (!strategies[value]) {
    throw new Error('Not a strategy: ${strategy}');
  }
  return value;
}

export const up = createMigrateFunction('up');
export const down = createMigrateFunction('down');

export const target = async (targetFilePath, options) => {
  const {
    strategy: strategyName,
    parent: {verbose},
    guarded,
  } = options;

  const allMigrations = await getMigrations();

  const targetContent = (await promisify(fs.readFile)(targetFilePath)).toString();

  const allMigrationsMap = _.transform(allMigrations, (o, value) => {
    o[value.id] = value;
  }, {});

  const getMigration = (id) => {
    if (!allMigrationsMap[id]) {
      throw new Error(`Migration not found: ${id}`);
    }

    return allMigrationsMap[id];
  };

  const targetMigrations = targetContent
    .split('\n')
    .map((x) => x.trim())
    .filter((x) => x)
    .map(getMigration);

  const storage = await getStorage();

  const currentMigrationsIds = await storage.list(db);
  const currentMigrations = currentMigrationsIds.map(getMigration);

  if (verbose) {
    console.log('Current state:', currentMigrations.length);
    console.log(currentMigrationsIds.map((id) => `  > ${id}`).join('\n') || '  --> no migrations run yet');
    console.log();

    console.log('Target:');
    console.log(targetMigrations.map(({id}) => `  ${id}`).join('\n') || '  --> empty stack');
    console.log();

    console.log(`Resolving via ${strategyName} strategy...\n`);
  }

  const strategy = strategies[strategyName];
  const queue = strategy.resolve(targetMigrations, currentMigrations, allMigrations);

  if (guarded) {
    const downMigrations = queue.filter(({direction}) => direction === 'down');
    if (downMigrations.length > 0) {
      throw new Error(`The following ${downMigrations.length} migrations were planned to be undone, but you are running in guarded mode: ${downMigrations.map(({migration: {id}}) => id).join(', ')}`);
    }
  }

  await runQueue(queue, storage, options);
};

export default {up, down, target};
