import * as fs from 'fs';
import * as path from 'path';
import { fileExists } from './file-utils';

describe('File Utils', () => {
  describe('FileExists', () => {
    function setupFileExists(
      opts: {
        fileShouldExist?: boolean;
        filePath?: string;
      } = {}
    ) {
      const {
        fileShouldExist = true,
        filePath = path.join('random', 'path', 'file', 'package.json'),
      } = opts;

      const accessSpy = jest
        .spyOn(fs, 'access')
        .mockImplementation((_: fs.PathLike, callback: fs.NoParamCallback) => {
          if (fileShouldExist) {
            callback(null);
          } else {
            callback(new Error('File not found'));
          }
        });

      return { accessSpy, filePath };
    }

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should indicate that the file exists', async () => {
      const { filePath } = setupFileExists({ fileShouldExist: true });

      const response = await fileExists(filePath);

      expect(response).toBe(true);
    });

    it('should indicate that the file does not exist', async () => {
      const { filePath } = setupFileExists({ fileShouldExist: false });

      const response = await fileExists(filePath);

      expect(response).toBe(false);
    });
  });
});
