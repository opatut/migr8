import knex from 'knex';

import getConfig from './config';

export let db;

export function connect() {
  db = knex(getConfig().database);
}

export default db;
