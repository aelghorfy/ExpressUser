const sqlite = require('sqlite3').verbose();
const db = new sqlite.Database('./database.sqlite', (err)=>{
    if(err){
        console.error('login error : ',err.message)

    }else {
        db.run('CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL, password TEXT NOT NULL,role TEXT NOT NULL)');
        console.log('logged to the db')
    }
});

module.exports = db;
    
