const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const {
  User, Date, UserInterest, Couple, Category, Spot,
} = require('../database/models/index.js');

const app = express();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(session({ secret: 'third-wheel' }));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then(user => done(null, user))
    .catch(err => done(err));
});

passport.use(new LocalStrategy((username, password, done) => {
  //  find user
  //    check for user and valid password
  //  return done with the user
  User.findOne({ username })
    .then((user) => {
      if (!user) {
        return done(null, false, { message: 'Incorrect username' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password' });
      }
      return done(null, user);
    })
    .catch((err) => {
      console.error(`Could not authorize user: ${err}`);
      done(err);
    });
}));

app.use(express.static(path.join(__dirname, '../client')));

const loggedIn = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.redirect('/login');
  }
};

app.get('/users/:id', (req, res) => {
  //  this is to retrieve a specific user profile
  const { id } = req.params;
  User.findByPk(id)
    .then((user) => {
      const {
        name, age, preference, gender, bio, url,
      } = user;
      const result = {
        name, age, preference, gender, bio, url,
      };
      res.status(200).send(result);
    })
    .catch((err) => {
      console.error(`Failed to fetch user information: ${err}`);
      res.status(400).send(err);
    });
});

app.get('/interests/:userId', (req, res) => {
  //  this is to find new spots around the user
});

app.get('/matches/:userId', (req, res) => {
  //  this is to retrieve all of the current matches
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/signup',
  failureFlash: true,
}));

app.post('/signup', async (req, res) => {
  //  create and authenticate new user here
  //  check if user already exists
  //    if exists, redirect to signup
  //  else create new user
  //  then utilize passport.login()
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      res.status(400).redirect('/signup');
    }
    const newUser = await User.create({ username, password });
    req.login(newUser, () => res.redirect('/'));
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);
