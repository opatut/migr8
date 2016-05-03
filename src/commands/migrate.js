import _ from 'lodash';

import getMigrations from '../utils/getMigrations';
import runMigration from '../utils/runMigration';
import strategies from '../utils/strategies';

function createMigrateFunction(direction) {
  return async (migrations, options) => {
    const allMigrations = await getMigrations(options);

    if (!allMigrations.length) {
      console.error('No migrations found.');
    }

    let migrationsToRun;

    if (options.all) {
      migrationsToRun = allMigrations;
    } else {
      migrationsToRun = _.transform(migrations, (o, name) => {
        o[name] = allMigrations[name];
      }, {});
    }

    for (const migration of Object.keys(migrationsToRun)) {
      console.time(migration);

      await runMigration({direction, migration});

      console.timeEnd(migration);
    }
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
export default {up, down};
