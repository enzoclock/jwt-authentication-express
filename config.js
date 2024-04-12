const server = {
  host: process.env.HOST || "localhost",
  port: process.env.PORT || 3000
};

const database = {
  dialect: process.env.DATABASE_DIALECT || "sqlite",
  storage: process.env.DATABASE_STORAGE || "database.sqlite"
};

const auth = {
  accessToken: {
    type: process.env.ACCESS_TOKEN_TYPE || 'Bearer',
    algorithm: process.env.ACCESS_TOKEN_ALGORITHM || 'HS256',
    secret: process.env.ACCESS_TOKEN_SECRET || 'Acc3ssTok3nS3c3t!',
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || 15 * 60 * 1000, // 15 minutes
    audience: process.env.ACCESS_TOKEN_AUDIENCE || 'my_backend_api', // Audience claim of the JWT
    issuer: process.env.ACCESS_TOKEN_ISSUER || 'my_authentication_server' // Issuer claim of the JWT
  },
  refreshToken: {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || 30 * 24 * 60 * 60 * 1000 // ~ 1 month
  },
  crypto: {
    saltRounds: process.env.SALT_ROUNDS || 10
  }
};

export default {
  auth,
  database,
  server,
};
