// IMPORTS
const path = require('path');
const express = require('express');
const mysql = require('mysql2/promise');
const session = require('express-session');
const fs = require('fs');
const xlsx = require('xlsx');

// DB POOL
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tryDB'
});


//===================================================== CREATE CLASS ============================================================
exports.createclass = async (req, res) => {
    console.log("Session user:", req.session.user);

    if (!req.session.user) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    const { subjectCode, subjectTitle, section, year, term, semester } = req.body;
    const userId = req.session.user.id;

    try {
        // Retrieve username from user ID
        const [userResult] = await db.query('SELECT username FROM users WHERE id = ?', [userId]);
        if (userResult.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const username = userResult[0].username;

        // Parse student data from uploaded file
        if (!req.file) {
            return res.status(400).json({ message: 'Student data file is required' });
        }

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const studentData = xlsx.utils.sheet_to_json(worksheet, {
            header: ["A", "B"], // Explicit headers
            raw: false,             
            defval: ""              
        });

        // Remove the uploaded file after processing
        fs.unlinkSync(req.file.path);

        // Insert the class and student data into the database
        const classData = {
            subjectCode,
            subjectTitle,
            section,
            year,
            term,
            semester
        };

        console.log("Class data before insert:", classData);

        const [classInsertResult] = await db.query(
            'INSERT INTO classes (user, class, students) VALUES (?, ?, ?)',
            [username, JSON.stringify(classData), JSON.stringify(studentData)]
        );

        const classId = classInsertResult.insertId; // retrieve the new class ID
        //console.log("New class ID:", classId);

        const remarksData = studentData
            .filter(student => student.B && student.A) // ensure both fields exist
            .map(student => [
                student.B.toString(), // LRN (converted to string)
                student.A, // student name
                classId
            ]);
            
        console.log("Inserting into remarks:", remarksData);

        if (remarksData.length > 0) {
            await db.query('INSERT INTO remarks (lrn, student, classId) VALUES ?', [remarksData]);
        }

        res.json({ message: 'Class and student data created successfully!' });

        console.log("Student data: ", studentData);
        console.log("Class data: ", classData);

    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ message: 'Error creating class and student data' });
    }
};


// ============================================= FETCH CLASS DATA ===================================================
exports.getClasses = async (req, res) => {
    try {
        console.log("Session data:", req.session.user); 

        // Check if session exists
        if (!req.session.user) {
            return res.status(401).render('login', {
                message: 'User not authenticated'
            });
        }

        const username = req.session.user.username;
        //const { classId } = req.params;

        const [classes] = await db.query('SELECT * FROM classes WHERE user = ?', [username]);
        res.json(classes);
        console.log(classes); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching classes' });
    }
};

// ============================================= FETCH CLASS DATA BY ID ===================================================
exports.getClassById = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const username = req.session.user.username;
        const { classId } = req.params;

        // Query to fetch the class data by ID and user
        const [classData] = await db.query('SELECT class FROM classes WHERE id = ? AND user = ?', [classId, username]);

        if (classData.length === 0) {
            return res.status(404).json({ message: 'Class not found' });
        }
        
        // Parse the JSON data if class is stored as a JSON string
        const classDetails = JSON.parse(classData[0].class);

        console.log('classDetails:', classDetails);
        res.json(classDetails); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching class' });
    }
};

// ============================================= FETCH STUDENT BY ID ===================================================
exports.getStudentById = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const username = req.session.user.username;
        const { classId } = req.params;

        // Query to fetch the class data by ID and user
        const [classData] = await db.query('SELECT students FROM classes WHERE id = ? AND user = ?', [classId, username]);

        if (classData.length === 0) {
            return res.status(404).json({ message: 'Class not found' });
        }
        
        // Parse the JSON data if class is stored as a JSON string
        const studentData = JSON.parse(classData[0].students);
        
        console.log('Student Data:', studentData); 
        res.json({studentData}); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching class' });
    }
};


// ============================================= CLASS DELETION  ===================================================
exports.deleteClass = async (req, res) => {
    const { classId } = req.params; 
    const { user } = req.session; 

    console.log("Session user:", req.session.user);

    if (!user) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    try {
        console.log(`Attempting to delete class with ID: ${classId} for user: ${user.username}`);

        // Execute the delete query to remove the class from the database
        const result = await db.query('DELETE FROM classes WHERE id = ? AND user = ?', [classId, user.username]);

        if (result.affectedRows > 0) {
            return res.json({ message: 'Class deleted successfully' });
        } else {
            // if no class was found or user does not own the class
            return res.status(404).json({ message: 'Class not found or you do not have permission to delete this class' });
        }
    } catch (error) {
        console.error('Error deleting class:', error);
        res.status(500).json({ message: 'Error deleting class' });
    }
};

// ============================================= OPEN SPECIFIC CLASS ===================================================
exports.openclass = async (req, res) => {
    try {
        const { classId } = req.params;
        const username = req.session.user.username;

        const [results] = await db.query('SELECT * FROM classes WHERE id = ? AND user = ?', [classId, username]);
        
        if (results.length === 0) {
            return res.status(404).json({ message: 'Class not found or you do not have access.' });
        }
        // Redirect to the specified page with encoded classId and username
        return res.redirect(`/class.html?classId=${encodeURIComponent(classId)}&username=${encodeURIComponent(username)}`);
    } catch (error) {
        console.error('Error in openclass:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// ========================================== ADD SPECIFIC TASK IN A CLASS  ===========================================
exports.addTask = async (req, res) => {
    try {
        const { component, taskName, maxScore, date } = req.body;
        const { classId } = req.params;

        console.log("Received data:", req.body);

        const numericClassId = parseInt(classId, 10);
        if (isNaN(numericClassId)) {
            console.error('Invalid classId format:', classId);
            return res.status(400).send('Invalid classId format');
        }

        const [rows] = await db.query('SELECT tasks FROM classes WHERE id = ?', [numericClassId]);
        if (!rows.length) {
            console.error('Class not found');
            return res.status(404).send('Class not found');
        }

        let tasks;
        try {
            tasks = rows[0].tasks ? JSON.parse(rows[0].tasks) : { writtenWork: [], performanceTask: [], exam: [] };
        } catch (parseError) {
            console.error('Error parsing tasks JSON:', parseError);
            tasks = { writtenWork: [], performanceTask: [], exam: [] };
        }

        // generate a unique taskId
        const taskId = Date.now();

        // add the new task to the appropriate component
        if (!tasks[component]) tasks[component] = [];
        const newTask = { taskId, taskName, maxScore: parseInt(maxScore, 10), date };
        tasks[component].push(newTask);

        // update tasks in the `classes` table
        await db.query('UPDATE classes SET tasks = ? WHERE id = ?', [JSON.stringify(tasks), numericClassId]);

        console.log('Updated tasks:', tasks);

        // fetch existing taskandscore for the class from the `remarks` table
        const [remarksRows] = await db.query('SELECT taskandscore FROM remarks WHERE classId = ?', [numericClassId]);

        let taskAndScore;
        if (remarksRows.length) {
            try {
                taskAndScore = remarksRows[0].taskandscore ? JSON.parse(remarksRows[0].taskandscore) : { writtenWork: [], performanceTask: [], exam: [] };
            } catch (parseError) {
                console.error('Error parsing taskandscore JSON:', parseError);
                taskAndScore = { writtenWork: [], performanceTask: [], exam: []};
            }
        } else {
            // initialize the taskAndScore structure if no existing record found
            taskAndScore = { writtenWork: [], performanceTask: [], exam: [] };
        }

        // add the new task to the taskandscore object
        if (!taskAndScore[component]) taskAndScore[component] = [];
        taskAndScore[component].push({ ...newTask, score: 0 }); 

        // update the taskandscore column in the `remarks` table
        await db.query('UPDATE remarks SET taskandscore = ? WHERE classId = ?', [JSON.stringify(taskAndScore), numericClassId]);

        console.log('Updated taskandscore in remarks:', taskAndScore);

        res.send({ message: 'Task added successfully' });
    } catch (err) {
        console.error('Error in addTask function:', err);
        res.status(500).send('An error occurred');
    }
};

// ============================================= FETCH TASK DATA  ===================================================
exports.getTasks = async (req, res) => {
    try {
        const { classId } = req.params;
        const numericClassId = parseInt(classId, 10);

        if (isNaN(numericClassId)) {
            return res.status(400).send('Invalid classId format');
        }

        const [rows] = await db.query('SELECT tasks FROM classes WHERE id = ?', [numericClassId]);

        if (!rows.length) {
            return res.status(404).send('Class not found');
        }

        //const tasks = JSON.parse(rows[0].tasks);
        //const tasks = rows[0].tasks;
        const tasks = rows[0].tasks ? JSON.parse(rows[0].tasks) : { writtenWork: [], performanceTask: [], exam: [] };

        res.json(tasks);
    } catch (err) {
        console.error('Error in getTasks function:', err);
        res.status(500).send('An error occurred');
    }
};

// ============================================= OPEN SPECIFIC TASK (SCORING) ===================================================
exports.openTask = async (req, res) => {
    try {
        console.log("Session data:", req.session.user); 

        if (!req.session.user) {
            return res.status(401).render('login', {
                message: 'User not authenticated'
            });
        }

        const username = req.session.user.username;
        const { classId, taskId } = req.query;

        // validate parameters
        if (!classId || !taskId) {
            return res.status(400).send('Class ID and Task ID are required');
        }

        // execute the query to retrieve the specific task using classId and taskId
        const [results] = await db.query('SELECT tasks FROM classes WHERE classId = ?', [classId]);

        // check if the class exists in the DB
        if (results.length === 0) {
            return res.status(404).send('Class not found');
        }

        console.log("Tasks data found in DB:", results);

        const tasksData = JSON.parse(results[0].tasks);
        const allTasks = [...tasksData.writtenWork, ...tasksData.performanceTask, ...tasksData.exam];
        const taskExists = allTasks.find(task => task.taskId == taskId);

        if (!taskExists) {
            return res.status(404).send('Task not found');
        }

        // redirect to tasks page
        return res.redirect(`/tasks.html?classId=${encodeURIComponent(classId)}&username=${encodeURIComponent(username)}&taskId=${encodeURIComponent(taskId)}`);
        
    } catch (error) {
        console.error("Error in handleTaskRedirect:", error);
        return res.status(500).render('login', {
            message: 'Internal server error'
        });
    }
};

// ============================================= DELETE SPECIFIC TASK ===================================================
exports.deleteTask = async (req, res) => {
    const { classId } = req.params; 
    const { component, taskName, maxScore, taskId} = req.body; 

    if (!component || !taskName || !maxScore) {
        return res.status(400).json({ message: 'Component, taskName, or maxScore missing' });
    }

    // for debugging purposes
    console.log(`Attempting to delete task with the following data:`);
    console.log(`Component: ${component}, TaskName: ${taskName}, MaxScore: ${maxScore}`);

    // retrieve task from specific component
    const selectQuery = `SELECT tasks FROM classes WHERE id = ?`;
    const selectParams = [classId];

    try {
        const [rows] = await db.query(selectQuery, selectParams);
        const tasks = rows[0]?.tasks;

        if (!tasks) {
            return res.status(404).json({ message: 'No tasks found for the specified class' });
        }

        // parse the JSON and filter out the task to delete
        const tasksJson = JSON.parse(tasks);
        if (!tasksJson[component]) {
            return res.status(404).json({ message: 'No such component in tasks' });
        }

        const updatedTasks = tasksJson[component].filter(task => {
            return task.taskName !== taskName || task.maxScore !== maxScore;
        });

        // update the database with the new tasks JSON
        tasksJson[component] = updatedTasks;
        const updateQuery = `UPDATE classes SET tasks = ? WHERE id = ?`;
        const updateParams = [JSON.stringify(tasksJson), classId];

        await db.query(updateQuery, updateParams);


        const selectRemarksQuery = `SELECT id, taskandscore FROM remarks WHERE classId = ?`;
        const [remarksRows] = await db.query(selectRemarksQuery, [classId]);

        for (const remark of remarksRows) {
            const taskandscore = JSON.parse(remark.taskandscore);

            if (taskandscore[component]) {
                taskandscore[component] = taskandscore[component].filter(
                    (task) => task.taskId !== taskId
                );

                await db.query(`UPDATE remarks SET taskandscore = ? WHERE id = ?`, [
                    JSON.stringify(taskandscore),
                    remark.id,
                ]);
            }
        }

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (err) {
        console.error('Error in deleteTask function:', err);
        res.status(500).send('An error occurred while deleting the task');
    }
};

// ============================================= FETCH TASK DATA BY ID ===================================================

exports.getTaskById = async (req, res) => { 
    try {
        const { taskId } = req.params;
        const { classId } = req.query;
        
        console.log(`Fetching taskId: ${taskId} for classId: ${classId}`);

        const numericClassId = parseInt(classId, 10);
        console.log('Converted numericClassId:', numericClassId);

        if (isNaN(numericClassId)) {
            console.error('Invalid classId format');
            return res.status(400).json({ message: 'Invalid classId format' });
        }

        const [rows] = await db.query('SELECT tasks FROM classes WHERE id = ?', [numericClassId]);

        if (!rows.length) {
            console.error('Class not found');
            return res.status(404).json({ message: 'Class not found' });
        }

        console.log('Rows returned from DB:', rows);

        let tasks = rows[0].tasks ? JSON.parse(rows[0].tasks) : { writtenWork: [], performanceTask: [], exam: [] };

        console.log('Parsed tasks:', tasks);

        const task = await findTaskById(tasks, taskId);

        if (!task) {
            console.log('Task not found');
            return res.status(404).json({ message: 'Task not found' });
        }

        console.log('Found task:', task);

        res.json(task);
    } catch (err) {
        console.error('Error fetching task:', err);
        res.status(500).json({ message: 'An error occurred' });
    }
};

// updated async findTaskById function
async function findTaskById(tasks, taskId) {
    const numericTaskId = Number(taskId);

    for (const category of ['writtenWork', 'performanceTask', 'exam']) {
        if (tasks[category]) {
            const task = tasks[category].find(task => task.taskId === numericTaskId);
            if (task) {
                return task;
            }
        }
    }

    return null;
}

//========================================================= SCORING   =========================================================
exports.fetchScoringData = async (req, res) => {
    try {
        const { classId } = req.params;
        const { taskId } = req.query;

        const [rows] = await db.query('SELECT id, student, taskandscore FROM remarks WHERE classId = ?', [classId]);

        if (!rows.length) {
            return res.status(404).send('No data found for this class');
        }

        const scoringData = rows.map(row => {
            let taskandscore = JSON.parse(row.taskandscore);
            let maxScore = 'Not Set';
            let score = null;

            const categories = ['writtenWork', 'performanceTask', 'exam'];

            categories.forEach(category => {
                const taskData = taskandscore[category].find(task => task.taskId === parseInt(taskId));
                if (taskData) {
                    maxScore = taskData.maxScore;
                    score = taskData.score; 
                }
            });

            return {
                id: row.id,         
                student: row.student,
                maxScore,           // Will be 'Not Set' if no matching taskId was found
                score               // Will be null if no matching taskId was found
            };
        });

        res.send(scoringData);
    } catch (err) {
        console.error('Error fetching scoring data:', err);
        res.status(500).send('An error occurred while fetching the data');
    }
};

//==================================================== SAVE SCORE (palpak ang logic sa rank sorting part) ======================================================
/*
exports.saveScores = async (req, res) => {
    try {
        const { classId } = req.params;
        const { studentScores } = req.body;

        console.log('Received student scores:', studentScores);

        for (let scoreData of studentScores) {
            const { studentId, taskId, score } = scoreData;

            const taskIdNumber = Number(taskId);

            if (isNaN(score) || score === null || score < 0) {
                console.error(`Invalid score for student ${studentId}: ${score}`);
                return res.status(400).json({ message: `Invalid score for student ${studentId}` });
            }

            const [remarksRows] = await db.query(
                'SELECT taskandscore, finalremark FROM remarks WHERE id = ? AND classId = ?',
                [studentId, classId]
            );
            if (!remarksRows.length) {
                return res.status(404).json({ message: 'No remarks data found for this student' });
            }

            let taskandscore = remarksRows[0].taskandscore;
            let finalremark = remarksRows[0].finalremark;

            if (typeof taskandscore === 'string') taskandscore = JSON.parse(taskandscore);
            if (typeof finalremark === 'string') finalremark = JSON.parse(finalremark);

            taskandscore = taskandscore || { writtenWork: [], performanceTask: [], exam: [] };
            finalremark = finalremark || { writtenWork: [], performanceTask: [], exam: [], remark: [] };

            const categories = ['writtenWork', 'performanceTask', 'exam'];

            const [classRows] = await db.query('SELECT components FROM classes WHERE id = ?', [classId]);
            if (!classRows.length) {
                return res.status(404).json({ message: 'Class not found' });
            }

            const components = classRows[0].components ? JSON.parse(classRows[0].components) : {};
            const componentRates = {
                writtenWork: components.writtenwork || 0,
                performanceTask: components.performancetask || 0,
                exam: components.exam || 0
            };

            let totalPercentage = 0;

            categories.forEach(category => {
                const taskIndex = taskandscore[category].findIndex(task => task.taskId === taskIdNumber);
                if (taskIndex !== -1) {
                    taskandscore[category][taskIndex].score = score; // update task score
                }

                const totalScore = taskandscore[category].reduce((sum, task) => sum + (task.score || 0), 0);
                const totalMaxScore = taskandscore[category].reduce((sum, task) => sum + (task.maxScore || 0), 0);

                const srating = totalMaxScore ? Math.round((totalScore / totalMaxScore) * 50 + 50) : 0;
                const componentRate = componentRates[category];
                const percentage = Math.round(srating * (componentRate / 100) * 100) / 100;

                totalPercentage += percentage;

                // update properties in finalremark
                finalremark[category] = [
                    { sst: totalScore },
                    { st: totalMaxScore },
                    { srating },
                    { componentRate },
                    { percentage }
                ];
            });

            // calculate grades and proficiency level
            const initialGrade = totalPercentage;
            const finalGrade = Math.round(initialGrade);
            const proficiencyLevel =
                finalGrade >= 90 ? 'A' :
                finalGrade >= 85 ? 'P' :
                finalGrade >= 80 ? 'AP' :
                finalGrade >= 75 ? 'D' : 'B';

            const remarksValue = finalGrade >= 75 ? "P" : "F";

            // update the remark field in finalremark
            finalremark.rating = [
                { initialGrade },
                { finalGrade },
                { proficiencylvl: proficiencyLevel },
                { rank: 1 }, // placeholder for rank (palpak logic)
                { remarks: remarksValue }
            ];

            // update remarks in the db
            await db.query(
                'UPDATE remarks SET taskandscore = ?, finalremark = ? WHERE id = ? AND classId = ?',
                [JSON.stringify(taskandscore), JSON.stringify(finalremark), studentId, classId]
            );

            console.log(`Updated taskandscore and finalremark for student ${studentId}:`, {
                taskandscore,
                finalremark
            });
        }

        // fetch all students' finalGrade and IDs for the given classId
        const [allRemarksRows] = await db.query(
            'SELECT id, finalremark FROM remarks WHERE classId = ?',
            [classId]
        );

        // parse finalremarks to extract and sort by finalGrade
        const students = allRemarksRows.map(row => {
            const finalremark = JSON.parse(row.finalremark);
            const finalGrade = finalremark.rating?.find(r => r.finalGrade)?.finalGrade || 0;
            return { id: row.id, finalGrade, finalremark };
        });

        // sort students by finalGrade in descending order
        students.sort((a, b) => b.finalGrade - a.finalGrade);

        // assign ranks and update finalremarks
        let currentRank = 1; 
        let lastGrade = null; 

        for (let i = 0; i < students.length; i++) {
            const student = students[i];

            if (student.finalGrade !== lastGrade) {
                currentRank = i + 1; 
            }
            
            student.finalremark.rating = student.finalremark.rating.map(item => {
                if (item.rank !== undefined) {
                    return { rank: currentRank }; 
                }
                return item;
            });

            if (!student.finalremark.rating.some(item => item.rank !== undefined)) {
                student.finalremark.rating.push({ rank: currentRank });
            }

            await db.query(
                `UPDATE remarks SET finalremark = ? WHERE id = ? AND classId = ?`,
                [JSON.stringify(student.finalremark), student.id, classId]
            );

            lastGrade = student.finalGrade;
        }

        res.status(200).json({ message: 'Scores, remarks, and other properties updated successfully!' });
    } catch (err) {
        console.error('Error saving scores:', err);
        res.status(500).json({ message: 'An error occurred while saving the scores' });
    }
};
*/
//========================================================= SAVE SCORES (GOOD) ===================================================================
exports.saveScores = async (req, res) => {
    try {
        const { classId } = req.params;
        const { studentScores } = req.body;

        console.log('Received student scores:', studentScores);

        for (let scoreData of studentScores) {
            const { studentId, taskId, score } = scoreData;

            const taskIdNumber = Number(taskId);

            if (isNaN(score) || score === null || score < 0) {
                console.error(`Invalid score for student ${studentId}: ${score}`);
                return res.status(400).json({ message: `Invalid score for student ${studentId}` });
            }

            const [remarksRows] = await db.query(
                'SELECT taskandscore, finalremark FROM remarks WHERE id = ? AND classId = ?',
                [studentId, classId]
            );
            if (!remarksRows.length) {
                return res.status(404).json({ message: 'No remarks data found for this student' });
            }

            let taskandscore = remarksRows[0].taskandscore;
            let finalremark = remarksRows[0].finalremark;

            if (typeof taskandscore === 'string') taskandscore = JSON.parse(taskandscore);
            if (typeof finalremark === 'string') finalremark = JSON.parse(finalremark);

            taskandscore = taskandscore || { writtenWork: [], performanceTask: [], exam: [] };
            finalremark = finalremark || { writtenWork: [], performanceTask: [], exam: [], remark: [] };

            const categories = ['writtenWork', 'performanceTask', 'exam'];

            const [classRows] = await db.query('SELECT components FROM classes WHERE id = ?', [classId]);
            if (!classRows.length) {
                return res.status(404).json({ message: 'Class not found' });
            }

            const components = classRows[0].components ? JSON.parse(classRows[0].components) : {};
            const componentRates = {
                writtenWork: components.writtenwork || 0,
                performanceTask: components.performancetask || 0,
                exam: components.exam || 0
            };

            let totalPercentage = 0;

            categories.forEach(category => {
                const taskIndex = taskandscore[category].findIndex(task => task.taskId === taskIdNumber);
                if (taskIndex !== -1) {
                    taskandscore[category][taskIndex].score = score; 
                }

                const totalScore = taskandscore[category].reduce((sum, task) => sum + (task.score || 0), 0);
                const totalMaxScore = taskandscore[category].reduce((sum, task) => sum + (task.maxScore || 0), 0);

                const srating = totalMaxScore ? Math.round((totalScore / totalMaxScore) * 50 + 50) : 0;
                const componentRate = componentRates[category];
                const percentage = Math.round(srating * (componentRate / 100) * 100) / 100;

                totalPercentage += percentage;

                // update properties in finalremark
                finalremark[category] = [
                    { sst: totalScore },
                    { st: totalMaxScore },
                    { srating },
                    { componentRate },
                    { percentage }
                ];
            });

            // calculate grades and proficiency level
            //const initialGrade = totalPercentage;
            const initialGrade = parseFloat(totalPercentage.toFixed(2));
            const finalGrade = Math.round(initialGrade);
            const proficiencyLevel =
                finalGrade >= 90 ? 'A' :
                finalGrade >= 85 ? 'P' :
                finalGrade >= 80 ? 'AP' :
                finalGrade >= 75 ? 'D' : 'B';

            const remarksValue = finalGrade >= 75 ? "P" : "F";

            // update the remark field in finalremark
            finalremark.rating = [
                { initialGrade },
                { finalGrade },
                { proficiencylvl: proficiencyLevel },
                { rank: 1 }, 
                { remarks: remarksValue }
            ];

            // update remarks in the db
            await db.query(
                'UPDATE remarks SET taskandscore = ?, finalremark = ? WHERE id = ? AND classId = ?',
                [JSON.stringify(taskandscore), JSON.stringify(finalremark), studentId, classId]
            );

            console.log(`Updated taskandscore and finalremark for student ${studentId}:`, {
                taskandscore,
                finalremark
            });
        }

        // fetch all students' finalGrade and IDs for the given classId
        const [allRemarksRows] = await db.query(
            'SELECT id, finalremark FROM remarks WHERE classId = ?',
            [classId]
        );

        // parse finalremarks to extract and sort by finalGrade
        const students = allRemarksRows.map(row => {
            const finalremark = JSON.parse(row.finalremark);
            const finalGrade = finalremark.rating?.find(r => r.finalGrade)?.finalGrade || 0;
            return { id: row.id, finalGrade, finalremark };
        });

        // sort students by finalGrade in descending order
        students.sort((a, b) => b.finalGrade - a.finalGrade);

        let currentRank = 0;
        let lastGrade = null;

        for (let i = 0; i < students.length; i++) {
            const student = students[i];

            if (student.finalGrade !== lastGrade) {
                currentRank++; 
            }

            student.finalremark.rating = student.finalremark.rating.map(item => {
                if (item.rank !== undefined) {
                    return { rank: currentRank };
                }
                return item;
            });

            if (!student.finalremark.rating.some(item => item.rank !== undefined)) {
                student.finalremark.rating.push({ rank: currentRank });
            }

            await db.query(
                `UPDATE remarks SET finalremark = ? WHERE id = ? AND classId = ?`,
                [JSON.stringify(student.finalremark), student.id, classId]
            );

            lastGrade = student.finalGrade; // Update the lastGrade for comparison
        }

        res.status(200).json({ message: 'Scores, remarks, and other properties updated successfully!' });
    } catch (err) {
        console.error('Error saving scores:', err);
        res.status(500).json({ message: 'An error occurred while saving the scores' });
    }
};

//================================================= GENERATE CLASS RECORD NAAAAAAAAAA ================================================

exports.getClassRecordData = async (req, res) => {
    const classId = req.params.classId;

    try {
        const [rows] = await db.query(`
            SELECT 
                c.id AS classId, 
                c.class AS classDetails, 
                c.students, 
                c.tasks, 
                c.components, 
                r.lrn, 
                r.student, 
                r.taskandscore, 
                r.finalremark, 
                u.fullName AS teacherName, 
                u.department AS teacherDepartment,
                rec.sod
            FROM classes c
            LEFT JOIN remarks r ON c.id = r.classId
            INNER JOIN users u ON c.user = u.username
            LEFT JOIN records rec ON c.id = rec.classId
            WHERE c.id = ?
        `, [classId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No data found for the specified class ID' });
        }

        // parse JSON fields and organize data
        const classData = {
            classId: rows[0].classId,
            classDetails: rows[0].classDetails ? JSON.parse(rows[0].classDetails) : {},
            students: rows[0].students ? JSON.parse(rows[0].students) : [],
            tasks: rows[0].tasks ? JSON.parse(rows[0].tasks) : {},
            components: rows[0].components ? JSON.parse(rows[0].components) : {},
            teacher: {
                name: rows[0].teacherName,
                department: rows[0].teacherDepartment,
            },
            remarks: rows.map(row => ({
                lrn: row.lrn,
                student: row.student,
                taskAndScore: row.taskandscore ? JSON.parse(row.taskandscore) : null,
                finalRemark: row.finalremark ? JSON.parse(row.finalremark) : null,
            })),
            sod: rows[0].sod ? JSON.parse(rows[0].sod) : [],
        };

        res.status(200).json(classData);
        console.log(classData);
    } catch (error) {
        console.error("Error fetching class data:", error);
        res.status(500).json({ message: 'Failed to fetch class data' });
    }
};


//===================================================================================================================================
exports.saveClassRecord = async (req, res) => {
    const { classId, user, aRemark, pRemark, apRemark, dRemark, bRemark, droppedRemark, iRemark, adminRecommendingApproval, adminPosition  } = req.body; 

    try {
        const [classDataRows] = await db.query(`
            SELECT 
                c.class AS classDetails, 
                c.students, 
                c.tasks, 
                c.components, 
                r.lrn, 
                r.student, 
                r.taskandscore, 
                r.finalremark
            FROM classes c
            LEFT JOIN remarks r ON c.id = r.classId
            WHERE c.id = ?`, [classId]);

        if (classDataRows.length === 0) {
            return res.status(404).json({ message: 'No class data found for the given classId' });
        }

        const [userRows] = await db.query('SELECT fullName FROM users WHERE username = ?', [user]);
        if (userRows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const teacherName = userRows[0].fullName;

        const classRecord = {
            classDetails: JSON.parse(classDataRows[0].classDetails || '{}'),
            students: JSON.parse(classDataRows[0].students || '[]'),
            tasks: JSON.parse(classDataRows[0].tasks || '{}'),
            components: JSON.parse(classDataRows[0].components || '{}'),
            remarks: classDataRows.map(row => ({
                lrn: row.lrn,
                student: row.student,
                taskAndScore: JSON.parse(row.taskandscore || 'null'),
                finalRemark: JSON.parse(row.finalremark || 'null'),
            })),
        };

        // prepare the SOD
        const remarks = classRecord.remarks;
        const proficiencyCounts = remarks.reduce((acc, remark) => {
            const level = remark.finalRemark?.rating[2]?.proficiencylvl;
            acc[level] = (acc[level] || 0) + 1;
            return acc;
        }, {});

        const total = remarks.length || 1; // Avoid division by zero
        const sodData = [
            { "A": proficiencyCounts['A'] || 0, "frequency": (((proficiencyCounts['A'] || 0) / total) * 100).toFixed(2), "remark": aRemark },
            { "P": proficiencyCounts['P'] || 0, "frequency": (((proficiencyCounts['P'] || 0) / total) * 100).toFixed(2), "remark": pRemark},
            { "AP": proficiencyCounts['AP'] || 0, "frequency": (((proficiencyCounts['AP'] || 0) / total) * 100).toFixed(2), "remark": apRemark },
            { "D": proficiencyCounts['D'] || 0, "frequency": (((proficiencyCounts['D'] || 0) / total) * 100).toFixed(2), "remark": dRemark },
            { "B": proficiencyCounts['B'] || 0, "frequency": (((proficiencyCounts['B'] || 0) / total) * 100).toFixed(2), "remark": bRemark },
            { "I": proficiencyCounts['I'] || 0, "frequency": (((proficiencyCounts['I'] || 0) / total) * 100).toFixed(2), "remark": iRemark },
            { "Dropped": proficiencyCounts['Dropped'] || 0, "frequency": (((proficiencyCounts['Dropped'] || 0) / total) * 100).toFixed(2), "remark": droppedRemark },
            { "adminName": adminRecommendingApproval, "adminPosition": adminPosition}
        ];

        await db.query(`
            INSERT INTO records (user, classId, classRecord, sod, status, teacherName)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            user,
            classId,
            JSON.stringify(classRecord),
            JSON.stringify(sodData),
            'No Status', 
            teacherName 
        ]);

        res.status(200).json({ message: 'Class record saved successfully' });
    } catch (error) {
        console.error('Error saving class record:', error);
        res.status(500).json({ message: 'Failed to save class record' });
    }
};

//============================================================================================================================================
exports.getAllClassRecordsByUser = async (req, res) => {
    const { username } = req.params; 

    try {
        const [recordsData] = await db.query(`
            SELECT user, classId, classRecord, sod, status
            FROM records
            WHERE user = ?`, [username]);

        if (recordsData.length === 0) {
            return res.status(404).json({ message: 'No records found for the given username' });
        }

        res.status(200).json(recordsData);
    } catch (error) {
        console.error('Error fetching records by user:', error);
        res.status(500).json({ message: 'Failed to fetch records' });
    }
};

//==========================================================================================================================================
exports.getFinalClassRecord = async (req, res) => {
    const classId = req.params.classId;

    try {
        const [finalRecord] = await db.query(`
            SELECT user, classId, teacherName, classRecord, sod, status
            FROM records
            WHERE classId = ?
        `, [classId]);

        if (finalRecord.length === 0) {
            return res.status(404).json({ message: 'No records found for given class id' });
        }

        console.log('Fetched Record from DB:', JSON.stringify(finalRecord, null, 2));  // mahaba 'to
        res.status(200).json(finalRecord);
    } catch (error) {
        console.error('Error fetching records by classId:', error);
        res.status(500).json({ message: 'Failed to fetch records' });
    }
};

//======================================================================================================================================

exports.updateApprovalStatus = async (req, res) => {
    const { classId, status } = req.body;

    if (!classId || !status) {
        return res.status(400).json({ message: 'Invalid input. Class ID and Status are required.' });
    }

    try {
        const query = `UPDATE records SET status = ? WHERE classId = ?`;
        const [result] = await db.execute(query, [status, classId]);

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Status updated successfully.' });
        } else {
            res.status(404).json({ message: 'Record not found.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while updating the status.' });
    }

}

//=======================================================================================================================================
exports.getRecordsByUser = async (req, res) => {
    const username = req.query.username;

    if (!username) {
        return res.status(400).json({ message: 'Username is required' });
    }

    try {
        const [records] = await db.execute('SELECT * FROM records WHERE user = ?', [username]);

        if (records.length === 0) {
            return res.status(404).json({ message: 'No records found for this user' });
        }

        res.json(records);
    } catch (err) {
        console.error('Error fetching records:', err);
        res.status(500).json({ message: 'Error fetching records' });
    }
};

//=====================================================================================================================================
exports.getPendingRecordsByUser = async (req, res) => {
    const username = req.query.username;

    if (!username) {
        return res.status(400).json({ message: 'Username is required' });
    }

    try {
        const [records] = await db.execute('SELECT * FROM records WHERE status = "pending" AND user = ?', [username]);

        if (records.length === 0) {
            return res.status(404).json({ message: 'No records found for this user' });
        }

        res.json(records);
    } catch (err) {
        console.error('Error fetching records:', err);
        res.status(500).json({ message: 'Error fetching records' });
    }
};

//========================================================================================================================================
exports.getApprovedRecordsByUser = async (req, res) => {
    const username = req.query.username;

    if (!username) {
        return res.status(400).json({ message: 'Username is required' });
    }

    try {
        const [records] = await db.execute('SELECT * FROM records WHERE status = "approved" AND user = ?', [username]);

        if (records.length === 0) {
            return res.status(404).json({ message: 'No records found for this user' });
        }

        res.json(records);
    } catch (err) {
        console.error('Error fetching records:', err);
        res.status(500).json({ message: 'Error fetching records' });
    }
};

//==================================================================================================================================
exports.getDisapprovedRecordsByUser = async (req, res) => {
    const username = req.query.username;

    if (!username) {
        return res.status(400).json({ message: 'Username is required' });
    }

    try {
        const [records] = await db.execute('SELECT * FROM records WHERE status = "disapproved" AND user = ?', [username]);

        if (records.length === 0) {
            return res.status(404).json({ message: 'No records found for this user' });
        }

        res.json(records);
    } catch (err) {
        console.error('Error fetching records:', err);
        res.status(500).json({ message: 'Error fetching records' });
    }
};

//==================================================================================================================================
exports.getNoStatusRecordsByUser = async (req, res) => {
    const username = req.query.username;

    if (!username) {
        return res.status(400).json({ message: 'Username is required' });
    }

    try {
        const [records] = await db.execute('SELECT * FROM records WHERE status = "no status" AND user = ?', [username]);

        if (records.length === 0) {
            return res.status(404).json({ message: 'No records found for this user' });
        }

        res.json(records);
    } catch (err) {
        console.error('Error fetching records:', err);
        res.status(500).json({ message: 'Error fetching records' });
    }
};

//===========================================================================================================================
//----------------------------------------------  ADMIN'S BACKEND -----------------------------------------------------------
//===========================================================================================================================

exports.getPendingRecords = async (req, res) => {
    const sql = 'SELECT * FROM records WHERE status IN ("pending", "approved", "disapproved")'; 
    //const sql = 'SELECT * FROM records WHERE status = "pending"';
    try {
        const [results] = await db.query(sql);

        if (results.length === 0) {
            return res.status(204).json([]);
        }

        const processedResults = results.map(record => {
            let classDetails = {};
            let status = record.status || 'N/A';
            let teacherName = record.teacherName || 'N/A';
            let classId = record.classId || 'N/A';

            if (record.classRecord) {
                if (typeof record.classRecord === 'string') {
                    try {
                        classDetails = JSON.parse(record.classRecord);
                    } catch (error) {
                        console.error('Error parsing classRecord for record:', record);
                        classDetails = {};  
                    }
                } else if (typeof record.classRecord === 'object') {
                    classDetails = record.classRecord;
                }
            }

            return { classDetails, status, teacherName, classId };
        });

        res.json(processedResults);
    } catch (err) {
        console.error('Error fetching records:', err);
        res.status(500).json({ error: 'Database query failed' });
    }
};

//=======================================================================================================================================
exports.getForApprovalRecords = async (req, res) => {
    const sql = 'SELECT * FROM records WHERE status = "pending"';
    try {
        const [results] = await db.query(sql);

        if (results.length === 0) {
            return res.status(204).json([]);
        }

        const processedResults = results.map(record => {
            let classDetails = {};
            let status = record.status || 'N/A';
            let teacherName = record.teacherName || 'N/A';
            let classId = record.classId || 'N/A';

            if (record.classRecord && typeof record.classRecord === 'string') {
                try {
                    classDetails = JSON.parse(record.classRecord);
                } catch (error) {
                    console.error('Error parsing classRecord:', error);
                    classDetails = {};
                }
            }

            return { classDetails, status, teacherName, classId };
        });

        res.json(processedResults);
    } catch (err) {
        console.error('Error fetching records:', err);
        res.status(500).json({ error: 'Database query failed' });
    }
};

//======================================================================================================================================
exports.getApprovedRecords = async (req, res) => {
    const sql = 'SELECT * FROM records WHERE status = "approved"';
    try {
        const [results] = await db.query(sql);

        if (results.length === 0) {
            return res.status(204).json([]);
        }

        const processedResults = results.map(record => {
            let classDetails = {};
            let status = record.status || 'N/A';
            let teacherName = record.teacherName || 'N/A';
            let classId = record.classId || 'N/A';

            if (record.classRecord && typeof record.classRecord === 'string') {
                try {
                    classDetails = JSON.parse(record.classRecord);
                } catch (error) {
                    console.error('Error parsing classRecord:', error);
                    classDetails = {};
                }
            }

            return { classDetails, status, teacherName, classId };
        });

        res.json(processedResults);
        console.log("resp: ", processedResults);
    } catch (err) {
        console.error('Error fetching records:', err);
        res.status(500).json({ error: 'Database query failed' });
    }
};

//======================================================================================================================================
exports.getDisapprovedRecords = async (req, res) => {
    const sql = 'SELECT * FROM records WHERE status = "disapproved"';
    try {
        const [results] = await db.query(sql);

        if (results.length === 0) {
            return res.status(204).json([]);
        }

        const processedResults = results.map(record => {
            let classDetails = {};
            let status = record.status || 'N/A';
            let teacherName = record.teacherName || 'N/A';
            let classId = record.classId || 'N/A';

            if (record.classRecord && typeof record.classRecord === 'string') {
                try {
                    classDetails = JSON.parse(record.classRecord);
                } catch (error) {
                    console.error('Error parsing classRecord:', error);
                    classDetails = {};
                }
            }

            return { classDetails, status, teacherName, classId };
        });

        res.json(processedResults);
        console.log("resp: ", processedResults);
    } catch (err) {
        console.error('Error fetching records:', err);
        res.status(500).json({ error: 'Database query failed' });
    }
};

//=======================================================================================================================================
exports.getTotalCounts = async (req, res) => {
    const totalQuery = `
        SELECT 
            (SELECT COUNT(*) FROM users) AS totalUsers,
            (SELECT COUNT(*) FROM classes) AS totalClasses,
            (SELECT COUNT(*) FROM records) AS totalRecords,
            (SELECT COUNT(*) FROM records WHERE status = 'approved') AS approvedCount,
            (SELECT COUNT(*) FROM records WHERE status = 'disapproved') AS disapprovedCount,
            (SELECT COUNT(*) FROM records WHERE status = 'pending') AS pendingCount
    `;

    try {
        const [result] = await db.query(totalQuery);
        res.json(result[0]); 
    } catch (err) {
        console.error('Error fetching totals:', err);
        res.status(500).send('Error fetching totals');
    }
};

//===========================================================================================================================================
exports.getUserDetails = async (req, res) => {
    const query = `
        SELECT employeeID, fullName, department, advisory
        FROM users
        WHERE username != 'admin';
    `;

    try {
        const [results, fields] = await db.execute(query);

        res.json(results);
    } catch (err) {
        console.error('Error fetching user details:', err);
        res.status(500).send('Error fetching user details');
    }
};


//=========================================================================================================================================
//--------------------------------------------------- TEACHER'S BACKEND AGAIN -------------------------------------------------------------
//=========================================================================================================================================
exports.saveComponentRate = async (req, res) => {
    try {
        const { classId } = req.params;
        const { component, rate } = req.body;

        const numericClassId = parseInt(classId, 10);
        if (isNaN(numericClassId)) {
            return res.status(400).send('Invalid class ID format');
        }

        const [rows] = await db.query('SELECT components FROM classes WHERE id = ?', [numericClassId]);
        if (!rows.length) {
            return res.status(404).send('Class not found');
        }

        let components = rows[0].components ? JSON.parse(rows[0].components) : {};

        components[component] = rate !== "" ? parseInt(rate, 10) : null;

        await db.query('UPDATE classes SET components = ? WHERE id = ?', [JSON.stringify(components), numericClassId]);

        res.send('Component rate updated successfully');
    } catch (error) {
        console.error('Error saving component rate:', error);
        res.status(500).send('An error occurred while saving the component rate');
    }
};

// ============================================================================================================================================
exports.deleteStudentByLRN = async (req, res) => {
    const { classId, lrn } = req.params;

    try {
        const [rows] = await db.query('SELECT students FROM classes WHERE id = ?', [classId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Class not found' });
        }

        let studentData = JSON.parse(rows[0].students);

        const updatedStudentData = studentData.filter(student => student.B !== lrn);

        await db.query('UPDATE classes SET students = ? WHERE id = ?', [
            JSON.stringify(updatedStudentData),
            classId
        ]);

        const deleteResult = await db.query('DELETE FROM remarks WHERE classId = ? AND lrn = ?', [classId, lrn]);

        if (deleteResult.affectedRows === 0) {
            console.warn(`No scoring data found for student with LRN ${lrn}`);
        }

        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ message: 'Error deleting student' });
    }
};


// ========================================================= HANDLE REDIRECT PAGES =====================================================================
const handleRedirect = async (req, res, page) => {
    try {
        console.log("Session data:", req.session.user); 

        if (!req.session.user) {
            return res.status(401).render('login', {
                message: 'User not authenticated'
            });
        }

        const username = req.session.user.username;

        const [results] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

        if (results.length === 0) {
            return res.status(404).render('login', {
                message: 'User not found'
            });
        }

        console.log("Received username:", username);
        console.log("User found in DB:", results);

        // redirect to the specified page with encoded username
        return res.redirect(`/${page}.html?username=${encodeURIComponent(username)}`);
    } catch (error) {
        console.error("Error in handleRedirect:", error);
        return res.status(500).render('login', {
            message: 'Internal server error'
        });
    }
};


// Open class function
//exports.openclass = (req, res) => handleRedirect(req, res, 'class');

// Back to main function
exports.backToMain = (req, res) => handleRedirect(req, res, 'main');

exports.recordPage = (req, res) => handleRedirect(req, res, 'records');

exports.pendingPage = (req, res) => handleRedirect(req, res, 'pending');

exports.approvedPage = (req, res) => handleRedirect(req, res, 'approved');

exports.disapprovedPage = (req, res) => handleRedirect(req, res, 'disapproved');

exports.adminDashboard = (req, res) => handleRedirect(req, res, 'admin-dashboard');

exports.adminRecord = (req, res) => handleRedirect(req, res, 'admin-records');

exports.adminFaculty = (req, res) => handleRedirect(req, res, 'admin-faculty');

exports.adminforApproval = (req, res) => handleRedirect(req, res, 'admin-forApproval');

exports.adminApproved = (req, res) => handleRedirect(req, res, 'admin-approved');

exports .adminDisapproved  = (req, res) => handleRedirect(req, res, 'admin-disapproved');

// Open students function
//exports.students = (req, res) => handleRedirect(req, res, 'students');

// Back to class function
//exports.backToClass = (req, res) => handleRedirect(req, res, 'class');

// View tasks function
//exports.tasks = (req, res) => handleRedirect(req, res, 'tasks');

