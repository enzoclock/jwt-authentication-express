import { compare, hash } from "../lib/crypto.js";
import { generateAuthenticationTokens, generateJwtToken, generateRandomString } from "../lib/tokens.js";
import { User } from "../models/index.js";

export async function registerUser(req, res) {
  const { username, email, password } = req.body;
  // TODO: body validation

  await User.create({
    username,
    email,
    password: hash(password)
  });

  res.redirect("/");
}

export async function loginUser(req, res) {
  const { email, password } = req.body;
  // TODO: body validation

  const user = await User.findOne({ where: { email }});
  if (! user) { return res.status(400).json({ status: 400, message: "Bad credentials" }); }

  const isMatching = await compare(password, user.password);
  if (! isMatching) { return res.status(400).json({ status: 400, message: "Bad credentials" }); }

  const payload = { id: user.id, username: user.username };
  const { accessToken, refreshToken } = generateAuthenticationTokens(payload);

  res.json({
    accessToken: accessToken.token,
    accessTokenType: accessToken.type,
    accessTokenExpiresIn: accessToken.expiresIn,
    refreshToken: refreshToken.token,
    refreshTokenExpiresIn: refreshToken.expiresIn
  });
}

