const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    main: './src/js/index.js',     // Main entry point
    slickslider: './src/js/slickslider.js', // Custom slick slider script
  },
  output: {
    filename: 'assets/js/[name].bundle.js',  // Dynamic output filenames for multiple entry points
    path: path.resolve(__dirname, 'dist'),
    clean: true,  // Clean the output directory before each build
  },
  module: {
    rules: [
      {
        test: /\.hbs$/,
        loader: 'handlebars-loader',
        options: {
          partialDirs: [
            path.join(__dirname, 'src', 'partials'),
            path.join(__dirname, 'src', 'partials', 'sections'),
          ],
        },
      },
      {
        test: /\.(sa|sc|c)ss$/i,
        use: [
          MiniCssExtractPlugin.loader,  // Extracts CSS to separate file
          'css-loader',  // Translates CSS into CommonJS
          'sass-loader', // Compiles Sass to CSS
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/layouts/main.hbs',
      inject: false,
      filename: 'index.html',
    }),
    new HtmlWebpackPlugin({
      template: 'src/pages/home.hbs',
      inject: 'body', // Inject scripts at the end of the body
      filename: 'home.html',
    }),
    new MiniCssExtractPlugin({
      filename: 'css/style.css',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: './src/assets/images', to: './assets/images', noErrorOnMissing: true },
        { from: './src/assets/fonts', to: './assets/fonts', noErrorOnMissing: true },
      ],
    }),
  ],
  devServer: {
    static: path.join(__dirname, 'dist'),
    port: 8080,
    historyApiFallback: true,  // Allows routing to work with history API in single-page apps
  },
  mode: 'development',
};