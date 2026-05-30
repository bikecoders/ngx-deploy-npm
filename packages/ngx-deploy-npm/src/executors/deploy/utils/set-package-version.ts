import * as fileUtils from '../../../utils';
import * as path from 'node:path';

export async function setPackageVersion(dir: string, packageVersion: string) {
  const packageContent: string = await fileUtils.readFileAsync(
    path.join(dir, 'package.json'),
    { encoding: 'utf8' }
  );

  const packageObj = JSON.parse(packageContent);

  packageObj.version = packageVersion;

  await fileUtils.writeFileAsync(
    path.join(dir, 'package.json'),
    JSON.stringify(packageObj, null, 4),
    { encoding: 'utf8' }
  );
}
