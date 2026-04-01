// PM2 Ecosystem — CardBuy
// Uso local:  pm2 start ecosystem.config.js
// Staging:    pm2 start ecosystem.config.js --env staging
// Producción: pm2 start ecosystem.config.js --env production

module.exports = {
  apps: [
    {
      name: "cardbuy-web",
      cwd: "./apps/web",
      script: "node_modules/.bin/next",
      args: "start",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development",
        PORT: 3000,
      },
      env_staging: {
        NODE_ENV: "production",
        PORT: 3010,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "./logs/web-error.log",
      out_file: "./logs/web-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
