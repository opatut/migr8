#!/usr/bin/env node
import 'babel-polyfill';
import run from './run';

run().catch((err) => {
  console.error(err.stack);
});

