const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const router = express.Router();

function redirectIfLoggedIn(req, res, next) {
  if (req.session.user) {
    return res.redirect('/assignments');
  }
  next();
}

router.get('/register', redirectIfLoggedIn, (req, res) => {
  res.render('register', { title: 'Register' });
});

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.send('Email already registered.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });

    await user.save();
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.send('Error registering user');
  }
});

router.get('/login', redirectIfLoggedIn, (req, res) => {
  res.render('login', { title: 'Login' });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.send('Invalid credentials');
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.send('Invalid credentials');
    }

    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
    };

    res.redirect('/assignments');
  } catch (err) {
    console.error(err);
    res.send('Error logging in');
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
