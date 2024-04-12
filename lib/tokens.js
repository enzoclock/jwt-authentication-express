import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import config from "../config.js";

const { algorithm, audience, expiresIn, issuer, secret, type } = config.auth.accessToken;
const { expiresIn: refreshTokenExpiresIn } = config.auth.refreshToken;

export function generateAuthenticationTokens(payload) {
  return {
    accessToken: {
      token: generateJwtToken(payload),
      type,
      expiresAt: new Date(new Date().valueOf() + expiresIn)
    },
    refreshToken: {
      token: generateRandomString(),
      expiresAt: new Date(new Date().valueOf() + refreshTokenExpiresIn)
    }
  };
}

export function generateJwtToken(payload) {
  return jwt.sign(payload, secret, { algorithm, audience, expiresIn, issuer });
}

export function generateRandomString() {
  return crypto.randomBytes(128).toString("base64");
}
