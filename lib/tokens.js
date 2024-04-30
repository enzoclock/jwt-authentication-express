import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import config from "../config.js";

const { algorithm, audience, expiresIn, issuer, secret, type } = config.auth.accessToken;
const { expiresIn: refreshTokenExpiresIn } = config.auth.refreshToken;
const { preventCSRF } = config.auth; // for browser-based clients

export function generateAuthenticationTokens(user) {
  const csrfToken = preventCSRF ? generateRandomString() : null;
  const payload = {
    id: user.id,
    username: user.username,
    ...(csrfToken && { csrfToken })
  };

  return {
    accessToken: {
      token: generateJwtToken(payload),
      type,
      expiresAt: createExpirationDate(expiresIn),
      expiresInMS: expiresIn
    },
    refreshToken: {
      token: generateRandomString(),
      expiresAt: createExpirationDate(refreshTokenExpiresIn),
      expiresInMS: refreshTokenExpiresIn
    },
    ...(csrfToken && { csrfToken })
  };
}

export function generateJwtToken(payload) {
  return jwt.sign(payload, secret, { algorithm, audience, expiresIn, issuer });
}

export function generateRandomString() {
  return crypto.randomBytes(128).toString("base64");
}

function createExpirationDate(expiresInMs) {
  return new Date(new Date().valueOf() + expiresInMs);
}
