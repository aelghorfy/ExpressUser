const express = require('express');
const app = express();
const getUser = require('./controllers/UserController');

app.get('/user', (res, req) =>{
    getUser(res,req);
});

app.listen(3000, ()=>(
    console.log("server is running on http://localhost:3000")


))

