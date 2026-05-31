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

export async function withTemporaryPackageVersion(
  dir: string,
  packageVersion: string,
  fn: () => Promise<void>
): Promise<void> {
  const packageJsonPath = path.join(dir, 'package.json');
  const originalContent = await fileUtils.readFileAsync(packageJsonPath, {
    encoding: 'utf8',
  });

  await setPackageVersion(dir, packageVersion);

  try {
    await fn();
  } finally {
    await fileUtils.writeFileAsync(packageJsonPath, originalContent, {
      encoding: 'utf8',
    });
  }
}
