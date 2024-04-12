import express from "express";
import config from "./config.js";
import { User } from "./models/index.js";

// Express app
const app = express();

// Client pages
app.get("/", sendHomePage);

// Body parsers
const formUrlEncodedParser = express.urlencoded({ extended: true });

// Authentication routes
app.post("/signup", formUrlEncodedParser, registerUser);
app.post("/signin", formUrlEncodedParser, loginUser);


// Resources
app.get("/public-stuff", getPublicStuff);
app.get("/private-stuff", getPrivateStuff);


// HTTP server
const { port, host } = config.server; 
app.listen(port, host, () => {
  console.log(`🚀 Server listening on http://${host}:${port}`);
});


// ==================

function sendHomePage(req, res) {
  res.sendFile(`${import.meta.dirname}/index.html`);
}

function getPublicStuff(req, res) {
  res.json({ message: "This is some public resource." });
}

function getPrivateStuff(req, res) {
  res.json({ message: "This is some private resource" });
}

async function registerUser(req, res) {
  const { pseudo, email, password } = req.body;
  // TODO: body validation

  await User.create({
    pseudo,
    email,
    password // TODO: password hashing
  });

  res.redirect("/");
}

function loginUser(req, res) {
  res.send("OK");
}
