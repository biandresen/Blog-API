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
  ],
};
