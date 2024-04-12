import express from "express";
import config from "./config.js";
import * as authController from "./controllers/auth.js";

// Express app
const app = express();

// Client pages (for testing purposes)
app.use("/", express.static("client"));

// Body parsers
app.use(express.urlencoded({ extended: true })); // application/x-www-form-urlencoded
app.use(express.json()); // application/json

// Authentication routes
app.post("/signup", authController.registerUser);
app.post("/signin", authController.loginUser);
app.post("/refresh", authController.refreshAccessTokens);


// Resources
app.get("/public-stuff", getPublicStuff);
app.get("/private-stuff", getPrivateStuff);


// HTTP server
const { port, host } = config.server; 
app.listen(port, host, () => {
  console.log(`🚀 Server listening on http://${host}:${port}`);
});


// ==================

function getPublicStuff(req, res) {
  res.json({ message: "This is some public resource." });
}

function getPrivateStuff(req, res) {
  res.json({ message: "This is some private resource" });
}

