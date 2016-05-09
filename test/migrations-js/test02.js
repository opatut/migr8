export async function up(db, trx) {
  await db.schema
    .table('test01', (table) => {
      table.integer('test02');
    })
    .transacting(trx);
}

export async function down(db, trx) {
  await db.schema
    .table('test01', (table) => {
      table.dropColumn('test02');
    })
    .transacting(trx);
}
