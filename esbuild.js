const esbuild = require('esbuild');
const glob = require('glob');

const buildTypes = {
  cjs: {
    splitting: false,
    format: 'cjs',
    tsconfig: './tsconfig.json',
    destination: '/cjs'
  },
  esm: {
    splitting: true,
    format: 'esm',
    tsconfig: './tsconfig.esm.json',
    destination: ''
  }
};

function esbuildWrapper(
  buildType = 'esm',
  options = {
    outDir: 'out'
  }
) {
  const { format, splitting, tsconfig, destination } = buildTypes[buildType];

  const filesToInclude = [
    // './src/**/*.tsx',
    './src/**/*.ts'
    // './src/**/*.scss',
  ].join(',');

  return function executeBuildCommand() {
    glob(filesToInclude, function (err, allFiles) {
      if (err) {
        console.log('error reading files', err);
      }

      const files = allFiles.filter((file) => {
        const hasTestFiles =
          file.includes('/tests/') || file.includes('/stories/');
        return !hasTestFiles;
      });

      esbuild
        .build({
          entryPoints: files,
          splitting,
          format,
          outdir: `${options.outDir}${destination}`,
          treeShaking: true,
          minify: true,
          bundle: true,
          sourcemap: true,
          chunkNames: '__chunks__/[name]-[hash]',
          target: ['es2021'],
          tsconfig,
          platform: 'node',
          define: {
            global: 'global',
            process: 'process',
            Buffer: 'Buffer',
            'process.env.NODE_ENV': `"production"`
          }
        })
        .then(() => {
          console.log(
            '\x1b[36m%s\x1b[0m',
            `[${new Date().toLocaleTimeString()}] sdk-dapp build succeeded for ${format} types`
          );
        })
        .catch(() => process.exit(1));
    });
  };
}

esbuildWrapper('esm')();
// esbuildWrapper('cjs')();
