export default () => ({
  app: {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.APP_PORT || '3000', 10),
  },
  database: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    name: process.env.POSTGRES_DB || 'imtixon',
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || '12345678',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'access',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  superAdmin: {
    username: process.env.SUPER_ADMIN_USERNAME || 'nuriddinznz',
    password: process.env.SUPER_ADMIN_PASSWORD || '2727',
    email:
      process.env.SUPER_ADMIN_EMAIL ||
      `${(process.env.SUPER_ADMIN_USERNAME || 'nuriddinznz')
        .replace(/[^a-z0-9]/gi, '')
        .toLowerCase()}@airways.local`,
  },
});
