import { promisify } from 'node:util';
import { readFile, writeFile, access } from 'node:fs';

export const readFileAsync = promisify(readFile);

export const writeFileAsync = promisify(writeFile);

export async function fileExists(filePath: string) {
  try {
    await promisify(access)(filePath);
    return true;
  } catch {
    return false;
  }
}
