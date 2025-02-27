//http://localhost/phpmyadmin/index.php?route=/sql&db=trydb&table=users&pos=0

// IMPORTS
const express = require("express");
const mysql = require("mysql2/promise");
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');

//Initialize app using express
const app = express();

// Database connection pool
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tryDB'
});

console.log('Database pool created:', db);

// Set up view engine
app.set('view engine', 'hbs');

// Set up express-session middleware
app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: false 
    }
}));

// Define public directory
const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());

// Define routes for login and registration pages
app.get('/', (req, res) => res.render('login'));
app.get('/register', (req, res) => res.render('register'));

// Middleware to check if user is logged in (admin or teacher)
function isLoggedIn(req, res, next) {
    if (req.session.user) {
        return next();  
    }
    res.redirect('/login');  
}

// Apply middleware to routes that require a logged-in user
app.use('/admin-dashboard.html', isLoggedIn);
app.use('/main.html', isLoggedIn);  

// Example login route to set session data after successful login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Query to check if user exists
    const [users] = await db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);

    if (users.length > 0) {
        req.session.user = {
            id: users[0].id,
            username: users[0].username
        };
        return res.redirect('/main'); 
    } else {
        return res.status(401).render('login', { message: 'Invalid credentials' });
    }
});

// Define other routes
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));

// Attach username from session to request object for easy access in routes
app.use((req, res, next) => {
    if (req.session && req.session.user) {
        req.username = req.session.user.username;
    }
    next();
});

// Routes to serve static pages
app.get('/main.html', (req, res) => res.sendFile(path.join(__dirname, 'Pages', 'main.html')));
app.get('/class.html', (req, res) => res.sendFile(path.join(__dirname, 'Pages', 'class.html')));
app.get('/students.html', (req, res) => res.sendFile(path.join(__dirname, 'Pages', 'students.html')));
app.get('/tasks.html', (req, res) => res.sendFile(path.join(__dirname, 'Pages', 'tasks.html')));
app.get('/records.html', (req, res) => res.sendFile(path.join(__dirname, 'Pages', 'records.html')));
app.get('/pending.html', (req, res) => res.sendFile(path.join(__dirname, 'Pages', 'pending.html')));
app.get('/approved.html', (req, res) => res.sendFile(path.join(__dirname, 'Pages', 'approved.html')));
app.get('/disapproved.html', (req, res) => res.sendFile(path.join(__dirname, 'Pages', 'disapproved.html')));
//==================================================================================================================
app.get('/admin-dashboard.html', (req, res) => res.sendFile(path.join(__dirname, 'Pages', 'admin-dashboard.html')));
app.get('/admin-records.html', (req, res) => res.sendFile(path.join(__dirname, 'Pages', 'admin-records.html')));
app.get('/admin-faculty.html', (req, res) => res.sendFile(path.join(__dirname, 'Pages', 'admin-faculty.html')));
app.get('/admin-forApproval.html', (req, res) => res.sendFile(path.join(__dirname, 'Pages', 'admin-forApproval.html')));
app.get('/admin-approved.html', (req, res) => res.sendFile(path.join(__dirname, 'Pages', 'admin-approved.html')));
app.get('/admin-disapproved.html', (req, res) => res.sendFile(path.join(__dirname, 'Pages', 'admin-disapproved.html')));



// Route to check session data for debugging
app.get('/check-session', (req, res) => {
    res.json(req.session.user ? req.session.user : { message: 'No session found' });
});

// Start server on specified port --> runnn!
const PORT = 5000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
