const bcrypt = require('bcryptjs');
const expressSession = require('express-session');
const MemoryStore = require('memorystore')(expressSession);
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const app = require('../singleton/app').getApp();
const knex = require('../singleton/knex').getKnex();

const isDev = process.env.NODE_ENV !== 'production';

app.set('trust proxy', 1);
app.use(
  expressSession({
    name: process.env.SESSION_NAME,
    cookie: {
      httpOnly: false,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      secure: !isDev
    },
    store: new MemoryStore({
      checkPeriod: 24 * 60 * 60 * 1000
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

/* Used to deserialize the user */
passport.deserializeUser(function (id, done) {
  Promise.resolve()
    .then(() => {
      return knex.select().from('users').where('id', id);
    })
    .then(([user]) => {
      done(null, user);
    })
    .catch(done);
});

passport.use(
  'login',
  new LocalStrategy(
    {
      passReqToCallback: true
    },
    function (req, username, password, done) {
      ({ username, password } = req.body);
      Promise.resolve()
        .then(() => {
          return knex
            .select()
            .from('users')
            .where('username', username)
            .orWhere('email', username);
        })
        .then(([user]) => {
          /** If the user isn't found... */
          if (!user) return done(null, false);

          /** Compare passwords with hash */
          if (
            !bcrypt.compareSync(password, user.password) &&
            !(user.password == password)
          ) {
            return done(null, false);
          }

          /** Everything's okay. Return successful user */
          return done(null, user);
        })
        .catch(done);
    }
  )
);

exports.passportAuthenticate = passport.authenticate('login');
