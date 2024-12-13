const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const {treatLogin, treatRegister, showLogout } = require('./controllers/UserController');
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Parse URL-encoded data
app.use(bodyParser.urlencoded({ extended: true }));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Set the views directory
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the "public" directory
app.use(express.static('public'));

// Session initialize
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 90000 } // session timeout of 90 seconds
}));

// Listen on port 3000
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

// Root route
app.get('/', (req, res) => {
    const loggedIn = req.session.isLoggedIn || false;
    const role = req.session.role || 'ROLE_USER'; // Default role if not set
    res.render('index', { loggedIn: loggedIn, role: role });
});

// Login route
app.get('/login', (req, res) => {
    const loggedIn = req.session.isLoggedIn || false;
    res.render('loginView', { loggedIn: loggedIn });
});

// Register route
app.get('/register', (req, res) => {
    const loggedIn = req.session.isLoggedIn || false;
    res.render('registerView', { loggedIn: loggedIn });
});

// Handle login
app.post('/login', (req, res) => {
    treatLogin(req, res);
});

// Handle registration
app.post('/register', (req, res) => {
    treatRegister(req, res);
});

// Handle logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/login');
            console.log(' user has disconnected !')
        }
    });
});

// Logged in route
app.get('/logedIn', (req, res) => {
    showLogout(req, res);
});

// Handle login form submission
app.post('/logedIn', (req, res) => {
    const { username, password } = req.body;

    // Authenticate user
    if (username && password) {
        req.session.isLoggedIn = true;
        req.session.username = username;

        console.log(username, "has successfully connected!");
        res.redirect('/logedIn');
    } else {
        res.redirect('/dashboard');
    }
});
