const fs = require('fs');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

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

  plugins: [
    new MiniCssExtractPlugin({
      filename: (pathData) => {
        // Without this absolute nonsense, the css files would have a js extension in them
        const name = path.basename(pathData.chunk.name, '.js');
        return `css/${name}.css`;
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: ['ts-loader', './src/js/webpack/globalServiceLoader.js'],
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          // Takes the JavaScript output from the garbage waste of space loader called css-loader
          // and turns it back into css
          MiniCssExtractPlugin.loader,
          {
            // Loads the css so that the url symbols can be resolved
            // This plugin has the trash garbage stupid waste of time side effect
            // of turning the css file into JavaScript
            loader: 'css-loader',
            options: {
              // We don't actually care about sourcemaps for css
              // so we disable them here
              sourceMap: false,
            },
          },
          // Allows relative paths to be used
          'resolve-url-loader',
          {
            loader: 'sass-loader',
            options: {
              // resolve-url-loader requires sourceMap: true
              sourceMap: true,
            },
          },
        ],
      },
      {
        // This turns images into data URIs
        test: /\.(png)$/,
        type: 'asset/inline',
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
