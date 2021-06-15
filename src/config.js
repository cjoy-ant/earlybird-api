module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN,
  LOCAL_CLIENT: process.env.LOCAL_CLIENT,
  DATABASE_URL: process.env.DATABASE_URL,
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL,
};
