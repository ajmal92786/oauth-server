const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

app.get("/", (req, res) => {
  res.send(`<h1>Welcome to OAuth API Server.</h1>`);
});

app.get("/auth/github", (req, res) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user,repo,security_events`;

  res.redirect(githubAuthUrl);
});

app.get("/auth/github/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("Authorization code not provided.");
  }

  try {
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );

    const accessToken = tokenResponse.data.access_token;

    res.cookie("access_token", accessToken);
    return res.redirect(`${process.env.FRONTEND_URL}/v1/profile/github`);
  } catch (error) {
    res.status(500).json(error);
  }
});

app.get("/auth/google", (req, res) => {
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=http://localhost:${PORT}/auth/google/callback&response_type=code&scope=profile email`;

  res.redirect(googleAuthUrl);
});

app.get("/auth/google/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("Authorization code not provided.");
  }

  let accessToken;

  try {
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: `http://localhost:${PORT}/auth/google/callback`,
      },
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    accessToken = tokenResponse.data.access_token;
    res.cookie("access_token", accessToken);
    return res.redirect(`${process.env.FRONTEND_URL}/v1/profile/google`);
  } catch (error) {
    console.error(error);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
