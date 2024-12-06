const express = require('express');
const app = express();
const { showLogin, treatLogin, treatRegister, showRegister } = require('./controllers/UserController');
const bodyParser = require('body-parser');
 
// Middleware to parse JSON
app.use(express.json());
 
// Parse URL-encoded data
app.use(bodyParser.urlencoded({ extended: true }));
 
// Listen on port 3000 -> home
app.listen(3000, (res, req) => { console.log('Hello') });
 
// Send the login form display via GET method
app.get('/login', (res, req) => { showLogin(res, req); });
 
// Send the registration form display via GET method
app.get('/register', (res, req) => { showRegister(res, req); });
 
// Send the processing of registration form data
app.post('/register', (res, req) => { treatRegister(res, req); });
 
app.post('/login', (res, req) => { treatLogin(res, req); });
