# migr8

[![version](https://img.shields.io/npm/v/migr8.svg?style=flat-square)](http://npm.im/migr8)
[![downloads](https://img.shields.io/npm/dm/migr8.svg?style=flat-square)](http://npm-stat.com/charts.html?package=migr8&from=2016-05-01)
[![MIT License](https://img.shields.io/npm/l/migr8.svg?style=flat-square)](http://opensource.org/licenses/MIT)

This is a tool for running migrations on relational databases. It uses [knex](http://knexjs.org) under the hood, so it supports **Postgres, MySQL, MariaDB, SQLite3** and **Oracle** out-of-the-box.

## Feature overview

* Target specification: Define your desired database state in a single text file, where you can choose the order in which to apply migrations. Put that file into your VCS and merge it when merging branches!
* modular driver system: Write your migrations in pure SQL, using the knex interface, or any other interface you like.
* upgrade strategies: Many functions for actual to desired state resolution included.
* transaction support: Wraps either for each migration into a transaction, or the whole operation.

## Usage &ndash; TL;DR version

1. Create your migrations. See *Migrations format* for details. Place them all somewhere, preferably in their *own repository*.
1. Configure the tool by creating a `.migraterc` in your project directory. Refer to the *Config* section for details.
1. Create a file, e.g. `migrations.txt` somewhere in your repository, listing the migrations you want to have applied.
1. Run `migr8 to migrations.txt` to apply the target state.

## Usage &ndash; The Tutorial

A quick migrations primer: Your database schema evolves over time and transitions through states, and your migrations are there to provide a path between those states. Each migration consists of a "up" and a "down" part, each a set of instructions on how to transform your database.

Now sometimes, people use these things called *version control systems* and *branching* and then they switch between branches. But on both branches, the application expects a different schema, hence different migrations to be applied. Thus, after switching the branch, the developer must revert some migrations from the old branch and apply some from the new branch.

Here is where the target specification comes in handy: that is a simple text file, which specifies a linear list of migrations to reach a desired state, one migration on each line. This file can be checked into the VCS, and thus always represents the desired state for the database. After switching the branch, the developer can use that file to determine which migrations to undo and which to apply to reach the correct state for the application code found on the branch.

There is just one caveat: in order to know how to undo the migrations from the old branch, the migration definitions should not be checked into the VCS, else you cannot possibly know how to undo them after switching the branch. Simply put them into their own repository. In the future, we might implement some git integration to fetch downwards migrations from other branches.

## Docs

### Strategies

* **commonAncestor**: find where your state branched off from the target state, revert to that common ancestor, and apply the new state in order
* **onlyUp**: run the migrations you're missing
* **onlyDown**: revert the migrations you have in excess
* **downUp**: like *commonAncestor*, but keep all migrations that were already applied (i.e. run *onlyDown* first, then *onlyUp*)
* **all**: migrate until you have applied all exisiting migrations
* **reorder**: bring the migrations you have already applied into the correct order, but leave extraneous/missing migrations in peace


### Migrations format

There are multiple formats in which you can specify your migrations.
