import {db} from './database';

async function promiseMap(list, fn = (fn_) => fn_()) {
  for (let index = 0; index < list.length; index++) {
    await fn(list[index], index);
  }
}

const dirIcon = (direction) => direction === 'up' ? '↑' : '↓';

function startTransaction(db_) {
  return new Promise((resolve) => {
    db_.transaction(resolve);
  });
}

export async function runQueue(queue, storage, options) {
  if (!queue.length) {
    console.log('Nothing to migrate. Exiting.');
    return;
  }

  const {
    dryRun,
    verbose,
    transaction: transactionMode,
  } = options.parent;

  if (verbose) {
    console.log('Migration plan:');
    console.log(queue.map(({migration: {id}, direction}, index) => `  ${index + 1}. ${dirIcon(direction)} ${id}`).join('\n'));
    console.log('\n');
  }

  let trx;

  try {
    if (transactionMode === 'combined') {
      if (verbose) {
        console.log('start combined transaction\n');
      }
      trx = await startTransaction(db);
    }

    await promiseMap(queue, async (item, index) => {
      const {migration, direction} = item;

      const prefix = `» ${index + 1} (${dirIcon(direction)}) `;
      console.log(`${prefix}${migration.id} (${direction})`);

      const start = new Date().getTime();

      if (transactionMode === 'discrete') {
        if (verbose) {
          console.log(`${prefix}start discrete transaction`);
        }
        if (!dryRun) {
          trx = await startTransaction(db);
        }
      }

      if (dryRun) {
        if (verbose) {
          console.log(`${prefix}-- skip migration (dry run) --`);
        }
      } else {
        // here the magic awaits
        await migration[direction](db, trx);
      }

      if (transactionMode === 'discrete') {
        if (verbose) {
          console.log(`${prefix}commit discrete transaction`);
        }

        if (!dryRun) {
          await trx.commit();
          await storage.add(db, [migration.id]);
        }
      }

      if (verbose) {
        const ms = new Date().getTime() - start;
        console.log(`${prefix}migrated ${migration.id} ${direction} in ${ms}ms\n`);
      }
    });

    if (transactionMode === 'combined') {
      if (verbose) {
        console.log('commit combined transaction\n');
      }
      await trx.commit();

      const downIds = queue
        .filter(({direction}) => direction === 'down')
        .map(({migration: {id}}) => id);

      const upIds = queue
        .filter(({direction}) => direction === 'up')
        .map(({migration: {id}}) => id);

      if (downIds.length > 0) {
        if (verbose) {
          console.log(`storage: remove ${downIds.length} migrations: ${downIds.join(', ')}`);
        }
        await storage.remove(db, downIds);
      }

      if (upIds.length > 0) {
        if (verbose) {
          console.log(`storage: add ${upIds.length} migrations: ${upIds.join(', ')}`);
        }
        await storage.add(db, upIds);
      }
    }
  } catch (err) {
    if (trx) {
      if (verbose) {
        console.log();
        console.warn('==========================================');
        console.warn('! ERROR DETECTED -- TRANSACTION ROLLBACK !');
        console.warn('==========================================');
        console.log();
      }
      await trx.rollback();
    }

    throw err;
  }
}
