const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const {treatLogin, treatRegister, showLogout, treatLogout } = require('./controllers/UserController');
const app = express();
const { v4: uuidv4 } = require('uuid');

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
    genid: (req) => { return uuidv4(); },
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true } // Set secure to false for local development
}));

// Middleware to prevent caching
app.use((req, res, next) => { 
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

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
// Profil route
app.get('/profil', (req, res) => {
    const loggedIn = req.session.isLoggedIn || false;
    const role = req.session.role || 'ROLE_USER';
    res.render('profilView', { loggedIn: loggedIn, role: role});
});

// Forum route
app.get('/forum', (req, res) => {
    const loggedIn = req.session.isLoggedIn || false;
    const role = req.session.role || 'ROLE_USER';
    res.render('forumView', { loggedIn: loggedIn, role: role});
});

// Market route
app.get('/marketplace', (req, res) => {
    const loggedIn = req.session.isLoggedIn || false;
    const role = req.session.role || 'ROLE_USER';
    res.render('marketView', { loggedIn: loggedIn, role: role});
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
    treatLogout(req, res);
});

app.use((req, res, next) => { 
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
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
