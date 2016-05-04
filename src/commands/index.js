import program from 'commander';
import {version} from '../../package.json';

import migrate, {parseStrategy} from './migrate';
import list, {parseListType} from './list';

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
  // .option('-b, --babel', 'Run javascript files with babel (please install and configure outside)')
  .version(version);

program
  .command('migrate [target]')
  .description('migrate to the target file')
  .option('-s, --strategy <strategy>', 'select a strategy (default: commonAncestor)', parseStrategy, 'commonAncestor')
  .option('-e, --error', 'exit with error if downward migrations were to be executed (useful in production)')
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
  .command('list')
  .description('list objects')
  .option('-t, --type <type>', 'what to list: \'migrations|strategies\' (default: migrations)', parseListType, 'migrations')
  .action(wrap(list));

export default program;
