const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const User = require('../models/User');

const router = express.Router();

// Redirect logged-in users away from login/register
function redirectIfLoggedIn(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return res.redirect('/assignments');
  }
  next();
}

// REGISTER PAGE
router.get('/register', redirectIfLoggedIn, (req, res) => {
  res.render('register', { title: 'Register' });
});

// REGISTER HANDLER
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.send('Email already in use');
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
    });

    // After registering, go to login
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.send('Error registering user');
  }
});

// LOGIN PAGE
router.get('/login', redirectIfLoggedIn, (req, res) => {
  res.render('login', { title: 'Login' });
});

// LOGIN HANDLER — Local login with passport
router.post('/login', async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.send('Invalid email or password');
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.send('Invalid email or password');
    }

    // Login using passport
    req.login(user, (err) => {
      if (err) return next(err);
      return res.redirect('/assignments');
    });
  } catch (err) {
    console.error(err);
    res.send('Error logging in');
  }
});

// GOOGLE AUTH — Redirect to Google
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// GOOGLE AUTH CALLBACK
router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/assignments');
  }
);

// GITHUB AUTH — Redirect to GitHub
router.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

// GITHUB AUTH CALLBACK
router.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/assignments');
  }
);

// LOGOUT
router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.session.destroy(() => {
      res.redirect('/');
    });
  });
});

module.exports = router;
