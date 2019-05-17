const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('terser-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const babelrc = JSON.parse(fs.readFileSync(`${process.cwd()}/.babelrc`, 'utf-8'));
const appDirectory = fs.realpathSync(process.cwd());
const resolveAppPath = relativePath => path.resolve(appDirectory, relativePath);

const context = resolveAppPath('lib');
const outputPath = resolveAppPath('lib-es');

/**
 * Optimizer
 */
function optimizerPlugins() {
	let plugins = [];

	plugins.push(
		new UglifyJsPlugin({
			cache: true,
			parallel: true,
			sourceMap: false // set to true if you want JS source maps
		}),
	);

	return plugins;
}


module.exports = {
	// Entry point for webpack
	context,
	resolve: {
		extensions: [
			'.js'
		]
	},
	entry: {
		index: `${context}/index.js`
	},
	// Output directory and filename
	output: {
		filename: '[name].min.js',
		path: outputPath
	},
	// Tell webpack to run babel on every file it runs through
	module: {
		rules: [
			{
				test: /\.js$/,
				loader: 'babel-loader',
				exclude: /node_modules/,
				options: { // Let's add babel presets and plugins
					presets: babelrc.presets,
					// ... and plugins.
					plugins: babelrc.plugins
				}
			}
		]
	},
	plugins: [
		new BundleAnalyzerPlugin(),
		new UglifyJsPlugin(),
	],
	// Some libraries import Node modules but don't use them in the browser.
	// Tell Webpack to provide empty mocks for them so importing them works.
	node: {
		dgram: 'empty',
		fs: 'empty',
		net: 'empty',
		tls: 'empty',
		child_process: 'empty',
	},
	// Turn off performance hints during development because we don't do any
	// splitting or minification in interest of speed. These warnings become
	// cumbersome.
	performance: {
		hints: false
	},
	optimization: {
		minimizer: optimizerPlugins()
	}
};
