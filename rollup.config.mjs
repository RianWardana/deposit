import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import htmlMinifier from 'rollup-plugin-html-minifier';
import summary from 'rollup-plugin-summary';
import copy from 'rollup-plugin-copy';

const copyConfig = {
  targets: [
    { src: 'img/**/*', dest: 'build/img' },
    { src: 'favicon.ico', dest: 'build' },
    { src: 'index.html', dest: 'build' }
  ],
  copyOnce: true, // Add this line to ensure copying is done only once during watch mode
};

export default {
  input: 'src/main-app.js',
  output: {
    dir: 'build/src',
    format: 'es',
  },
  plugins: [
    // Entry point for application build; can specify a glob to build multiple
    // HTML files for non-SPA app
    htmlMinifier({
      include: '**/*.html',
      htmlMinifierOptions: {
        collapseWhitespace: true,
        removeComments: true,
        caseSensitive: true,
        minifyCSS: true,
      },
    }),
    // Resolve bare module specifiers to relative paths
    resolve(),
    // Minify JS
    terser({
      ecma: 2020,
      module: true,
      warnings: true,
    }),
    // Print bundle summary
    summary(),
    copy(copyConfig),
  ],
  
  preserveEntrySignatures: 'strict',
};
