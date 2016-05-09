export async function up(db, trx) {
  await db.schema
    .createTable('test01', (table) => {
      table.integer('id').primary();
      table.string('name', 32);
    })
    .transacting(trx);
}

export async function down(db, trx) {
  await db.schema
    .dropTable('test01')
    .transacting(trx);
}

export const meta = {
  description: 'foo bar',
};
