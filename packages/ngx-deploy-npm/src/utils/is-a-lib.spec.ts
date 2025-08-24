import { isProjectAPublishableLib } from './is-a-lib';
import * as fileUtils from './file-utils';
import { ProjectConfiguration, Tree, readJson } from '@nx/devkit';
import * as mocks from '../__mocks__/mocks';
import * as path from 'path';

describe('is-a-lib', () => {
  const setUp = () => {
    const projects: Record<
      'publishableLibrary' | 'nonPublishableLibrary' | 'app',
      ProjectConfiguration
    > = {
      publishableLibrary: mocks.getLib('pub-lib'),
      nonPublishableLibrary: mocks.getLib('non-pub-lib'),
      app: mocks.getApplication('app'),
    };

    return { projects };
  };

  describe('isProjectAPublishableLib', () => {
    const setUpIsProjectAPublishableLib = ({
      shouldPackageJsonExists,
      packageJsonContent,
    }: {
      shouldPackageJsonExists: boolean;
      packageJsonContent?: { name: string; private?: boolean };
    }) => {
      const { projects } = setUp();
      const mockTree = {} as Tree;

      const fileExistsMock = jest
        .spyOn(fileUtils, 'fileExists')
        .mockImplementation(() => Promise.resolve(shouldPackageJsonExists));

      const readJsonMock = jest
        .spyOn({ readJson }, 'readJson')
        .mockImplementation(() => packageJsonContent || { name: 'test-lib' });

      return { fileExistsMock, readJsonMock, projects, mockTree };
    };

    afterEach(jest.restoreAllMocks);

    describe('when package.json exists', () => {
      describe('and package is public (private is false or undefined)', () => {
        it('should indicate that the project is a publishable library when private is false', async () => {
          const { projects, mockTree } = setUpIsProjectAPublishableLib({
            shouldPackageJsonExists: true,
            packageJsonContent: { name: 'test-lib', private: false },
          });

          const response = await isProjectAPublishableLib(
            mockTree,
            projects.publishableLibrary
          );

          expect(response).toBe(true);
        });

        it('should indicate that the project is a publishable library when private is undefined', async () => {
          const { projects, mockTree } = setUpIsProjectAPublishableLib({
            shouldPackageJsonExists: true,
            packageJsonContent: { name: 'test-lib' },
          });

          const response = await isProjectAPublishableLib(
            mockTree,
            projects.publishableLibrary
          );

          expect(response).toBe(true);
        });
      });

      describe('and package is private (private is true)', () => {
        it('should indicate that the project is not a publishable library', async () => {
          const { projects, mockTree } = setUpIsProjectAPublishableLib({
            shouldPackageJsonExists: true,
            packageJsonContent: { name: 'test-lib', private: true },
          });

          const response = await isProjectAPublishableLib(
            mockTree,
            projects.publishableLibrary
          );

          expect(response).toBe(false);
        });
      });
    });

    describe('when package.json does not exist', () => {
      it('should indicate that the project is not a publishable library', async () => {
        const { projects, mockTree } = setUpIsProjectAPublishableLib({
          shouldPackageJsonExists: false,
        });

        const response = await isProjectAPublishableLib(
          mockTree,
          projects.nonPublishableLibrary
        );

        expect(response).toBe(false);
      });
    });

    describe('file operations', () => {
      it('should look for package.json file in the project root', async () => {
        const { fileExistsMock, projects, mockTree } =
          setUpIsProjectAPublishableLib({
            shouldPackageJsonExists: false,
          });
        const project = projects.nonPublishableLibrary;

        await isProjectAPublishableLib(mockTree, project);

        expect(fileExistsMock).toHaveBeenCalledWith(
          path.join(project.root, 'package.json')
        );
      });

      it('should read package.json content when file exists', async () => {
        const { readJsonMock, projects, mockTree } =
          setUpIsProjectAPublishableLib({
            shouldPackageJsonExists: true,
            packageJsonContent: { name: 'test-lib', private: false },
          });
        const project = projects.publishableLibrary;

        await isProjectAPublishableLib(mockTree, project);

        expect(readJsonMock).toHaveBeenCalledWith(
          mockTree,
          path.join(project.root, 'package.json')
        );
      });
    });
  });
});
