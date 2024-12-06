const User = require('../models/User')
const userView = require('../views/UserView');
const loginView = require('../views/loginView');
const registerView = require('../views/RegisterView');
/* const deleteView = require('../views/DeleteView'); */
const db = require('../db/db');
const bcrypt = require('bcrypt')


function getUser(req, res){
    const user = new User(1,'Rocher');
   res.end(userView(user));

}

function showRegister(req, res){
    res.send(registerView());

}

function showLogin(req, res){
    res.send(loginView());
}

/* function showDelete(req, res){
    res.send(deleteView());
} */

function treatRegister(req, res){
    const saltRounds = 10;
    const {username, password, secretquestion} = req.body;
    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {

        const newUser = new User (username,hashedPassword, secretquestion);
    const query = 'INSERT INTO users (username, password, secretquestion) VALUES (?,?,?)';
    db.run(query,[newUser.username,newUser.password,newUser.secretquestion],
        function (err){
            if(err){
            console.error('register failed: ',err.message)
            res.send('ERROR');
        } else{
            console.log("user access:", newUser)
            res.send("SUCCESS")
        }
    })
        
    });
    
}

/* function treatDelete(req, res){
   const {password, secretquestion} = req.body;




} */



function treatLogin(req, res) {
    const {username, password} = req.body;
    const newUser= new User(username, password);
    const query = 'SELECT * FROM users WHERE username = ?'
    db.get(query, [newUser.username], function(err, row){
        if(err){
            console.error('connexion as failed', err.message);
            res.send('error');
        } else {
            if(newUser.password === row.password){
                console.log(newUser, 'logged in !');
                res.send('Welcome ! ');
            }
                else {
                    console.log('wrong password');
                    res.send('Wrong password !');
                }
        }
    });
}
module.exports = {getUser, showLogin, treatLogin, showRegister, treatRegister};