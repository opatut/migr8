export default async function (options) {
  const {
    tableName = '_migrations',
  } = options;

  async function createTable(db) {
    return db.schema.createTableIfNotExists(tableName, (table) => {
      table.increments('index');
      table.string('id');
    });
  }

  return {
    list: async (db) => {
      await createTable(db);
      const rows = await db(tableName).select('id').orderBy('index');
      return rows.map(({id}) => id);
    },
    add: async (db, ids) => {
      await createTable(db);
      await db(tableName).insert(ids.map((id) => ({id})));
    },
    remove: async (db, ids) => {
      await createTable(db);
      await db(tableName).whereIn('id', ids).delete();
    },
  };
}
