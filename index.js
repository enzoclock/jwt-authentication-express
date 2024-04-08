import express from "express";
import config from "./config.js";

// Create Express app
const app = express();

// Configure client pages
app.get("/", (req, res) => {
  res.sendFile(`${import.meta.dirname}/index.html`);
});

// Configure public API routes
app.get("/api/public", getPublicStuff);
app.get("/api/signup", registerUser);
app.get("/api/signin", loginUser);

// Configure protected routes
app.get("/api/private", getPrivateStuff);


// Start HTTP server
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

function registerUser(req, res) {
  res.send("OK");
}

function loginUser(req, res) {
  res.send("OK");
}
