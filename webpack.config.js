const path = require('path');

module.exports = {
  devtool: 'cheap-module-source-map',
  entry: './src/js/service-worker.ts',

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },

  node: {
    global: false,
  },

  output: {
    path: path.resolve(__dirname, './src/dist'),
    filename: 'service-worker.js',
  },

  resolve: {
    extensions: ['.ts', '.tsx'],
  },
};
