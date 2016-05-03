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
  .option('-c, --config <path>', 'Path to config file.')
  // .option('-b, --babel', 'Run javascript files with babel (please install and configure outside)')
  .version(version);

program
  .command('migrate [target]')
  .description('Migrate to the target file')
  .option('-s, --strategy <strategy>', 'Select a strategy (default: common_ancestor).', parseStrategy, '')
  .option('-e, --error', 'Exit with error if downward migrations were to be executed (useful in production).')
  .action(wrap(migrate.target));

program
  .command('up <migrations...>')
  .description('Migrate up manually')
  .action(wrap(migrate.up));

program
  .command('down <migrations...>')
  .description('Migrate down manually')
  .action(wrap(migrate.down));

program
  .command('list')
  .description('List objects')
  .option('-v, --verbose', 'Detailed listing')
  .option('-t, --type <type>', 'what to list: \'migrations|strategies\' (default: migrations).', parseListType, 'migrations')
  .action(wrap(list));

export default program;
