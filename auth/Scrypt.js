import { scryptSync, timingSafeEqual, randomBytes } from "node:crypto";

export class Scrypt {
  static hash(password) {
    // On crée le sel : 16 bytes est la recommandation.
    const salt = randomBytes(16).toString("hex");
    // On crée le hash du mot de passe 64 caractères de long, on peut faire plus ou moins, mais plus c'est mieux : consultez la doc pour les options. Il est retourné sous forme de Buffer <https://nodejs.org/api/buffer.html>
    // The settings recommended by OWASP do work out to a rather high maxmem:
    // "If Argon2id is not available, use scrypt with a minimum CPU/memory cost parameter of (2^17)
    // a minimum block size of 8 (1024 bytes), and a parallelization parameter of 1"
    // That works out to 134220800, around 134MB.
    const buf = scryptSync(password, salt, 64, {
      N: 131072,
      maxmem: 134220800,
    });
    // On convertit le Buffer en string hexa et on concatène la string obtenue (le hash) et le sel, c'est ça qu'on met en BDD.
    return `${buf.toString("hex")}.${salt}`;
  }

  static compare(plainTextpassword, hash) {
    // split() retourne un tableau que l'on destructure pour obtenir le hash et le sel
    const [hashedPassword, salt] = hash.split(".");
    // On créé un buffer : une sorte de tableau de caractères que peut analyer l'algo scrypt
    const hashedPasswordBuf = Buffer.from(hashedPassword, "hex");
    // On hash le mot de passe reçu du req.body avec le sel du mot de passe que l'on a en BDD

    // The settings recommended by OWASP do work out to a rather high maxmem:
    // "If Argon2id is not available, use scrypt with a minimum CPU/memory cost parameter of (2^17)
    // a minimum block size of 8 (1024 bytes), and a parallelization parameter of 1"
    // That works out to 134220800, around 134MB.
    const clearPasswordBuffer = scryptSync(plainTextpassword, salt, 64, {
      N: 131072,
      maxmem: 134220800,
    });
    // On compare les deux mots de passe avec timingSafeEqual (voir la doc, lien ci-dessus)
    return timingSafeEqual(hashedPasswordBuf, clearPasswordBuffer);
  }
}
