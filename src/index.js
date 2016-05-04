#!/usr/bin/env node
import 'source-map-support/register';
import 'babel-polyfill';
import run from './run';

run().catch((err) => {
  console.error(err.stack);
});

