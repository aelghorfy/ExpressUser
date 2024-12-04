const user = require("../models/user")
const PasTropLongCaVaEtreLongEtChiant = require("../views/PasTropLongCaVaEtreLongEtChiant");

function getUser(req, res){
    const user = new User(1,"Rocher");
    res.end(PasTropLongCaVaEtreLongEtChiant(user));

}

module.exports = getUser();