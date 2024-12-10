function loginView() {
    return `<html>
                <body>
                    <form method='POST' action='/logedIn'>
                        <input type='text' placeholder='name' name='username'/>
                        <input type='password' placeholder='password' name='password'/>
                        <button type='submit'>Log In</button>
                    </form>
                </body>
            </html>`
}
 
module.exports = loginView;
