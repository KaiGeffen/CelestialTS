const path = require('path');
module.exports = {
    entry: './src/app.ts',
    module: {
	rules: [
{
    test: /\.tsx?$/,
    use: 'ts-loader'
}
    ]
    },
    resolve: {
	    extensions: [ '.ts', '.tsx', '.js' ],
        alias: {
            path: require.resolve("path-browserify")
        }
    },
    output: {
	filename: 'app.js',
	path: path.resolve(__dirname, 'dist')
    },
    mode: 'development'
};
