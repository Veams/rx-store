/**
 * Plugins
 */
import { normalize } from 'path';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';
import visualizer from 'rollup-plugin-visualizer';

/**
 * Use package json entries
 */
import pkg from './package.json';

/**
 * Constants
 */
const extensions = ['.js', '.jsx', '.ts', '.tsx'];
const name = 'RxStore';
const ENV = process.env.NODE_ENV;
const plugins = [
    // We resolve all file extension mentioned above.
    resolve({ extensions }),
    replace({
        // Because our output is for the browser, we need to get rid of all node specific runtime vars.
        'process.env.NODE_ENV': JSON.stringify(ENV),
    }),
    // Allow bundling cjs modules. Rollup doesn't understand cjs
    commonjs(),
    // Compile TypeScript/JavaScript files
    babel({ extensions, include: ['src/**/*'] }),
    // Next to our custom bundle analyzer we have a simple nice looking stat file we can open up to inspect the file size of our library.
    visualizer({ template: 'sunburst' }),
];

if (process.env.NODE_ENV === 'production') {
    plugins.push(
        terser({
            sourcemap: true,
        })
    );
}

/**
 * Config Export
 */
export default {
    input: './src/index.ts',
    // Specify here external modules which you don't want to include in your bundle (for instance: 'lodash', 'moment' etc.)
    // https://rollupjs.org/guide/en#external-e-external
    external: [],
    plugins,
    output: [
        {
            file: pkg.browser,
            format: 'umd',
            name,
            exports: 'named',
            sourcemap: true,
            // https://rollupjs.org/guide/en#output-globals-g-globals
            globals: {
                rxStore: name,
            },
        },
    ],
};
