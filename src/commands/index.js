import program from 'commander';
import {version} from '../../package.json';

import migrate, {parseStrategy, parseTransactionMode} from './migrate';
import list from './list';

export let selectedCommand = function defaultHelp() {
  program.outputHelp();
};

function wrap(cmd) {
  return function wrappedCommand(...args) {
    selectedCommand = () => cmd(...args);
  };
}

program
  .option('-c, --config <path>', 'path to config file')
  .option('-n, --dry-run', 'do not actually execute any migrations, only print what would happen')
  .option('-v, --verbose', 'be chatty')
  .option('-t, --transaction <mode>', 'choose a transaction mode -- off: no transactions, discrete: one transaction per migration, combined: one transaction for all migrations (default)', parseTransactionMode, 'combined')
  // .option('-b, --babel', 'Run javascript files with babel (please install and configure outside)')
  .version(version);

program
  .command('to [target]')
  .description('migrate to the target file')
  .option('-s, --strategy <strategy>', 'select a strategy (default: commonAncestor)', parseStrategy, 'commonAncestor')
  .option('-g, --guarded', 'do not run down migrations, exit with error if downward migrations have to be executed (useful in production)')
  .action(wrap(migrate.target));

program
  .command('up <migrations...>')
  .description('migrate up manually')
  .action(wrap(migrate.up));

program
  .command('down <migrations...>')
  .description('migrate down manually')
  .action(wrap(migrate.down));

program
  .command('down-up <migrations...>')
  .description('migrate down, then up manually')
  .action(wrap(migrate.downUp));


program
  .command('list [type]')
  .description('list objects (migrations, strategies)')
  .action(wrap(list));

export default program;
