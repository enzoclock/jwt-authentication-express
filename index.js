import express from "express";
import cookieParser from "cookie-parser";
import config from "./config.js";
import * as authController from "./controllers/auth.js";
import { verifyJwtToken } from "./lib/tokens.js";

// Express app
const app = express();

// Client pages (for testing purposes)
app.use("/", express.static("client"));

// Body parsers
app.use(express.urlencoded({ extended: true })); // application/x-www-form-urlencoded
app.use(express.json()); // application/json

// Cookie parser
app.use(cookieParser());

// Authentication routes
app.post("/signup", authController.signupUser);
app.post("/login", authController.loginUser);
app.delete("/logout", authController.logout);
app.post("/refresh", authController.refreshAccessToken);


// Any API resources
app.get("/public-stuff", getPublicStuff);
app.get("/private-stuff", isAuthenticated, getPrivateStuff);


// HTTP server
const { port, host } = config.server; 
app.listen(port, host, () => {
  console.log(`🚀 Server listening on http://${host}:${port}`);
});

// ==================================================
// =========== Authentication middleware ============
// ==================================================

function isAuthenticated(req, res, next) {
  // Get access token from either cookies (browsers) or Authorization headers (any service)
  const accessToken = req.cookies?.accessToken || req.headers?.["Authorization"]?.split("Bearer ")[1];
  if (! accessToken) { return res.status(401).json({ status: 401, message: "No access token provided in request headers" }); }

  const decodedToken = verifyJwtToken(accessToken);
  if (! decodedToken) { return res.status(401).json({ status: 401, message: "Invalid access token" }); }
  
  if (config.auth.preventCSRF) {
    const csrfToken = req.headers?.["x-csrf-token"];
    if (! csrfToken) { return res.status(401).json({ status: 401, message: "No csrf token provided in request headers" }); }

    if (decodedToken.csrfToken !== csrfToken) { return res.status(401).json({ status: 401, message: "Bad CSRF token provided" }); }
  }

  next();
}

// ==================================================
// ================ ANY API RESOURCES ===============
// ==================================================

function getPublicStuff(_, res) {
  res.json({ status: 200, message: "This is some public resource." });
}

function getPrivateStuff(_, res) {
  res.json({ status: 200, message: "This is some private resource" });
}
