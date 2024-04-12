import bcrypt from "bcrypt";
import config from "../config.js";


export async function hash(data) {
  const { saltRounds } = config.crypto;
  return await bcrypt.hash(data, saltRounds);
}

export async function compare(rawData, encryptedData) {
  return await bcrypt.compare(rawData, encryptedData);
}

