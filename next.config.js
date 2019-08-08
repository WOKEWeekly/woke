require('dotenv').config()

const withSass = require("@zeit/next-sass");
const withCss = require("@zeit/next-css");
const withPlugins = require("next-compose-plugins");
const shebang_loader = require('shebang-loader');

const DotEnv = require('dotenv-webpack');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const dev = process.env.NODE_ENV !== 'production';

module.exports = withPlugins([
  [
    withCss,
    {
      webpack: function(config) {
        config.node = {
          fs: 'empty',
          child_process: 'empty',
          module: 'empty'
        };
        config.module.rules.push({
          test: /\.(eot|woff|woff2|ttf|svg|png|jpg|gif)$/,
          use: {
            loader: "url-loader",
            options: {
              limit: 100000,
              name: "[name].[ext]",
            },
          }
        },
        {
          test: /\.(js)$/,
          use: {
            loader: 'shebang-loader'
          }
        });

        config.plugins = config.plugins || []
        config.plugins = [
          ...config.plugins,
          new DotEnv({
            path: dev ? './config.env' : '/root/config.env',
            systemvars: true
          }),
          new MomentLocalesPlugin(),
        ];

        return config
      },
    },
  ],
  [
    withSass,
    {
      cssModules: true,
      cssLoaderOptions: {
        importLoaders: 1,
        localIdentName: "[local]___[hash:base64:5]",
      },
    },
  ]
])