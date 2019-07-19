module.exports = {
  apps : {
    name: 'woke',
    script: 'npm',
    args: 'run prod',
    autorestart: true,
    watch: true,
    ignore_watch: ['static']
  }
};
