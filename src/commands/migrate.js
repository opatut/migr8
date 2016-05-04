import fs from 'fs';
import _ from 'lodash';
import promisify from 'es6-promisify';
import invariant from 'invariant';

import getMigrations from '../utils/getMigrations';
import {runQueue} from '../utils/runQueue';
import * as strategies from '../utils/strategies';
import * as storages from '../storages';
import {getConfig} from '../utils/config';
import {db} from '../utils/database';

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
    await runQueue(queue, options);
  };
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
  } = options;

  const {
    storage: {
      type: storageType,
      ...storageConfig,
    },
  } = getConfig();

  const allMigrations = await getMigrations();

  const targetContent = (await promisify(fs.readFile)(targetFilePath)).toString();

  const allMigrationsMap = _.transform(allMigrations, (o, value) => {
    o[value.id] = value;
  }, {});

  const targetMigrations = targetContent
    .split('\n')
    .map((x) => x.trim())
    .filter((x) => x)
    .map((id) => allMigrationsMap[id]);

  const storage = await storages[storageType](storageConfig);

  const currentMigrationsIds = await storage.list(db);
  const currentMigrations = currentMigrationsIds.map((id) => allMigrationsMap[id]);

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

  await runQueue(queue, options);
};

export default {up, down, target};
