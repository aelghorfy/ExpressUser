const User = require('../models/User');
const db = require('../db/db');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Function to get user details and render the user view
function getUser(req, res) {
    const user = new User(1, 'Rocher');
    res.render('userView', { user: user });
}

// Function to show the registration form
function showRegister(req, res) {
    res.render('register');
}

// Function to show the login form
function showLogin(req, res) {
    res.render('loginView');
}

// Function to show the logout view
function showLogout(req, res) {
    res.send('SUCCESSFULLY LOGGED OUT');
}

// Function to handle user registration
function treatRegister(req, res) {
    const { username, password } = req.body;
    const query = 'SELECT * FROM users WHERE username = ?';
    
    db.get(query, [username], (err, row) => {
        if (err) {
            console.error('Error checking username:', err.message);
            res.send('ERROR');
        } else if (row) {
            // Username already exists
            res.send('Username already taken. Please choose a different username.');
        } else {
            // Username is available, proceed with registration
            bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
                if (err) {
                    console.error('Hashing error:', err.message);
                    res.send('ERROR');
                } else {
                    const newUser = new User(username, hashedPassword, 'ROLE_USER'); // Default ROLE_USER
                    const insertQuery = 'INSERT INTO users (username, password, role) VALUES (?,?,?)';
                    db.run(insertQuery, [newUser.username, newUser.password, newUser.role], function (err) {
                        if (err) {
                            console.error('Register failed:', err.message);
                            res.send('ERROR');
                        } else {
                            console.log("User registered:", newUser);
                            res.send("SUCCESS");
                        }
                    });
                }
            });
        }
    });
}

// Function to handle user login
function treatLogin(req, res) {
    const { username, password } = req.body;
    const newUser = new User(username, password);
    const query = 'SELECT * FROM users WHERE username = ?';
    db.get(query, [newUser.username], function (err, row) {
        if (err) {
            console.error('Connection failed', err.message);
            res.send('ERROR');
        }
        if (row) {
            bcrypt.compare(password, row.password, (err, result) => {
                if (err) {
                    console.log("Password does NOT match!");
                    res.send('Failed to compare');
                } else if (result) {
                    console.log(newUser.username, 'Connected!');
                    req.session.isLoggedIn = true;
                    req.session.username = username;
                    req.session.role = row.role;
                    res.render('userView', { user: row, loggedIn: true, role: row.role });
                } else {
                    console.log('Wrong password!');
                    res.send('Password does NOT match!');
                }
            });
        } else {
            console.log('User not found!');
            res.send('User not found!');
        }
    });
}

function treatLogout(req, res) {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('Error logging out');
        } else {
            res.redirect('/login');
            console.log()
        }
    });
}



module.exports = { getUser, showLogin, treatLogin, showRegister, treatRegister, showLogout, treatLogout };
