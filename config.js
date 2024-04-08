const server = {
  port: process.env.PORT || 3000,
  host: process.env.HOST || "localhost"
}

const database = {
  dialect: "postgres",
};

const auth = {
  accessToken: {
    type: process.env.ACCESS_TOKEN_TYPE || 'Bearer',
    algorithm: process.env.ACCESS_TOKEN_ALGORITHM || 'HS256',
    secret: process.env.ACCESS_TOKEN_SECRET || 'Acc3ssTok3nS3c3t!',
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || 15 * 60 * 1000, // 15 minutes
    audience: process.env.ACCESS_TOKEN_AUDIENCE || 'my_backend_api',
    issuer: process.env.ACCESS_TOKEN_ISSUER || 'my_authentication_server'
  },
  refreshToken: {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || 30 * 24 * 60 * 60 * 1000 // ~ 1 month
  }
}

export default {
  server,
  auth
}