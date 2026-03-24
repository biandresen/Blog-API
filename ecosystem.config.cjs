module.exports = {
  apps: [
    {
      name: "dadjokes-api",
      script: "src/server.js",
      interpreter: "node",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
        UPLOADS_DIR: "/var/www/dadjokes-uploads",
      },
    },
     {
      name: "dadjokes-worker",
      script: "src/jobs/worker.js",    // scheduler entry
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};


// pm2 start ecosystem.config.cjs
// pm2 save
// pm2 status

// pm2 startup
// pm2 save


//LOGGING
// pm2 install pm2-logrotate
// pm2 set pm2-logrotate:max_size 10M
// pm2 set pm2-logrotate:retain 14
// pm2 set pm2-logrotate:compress true
// pm2 set pm2-logrotate:dateFormat YYYY-MM-DD_HH-mm-ss

// PRODUCT FUNNEL
// SELECT "type", COUNT(*)
// FROM "ProductEvent"
// GROUP BY "type"
// ORDER BY COUNT(*) DESC;

//ADMIN ACTIONS
// SELECT "action", "actorUserId", COUNT(*)
// FROM "AuditLog"
// GROUP BY "action", "actorUserId"
// ORDER BY COUNT(*) DESC;

//MODERATION ATTEMPTS
// SELECT "action", COUNT(*)
// FROM "ModerationEvent"
// GROUP BY "action"
// ORDER BY COUNT(*) DESC;

//RUNNING WITH PM2
// pm2 start src/server.js --name dadjokes-api --env production
// pm2 start src/jobs/worker.js --name dadjokes-worker --env production

// NODE_ENV=production LOG_LEVEL=info pm2 start src/server.js --name dadjokes-api
// NODE_ENV=production LOG_LEVEL=info pm2 start src/jobs/worker.js --name dadjokes-worker