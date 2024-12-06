function registerView() {
    return `<html>
                <body>
                    <form method='POST' action='/register'>
                        <input type='text' name='username' placeholder='name' />
                        <input type='password' name='password' placeholder='password'/>
                        <button type='submit'>Register</button>
                    </form>
                </body>
            </html>`
}
 
module.exports = registerView;