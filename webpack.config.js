import { readdirSync } from 'fs';
import { basename, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const pagesDirectory = './src/js/pages';
const __dirname = dirname(fileURLToPath(import.meta.url));

const getEntryFiles = () => {
  const entryFiles = {};

  readdirSync(pagesDirectory).forEach((directory) => {
    entryFiles[
      `./pages/${directory}.js`
    ] = `${pagesDirectory}/${directory}/index.ts`;
  });

  return entryFiles;
};

export default {
  devtool: 'cheap-module-source-map',
  entry: getEntryFiles(),

  plugins: [
    new MiniCssExtractPlugin({
      filename: (pathData) => {
        // Without this absolute nonsense, the css files would have a js extension in them
        const name = basename(pathData.chunk.name, '.js');
        return `css/${name}.css`;
      },
    }),
  ],

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: ['ts-loader', 'extension-service-loader'],
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
        test: /\.(png|svg)$/,
        type: 'asset/inline',
      },
    ],
  },

  node: {
    global: false,
  },

  output: {
    path: resolve(__dirname, './src/dist'),
    filename: '[name]',
  },

  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.scss'],
  },
};
