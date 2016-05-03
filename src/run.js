import program, {selectedCommand} from './commands';
import {loadConfig} from './utils/config';

export default async function run() {
  program.parse(process.argv);

  if (program.config) {
    await loadConfig(program.config);
  }

  await selectedCommand();
}
