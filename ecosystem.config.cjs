module.exports = {
  apps: [
    {
      name: "blog-api",
      script: "src/server.js",
      interpreter: "node",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
        UPLOADS_DIR: "/var/www/bloggy-uploads",
      },
    },
     {
      name: "bloggy-worker",
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