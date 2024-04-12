import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import config from "../config.js";

const { algorithm, audience, expiresIn, issuer, secret, type } = config.auth.accessToken;
const { expiresIn: refreshTokenExpiresIn } = config.auth.refreshToken.expiresIn;

export function generateAuthenticationTokens(payload) {
  const token = generateJwtToken(payload);
  const refreshToken = generateRandomString();

  return {
    accessToken: {
      token,
      type,
      expiresIn
    },
    refreshToken: {
      token: refreshToken,
      expiresIn: refreshTokenExpiresIn
    }
  };
}

export function generateJwtToken(payload) {
  return jwt.sign(payload, secret, { algorithm, audience, expiresIn, issuer });
}

export function generateRandomString() {
  return crypto.randomBytes(128).toString("base64");
}
