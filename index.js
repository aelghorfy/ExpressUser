const express = require('express');
const app = express();
const {getUser, showLogin, treatLogin} = require('./controllers/UserController');
const bodyParser = require('body-parser');



app.get('/user', (res, req) =>{
    getUser(res,req);
});

app.get("/login", showLogin)

app.use(bodyParser.urlencoded({extended:true}))

app.post("/login", treatLogin)

app.listen(3000, ()=>(
    console.log("server is running on http://localhost:3000")


))




