module.exports = {
    apps : [{
      name: 'My Telegram Bot',
      script: 'dist/app.js',
      args: '',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    }]
  };