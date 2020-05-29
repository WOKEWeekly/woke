/* eslint-disable import/order */
const DotEnv = require('dotenv-webpack');
const server = require('./server.js');
const path = require('path');

module.exports = {
  useFileSystemPublicRoutes: false,
  webpack: function (config) {
    config.module.rules.push({
      test: /\.(eot|woff|woff2|ttf|svg|png|jpg|gif)$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 100000,
          name: '[name].[ext]'
        }
      }
    });

    config.node = {
      fs: 'empty',
      child_process: 'empty',
      module: 'empty'
    };

    config.plugins = [
      ...config.plugins,
      new DotEnv({
        path: server.config,
        systemvars: true,
        silent: true
      })
    ];

    // TODO: Change to all absolute imports
    config.resolve.alias = {
      ...config.resolve.alias,
      ...mapImportsToAliases()
    };

    return config;
  }
};

/** Maps aliases to be resolved for absolute imports */
const mapImportsToAliases = () => {
  const directories = [
    'components',
    'constants',
    'partials',
    'pages',
    'reducers',
    'styles',
    'test'
  ];
  const aliases = {};

  directories.forEach((directory) => {
    aliases[`@${directory}`] = path.resolve(__dirname, directory);
  });

  return aliases;
};
