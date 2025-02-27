const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const path = require('path');
const session = require('express-session');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tryDB'
});

exports.register = async (req, res) => {
    console.log("Received data:", req.body);
    const { fullName, employeeID, department, username, password, advisory } = req.body;

    //if (!fullName?.trim() || !employeeID?.trim() || !department?.trim() || !username?.trim() || !password?.trim() || !advisory?.trim()) {
    //    return res.status(400).json({ message: "All fields require an input." });
    //}

    db.query('SELECT username FROM users WHERE username = ?', [username], async (error, result) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Database query error' });
        }

        if (result.length > 0) {
            return res.status(400).json({ message: 'Username already exists.' });
        }
        console.log("Password to hash during registration:", password);
        let hashedPassword = await bcrypt.hash(password, 10);
        console.log("Hashed Password:", hashedPassword);

        db.query('INSERT INTO users SET ?', {
            fullName, employeeID, department, username, password: hashedPassword, advisory
        }, (error) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: 'Database insertion error' });
            } else {
                return res.status(201).json({ message: 'User registered successfully.' });
            }
        });
    });
};

/* ============================================== WOKING BUT NO LANDING PAGE FOR ADMIN ======================================================
// Login function
exports.login = (req, res) => {
    const { username, password } = req.body;

    db.query('SELECT * FROM users WHERE username = ?', [username], async (error, results) => {
        if (error) {
            console.error("Database query error:", error);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (results.length > 0) {
            const user = results[0];

            // Log for debugging
            console.log("Login attempt for username:", username);
            console.log("Stored hashed password:", user.password);
            console.log("Password to compare:", password);

            // Compare password with the stored hashed password
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                req.session.user = { id: user.id, username: user.username };
                console.log("Session user set:", req.session.user); // Debug line
                //return res.redirect('/main.html?username=' + encodeURIComponent(username));
                // Redirect to the main page (or another page)
                //return res.redirect(`/main.html?username=${encodeURIComponent(user.username)}`);
                return res.status(200).json({ message: 'Login successful', username: user.username });
            } else {
                return res.status(401).json({ message: 'Incorrect username or password' });
            }
        } else {
            return res.status(401).json({ message: 'Account does not exist' });
        }
    });
};
*/

//==================================================================== WORKING BOTH YAYYY ====================================================================

// Login function
exports.login = (req, res) => {
    const { username, password } = req.body;

    // Hardcoded admin credentials
    const adminUsername = 'admin';
    const adminPassword = 'admin123';

    // Check if the login is for admin
    if (username === adminUsername && password === adminPassword) {
        req.session.user = { username: adminUsername }; // Set admin session
        return res.status(200).json({ message: 'Admin login successful', username: adminUsername });
    }

    // For regular users, check the database
    db.query('SELECT * FROM users WHERE username = ?', [username], async (error, results) => {
        if (error) {
            console.error("Database query error:", error);
            return res.status(500).json({ message: 'Internal server error' });
        }

        if (results.length > 0) {
            const user = results[0];

            // Compare entered password with the hashed password from the database
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                req.session.user = { id: user.id, username: user.username }; // Set regular user session
                return res.status(200).json({ message: 'Login successful', username: user.username });
            } else {
                return res.status(401).json({ message: 'Incorrect username or password' });
            }
        } else {
            return res.status(401).json({ message: 'Account does not exist' });
        }
    });
};

//==============================================================================================================================================================
exports.forgetPassword = async (req, res) => {
    const { username, employeeID, newPass } = req.body;

    if (!employeeID || !newPass) {
        return res.status(400).json({ message: 'Employee ID and new password are required.' });
    }

    try {
        // Use parameterized query to prevent SQL injection
        const query = 'SELECT * FROM users WHERE employeeID = ? AND username = ?';
        db.query(query, [employeeID, username], async (err, user) => {
            if (err) {
                console.error('Error querying database:', err);
                return res.status(500).json({ message: 'Internal server error.' });
            }

            if (user.length === 0) {
                return res.status(404).json({ message: 'Employee ID and User not found.' });
            }

            // Hash the new password
            const hashedPassword = await bcrypt.hash(newPass, 10);

            // Update the password using parameterized query
            const updateQuery = 'UPDATE users SET password = ? WHERE employeeID = ? AND username = ?';
            db.query(updateQuery, [hashedPassword, employeeID, username], (updateErr, result) => {
                if (updateErr) {
                    console.error('Error updating password:', updateErr);
                    return res.status(500).json({ message: 'Failed to update the password. Please try again.' });
                }

                if (result.affectedRows > 0) {
                    return res.status(200).json({ message: 'Password has been reset successfully.' });
                } else {
                    return res.status(500).json({ message: 'Failed to update the password. Please try again.' });
                }
            });
        });
    } catch (error) {
        console.error('Error updating password:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};


//==============================================================================================================================================

//logout function
exports.logout = (req, res) => {
    // using express-session
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error logging out');
        }
        // Redirect to login page after logout
        //res.redirect('/login');
        return res.status(200).send("Logged out successfully");
    });
};



