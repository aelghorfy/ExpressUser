const express = require('express');
const session = require('express-session')
const app = express();
const { showLogin, treatLogin, treatRegister, showRegister,showLogout } = require('./controllers/UserController');
const bodyParser = require('body-parser');
 
// Middleware to parse JSON
app.use(express.json());
 
// Parse URL-encoded data
app.use(bodyParser.urlencoded({ extended: true }));
 
// Listen on port 3000 -> home
app.listen(3000, (res, req) => { console.log('Hello') });

//Session initialize
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 90000 } // session timeout of 60 seconds
  }));

  app.get('/', (req, res) => {
    const sessionData = req.session;
  
    // Access session data
  });

  app.post('/logedIn', (req, res) => {
    const { username, password } = req.body;
  
    // Authenticate user
    if ((username, password)) {
      req.session.isLoggedIn = true;
      req.session.username = username;
  
      console.log(username, " as successfully connected in!")
            res.redirect('/logedIn')
    } else {
      res.redirect('/dashboard');
    }
  });


//Logout session
 app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/logout');
        }
    });
});


 
// Send the login form display via GET method
app.get('/login', (req, res) => { showLogin(req, res); });
 
// Send the registration form display via GET method
app.get('/register', (req, res) => { showRegister(req, res); });

// Send the logout button display via GET method
app.get('/logedIn', (req, res) => { showLogout(req, res); });
 
// Send the processing of registration form data
app.post('/register', (req, res) => { treatRegister(req, res); });
 
app.post('/login', (req, res) => { treatLogin(req, res); });
