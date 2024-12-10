function LogoutView(){
  return  `<html>
            <body>
                <form method='POST' action='/logout'>
                 <button type='submit'>Logout</button>
                </form>
                <a href="/login">Login again</a>
            </body>
        </html>
        `
}

module.exports=LogoutView;