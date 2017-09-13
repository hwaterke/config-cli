import path from 'path';
import {
  getPackageJson,
  setPackageJson,
  hasDependency,
  setScript
} from '../../helpers/package';
import {yarnInstallMissing} from '../../helpers/yarn';
import {addLintStagedCommand} from '../../helpers/lintStaged';
import {copyFile} from '../../helpers/basic';

export class EslintPlugin {
  static flag = 'eslint';
  static description = 'Configures eslint and precommit hooks';

  async run() {
    const isCRA = hasDependency(getPackageJson(), 'react-scripts');

    // In a create-react-app environment we do not need to install eslint
    if (isCRA) {
      await yarnInstallMissing(['lint-staged', 'husky'], true);
      copyFile(
        path.join(__dirname, 'data', 'eslintrc.react.json'),
        './.eslintrc.json'
      );
    } else {
      await yarnInstallMissing(
        [
          'lint-staged',
          'husky',
          'eslint',
          'babel-eslint',
          'eslint-plugin-import'
        ],
        true
      );
      copyFile(
        path.join(__dirname, 'data', 'eslintrc.node.json'),
        './.eslintrc.json'
      );
    }

    const packageJson = getPackageJson();
    addLintStagedCommand(
      packageJson,
      'eslint',
      'eslint --max-warnings 1',
      false
    );
    setScript(packageJson, 'precommit', 'lint-staged');
    setPackageJson(packageJson);
  }
}