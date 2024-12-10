const User = require('../models/User')
const userView = require('../views/UserView');
const loginView = require('../views/loginView');
const registerView = require('../views/RegisterView');
const LogoutView = require('../views/LogoutView');
/* const deleteView = require('../views/DeleteView'); */
const db = require('../db/db');
const bcrypt = require('bcrypt')
const saltRounds = 10;


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

function showLogout (req, res) {

    res.send(LogoutView());

}

/* function showDelete(req, res){
    res.send(deleteView());
} */ 
    function treatRegister(req, res) {
        const { username, password, secretquestion } = req.body;
        bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
            if (err) {
                console.error('Hashing error:', err.message);
                res.send('ERROR');
            } else {
                bcrypt.hash(secretquestion, saltRounds, (err, hashedSecretQuestion) => {
                    if (err) {
                        console.error('Hashing error:', err.message);
                        res.send('ERROR');
                    } else {
                        const newUser = new User(username, hashedPassword, hashedSecretQuestion);
                        const query = 'INSERT INTO users (username, password, secretquestion) VALUES (?,?,?)';
                        db.run(query, [newUser.username, newUser.password, newUser.secretquestion], function (err) {
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
    

/* function treatDelete(req, res){
   const {password, secretquestion} = req.body;




} */



   function treatLogin(req, res) {
    const {username, password} = req.body;
    const newUser= new User(username, password);
    const query = 'SELECT * FROM users WHERE username = ?'
    db.get(query, [newUser.username], function(err, row){
        if(err){
            console.error('echec connexion', err.message);
            res.send('error');
        }
        if(row){
            bcrypt.compare(password, row.password, (err, result) => {
                if(err){
                    console.log("mdp non correspondant");
                    res.send('echec comparaison');
                } else if(result){
                    console.log(newUser, 'Connecté');
                    res.send('Welcome ! ');
                }else {
                    console.log('mauvais mdp');
                    res.send('mot de passe éronné');
                }
            } );
        }
    });
}

module.exports = {getUser, showLogin, treatLogin, showRegister, treatRegister, showLogout};