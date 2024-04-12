import { compare, hash, unsaltedHash } from "../lib/crypto.js";
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
  if (! user) { return res.status(400).json({ status: 401, message: "Bad credentials" }); }

  const isMatching = await compare(password, user.password);
  if (! isMatching) { return res.status(400).json({ status: 401, message: "Bad credentials" }); }

  // Create authentication tokens
  const { accessToken, refreshToken } = generateAuthenticationTokens(user);

  // Invalidate all user existing Refresh Tokens, then save the new one
  await RefreshToken.destroy({
    where: { userId: user.id }
  });

  await RefreshToken.create({
    userId: user.id,
    token: unsaltedHash(refreshToken.token), // https://security.stackexchange.com/questions/271157/where-to-store-jwt-refresh-tokens
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

export async function refreshAccessTokens(req, res) {
  const { token } = req.body;
  // TODO: validate body

  const refreshToken = await RefreshToken.findOne({
    where: { token: unsaltedHash(token) },
    include: { association: "user" }
  });
  if (! refreshToken) { return res.status(401).json({ status: 401, message: "Invalid refresh token provided"}); }

  // Check token validity
  const isProvidedTokenStillValid = new Date().valueOf() < refreshToken.expiresAt.valueOf();
  if (! isProvidedTokenStillValid) {
    await refreshToken.destroy(); // Clean up invalid tokens
    return res.status(401).json({ status: 401, message: "Invalid refresh token provided"});
  }

  // Generate new tokens
  const { accessToken, refreshToken: newRefreshToken } = generateAuthenticationTokens(refreshToken.user);

  // Delete old token, then save the new one
  await refreshToken.destroy();

  await RefreshToken.create({
    userId: refreshToken.user.id,
    token: unsaltedHash(newRefreshToken.token),
    expiresAt: newRefreshToken.expiresAt
  });
  
  // Send reply
  res.json({
    accessToken: accessToken.token,
    accessTokenType: accessToken.type,
    accessTokenExpiresAt: accessToken.expiresAt,
    refreshToken: newRefreshToken.token,
    refreshTokenExpiresAt: newRefreshToken.expiresAt
  });
}
