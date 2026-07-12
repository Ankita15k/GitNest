import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const archiver = require('archiver');

export const generateRepositoryArchive = (
  userId,
  repoName
) => {
  return new Promise((resolve, reject) => {
    const repoPath = path.resolve(
      process.cwd(),
      'repositories',
      userId,
      repoName
    );

    const archiveDir = path.resolve(
      process.cwd(),
      'temp'
    );

    fs.mkdirSync(archiveDir, {
      recursive: true,
    });

    const zipPath = path.join(
      archiveDir,
      `${repoName}.zip`
    );

    const output = fs.createWriteStream(
      zipPath
    );

    const archive = archiver('zip', {
      zlib: { level: 9 },
    });

    output.on('close', () => {
      resolve(zipPath);
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);

    archive.directory(
      repoPath,
      false,
      (entry) => {
        if (
          entry.name.startsWith('.git')
        ) {
          return false;
        }

        return entry;
      }
    );

    archive.finalize();
  });
};
