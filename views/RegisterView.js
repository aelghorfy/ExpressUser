function registerView() {
    return `<html>
                <body>
                    <form method='POST' action='/register'>
                        <input type='text' name='username' placeholder='name' required/>
                            <input type='password' name='password' placeholder='password' required/>
                            <select name='secret' id='secret' required>
                             <option value="blank"> </option>
                            <option value="maidenMother">What is your mother's maiden name?</option>
                            <option value="streetName">What is the name of the street you grew up on?</option>
                            <option value="firstPet">What was the name of your first pet?</option>
                            <option value="favBook">What is your favorite book?</option>
                            <option value="favTeacher">What is the name of your favorite teacher?</option>
                            
                            </select>
                            <input type='text' name='secretquestion' placeholder="Secret answer"/>
                        <button type='submit'>Register</button>
                    </form>
                </body>
            </html>`
}
 
module.exports = registerView;