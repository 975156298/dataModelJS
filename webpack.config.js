const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const path = require('path');

module.export = {
	entry: './index.js',
//entry: {
//     a: './src/a.js',
//     b: './src/b.js'
//     }
	plugins: [
		new CleanWebpackPlugin() // 清除指定文件夹
	],
	output: {
		filename: '[name].bundle.js',
		path: path.resolve('./', 'dist')
	}
}
