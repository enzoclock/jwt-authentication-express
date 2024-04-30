import { z } from "zod";
import config from "../config.js";
import { compare, hash, unsaltedHash } from "../lib/crypto.js";
import { generateAuthenticationTokens } from "../lib/tokens.js";
import { User, RefreshToken } from "../models/index.js";

// ============================================================
// ====================== USER SIGNUP =========================
// ============================================================

export async function signupUser(req, res) {
  // Body validation
  const { data, error } = await buildSignupBodySchema().safeParseAsync(req.body);
  if (error) { return res.status(400).json({ status: 400, message: error.message }); }

  // Create a new user
  const { username, email, password } = data;

  // Check if email is always in use
  const nbOfUsersWithSameEmail = await User.count({ where: { email }});
  if (nbOfUsersWithSameEmail !== 0) { return res.status(409).json({ status: 409, message: "Provided email already in use" }); }

  await User.create({
    username,
    email,
    password: await hash(password)
  });

  // Client reponse
  res.status(201).json({ status: 201, message: "User successfully created" });
}

// ============================================================
// ====================== USER SIGNIN =========================
// ============================================================

export async function loginUser(req, res) {
  // Body validation
  const { data, error } = await buildLoginBodySchema().safeParseAsync(req.body);
  if (error) { return res.status(400).json({ status: 400, message: error.message }); }

  const { email, password } = data;
  
  // Validate user exists and provided password matches
  const user = await User.findOne({ where: { email }});
  if (! user) { return res.status(401).json({ status: 401, message: "Bad credentials" }); }

  const isMatching = await compare(password, user.password);
  if (! isMatching) { return res.status(401).json({ status: 401, message: "Bad credentials" }); }

  // Create authentication tokens
  const { accessToken, refreshToken, csrfToken } = generateAuthenticationTokens(user);

  // Invalidate all user existing Refresh Tokens, then save the new one
  await RefreshToken.destroy({
    where: { userId: user.id }
  });
  await RefreshToken.create({
    userId: user.id,
    token: unsaltedHash(refreshToken.token), // https://security.stackexchange.com/questions/271157/where-to-store-jwt-refresh-tokens
    expiresAt: refreshToken.expiresAt
  });

  // Client reponse
  sendTokensResponse(res, { accessToken, refreshToken, csrfToken });
}

// ============================================================
// ==================== REFRESH TOKEN =========================
// ============================================================

export async function refreshAccessToken(req, res) {
  // Get refresh token either from cookies (browsers auth) or body (any service)
  const rawToken = req.cookies?.refreshToken || req.body?.refreshToken;

  // Validation
  const { data: token, error } = await buildRefreshTokenSchema().safeParseAsync(rawToken);
  if (error) { return res.status(400).json({ status: 400, message: error.message }); }

  // Find existing token and associated user
  const existingRefreshToken = await RefreshToken.findOne({
    where: { token: unsaltedHash(token) },
    include: { association: "user" }
  });
  if (! existingRefreshToken) { return res.status(401).json({ status: 401, message: "Invalid refresh token provided"}); }

  // Check token validity
  const isProvidedTokenStillValid = new Date().valueOf() < existingRefreshToken.expiresAt.valueOf();
  if (! isProvidedTokenStillValid) {
    await existingRefreshToken.destroy(); // Clean up invalid tokens
    return res.status(401).json({ status: 401, message: "Invalid refresh token provided"});
  }

  // Generate new tokens
  const { accessToken, refreshToken, csrfToken } = generateAuthenticationTokens(existingRefreshToken.user);

  // Delete old token, then save the new one
  await existingRefreshToken.destroy();
  await RefreshToken.create({
    userId: existingRefreshToken.user.id,
    token: unsaltedHash(refreshToken.token),
    expiresAt: refreshToken.expiresAt
  });

  // Client reponse
  sendTokensResponse(res, { accessToken, refreshToken, csrfToken });
}

// ============================================================
// ===================== LOGOUT USER ==========================
// ============================================================

export async function logout(req, res) {
  res.cookie("accessToken", Math.random().toString());
  res.cookie("refreshToken", Math.random().toString());
  res.status(204).end();
}

// ============================================================
// ====================== BODY SCHEMA =========================
// ============================================================

function buildSignupBodySchema() {
  return z.object({
    username: z.string().min(1),
    email: z.string().min(1).email(),
    password: z.string().min(8)
  });
}

function buildLoginBodySchema() {
  return z.object({
    email: z.string().email(),
    password: z.string()
  });
}

function buildRefreshTokenSchema() {
  return z.string().min(1);
}


// ============================================================
// =================== RESPONSE HANDLING ======================
// ============================================================

function sendTokensResponse(res, { accessToken, refreshToken, csrfToken }) {
  // Set tokens in client cookies (to prevent XSS)
  res.cookie("accessToken", accessToken.token, {
    maxAge: accessToken.expiresInMS,
    httpOnly: true, // Client code cannot access cookie
    secure: config.server.secure // Only send cookie via HTTPS
  });

  res.cookie("refreshToken", refreshToken.token, {
    maxAge: refreshToken.expiresInMS,
    httpOnly: true,
    secure: config.server.secure,
    path: "/refresh" // Client will only send the "refreshToken" cookie through the /refresh route
  });

  // Send reply (to ease client handling)
  res.json({
    accessToken: accessToken.token,
    accessTokenType: accessToken.type,
    accessTokenExpiresAt: accessToken.expiresAt,

    refreshToken: refreshToken.token,
    refreshTokenExpiresAt: refreshToken.expiresAt,

    ...(csrfToken && { csrfToken })
  });
}
