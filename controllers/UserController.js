const User = require('../models/user')
const userView = require('../views/UserView');
const loginView = require('../views/loginView');

function getUser(req, res){
    const user = new User(1,'Rocher');
   res.end(userView(user));

}


function showLogin(req, res){
    res.send(loginView());
}


function treatLogin(req, res){
    const {nom, password} = req.body;
    if (nom === "admin" && password === "password"){
        res.send ("Welcome !")
    }else {
        res.send ('Error')
    }
        

}
module.exports = {getUser, showLogin, treatLogin};