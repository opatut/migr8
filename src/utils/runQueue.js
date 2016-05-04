import {db} from './database';

async function promiseMap(list, fn = (fn_) => fn_()) {
  for (let index = 0; index < list.length; index++) {
    await fn(list[index], index);
  }
}

const dirIcon = (direction) => direction === 'up' ? '↑' : '↓';

export async function runQueue(queue, options) {
  const {dryRun, verbose} = options.parent;

  if (verbose) {
    console.log('Migration plan:');
    console.log(queue.map(({migration: {id}, direction}, index) => `  ${index + 1}. ${dirIcon(direction)} ${id}`).join('\n'));
    console.log('\n');
  }

  await promiseMap(queue, async (item, index) => {
    const {migration, direction} = item;

    const prefix = `>> ${index + 1} (${dirIcon(direction)}) `;
    console.log(`${prefix}${migration.id} (${direction})`);

    const start = new Date().getTime();

    if (dryRun) {
      if (verbose) {
        console.log(`${prefix}skipping in dry run`);
      }
    } else {
      await migration[direction](db);
    }

    if (options.parent.verbose) {
      const ms = new Date().getTime() - start;
      console.log(`${prefix}Migrated ${migration.id} ${direction} in ${ms}ms\n`);
    }
  });
}
