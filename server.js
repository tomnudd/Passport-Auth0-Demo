const express = require("express");
const app = express();

const session = require("express-session")
const passport = require("passport");

const PORT = "8090";

// Don't commit these details to GitHub!
// Can use the package "dotenv" to store them as environment variables
const Auth0Strategy = require("passport-auth0");
const AUTH_DOMAIN = "";
const AUTH_ID = "";
const AUTH_SECRET = "";

const authStrat = new Auth0Strategy({
    domain: AUTH_DOMAIN,
    clientID: AUTH_ID,
    clientSecret: AUTH_SECRET,
    callbackURL: "http://127.0.0.1:" + PORT + "/login/callback" // this will change if you use a different port or deploy your app
}, async function(accessToken, refreshToken, extraParams, profile, done) {
    // This is where you'd check if a user is in your database
    // Can access user IDs through profile.id
    // This just uses session memory for now
    return done(null, profile);
});

passport.use(authStrat)

passport.serializeUser((user, callback) => {
    callback(null, user);
});

passport.deserializeUser((obj, callback) => {
    callback(null, obj);
});

app.use(session({ secret: "supersecretIDgoeshere", saveUninitialized: false, resave: false }))

// initialise passport session
app.use(passport.initialize());
app.use(passport.session());

// Signin routes
app.get("/login",
    passport.authenticate("auth0", { scope: "openid email profile" })
);

app.get("/login/callback",
    passport.authenticate("auth0", { failureRedirect: "/" }),
    function(req, res) {
        // Successful authentication, redirect home
        res.redirect("/");
    });

// Here you can define API routes
// e.g. one checking if req.user exists to see if a user is logged in
// (then potentially also checking if their token is still valid)

// If a page doesn't have a route attached to it, we can just serve pages from a "static" folder, defaulting to /
// Specific API routes must be defined before these lines, or else they will be overridden

app.use(express.static("static"))

app.all("*", function(req, res) {
    res.status(200).sendFile("/", { root: "static" });
});

app.listen(PORT);