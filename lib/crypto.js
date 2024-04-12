import crypto from "node:crypto";
import bcrypt from "bcrypt";
import config from "../config.js";

const { saltRounds, unsaltedHashAlgorithm } = config.auth.crypto;

export async function hash(data) {
  return await bcrypt.hash(data, saltRounds);
}

export async function compare(rawData, encryptedData) {
  return await bcrypt.compare(rawData, encryptedData);
}

export function unsaltedHash(data) {
  return crypto.hash(unsaltedHashAlgorithm, data);
}
