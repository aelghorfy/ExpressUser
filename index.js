const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const {treatLogin, treatRegister, showLogout, treatLogout } = require('./controllers/UserController');
const app = express();
const { v4: uuidv4 } = require('uuid');
const multer  = require('multer');
const db = require('./db/db');


//Let multer know where to upload the images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/image')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const upload = multer ({storage: storage})

app.use(express.static(__dirname + '/public'));


app.post('/views/MarketView.ejs', upload.single('image'), function (req, res, next) {//try to find the right view
    console.log(JSON.stringify(req.file))
    const response = '<a href="/">Home</a><br>'
    response += "Files uploaded successfully.<br>"
    response += `<img src="${req.file.path}" /><br>`
    return res.send(response)
  })



// Middleware to parse JSON
app.use(express.json());

// Parse URL-encoded data
app.use(bodyParser.urlencoded({ extended: true }));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Set the views directory
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the "public" directory
app.use(express.static('public'));

// Session initialize
app.use(session({
    genid: (req) => { return uuidv4(); },
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true } // Set secure to false for local development
}));

// Middleware to prevent caching
app.use((req, res, next) => { 
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

// Listen on port 3000
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

// Root route
app.get('/', (req, res) => {
    const loggedIn = req.session.isLoggedIn || false;
    const role = req.session.role || 'ROLE_USER'; // Default role if not set
    res.render('index', { loggedIn: loggedIn, role: role });
});

// Login route
app.get('/login', (req, res) => {
    const loggedIn = req.session.isLoggedIn || false;
    res.render('loginView', { loggedIn: loggedIn });
});
// Profil route
app.get('/profil', (req, res) => {
    const loggedIn = req.session.isLoggedIn || false;
    const role = req.session.role || 'ROLE_USER';
    res.render('profilView', { loggedIn: loggedIn, role: role});
});

// Forum route
app.get('/forum', (req, res) => {
    const loggedIn = req.session.isLoggedIn || false;
    const role = req.session.role || 'ROLE_USER';
    res.render('forumView', { loggedIn: loggedIn, role: role});
});

// Market route
app.get('/marketplace', (req, res) => {
    const query = 'SELECT * FROM posts WHERE status = "APPROVED"';
    const loggedIn = req.session.isLoggedIn || false;
    const role = req.session.role || 'ROLE_USER';
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching posts:', err.message);
            res.status(500).send('Internal Server Error');
        } else {
            res.render('marketView', { loggedIn: loggedIn, role: role, posts: rows });
        }
    });
});

app.post('/marketplace', upload.single('image'), (req, res) => {
    const userId = req.session.isLoggedIn || false;
    const { title, content, price } = req.body;
    const imagePath = req.file ? `/public/image/${req.file.filename}` : null;

    if (!userId) {
        return res.status(401).send('Unauthorized: Please log in first.');
    }

    const query = `
        INSERT INTO posts (title, content, price, imagePath, status, userId)
        VALUES (?, ?, ?, ?, 'PENDING', ?)
    `;
    db.run(query, [title, content, price, imagePath, userId], function (err) {
        if (err) {
            console.error('Error inserting post:', err.message);
            res.status(500).send('Internal Server Error');
        } else {
            console.log('Post created with ID:', this.lastID);
            res.redirect('/marketplace');
        }
    });
});

// Register route
app.get('/register', (req, res) => {
    const loggedIn = req.session.isLoggedIn || false;
    res.render('registerView', { loggedIn: loggedIn });
});

// Handle login
app.post('/login', (req, res) => {
    treatLogin(req, res);
});

// Handle registration
app.post('/register', (req, res) => {
    treatRegister(req, res);
});

// Handle logout
app.get('/logout', (req, res) => {
    treatLogout(req, res);
});

app.use((req, res, next) => { 
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});


// Logged in route
app.get('/logedIn', (req, res) => {
    showLogout(req, res);
});

// Handle login form submission
app.post('/logedIn', (req, res) => {
    const { username, password } = req.body;

    // Authenticate user
    if (username && password) {
        req.session.isLoggedIn = true;
        req.session.username = username;

        console.log(username, "has successfully connected!");
        res.redirect('/logedIn');
    } else {
        res.redirect('/dashboard');
    }
});

app.get('/adminpost', (req, res) => {
    if (req.session.role !== 'ROLE_ADMIN') {
        return res.status(403).send('Forbidden: Admins only.');
    }

    const query = 'SELECT * FROM posts WHERE status = "PENDING"';
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching posts:', err.message);
            res.status(500).send('Internal Server Error');
        } else {
            res.render('adminPostView', { posts: rows });
        }
    });
});


app.post('/admin/posts/:id', (req, res) => {
    const postId = req.params.id;
    const action = req.query.action; 

    if (action === 'approve') {
        const query = 'UPDATE posts SET status = "APPROVED" WHERE id = ?';
        db.run(query, [postId], (err) => {
            if (err) {
                console.error('Error approving post:', err.message);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(`Post ${postId} approved.`);
                res.redirect('/marketplace');
            }
        });
    } else if (action === 'delete') {
        const query = 'DELETE FROM posts WHERE id = ?';
        db.run(query, [postId], (err) => {
            if (err) {
                console.error('Error deleting post:', err.message);
                res.status(500).send('Internal Server Error');
            } else {
                console.log(`Post ${postId} deleted.`);
                res.redirect('/admin/posts');
            }
        });
    } else {
        res.status(400).send('Invalid action');
    }
});

