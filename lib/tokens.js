import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import config from "../config.js";

const { algorithm, audience, expiresIn, issuer, secret, type } = config.auth.accessToken;
const { expiresIn: refreshTokenExpiresIn } = config.auth.refreshToken;

export function generateAuthenticationTokens(user) {
  const payload = { id: user.id, username: user.username };

  return {
    accessToken: {
      token: generateJwtToken(payload),
      type,
      expiresAt: computeExpirationDate(expiresIn)
    },
    refreshToken: {
      token: generateRandomString(),
      expiresAt: computeExpirationDate(refreshTokenExpiresIn)
    }
  };
}

export function generateJwtToken(payload) {
  return jwt.sign(payload, secret, { algorithm, audience, expiresIn, issuer });
}

export function generateRandomString() {
  return crypto.randomBytes(128).toString("base64");
}

function computeExpirationDate(expiresInMs) {
  return new Date(new Date().valueOf() + expiresInMs);
}