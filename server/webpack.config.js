const nodeExternals = require('webpack-node-externals')

module.exports = {
  entry: './src/index.ts', // Replace with your TypeScript entry file
  output: {
    path: __dirname + '/dist',
    filename: 'index.js',
    libraryTarget: 'commonjs2', // Use CommonJS for Node.js
  },
  target: 'node',
  externals: [nodeExternals()], // Exclude node_modules from the bundle
  resolve: {
    extensions: ['.ts', '.js'], // Allow importing .ts and .js files
  },
  module: {
    rules: [
      {
        test: /\.ts$/, // Process TypeScript files
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
}
