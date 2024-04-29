import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import config from "../config.js";

const { algorithm, audience, expiresIn, issuer, secret, type } = config.auth.accessToken;
const { expiresIn: refreshTokenExpiresIn } = config.auth.refreshToken;
const { preventCSRF } = config.auth;

export function generateAuthenticationTokens(user) {
  const payload = { id: user.id, username: user.username };

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
    }
  };
}

export function generateJwtToken(payload) {
  return jwt.sign({
    ...payload,
    ...(preventCSRF && { csrfToken: generateRandomString() }) // For browser-based clients
  }, secret, { algorithm, audience, expiresIn, issuer });
}

export function generateRandomString() {
  return crypto.randomBytes(128).toString("base64");
}

function createExpirationDate(expiresInMs) {
  return new Date(new Date().valueOf() + expiresInMs);
}
