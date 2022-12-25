const fs = require('fs');
const path = require('path');

const pagesDirectory = './src/js/pages';

const getEntryFiles = () => {
  const entryFiles = {
    './service-worker.js': './src/js/service-worker.ts',
  };

  fs.readdirSync(pagesDirectory).forEach((directory) => {
    entryFiles[
      `./pages/${directory}.js`
    ] = `${pagesDirectory}/${directory}/index.ts`;
  });

  return entryFiles;
};

module.exports = {
  devtool: 'cheap-module-source-map',
  entry: getEntryFiles(),

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        type: 'asset/resource',
        generator: {
          filename: 'css/[name].css',
        },
        use: ['sass-loader'],
      },
    ],
  },

  node: {
    global: false,
  },

  output: {
    path: path.resolve(__dirname, './src/dist'),
    filename: '[name]',
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.scss'],
  },
};
