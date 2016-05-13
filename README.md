# migr8

[![version](https://img.shields.io/npm/v/migr8.svg?style=flat-square)](http://npm.im/migr8)
[![downloads](https://img.shields.io/npm/dm/migr8.svg?style=flat-square)](http://npm-stat.com/charts.html?package=migr8&from=2016-05-01)
[![MIT License](https://img.shields.io/npm/l/migr8.svg?style=flat-square)](http://opensource.org/licenses/MIT)

This is a tool for running migrations on relational databases. It uses [knex](http://knexjs.org) under the hood, so it supports **Postgres, MySQL, MariaDB, SQLite3** and **Oracle** out-of-the-box.

## Feature overview

* Target specification: Define your desired database state in a single text file, where you can choose the order in which to apply migrations. Put that file into your VCS and merge it when merging branches!
* Modular driver system: Write your migrations in pure SQL, or using the knex interface, or simply plug in your own interface to parse and execute your migrations.
* Upgrade strategies: Includes different ways to resolve how to upgrade from the actual to the desired state.
* Transactions: Wraps either each migration into a transaction, or the whole operation.

Planned features include:

* git integration: collect migrations across branches, apply or undo them from somewhere else
* seeding: fill your database the way you define your schema, but fit to your developer's needs
* maintenance tasks: define tasks to run on your database and use from your application or the CLI (e.g. in cron jobs)

You have an idea that will make this tool more awesome? Post an [issue on github](https://github.com/opatut/migr8/issues/new).

## Usage &ndash; TL;DR version

1. Choose your driver, and create your migrations. Refer to [Drivers](#drivers) for details. Place them all somewhere, preferably in their *own repository*.
1. Configure the tool by creating a `.migr8.yaml` in your project directory. Refer to [Config](#configuration) for details.
1. Create a file, e.g. `migrations.txt` somewhere in your repository, listing the migrations you want to have applied.
1. Run `migr8 to migrations.txt` to apply the target state.

## Usage &ndash; The Tutorial

A quick migrations primer: Your database schema evolves over time and transitions through states, and your migrations are there to provide a path between those states. Each migration consists of a "up" and a "down" part, each a set of instructions on how to transform your database.

Now sometimes, people use these things called *version control systems* and *branching* and then they switch between branches. But on both branches, the application expects a different schema, hence different migrations to be applied. Thus, after switching the branch, the developer must revert some migrations from the old branch and apply some from the new branch.

Here is where the target specification comes in handy: that is a simple text file, which specifies a linear list of migrations to reach a desired state, one migration on each line. This file can be checked into the VCS, and thus always represents the desired state for the database. After switching the branch, the developer can use that file to determine which migrations to undo and which to apply to reach the correct state for the application code found on the branch.

There is just one caveat: in order to know how to undo the migrations from the old branch, the migration definitions should not be checked into the VCS, else you cannot possibly know how to undo them after switching the branch. Simply put them into their own repository. In the future, we might implement some git integration to fetch downwards migrations from other branches.

## Configuration

Place a `.migr8.yaml` file in the root directory of your project. Fill it with these contents:

```yaml
database:
  # this is the knex configuration, refer http://knexjs.org for reference
  client: 'pg'
  connection:
    host: 'localhost'
    user: 'foo'
    password: 'bar'
    database: 'baz'

driver:
  # how to execute migrations, see "Drivers" for details
  type: 'sql'
  # driver options go here

storage:
  # how to store current database state, see "Storage" for details
  type: 'sql',
  # storage options go here, for example:
  tableName: '_migrations',

migrations:
  path: 'path/to/migrations/folder' # default: 'migrations'
  pattern: '**.sql' # glob pattern inside migrations.path -> the matches are the migration IDs
```

## Docs

### Strategies

* **commonAncestor**: find where your state branched off from the target state, revert to that common ancestor, and apply the new state in order
* **onlyUp**: run the migrations you're missing
* **onlyDown**: revert the migrations you have in excess
* **downUp**: like *commonAncestor*, but keep all migrations that were already applied (i.e. run *onlyDown* first, then *onlyUp*)
* **all**: migrate until you have applied all exisiting migrations
* **reorder**: bring the migrations you have already applied into the correct order, but leave extraneous/missing migrations in peace

### Drivers

There are multiple formats in which you can specify your migrations. How a migration file is parsed depends on the driver you configured. Included are these drivers:

#### `sql` driver

This is the simplest driver, and it works with any database type you can think of: you specify your migration in pure SQL syntax. This is an example migration file:

```sql
This is some description, it is not executed as SQL but parsed as metadata.

-- UP --

CREATE TABLE person (
  name VARCHAR(64)
);

-- DOWN --

DROP TABLE person;
```

#### `js` driver

You can also use the javascript interface for your migrations, exposed via the underlying knex instance. Here is the above example migration as javascript:

```js
module.exports.up = function (db, trx) {
  return db.schema
    .createTable('person', function (table) {
      table.string('name', 32);
    })
    .transacting(trx);
};

module.exports.down = function (db, trx) {
  return db.schema
    .dropTable('person')
    .transacting(trx);
};

// optional
module.exports.meta = {
  description: 'This is the description.',
};
```

Please make sure to use the transaction that is passed as the second parameter, else you lose transaction support.

You can also set the `driver.babel = true` configuration option, place a `.babelrc` in your repository and write ES6:

```js
export async function up(db, trx) {
  await db.schema
    .createTable('person', (table) => {
      table.string('name', 32);
    })
    .transacting(trx);
}

export async function down(db, trx) {
  await db.schema
    .dropTable('person')
    .transacting(trx);
}

// optional
export const meta = {
  description: 'This is the description.',
};
```

### Storage

When migr8 executes any migrations, it needs to remember the state of your database so it does not apply the same migrations twice, and is able to undo unwanted migrations later. This state is saved using a *storage module*, of which there is currently only one: the SQL storage. It stores the current database state inside your database, in a table named `_migrations` (which of course you can configure).

In future, I might add support for file-based storage, or whatever you can think of.
