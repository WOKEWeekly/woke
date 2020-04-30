const DotEnv = require('dotenv-webpack');
const server = require('./server.js');
const fs = require('fs');

module.exports = {
  useFileSystemPublicRoutes: false,
  generateBuildId: async () => {
    const revision = fs.readFileSync('../git/HEAD').toString();
    if (revision.indexOf(':') === -1) return revision;
    return fs.readFileSync('.git/' + revision.substring(5)).toString();
  },
  webpack: function (config) {
    config.node = {
      fs: 'empty',
      child_process: 'empty',
      module: 'empty',
    };
    config.module.rules.push({
      test: /\.(eot|woff|woff2|ttf|svg|png|jpg|gif)$/,
      use: {
        loader: 'url-loader',
        options: {
          limit: 100000,
          name: '[name].[ext]',
        },
      },
    });

    config.plugins = [
      ...config.plugins,
      new DotEnv({
        path: server.config,
        systemvars: true,
        silent: true,
      }),
    ];

    return config;
  },
};
