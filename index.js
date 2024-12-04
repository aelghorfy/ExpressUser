const express = require('express');
const app = express();
const monUser = require('./controllers/UserController');

app.get('/user', (res, req) =>{
    monUser(res,req);
});

app.listen(3000, ()=>(
    console.log("server is running on http://localhost:3000")


))

