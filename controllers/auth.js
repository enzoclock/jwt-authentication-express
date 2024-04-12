import { compare, hash } from "../lib/crypto.js";
import { generateAuthenticationTokens } from "../lib/tokens.js";
import { User, RefreshToken } from "../models/index.js";

export async function registerUser(req, res) {
  const { username, email, password } = req.body;
  // TODO: body validation

  await User.create({
    username,
    email,
    password: await hash(password)
  });

  res.redirect("/");
}

export async function loginUser(req, res) {
  const { email, password } = req.body;
  // TODO: body validation

  // Validate user exists and provided password matches
  const user = await User.findOne({ where: { email }});
  if (! user) { return res.status(400).json({ status: 400, message: "Bad credentials" }); }

  const isMatching = await compare(password, user.password);
  if (! isMatching) { return res.status(400).json({ status: 400, message: "Bad credentials" }); }

  // Create authentication tokens
  const payload = { id: user.id, username: user.username };
  const { accessToken, refreshToken } = generateAuthenticationTokens(payload);

  // Invalidate all user existing Refresh Tokens, then save the new one
  await RefreshToken.destroy({
    where: { userId: user.id }
  });

  await RefreshToken.create({
    userId: user.id,
    token: refreshToken.token,
    expiresAt: refreshToken.expiresAt
  });

  // Send reply
  res.json({
    accessToken: accessToken.token,
    accessTokenType: accessToken.type,
    accessTokenExpiresAt: accessToken.expiresAt,
    refreshToken: refreshToken.token,
    refreshTokenExpiresAt: refreshToken.expiresAt
  });
}

