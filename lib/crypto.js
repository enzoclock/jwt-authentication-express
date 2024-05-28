import crypto from "node:crypto";
import { promisify } from "node:util";
import config from "../config.js";


export async function hash(password) {
  // Using scrypt algorithm, following OWASP recommendations (https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
  const scrypt = promisify(crypto.scrypt); // Node.js recommends using the async version of scrypt to prevent blocking the event loop. Here we promesify it for readability.
  const { saltLength, hashLength, cost, blockSize, parallelization, maxmem } = config.auth.crypto.scrypt;
  
  const salt = crypto.randomBytes(saltLength).toString("hex");
  const hashBuffer = await scrypt(password, salt, hashLength, { cost, blockSize, parallelization, maxmem });
  return `${hashBuffer.toString("hex")}.${salt}`; // salt is stored along with the hashed password to allow comparison
}


export async function compare(plainTextPassword, hashedPassword) {
  const [hash, salt] = hashedPassword.split(".");
  const hashedPasswordBuffer = Buffer.from(hash, "hex");

  const scrypt = promisify(crypto.scrypt);
  const { hashLength, cost, blockSize, parallelization, maxmem } = config.auth.crypto.scrypt;
  const plainTextPasswordBuffer = await scrypt(plainTextPassword, salt, hashLength, { cost, blockSize, parallelization, maxmem });

  return crypto.timingSafeEqual(hashedPasswordBuffer, plainTextPasswordBuffer); // this function does not leak timing information that would allow an attacker to guess one of the values.
}


export function unsaltedHash(data) {
  const { unsaltedHashAlgorithm } = config.auth.crypto;
  return crypto.hash(unsaltedHashAlgorithm, data);
}
