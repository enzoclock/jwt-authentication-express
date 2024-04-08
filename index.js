import express from "express";
import config from "./config.js";

// Create Express app
const app = express();

// Configure public routes
app.get("/public", getPublicStuff);
app.get("/signup", registerUser);
app.get("/signin", loginUser);

// Configure protected routes
app.get("/private", getPrivateStuff);


// Start HTTP server
const { port, host } = config.server; 
app.listen(port, host, () => {
  console.log(`🚀 Server listening on http://${host}:${port}`);
});


// ==================

function getPublicStuff(req, res) {
  res.json({ message: "This is some public resources." });
}

function getPrivateStuff(req, res) {
  res.json({ message: "This is some private resources" });
}
