import crypto from "node:crypto";
import { Scrypt } from "../auth/Scrypt.js";
import config from "../config.js";

const { saltRounds, unsaltedHashAlgorithm } = config.auth.crypto;

export async function hash(data) {
  return Scrypt.hash(data, saltRounds);
}

export async function compare(rawData, encryptedData) {
  return Scrypt.compare(rawData, encryptedData);
}

export function unsaltedHash(data) {
  return crypto.hash(unsaltedHashAlgorithm, data);
}
