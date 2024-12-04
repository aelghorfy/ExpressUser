const User = require('../models/user')
const PasTropLongLeNomCaVaEtreLongEtChiant = require('../views/UserView');

function getUser(req, res){
    const user = new User(1,'Rocher');
   res.end(PasTropLongLeNomCaVaEtreLongEtChiant(user));

}

module.exports = getUser;