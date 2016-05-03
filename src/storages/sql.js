export default async function (options) {
  const {
    tableName = '_migrations',
  } = options;

  async function createTable(db) {
    return db.createTable(tableName, (table) => {
      table.increments('index');
      table.string('name');
    });
  }

  return {
    list: async (db) => {
      await createTable(db);
      const rows = await db(tableName).select('name').orderBy('index');
      return rows.map(({name}) => name);
    },
    add: async (db, migrations) => {
      await createTable(db);
      await db(tableName).insert(migrations.map((name) => ({name})));
    },
    remove: async (db, migrations) => {
      await createTable(db);
      await db.whereIn('name', migrations).delete();
    },
  };
}
