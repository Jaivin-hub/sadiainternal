const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const JS_DIR = path.resolve( __dirname, 'src/js' );
console.log("JS_DIR",JS_DIR)

module.exports = {
  entry:'./src/js/index.js',
  // entry : {
  //   app: './src/js/index',
  // },
  output: {
    filename: 'assets/js/[name].bundle.js', // Dynamic output filenames for multiple entry points
    path: path.resolve(__dirname, 'dist'),    // Output directory
    clean: true,                              // Clean the output directory before each build
  },
  module: {
    rules: [
      {
        test: /\.hbs$/,                       // Handlebar template files
        loader: 'handlebars-loader',
        options: {
          partialDirs: [
            path.join(__dirname, 'src', 'partials'),
            path.join(__dirname, 'src', 'partials', 'sections'),
          ],
        },
      },
      {
        test: /\.(sa|sc|c)ss$/i,              // CSS and Sass files
        use: [
          MiniCssExtractPlugin.loader,        // Extracts CSS to separate file
          'css-loader',                       // Translates CSS into CommonJS
          'sass-loader',                      // Compiles Sass to CSS
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/layouts/main.hbs',     // Template for main HTML file
      inject: false,                         // Do not inject scripts
      filename: 'index.html',                // Output filename
    }),
    new HtmlWebpackPlugin({
      template: 'src/pages/home.hbs',       // Template for home page
      inject: 'body',                        // Inject scripts at the end of the body
      filename: 'home.html',                 // Output filename for home page
      chunks: ['main', 'slickslider'],       // Include both entry points in this file
    }),
    new MiniCssExtractPlugin({
      filename: 'css/style.css',             // Output CSS filename
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: './src/assets/images', to: './assets/images', noErrorOnMissing: true },
        { from: './src/assets/fonts', to: './assets/fonts', noErrorOnMissing: true },
        { from: './node_modules/slick-carousel/slick/slick.css', to: './assets/css/slick.css' },
        { from: './node_modules/slick-carousel/slick/slick-theme.css', to: './assets/css/slick-theme.css' },
        { from: './node_modules/slick-carousel/slick/slick.min.js', to: './assets/js/slick.min.js' },
      ],
    }),
  ],
  devServer: {
    static: path.join(__dirname, 'dist'),   // Serve content from 'dist'
    port: 8080,                              // Development server port
    historyApiFallback: true,                // Fallback for single-page applications
  },
  mode: 'development',                       // Set mode to development
};
