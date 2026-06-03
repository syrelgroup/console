module.exports = {
  apps: [
    {
      name: "syrel-console",
      script: "./dist/src/index.js",
      env: {
        PORT: 5003,
        NODE_ENV: "production",
      },
    },
  ],
};
