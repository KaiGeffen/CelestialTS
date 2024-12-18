const nodeExternals = require('webpack-node-externals')

module.exports = {
  entry: './src/index.ts', // Replace with your TypeScript entry file
  stats: { warnings: false },
  output: {
    path: __dirname + '/dist',
    filename: 'index.js',
    libraryTarget: 'commonjs2', // Use CommonJS for Node.js
  },
  mode: 'development',
  target: 'node',
  externals: [nodeExternals()], // Exclude node_modules from the bundle
  resolve: {
    extensions: ['.ts', '.js'], // Allow importing .ts and .js files
  },
  module: {
    rules: [
      {
        test: /\.ts$/, // Process TypeScript files
        loader: 'ts-loader',
        options: {
          transpileOnly: true, // Skip type-checking
        },
        exclude: /node_modules/,
      },
    ],
  },
}
