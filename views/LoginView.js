function loginView(){
    return `<html>
    <body>
    <main>
    <form method= 'post' action='/login'>
    <input type ='text' name= 'user' placeholder='UserName' >
    <input type ='password' name= 'password' placeholder='Password' >
    <input type = 'submit' value='Log In'>
    
    </form>
    </main>
    </body>
    </html>`;
}


module.exports = loginView;

