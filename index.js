const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const {treatLogin, treatRegister, treatLogout } = require('./controllers/UserController');
const app = express();
const { v4: uuidv4 } = require('uuid');
const multer  = require('multer');
const db = require('./db/db');
const fs = require('fs');



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
    const { search, minPrice, maxPrice } = req.query;
    const loggedIn = req.session.isLoggedIn || false;
    const role = req.session.role || 'ROLE_USER';
    const userId = req.session.userId || null; // Get the logged-in user's ID

    let query = 'SELECT posts.*, users.username FROM posts JOIN users ON users.id = posts.userId WHERE status = "APPROVED"';
    const params = [];

    if (search) {
        query += ' AND (posts.title LIKE ? OR posts.content LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }

    if (minPrice) {
        query += ' AND posts.price >= ?';
        params.push(minPrice);
    }

    if (maxPrice) {
        query += ' AND posts.price <= ?';
        params.push(maxPrice);
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Error fetching posts:', err.message);
            res.status(500).send('Internal Server Error');
        } else {
            res.render('marketView', { loggedIn: loggedIn, role: role, userId: userId, posts: rows });
        }
    });
});


// Display in marketplace post with approved status
app.post('/marketplace', upload.single('image'), (req, res) => {
    const userId = req.session.userId; 
    const { title, content, price } = req.body;
    const imagePath = req.file ? `/public/image/${req.file.filename}` : null;

    if (!userId) {
        return res.status(401).send('Unauthorized: Please log in first.');
    }

    const query = `
        INSERT INTO posts (title, content, price, imagePath, status, userId)
        VALUES (?, ?, ?, ?, 'PENDING', ?);
    `;
    db.run(query, [title, content, price, imagePath, userId], function (err) {
        if (err) {
            console.error('Error inserting post:', err.message);
            res.status(500).send('Internal Server Error');
        } else {
            console.log('Post created by userID:', userId);
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
    const loggedIn = req.session.isLoggedIn || false;
    const role = req.session.role || 'ROLE_USER';
    
    if (req.session.role !== 'ROLE_ADMIN') {
        return res.status(403).send('Forbidden: Admins only.');
    }

    const query = 'SELECT * FROM posts WHERE status = "PENDING"';
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Error fetching posts:', err.message);
            res.status(500).send('Internal Server Error');
        } else {
            res.render('adminPostView', {loggedIn: loggedIn, role: role, posts: rows});
        }
    });
});



app.post('/admin/posts/:id', (req, res) => {
    const postId = req.params.id;
    const action = req.query.action;
    const userId = req.session.userId; // Get the logged-in user's ID
    const userRole = req.session.role; // Get the logged-in user's role

    if (!userId) {
        return res.status(401).send('Unauthorized: Please log in first.');
    }

    // First, check if the post belongs to the logged-in user or if the user is an admin
    const checkPostQuery = 'SELECT * FROM posts WHERE id = ?';
    db.get(checkPostQuery, [postId], (err, post) => {
        if (err) {
            console.error('Error fetching post:', err.message);
            return res.status(500).send('Internal Server Error');
        }

        if (!post) {
            return res.status(404).send('Post not found');
        }

        if (post.userId !== userId && userRole !== 'ROLE_ADMIN') {
            return res.status(403).send('Forbidden: You do not have permission to modify or delete this post.');
        }

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
            //Get the image path from the post
            const getImageQuery = 'SELECT imagePath FROM posts WHERE id = ?';
            db.get(getImageQuery, [postId], (err, row) => {
                if (err) {
                    console.error('Error fetching image path:', err.message);
                    res.status(500).send('Internal Server Error');
                } else if (row && row.imagePath) {
                    // Delete the image file
                    fs.unlink(`./public${row.imagePath}`, (err) => {
                        if (err) {
                            console.error('Error deleting image file:', err.message);
                        } else {
                            console.log(`Image file ${row.imagePath} deleted.`);
                        }
                    });
                }

                // Delete the post from the database
                const deleteQuery = 'DELETE FROM posts WHERE id = ?';
                db.run(deleteQuery, [postId], (err) => {
                    if (err) {
                        console.error('Error deleting post:', err.message);
                        res.status(500).send('Internal Server Error');
                    } else {
                        console.log(`Post ${postId} deleted.`);
                        res.redirect('/marketplace');
                    }
                });
            });
        } else {
            res.status(400).send('Invalid action');
        }
    });
});
