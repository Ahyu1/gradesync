
//WITHOUT TASKID
/*
exports.addTask = async (req, res) => {
    try {
        const { component, taskName, maxScore } = req.body;
        const { classId } = req.params;

        console.log("Received data:", req.body);

        const numericClassId = parseInt(classId, 10);
        console.log('Received classId (numeric):', numericClassId, '| Original classId:', classId);

        if (isNaN(numericClassId)) {
            console.error('Invalid classId format:', classId);
            return res.status(400).send('Invalid classId format');
        }

        // Fetch current tasks for the class
        const [rows] = await db.query('SELECT tasks FROM classes WHERE id = ?', [numericClassId]);
        console.log('Database query results:', rows);

        if (!rows.length) {
            console.error('Class not found');
            return res.status(404).send('Class not found');
        }

        // Ensure tasks is correctly parsed
        let tasks;
        try {
            tasks = rows[0].tasks ? JSON.parse(rows[0].tasks) : { writtenWork: [], performanceTask: [], exam: [] };
        } catch (parseError) {
            console.error('Error parsing tasks JSON:', parseError);
            tasks = { writtenWork: [], performanceTask: [], exam: [] };
        }

        console.log('Current tasks before update:', tasks);

        // Add the new task to the specified category
        if (!tasks[component]) tasks[component] = [];  // Ensure component category exists
        tasks[component].push({ taskName, maxScore: parseInt(maxScore, 10) });

        console.log('Updated tasks after adding new task:', tasks);

        // Update tasks column in the database with appended data
        await db.query('UPDATE classes SET tasks = ? WHERE id = ?', [JSON.stringify(tasks), numericClassId]);
        console.log('Task added successfully');
        res.send('Task added successfully');

    } catch (err) {
        console.error('Error in addTask function:', err);
        res.status(500).send('An error occurred');
    }
};
*/

/*
exports.addTask = async (req, res) => {
    try {
        const { component, taskName, maxScore } = req.body;
        const { classId } = req.params;

        console.log("Received data:", req.body);

        const numericClassId = parseInt(classId, 10);
        console.log('Received classId (numeric):', numericClassId, '| Original classId:', classId);

        if (isNaN(numericClassId)) {
            console.error('Invalid classId format:', classId);
            return res.status(400).send('Invalid classId format');
        }

        // Fetch current tasks for the class
        const [rows] = await db.query('SELECT tasks FROM classes WHERE id = ?', [numericClassId]);
        console.log('Database query results:', rows);

        if (!rows.length) {
            console.error('Class not found');
            return res.status(404).send('Class not found');
        }

        // Ensure tasks is correctly parsed
        let tasks;
        try {
            tasks = rows[0].tasks ? JSON.parse(rows[0].tasks) : { writtenWork: [], performanceTask: [], exam: [] };
        } catch (parseError) {
            console.error('Error parsing tasks JSON:', parseError);
            tasks = { writtenWork: [], performanceTask: [], exam: [] };
        }

        console.log('Current tasks before update:', tasks);

        // Generate a unique taskId
        const taskId = Date.now();

        // Add the new task with the generated taskId
        if (!tasks[component]) tasks[component] = [];  // Ensure component category exists
        tasks[component].push({ taskId, taskName, maxScore: parseInt(maxScore, 10) });

        console.log('Updated tasks after adding new task:', tasks);

        // Update tasks column in the database with appended data
        await db.query('UPDATE classes SET tasks = ? WHERE id = ?', [JSON.stringify(tasks), numericClassId]);
        console.log('Task added successfully');
        res.send('Task added successfully');

    } catch (err) {
        console.error('Error in addTask function:', err);
        res.status(500).send('An error occurred');
    }
};
*/

//==================================================================================
/*
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
        //const studentData = xlsx.utils.sheet_to_json(worksheet);
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


        await db.query(
            'INSERT INTO classes (user, class, students) VALUES (?, ?, ?)',
            [username, JSON.stringify(classData), JSON.stringify(studentData)]
        );

        res.json({ message: 'Class and student data created successfully!' });

        console.log("stduent data: ", studentData);
        console.log("Class data: ", classData);

    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ message: 'Error creating class and student data' });
    }
};
*/

/*
exports.fetchScoringData = async (req, res) => {
    try {
        const { classId } = req.params; // Extract classId from the route parameter
        const { taskId } = req.query; // Correctly read taskId from query
        
        // Query to fetch student data and task data (from remarks table)
        const [rows] = await db.query('SELECT id, student, taskandscore FROM remarks WHERE classId = ?', [classId]);

        if (!rows.length) {
            return res.status(404).send('No data found for this class');
        }

        // Format data to send back to the frontend
        const scoringData = rows.map(row => {
            let taskandscore = JSON.parse(row.taskandscore);  // Parse the taskandscore JSON

            // Check if taskandscore is an array
            if (Array.isArray(taskandscore)) {
                const taskData = taskandscore.find(task => task.taskId === taskId);
                return {
                    id: row.id,  // studentId
                    student: row.student,
                    score: taskData ? taskData.score : null,  // Display score if available
                    maxScore: taskData ? taskData.maxScore : 0  // Max score from task
                };
            } 
            // If taskandscore is an object, use it accordingly
            else if (typeof taskandscore === 'object') {
                const taskData = taskandscore[taskId]; // Assuming taskId is a key in the object
                return {
                    id: row.id,  // studentId
                    student: row.student,
                    score: taskData ? taskData.score : null,  // Display score if available
                    maxScore: taskData ? taskData.maxScore : 0  // Max score from task
                };
            } 
            else {
                console.error('taskandscore is neither an array nor an object:', taskandscore);
                return { id: row.id, student: row.student, score: null, maxScore: 0 }; // Default fallback
            }
        });

        res.send(scoringData);
    } catch (err) {
        console.error('Error fetching scoring data:', err);
        res.status(500).send('An error occurred while fetching the data');
    }
};
*/
//=========================================================================================================
/*
exports.saveScores = async (req, res) => {
    try {
        const { classId } = req.params; // Extract classId from route params
        const { studentScores } = req.body; // Array of student scores to update

        console.log('Received student scores:', studentScores);

        // Loop through studentScores and update each student's taskandscore
        for (let scoreData of studentScores) {
            const { studentId, taskId, score } = scoreData;

            // Validate if the score is a valid number
            if (isNaN(score) || score === null || score < 0) {
                console.error(`Invalid score for student ${studentId}: ${score}`);
                return res.status(400).json({ message: `Invalid score for student ${studentId}` });
            }

            // Get the current taskandscore data for the student
            const [remarksRows] = await db.query('SELECT taskandscore FROM remarks WHERE id = ? AND classId = ?', [studentId, classId]);

            if (!remarksRows.length) {
                return res.status(404).json({ message: 'No remarks data found for this student' });
            }

            let taskandscore = remarksRows[0].taskandscore;

            // Log the taskandscore data to check its structure
            console.log('Original taskandscore data:', taskandscore);

            // Check if taskandscore is a string (it might be a JSON string)
            if (typeof taskandscore === 'string') {
                taskandscore = JSON.parse(taskandscore);  // Parse if it's a string
            }

            // If taskandscore is not found or invalid, initialize it to an empty structure
            if (!taskandscore || typeof taskandscore !== 'object' || !taskandscore.writtenWork || !taskandscore.performanceTask || !taskandscore.exam) {
                console.log('Initializing taskandscore to empty structure');
                taskandscore = {
                    writtenWork: [],
                    performanceTask: [],
                    exam: []
                };
            }

            let taskUpdated = false;
            const categories = ['writtenWork', 'performanceTask', 'exam'];

            // Update the score for the task
            categories.forEach(category => {
                const taskIndex = taskandscore[category].findIndex(task => task.taskId === taskId);
                if (taskIndex !== -1) {
                    taskandscore[category][taskIndex].score = score;
                    taskUpdated = true;
                }
            });

            // If no task was updated
            if (!taskUpdated) {
                console.error(`Task with taskId ${taskId} not found in any category for student ${studentId}`);
                return res.status(404).json({ message: `Task with taskId ${taskId} not found for student ${studentId}` });
            }

            // Log the updated taskandscore
            console.log('Updated taskandscore:', taskandscore);

            // Save the updated taskandscore back to the database
            await db.query('UPDATE remarks SET taskandscore = ? WHERE id = ? AND classId = ?', [JSON.stringify(taskandscore), studentId, classId]);
        }

        // Respond with success message
        res.status(200).json({ message: 'Scores updated successfully!' });
    } catch (err) {
        console.error('Error saving scores:', err);
        res.status(500).json({ message: 'An error occurred while saving the scores' });
    }
};

/*
exports.saveScores = async (req, res) => {
    try {
        const { classId } = req.params; // Extract classId from route params
        const { studentScores } = req.body; // Array of student scores to update

        console.log('Received student scores:', studentScores);

        // Loop through studentScores and update each student's taskandscore
        for (let scoreData of studentScores) {
            const { studentId, taskId, score } = scoreData;

            // Validate if the score is a valid number
            if (isNaN(score) || score === null || score < 0) {
                console.error(`Invalid score for student ${studentId}: ${score}`);
                return res.status(400).json({ message: `Invalid score for student ${studentId}` });
            }

            // Get the current taskandscore data for the student
            const [remarksRows] = await db.query('SELECT taskandscore FROM remarks WHERE id = ? AND classId = ?', [studentId, classId]);

            if (!remarksRows.length) {
                return res.status(404).json({ message: 'No remarks data found for this student' });
            }

            let taskandscore = remarksRows[0].taskandscore;

            // If taskandscore is not found, initialize it to an empty object
            if (!taskandscore) {
                taskandscore = {
                    writtenWork: [],
                    performanceTask: [],
                    exam: []
                };
            }

            // Ensure taskandscore is an object with correct properties
            if (taskandscore && typeof taskandscore === 'object' && taskandscore.writtenWork && taskandscore.performanceTask && taskandscore.exam) {
                let taskUpdated = false;

                // Check each category and update the task score
                const categories = ['writtenWork', 'performanceTask', 'exam'];

                categories.forEach(category => {
                    const taskIndex = taskandscore[category].findIndex(task => task.taskId === taskId);
                    if (taskIndex !== -1) {
                        taskandscore[category][taskIndex].score = score;
                        taskUpdated = true;
                    }
                });

                // If no task was updated
                if (!taskUpdated) {
                    console.error(`Task with taskId ${taskId} not found in any category for student ${studentId}`);
                    return res.status(404).json({ message: `Task with taskId ${taskId} not found for student ${studentId}` });
                }

                // Save the updated taskandscore back to the database
                await db.query('UPDATE remarks SET taskandscore = ? WHERE id = ? AND classId = ?', [JSON.stringify(taskandscore), studentId, classId]);
            } else {
                console.error('Invalid taskandscore format or missing categories:', taskandscore);
                return res.status(500).json({ message: 'Invalid taskandscore format' });
            }
        }

        // Respond with success message
        res.status(200).json({ message: 'Scores updated successfully!' });
    } catch (err) {
        console.error('Error saving scores:', err);
        res.status(500).json({ message: 'An error occurred while saving the scores' });
    }
};

/*
exports.saveScores = async (req, res) => {
    try {
        const { classId } = req.params; // Extract classId from route params
        const { studentScores } = req.body; // Array of student scores to update

        console.log('Received student scores:', studentScores);

        // Loop through studentScores and update each student's taskandscore
        for (let scoreData of studentScores) {
            const { studentId, taskId, score } = scoreData;

            // Validate if the score is a valid number
            if (isNaN(score) || score === null || score < 0) {
                console.error(`Invalid score for student ${studentId}: ${score}`);
                return res.status(400).json({ message: `Invalid score for student ${studentId}` });
            }

            // Get the current taskandscore data for the student
            const [remarksRows] = await db.query('SELECT taskandscore FROM remarks WHERE id = ? AND classId = ?', [studentId, classId]);

            if (!remarksRows.length) {
                return res.status(404).json({ message: 'No remarks data found for this student' });
            }

            let taskandscore = remarksRows[0].taskandscore;

            // If taskandscore is not found, initialize it to an empty object
            if (!taskandscore) {
                taskandscore = {
                    writtenWork: [],
                    performanceTask: [],
                    exam: []
                };
            }

            // Ensure taskandscore is in object format before updating it
            if (typeof taskandscore === 'object') {
                // Update the score for the correct task in the respective category
                const categories = ['writtenWork', 'performanceTask', 'exam'];

                let taskUpdated = false;
                categories.forEach(category => {
                    // Find the task by taskId within each category
                    const taskIndex = taskandscore[category].findIndex(task => task.taskId === taskId);
                    if (taskIndex !== -1) {
                        // Task found, update the score
                        taskandscore[category][taskIndex].score = score;
                        taskUpdated = true;
                    }
                });

                // If the task wasn't found in any category
                if (!taskUpdated) {
                    console.error(`Task with taskId ${taskId} not found in any category for student ${studentId}`);
                    return res.status(404).json({ message: `Task with taskId ${taskId} not found for student ${studentId}` });
                }

                // Save the updated taskandscore back to the database
                await db.query('UPDATE remarks SET taskandscore = ? WHERE id = ? AND classId = ?', [JSON.stringify(taskandscore), studentId, classId]);
            } else {
                console.error('taskandscore is neither an array nor an object:', taskandscore);
                return res.status(500).json({ message: 'Invalid taskandscore format' });
            }
        }

        // Respond with success message
        res.status(200).json({ message: 'Scores updated successfully!' });
    } catch (err) {
        console.error('Error saving scores:', err);
        res.status(500).json({ message: 'An error occurred while saving the scores' });
    }
};

/*
exports.saveScores = async (req, res) => {
    try {
        const { classId } = req.params;  // Extract classId from route params
        const { studentScores } = req.body;  // Array of student scores to update

        console.log('Received student scores:', studentScores);

        // Loop through studentScores and update each student's taskandscore
        for (let scoreData of studentScores) {
            const { studentId, taskId, score } = scoreData;

            // Validate if the score is a valid number
            if (isNaN(score) || score === null || score < 0) {
                console.error(`Invalid score for student ${studentId}: ${score}`);
                return res.status(400).json({ message: `Invalid score for student ${studentId}` });
            }


            // Get the current taskandscore data for the student
            const [remarksRows] = await db.query('SELECT taskandscore FROM remarks WHERE id = ? AND classId = ?', [studentId, classId]);

            if (!remarksRows.length) {
                return res.status(404).json({ message: 'No remarks data found for this student' });
            }

            let taskandscore = remarksRows[0].taskandscore;

            // If taskandscore is not found, initialize it to an empty object or array
            if (!taskandscore) {
                taskandscore = {};  // You can choose an array if that's your intended structure
            }

            // Ensure taskandscore is in object format before updating it
            if (Array.isArray(taskandscore) || typeof taskandscore === 'object') {
                // If taskandscore is an object, update the score using taskId as the key
                if (typeof taskandscore === 'object') {
                    const categories = ['writtenWork', 'performanceTask', 'exam'];

                    categories.forEach(category => {
                        const taskIndex = taskandscore[category].findIndex(task => task.taskId === taskId);
                        if (taskIndex !== -1) {
                            taskandscore[category][taskIndex].score = score;  // Update score for this task
                        }
                    });
                }

                // Save the updated taskandscore back to the database
                await db.query('UPDATE remarks SET taskandscore = ? WHERE id = ? AND classId = ?', [JSON.stringify(taskandscore), studentId, classId]);

            } else {
                console.error('taskandscore is neither an array nor an object:', taskandscore);
                return res.status(500).json({ message: 'Invalid taskandscore format' });
            }
        }

        // Respond with success message
        res.status(200).json({ message: 'Scores updated successfully!' });
    } catch (err) {
        console.error('Error saving scores:', err);
        res.status(500).json({ message: 'An error occurred while saving the scores' });
    }
};

/*
// In your controller (mainController.js)
exports.saveScores = async (req, res) => {
    try {
        const { classId } = req.params;  // Extract classId from route params
        const { studentScores } = req.body;  // Array of student scores to update

        // Loop through studentScores and update each student's taskandscore
        for (let scoreData of studentScores) {
            const { studentId, taskId, score } = scoreData;

            // Get the current taskandscore data for the student
            const [remarksRows] = await db.query('SELECT taskandscore FROM remarks WHERE id = ? AND classId = ?', [studentId, classId]);

            if (!remarksRows.length) {
                return res.status(404).send('No remarks data found for this student');
            }

            let taskandscore = remarksRows[0].taskandscore;

            // If taskandscore is not found, initialize it to an empty object or array
            if (!taskandscore) {
                taskandscore = {};  // You can choose an array if that's your intended structure
            }

            // Ensure taskandscore is in object format before updating it
            if (typeof taskandscore === 'object' || Array.isArray(taskandscore)) {
                if (Array.isArray(taskandscore)) {
                    // If taskandscore is an array, find and update the task
                    let taskFound = false;
                    for (let taskCategory in taskandscore) {
                        const task = taskandscore[taskCategory].find(t => t.taskId === taskId);
                        if (task) {
                            task.score = score;  // Update score for this task
                            taskFound = true;
                            break;
                        }
                    }
                    if (!taskFound) {
                        return res.status(404).send('Task not found in taskandscore array');
                    }
                } else {
                    // If taskandscore is an object, update the score using taskId as the key
                    if (taskandscore[taskId]) {
                        taskandscore[taskId].score = score;
                    } else {
                        console.error('No task found with this taskId:', taskId);
                        return res.status(404).send('Task not found in taskandscore object');
                    }
                }

                // Save the updated taskandscore back to the database
                await db.query('UPDATE remarks SET taskandscore = ? WHERE id = ? AND classId = ?', [JSON.stringify(taskandscore), studentId, classId]);

            } else {
                console.error('taskandscore is neither an array nor an object:', taskandscore);
                return res.status(500).send('Invalid taskandscore format.');
            }
        }

        // Respond with success message
        res.status(200).send({ message: 'Scores updated successfully!' });
    } catch (err) {
        console.error('Error saving scores:', err);
        res.status(500).send('An error occurred while saving the scores');
    }
};

/*
// In your controller (mainController.js)
exports.saveScores = async (req, res) => {
    try {
        const { classId } = req.params;  // Extract classId from route params
        const { studentScores } = req.body;  // Array of student scores to update

        // Loop through studentScores and update each student's taskandscore
        for (let scoreData of studentScores) {
            const { studentId, taskId, score } = scoreData;

            // Get the current taskandscore data for the student
            const [remarksRows] = await db.query('SELECT taskandscore FROM remarks WHERE id = ? AND classId = ?', [studentId, classId]);

            if (!remarksRows.length) {
                return res.status(404).send('No remarks data found for this student');
            }

            let taskandscore = remarksRows[0].taskandscore;

            // If taskandscore is not found, initialize it to an empty object or array
            if (!taskandscore) {
                taskandscore = {};  // You can choose an array if that's your intended structure
            }

            // Ensure taskandscore is in object format before updating it
            if (Array.isArray(taskandscore) || typeof taskandscore === 'object') {
                if (Array.isArray(taskandscore)) {
                    // If taskandscore is an array, find and update the task
                    for (let taskCategory in taskandscore) {
                        const task = taskandscore[taskCategory].find(t => t.taskId === taskId);
                        if (task) {
                            task.score = score;  // Update score for this task
                            break;
                        }
                    }
                } else {
                    // If taskandscore is an object, update the score using taskId as the key
                    if (taskandscore[taskId]) {
                        taskandscore[taskId].score = score;
                    } else {
                        console.error('No task found with this taskId:', taskId);
                    }
                }

                // Save the updated taskandscore back to the database
                await db.query('UPDATE remarks SET taskandscore = ? WHERE id = ? AND classId = ?', [JSON.stringify(taskandscore), studentId, classId]);

            } else {
                console.error('taskandscore is neither an array nor an object:', taskandscore);
                return res.status(500).send('Invalid taskandscore format.');
            }
        }

        // Respond with success message
        res.status(200).send({ message: 'Scores updated successfully!' });
    } catch (err) {
        console.error('Error saving scores:', err);
        res.status(500).send('An error occurred while saving the scores');
    }
};
*/
//========================================================VERY IMPORTANT=====================================================
/*
exports.fetchScoringData = async (req, res) => {
    try {
        const { classId } = req.params;
        const { taskId } = req.query;

        // Query to fetch student data and task data (from remarks table)
        const [rows] = await db.query('SELECT id, student, taskandscore FROM remarks WHERE classId = ?', [classId]);

        if (!rows.length) {
            return res.status(404).send('No data found for this class');
        }

        // Format data to send back to the frontend
        const scoringData = rows.map(row => {
            let taskandscore = JSON.parse(row.taskandscore);
            console.log('taskandscore for student', row.student, ':', taskandscore);  // Add debugging log

            // Define a fallback for maxScore if not found
            let maxScore = 'Not Set';

            // Check for taskId in each category of tasks (writtenWork, performanceTask, exam)
            const categories = ['writtenWork', 'performanceTask', 'exam'];

            // Loop through each category
            categories.forEach(category => {
                const taskData = taskandscore[category].find(task => task.taskId === parseInt(taskId));
                if (taskData) {
                    maxScore = taskData.maxScore;
                }
            });

            return {
                id: row.id,  // studentId
                student: row.student,
                maxScore: maxScore  // Will be 'Not Set' if no matching taskId was found
            };
        });

        res.send(scoringData);
    } catch (err) {
        console.error('Error fetching scoring data:', err);
        res.status(500).send('An error occurred while fetching the data');
    }
};
*/
//==========================================================================================================
/*
// Function to render the scoring data in a table format
function renderScoringTable(scoringData) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';  // Clear any existing data
    
    // Loop through the scoring data and create table rows
    scoringData.forEach(item => {
        const row = document.createElement('tr');
        
        // Create table cells
        const studentCell = document.createElement('td');
        studentCell.textContent = item.student;
        row.appendChild(studentCell);

        const scoreCell = document.createElement('td');
        const scoreInput = document.createElement('input');
        scoreInput.placeholder = "-";
        scoreInput.type = 'number';
        scoreInput.value = item.score || '';  // Display previous score if available
        scoreInput.classList.add('number-input');
        scoreInput.dataset.studentId = item.id; // Add student ID to input's dataset
        scoreCell.appendChild(scoreInput);
        row.appendChild(scoreCell);

        const maxScoreCell = document.createElement('td');
        maxScoreCell.textContent = item.maxScore || 'Not Set';  // Display 'Not Set' if no max score
        row.appendChild(maxScoreCell);

        // Append the row to the table body
        tableBody.appendChild(row);
    });
}
*/

//==========================================================NON WORKINGS=================================================
/*
async function saveScores() {
    const classId = new URLSearchParams(window.location.search).get('classId'); // Get classId from the URL
    const taskId = new URLSearchParams(window.location.search).get('taskId');   // Get taskId from the URL

    // Check if classId and taskId are present
    if (!classId || !taskId) {
        alert('Class ID or Task ID is missing.');
        return;
    }

    // Get all the student scores from the table inputs
    const studentScores = [];
    const inputs = document.querySelectorAll('.number-input'); // Find all input fields with class 'number-input'

    inputs.forEach(input => {
        const studentId = input.dataset.studentId; // Get studentId from the input's dataset
        const score = input.value.trim();  // Get the score entered by the user

        // Validate the score before pushing it to studentScores
        if (!score) {
            alert(`Invalid score for student ${studentId}`);
            return;  // Skip this score if invalid
        }

        // If the score is valid, add it to the studentScores array
        studentScores.push({
            studentId,
            taskId,
            score: parseFloat(score) // Ensure the score is treated as a number
        });
    });

    // Check if there are any student scores to save
    if (studentScores.length === 0) {
        alert('No scores to save.');
        return;
    }

    try {
        console.log('Student Scores:', studentScores);
        // Send the student scores to the backend to save
        const response = await fetch(`/saveScores/${classId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ studentScores })
        });

        // Parse the JSON response
        const data = await response.json();

        // Handle successful saving
        if (response.ok) {
            alert('Scores saved successfully!');
        } else {
            throw new Error(data.message || 'An error occurred while saving the scores.');
        }
    } catch (error) {
        console.error('Error saving scores:', error);
        alert('An error occurred while saving the scores.');
    }
}

// Event listener to handle the "Save" button click
document.querySelector('.saveButton').addEventListener('click', saveScores);

// Function to save scores for the students
/*
async function saveScores() {
    const classId = new URLSearchParams(window.location.search).get('classId'); // Get classId from the URL
    const taskId = new URLSearchParams(window.location.search).get('taskId');   // Get taskId from the URL

    // Check if classId and taskId are present
    if (!classId || !taskId) {
        alert('Class ID or Task ID is missing.');
        return;
    }

    // Get all the student scores from the table inputs
    const studentScores = [];
    const inputs = document.querySelectorAll('.number-input'); // Find all input fields with class 'number-input'

    inputs.forEach(input => {
        const studentId = input.dataset.studentId; // Get studentId from the input's dataset
        const score = input.value;  // Get the score entered by the user

        // Validate the score before pushing it to studentScores
        if (!score) {
            alert(`Invalid score for student ${studentId}`);
            return;  // Skip this score if invalid
        }

        // If the score is valid, add it to the studentScores array
        studentScores.push({
            studentId,
            taskId,
            score: parseFloat(score) // Ensure the score is treated as a number
        });
    });

    // Check if there are any student scores to save
    if (studentScores.length === 0) {
        alert('No scores to save.');
        return;
    }

    try {
        // Send the student scores to the backend to save
        const response = await fetch(`/saveScores/${classId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ studentScores })
        });

        const data = await response.json();

        // Handle successful saving
        if (response.ok) {
            alert('Scores saved successfully!');
        } else {
            throw new Error(data.message || 'An error occurred while saving the scores.');
        }
    } catch (error) {
        console.error('Error saving scores:', error);
        alert('An error occurred while saving the scores.');
    }
}

// Event listener to handle the "Save" button click
document.querySelector('.saveButton').addEventListener('click', saveScores);


/*
// Function to save scores for the students
async function saveScores() {
    const classId = new URLSearchParams(window.location.search).get('classId'); // Get classId from the URL
    const taskId = new URLSearchParams(window.location.search).get('taskId');   // Get taskId from the URL

    // Check if classId and taskId are present
    if (!classId || !taskId) {
        alert('Class ID or Task ID is missing.');
        return;
    }

    // Get all the student scores from the table inputs
    const studentScores = [];
    const inputs = document.querySelectorAll('.number-input'); // Find all input fields with class 'number-input'

    inputs.forEach(input => {
        const studentId = input.dataset.studentId; // Get studentId from the input's dataset
        const score = input.value;  // Get the score entered by the user

        // Validate the score before pushing it to studentScores
        if (!score) {
            alert(`Invalid score for student ${studentId}`);
            return;  // Skip this score if invalid
        }

        // If the score is valid, add it to the studentScores array
        studentScores.push({
            studentId,
            taskId,
            score: parseFloat(score) // Ensure the score is treated as a number
        });
    });

    // Check if there are any student scores to save
    if (studentScores.length === 0) {
        alert('No scores to save.');
        return;
    }

    try {
        // Send the student scores to the backend to save
        const response = await fetch(`/saveScores/${classId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ studentScores })
        });

        const data = await response.json();

        // Handle successful saving
        if (response.ok) {
            alert('Scores saved successfully!');
        } else {
            throw new Error(data.message || 'An error occurred while saving the scores.');
        }
    } catch (error) {
        console.error('Error saving scores:', error);
        alert('An error occurred while saving the scores.');
    }
}


// Event listener to handle the "Save" button click
document.querySelector('.saveButton').addEventListener('click', saveScores);


//============================================================================================================
/*
function renderScoringTable() {
    const container = document.querySelector('.container');
                const tableHTML = `
                    <table id="dataTable">
                        <thead>
                            <tr>
                                <th>STUDENT NAME</th>
                                <th>SCORE</th>
                                <th>MAX SCORE</th>
                            </tr>
                        </thead>
                        <tbody>
                                <tr>
                                    <td>Ben Condino</td>
                                    <td><input type="number" class="number-input" placeholder="-"></td>
                                    <td>20</td>
                                </tr>
                                <tr>
                                    <td>Acyma Joson</td>
                                    <td><input type="number" class="number-input" placeholder="-"></td>
                                    <td>20</td>
                                </tr>
                        </tbody>
                    </table>`;

                
                container.innerHTML = tableHTML;

}
document.addEventListener('DOMContentLoaded', renderScoringTable);
*/
//============================================================================
/*
   document.querySelector('.fileUpload').addEventListener('change', function(event) {
      const file = event.target.files[0];
      if (file) {
          const reader = new FileReader();
          
          reader.onload = function(e) {
              const data = new Uint8Array(e.target.result);
              const workbook = XLSX.read(data, { type: 'array' });
              const firstSheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[firstSheetName];
              const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

              // Store the data in localStorage
              localStorage.setItem('studentData', JSON.stringify(jsonData));

              // Redirect to students.html
              window.location.href = 'students.html';
          };

          reader.readAsArrayBuffer(file);
      }
  });*/

  /*
//===================================
exports.saveScores = async (req, res) => {
    try {
        const { classId } = req.params; // Extract classId from route params
        const { studentScores } = req.body; // Array of student scores to update

        console.log('Received student scores:', studentScores);

        // Loop through studentScores and update each student's taskandscore
        for (let scoreData of studentScores) { 
            const { studentId, taskId, score } = scoreData;

            // Convert taskId to a number to ensure type consistency
            const taskIdNumber = Number(taskId);

            // Validate if the score is a valid number
            if (isNaN(score) || score === null || score < 0) {
                console.error(`Invalid score for student ${studentId}: ${score}`);
                return res.status(400).json({ message: `Invalid score for student ${studentId}` });
            }

            // Get the current taskandscore data for the student
            const [remarksRows] = await db.query('SELECT taskandscore FROM remarks WHERE id = ? AND classId = ?', [studentId, classId]);

            if (!remarksRows.length) {
                return res.status(404).json({ message: 'No remarks data found for this student' });
            }

            let taskandscore = remarksRows[0].taskandscore;

            // Log the taskandscore data to check its structure
            console.log('Original taskandscore data:', taskandscore);

            // Check if taskandscore is a string (it might be a JSON string)
            if (typeof taskandscore === 'string') {
                taskandscore = JSON.parse(taskandscore);  // Parse if it's a string
            }

            // If taskandscore is not found or invalid, initialize it to an empty structure
            if (!taskandscore || typeof taskandscore !== 'object' || !taskandscore.writtenWork || !taskandscore.performanceTask || !taskandscore.exam) {
                console.log('Initializing taskandscore to empty structure');
                taskandscore = {
                    writtenWork: [],
                    performanceTask: [],
                    exam: []
                };
            }

            let taskUpdated = false;
            const categories = ['writtenWork', 'performanceTask', 'exam'];

            // Update the score for the task
            categories.forEach(category => {
                const taskIndex = taskandscore[category].findIndex(task => task.taskId === taskIdNumber);  // Use taskIdNumber here
                if (taskIndex !== -1) {
                    taskandscore[category][taskIndex].score = score;
                    taskUpdated = true;
                }
            });

            // If no task was updated
            if (!taskUpdated) {
                console.error(`Task with taskId ${taskId} not found in any category for student ${studentId}`);
                return res.status(404).json({ message: `Task with taskId ${taskId} not found for student ${studentId}` });
            }

            // Log the updated taskandscore
            console.log('Updated taskandscore:', taskandscore);

            // Save the updated taskandscore back to the database
            await db.query('UPDATE remarks SET taskandscore = ? WHERE id = ? AND classId = ?', [JSON.stringify(taskandscore), studentId, classId]);
        }

        // Respond with success message
        res.status(200).json({ message: 'Scores updated successfully!' });
    } catch (err) {
        console.error('Error saving scores:', err);
        res.status(500).json({ message: 'An error occurred while saving the scores' });
    }
};
*/
//=======================================VERY BIG CHANGES================================
/*
exports.saveScores = async (req, res) => {
    try {
        const { classId } = req.params; // Extract classId from route params
        const { studentScores } = req.body; // Array of student scores to update

        console.log('Received student scores:', studentScores);

        for (let scoreData of studentScores) {
            const { studentId, taskId, score } = scoreData;

            // Convert taskId to a number
            const taskIdNumber = Number(taskId);

            // Validate the score
            if (isNaN(score) || score === null || score < 0) {
                console.error(`Invalid score for student ${studentId}: ${score}`);
                return res.status(400).json({ message: `Invalid score for student ${studentId}` });
            }

            // Fetch the current taskandscore and finalremarks data
            const [remarksRows] = await db.query(
                'SELECT taskandscore, finalremark FROM remarks WHERE id = ? AND classId = ?',
                [studentId, classId]
            );

            if (!remarksRows.length) {
                return res.status(404).json({ message: 'No remarks data found for this student' });
            }

            let taskandscore = remarksRows[0].taskandscore;
            let finalremarks = remarksRows[0].finalremarks;

            // Parse taskandscore and finalremarks if they are strings
            if (typeof taskandscore === 'string') taskandscore = JSON.parse(taskandscore);
            if (typeof finalremarks === 'string') finalremarks = JSON.parse(finalremarks);

            // Initialize structures if they are not valid
            taskandscore = taskandscore || { writtenWork: [], performanceTask: [], exam: [] };
            finalremarks = finalremarks || { writtenWork: [], performanceTask: [], exam: [] };

            let taskUpdated = false;
            const categories = ['writtenWork', 'performanceTask', 'exam'];

            // Update the score for the task
            categories.forEach(category => {
                const taskIndex = taskandscore[category].findIndex(task => task.taskId === taskIdNumber);
                if (taskIndex !== -1) {
                    //taskandscore[category][taskIndex].score = score;
                    // Update existing task
                    const task = taskandscore[category][taskIndex];
                    task.score = score;
                    task.rating = 100; // Set default rating to 100
                    task.srating = score * 0.8; // Example calculation for srating (customize as needed)
                    task.percentage = (score / 100) * 100; // Example percentage calculation
                    taskUpdated = true;
                    taskUpdated = true;
                }
            });

            if (!taskUpdated) {
                console.error(`Task with taskId ${taskId} not found in any category for student ${studentId}`);
                return res.status(404).json({ message: `Task with taskId ${taskId} not found for student ${studentId}` });
            }

            // Compute the sum of maxScores for each category and update finalremarks
            const computeMaxScores = category => {
                return taskandscore[category].reduce((sum, task) => sum + task.maxScore, 0);
            };

            categories.forEach(category => {
                const maxScoreSum = computeMaxScores(category);

                if (!finalremarks[category]) finalremarks[category] = [];
                const stEntry = finalremarks[category].find(entry => entry.st !== undefined);

                if (stEntry) {
                    stEntry.st = maxScoreSum; // Update if it exists
                } else {
                    finalremarks[category].push({ st: maxScoreSum }); // Add if not present
                }
            });

            // Save the updated taskandscore and finalremarks to the database
            await db.query(
                'UPDATE remarks SET taskandscore = ?, finalremark = ? WHERE id = ? AND classId = ?',
                [JSON.stringify(taskandscore), JSON.stringify(finalremarks), studentId, classId]
            );

            console.log(`Updated finalremarks for student ${studentId}:`, finalremarks);
        }

        res.status(200).json({ message: 'Scores and finalremark updated successfully!' });
    } catch (err) {
        console.error('Error saving scores and updating finalremarks:', err);
        res.status(500).json({ message: 'An error occurred while saving the scores and updating finalremarks' });
    }
};
*/
//=============================================================MISSKO=====================================================
/*
exports.saveScores = async (req, res) => {
    try {
        const { classId } = req.params; // Extract classId from route params
        const { studentScores } = req.body; // Array of student scores to update

        console.log('Received student scores:', studentScores);

        // Loop through studentScores and update each student's taskandscore
        for (let scoreData of studentScores) { 
            const { studentId, taskId, score } = scoreData;

            // Convert taskId to a number to ensure type consistency
            const taskIdNumber = Number(taskId);

            // Validate if the score is a valid number
            if (isNaN(score) || score === null || score < 0) {
                console.error(`Invalid score for student ${studentId}: ${score}`);
                return res.status(400).json({ message: `Invalid score for student ${studentId}` });
            }

            // Get the current taskandscore data for the student
            const [remarksRows] = await db.query('SELECT taskandscore, finalremark FROM remarks WHERE id = ? AND classId = ?', [studentId, classId]);

            if (!remarksRows.length) {
                return res.status(404).json({ message: 'No remarks data found for this student' });
            }

            let taskandscore = remarksRows[0].taskandscore;
            let finalremark = remarksRows[0].finalremark;

            // Parse taskandscore and finalremark if they are strings
            if (typeof taskandscore === 'string') taskandscore = JSON.parse(taskandscore);
            if (typeof finalremark === 'string') finalremark = JSON.parse(finalremark);

            // Initialize structures if invalid
            taskandscore = taskandscore || { writtenWork: [], performanceTask: [], exam: [] };
            finalremark = finalremark || { writtenWork: [], performanceTask: [], exam: [] };

            let taskUpdated = false;
            const categories = ['writtenWork', 'performanceTask', 'exam'];

            // Update the score for the task and calculate `sst` and `rating`
            categories.forEach(category => {
                const taskIndex = taskandscore[category].findIndex(task => task.taskId === taskIdNumber);
                if (taskIndex !== -1) {
                    taskandscore[category][taskIndex].score = score;
                    //taskandscore[category][taskIndex].rating = 100; // Set rating to 100
                    taskUpdated = true;
                }

                // Calculate the total score (sst) for the category
                const totalScore = taskandscore[category].reduce((sum, task) => sum + (task.score || 0), 0);
                const sstIndex = finalremark[category].findIndex(entry => entry.hasOwnProperty('sst'));

                if (sstIndex !== -1) {
                    finalremark[category][sstIndex].sst = totalScore; // Update sst if it exists
                } else {
                    finalremark[category].push({ sst: totalScore }); // Add sst if not present
                }
            });

            // If no task was updated
            if (!taskUpdated) {
                console.error(`Task with taskId ${taskId} not found in any category for student ${studentId}`);
                return res.status(404).json({ message: `Task with taskId ${taskId} not found for student ${studentId}` });
            }

            // Save the updated taskandscore and finalremark back to the database
            await db.query('UPDATE remarks SET taskandscore = ?, finalremark = ? WHERE id = ? AND classId = ?', 
                [JSON.stringify(taskandscore), JSON.stringify(finalremark), studentId, classId]);

            console.log(`Updated taskandscore and finalremark for student ${studentId}:`, { taskandscore, finalremark });
        }

        // Respond with success message
        res.status(200).json({ message: 'Scores, sst, and rating updated successfully!' });
    } catch (err) {
        console.error('Error saving scores:', err);
        res.status(500).json({ message: 'An error occurred while saving the scores' });
    }
};
*/
//=======================================================FINALS===================================================
/*
exports.saveScores = async (req, res) => {
    try {
        const { classId } = req.params; // Extract classId from route params
        const { studentScores } = req.body; // Array of student scores to update

        console.log('Received student scores:', studentScores);

        // Loop through studentScores and update each student's taskandscore
        for (let scoreData of studentScores) { 
            const { studentId, taskId, score } = scoreData;

            // Convert taskId to a number to ensure type consistency
            const taskIdNumber = Number(taskId);

            // Validate if the score is a valid number
            if (isNaN(score) || score === null || score < 0) {
                console.error(`Invalid score for student ${studentId}: ${score}`);
                return res.status(400).json({ message: `Invalid score for student ${studentId}` });
            }

            // Get the current taskandscore data for the student
            const [remarksRows] = await db.query('SELECT taskandscore, finalremark FROM remarks WHERE id = ? AND classId = ?', [studentId, classId]);

            if (!remarksRows.length) {
                return res.status(404).json({ message: 'No remarks data found for this student' });
            }

            let taskandscore = remarksRows[0].taskandscore;
            let finalremark = remarksRows[0].finalremark;

            // Parse taskandscore and finalremark if they are strings
            if (typeof taskandscore === 'string') taskandscore = JSON.parse(taskandscore);
            if (typeof finalremark === 'string') finalremark = JSON.parse(finalremark);

            // Initialize structures if invalid
            taskandscore = taskandscore || { writtenWork: [], performanceTask: [], exam: [] };
            finalremark = finalremark || { writtenWork: [], performanceTask: [], exam: [] };

            let taskUpdated = false;
            const categories = ['writtenWork', 'performanceTask', 'exam'];

            // Update the score for the task and calculate `sst` and `rating`
            categories.forEach(category => {
                const taskIndex = taskandscore[category].findIndex(task => task.taskId === taskIdNumber);
                if (taskIndex !== -1) {
                    taskandscore[category][taskIndex].score = score;
                    taskandscore[category][taskIndex].rating = 100; // Set rating to 100
                    taskUpdated = true;
                }

                // Calculate the total score (sst) for the category
                const totalScore = taskandscore[category].reduce((sum, task) => sum + (task.score || 0), 0);
                const sstIndex = finalremark[category].findIndex(entry => entry.hasOwnProperty('sst'));

                if (sstIndex !== -1) {
                    finalremark[category][sstIndex].sst = totalScore; // Update sst if it exists
                } else {
                    finalremark[category].push({ sst: totalScore }); // Add sst if not present
                }
            });

            // If no task was updated
            if (!taskUpdated) {
                console.error(`Task with taskId ${taskId} not found in any category for student ${studentId}`);
                return res.status(404).json({ message: `Task with taskId ${taskId} not found for student ${studentId}` });
            }

            // Save the updated taskandscore and finalremark back to the database
            await db.query('UPDATE remarks SET taskandscore = ?, finalremark = ? WHERE id = ? AND classId = ?', 
                [JSON.stringify(taskandscore), JSON.stringify(finalremark), studentId, classId]);

            console.log(`Updated taskandscore and finalremark for student ${studentId}:`, { taskandscore, finalremark });
        }

        // Respond with success message
        res.status(200).json({ message: 'Scores, sst, and rating updated successfully!' });
    } catch (err) {
        console.error('Error saving scores:', err);
        res.status(500).json({ message: 'An error occurred while saving the scores' });
    }
};
*/

/*
//======================================================THIS IS WORKING SO FINE FINE FINE==========================================
exports.saveScores = async (req, res) => {
    try {
        const { classId } = req.params; // Extract classId from route params
        const { studentScores } = req.body; // Array of student scores to update

        console.log('Received student scores:', studentScores);

        // Loop through studentScores and update each student's taskandscore
        for (let scoreData of studentScores) {
            const { studentId, taskId, score } = scoreData;

            // Convert taskId to a number to ensure type consistency
            const taskIdNumber = Number(taskId);

            // Validate if the score is a valid number
            if (isNaN(score) || score === null || score < 0) {
                console.error(`Invalid score for student ${studentId}: ${score}`);
                return res.status(400).json({ message: `Invalid score for student ${studentId}` });
            }

            // Get the current taskandscore data for the student
            const [remarksRows] = await db.query('SELECT taskandscore, finalremark FROM remarks WHERE id = ? AND classId = ?', [studentId, classId]);

            if (!remarksRows.length) {
                return res.status(404).json({ message: 'No remarks data found for this student' });
            }

            let taskandscore = remarksRows[0].taskandscore;
            let finalremark = remarksRows[0].finalremark;

            // Parse taskandscore and finalremark if they are strings
            if (typeof taskandscore === 'string') taskandscore = JSON.parse(taskandscore);
            if (typeof finalremark === 'string') finalremark = JSON.parse(finalremark);

            // Initialize structures if invalid
            taskandscore = taskandscore || { writtenWork: [], performanceTask: [], exam: [] };
            finalremark = finalremark || { writtenWork: [], performanceTask: [], exam: [] };

            let taskUpdated = false;
            const categories = ['writtenWork', 'performanceTask', 'exam'];

            // Update the score for the task and calculate `sst` and `rating`
            categories.forEach(category => {
                const taskIndex = taskandscore[category].findIndex(task => task.taskId === taskIdNumber);
                if (taskIndex !== -1) {
                    taskandscore[category][taskIndex].score = score;
                    taskandscore[category][taskIndex].rating = 100; // Set rating to 100
                    taskUpdated = true;
                }

                // Calculate the total score (sst) for the category
                const totalScore = taskandscore[category].reduce((sum, task) => sum + (task.score || 0), 0);
                const sstIndex = finalremark[category].findIndex(entry => entry.hasOwnProperty('sst'));

                if (sstIndex !== -1) {
                    finalremark[category][sstIndex].sst = totalScore; // Update sst if it exists
                } else {
                    finalremark[category].push({ sst: totalScore }); // Add sst if not present
                }

                // Calculate the total maxScore for the category and store it in "st"
                const totalMaxScore = taskandscore[category].reduce((sum, task) => sum + (task.maxScore || 0), 0);
                const stIndex = finalremark[category].findIndex(entry => entry.hasOwnProperty('st'));

                if (stIndex !== -1) {
                    finalremark[category][stIndex].st = totalMaxScore; // Update st if it exists
                } else {
                    finalremark[category].push({ st: totalMaxScore }); // Add st if not present
                }
            });

            // If no task was updated
            if (!taskUpdated) {
                console.error(`Task with taskId ${taskId} not found in any category for student ${studentId}`);
                return res.status(404).json({ message: `Task with taskId ${taskId} not found for student ${studentId}`});
            }

            // Save the updated taskandscore and finalremark back to the database
            await db.query('UPDATE remarks SET taskandscore = ?, finalremark = ? WHERE id = ? AND classId = ?', 
                [JSON.stringify(taskandscore), JSON.stringify(finalremark), studentId, classId]);

            console.log(`Updated taskandscore and finalremark for student ${studentId}:`, { taskandscore, finalremark });
        }

        // Respond with success message
        res.status(200).json({ message: 'Scores, sst, st, and rating updated successfully!' });
    } catch (err) {
        console.error('Error saving scores:', err);
        res.status(500).json({ message: 'An error occurred while saving the scores' });
    }
};

//=================================================THIS SHIT IS WORKING SO DAMN FINE. IM TRYING MY BEST NOT TO TOUCH THIS PRECIOUS CODE=================================
exports.saveScores = async (req, res) => {
    try {
        const { classId } = req.params; // Extract classId from route params
        const { studentScores } = req.body; // Array of student scores to update

        console.log('Received student scores:', studentScores);

        // Loop through studentScores and update each student's taskandscore
        for (let scoreData of studentScores) {
            const { studentId, taskId, score } = scoreData;

            // Convert taskId to a number to ensure type consistency
            const taskIdNumber = Number(taskId);

            // Validate if the score is a valid number
            if (isNaN(score) || score === null || score < 0) {
                console.error(`Invalid score for student ${studentId}: ${score}`);
                return res.status(400).json({ message: `Invalid score for student ${studentId}` });
            }

            // Get the current taskandscore data for the student
            const [remarksRows] = await db.query('SELECT taskandscore, finalremark FROM remarks WHERE id = ? AND classId = ?', [studentId, classId]);

            if (!remarksRows.length) {
                return res.status(404).json({ message: 'No remarks data found for this student' });
            }

            let taskandscore = remarksRows[0].taskandscore;
            let finalremark = remarksRows[0].finalremark;

            // Parse taskandscore and finalremark if they are strings
            if (typeof taskandscore === 'string') taskandscore = JSON.parse(taskandscore);
            if (typeof finalremark === 'string') finalremark = JSON.parse(finalremark);

            // Initialize structures if invalid
            taskandscore = taskandscore || { writtenWork: [], performanceTask: [], exam: [] };
            finalremark = finalremark || { writtenWork: [], performanceTask: [], exam: [] };

            const categories = ['writtenWork', 'performanceTask', 'exam'];

            // Update the score for the task and calculate sst and rating
            categories.forEach(category => {
                const taskIndex = taskandscore[category].findIndex(task => task.taskId === taskIdNumber);
                if (taskIndex !== -1) {
                    taskandscore[category][taskIndex].score = score;
                    taskUpdated = true;
                }

                // Calculate the total score (sst) for the category
                const totalScore = taskandscore[category].reduce((sum, task) => sum + (task.score || 0), 0);
                const sstIndex = finalremark[category].findIndex(entry => entry.hasOwnProperty('sst'));

                // Ensure that sst exists in finalremark and update it
                if (sstIndex !== -1) {
                    finalremark[category][sstIndex].sst = totalScore; // Update sst if it exists
                } else {
                    finalremark[category].push({ sst: totalScore }); // Add sst if not present
                }

                // Calculate the total maxScore for the category and store it in "st"
                const totalMaxScore = taskandscore[category].reduce((sum, task) => sum + (task.maxScore || 0), 0);
                const stIndex = finalremark[category].findIndex(entry => entry.hasOwnProperty('st'));

                if (stIndex !== -1) {
                    finalremark[category][stIndex].st = totalMaxScore; // Update st if it exists
                } else {
                    finalremark[category].push({ st: totalMaxScore }); // Add st if not present
                }

                // Now calculate srating independently and update the existing property if it exists
                const sst = finalremark[category].find(entry => entry.hasOwnProperty('sst'))?.sst || 0;
                const st = finalremark[category].find(entry => entry.hasOwnProperty('st'))?.st || 0;
                if (sst && st) {
                    const srating = Math.round((sst / st) * 50 + 50); // Apply formula for srating
                    const sratingIndex = finalremark[category].findIndex(entry => entry.hasOwnProperty('srating'));

                    if (sratingIndex !== -1) {
                        finalremark[category][sratingIndex].srating = srating; // Update existing srating
                    } else {
                        finalremark[category].push({ srating }); // Add srating if not present
                    }
                }

                // Add rating property with a default value of 100 if not already present
                if (!finalremark[category].some(entry => entry.hasOwnProperty('rating'))) {
                    finalremark[category].push({ rating: 100 }); // Add default rating if not present
                }
            });

            // Save the updated taskandscore and finalremark back to the database
            await db.query('UPDATE remarks SET taskandscore = ?, finalremark = ? WHERE id = ? AND classId = ?', 
                [JSON.stringify(taskandscore), JSON.stringify(finalremark), studentId, classId]);

            console.log(`Updated taskandscore and finalremark for student ${studentId}:`, { taskandscore, finalremark });
        }

        // Respond with success message
        res.status(200).json({ message: 'Scores, sst, st, rating, and srating updated successfully!' });
    } catch (err) {
        console.error('Error saving scores:', err);
        res.status(500).json({ message: 'An error occurred while saving the scores' });
    }
};
*/
/*

//=========================================WORKS WITH ST, SST, RATING, SRATING, COMPONENTRATE... TO PRECIOUS TO TOUCH=========================

exports.saveScores = async (req, res) => {
    try {
        const { classId } = req.params; // Extract classId from route params
        const { studentScores } = req.body; // Array of student scores to update

        console.log('Received student scores:', studentScores);

        // Loop through studentScores and update each student's taskandscore
        for (let scoreData of studentScores) {
            const { studentId, taskId, score } = scoreData;

            // Convert taskId to a number to ensure type consistency
            const taskIdNumber = Number(taskId);

            // Validate if the score is a valid number
            if (isNaN(score) || score === null || score < 0) {
                console.error(`Invalid score for student ${studentId}: ${score}`);
                return res.status(400).json({ message: `Invalid score for student ${studentId}` });
            }

            // Get the current taskandscore and finalremark data for the student
            const [remarksRows] = await db.query('SELECT taskandscore, finalremark FROM remarks WHERE id = ? AND classId = ?', [studentId, classId]);

            if (!remarksRows.length) {
                return res.status(404).json({ message: 'No remarks data found for this student' });
            }

            let taskandscore = remarksRows[0].taskandscore;
            let finalremark = remarksRows[0].finalremark;

            // Parse taskandscore and finalremark if they are strings
            if (typeof taskandscore === 'string') taskandscore = JSON.parse(taskandscore);
            if (typeof finalremark === 'string') finalremark = JSON.parse(finalremark);

            // Initialize structures if invalid
            taskandscore = taskandscore || { writtenWork: [], performanceTask: [], exam: [] };
            finalremark = finalremark || { writtenWork: [], performanceTask: [], exam: [] };

            const categories = ['writtenWork', 'performanceTask', 'exam'];

            // Fetch the component rates for the class from the classes table
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

            // Loop through each category and update the score and other properties
            categories.forEach(category => {
                const taskIndex = taskandscore[category].findIndex(task => task.taskId === taskIdNumber);
                if (taskIndex !== -1) {
                    taskandscore[category][taskIndex].score = score; // Update task score
                }

                // Calculate the total score (sst) for the category
                const totalScore = taskandscore[category].reduce((sum, task) => sum + (task.score || 0), 0);
                const sstIndex = finalremark[category].findIndex(entry => entry.hasOwnProperty('sst'));

                if (sstIndex !== -1) {
                    finalremark[category][sstIndex].sst = totalScore; // Update sst
                } else {
                    finalremark[category].push({ sst: totalScore }); // Add sst if not present
                }

                // Calculate the total maxScore for the category and store it in "st"
                const totalMaxScore = taskandscore[category].reduce((sum, task) => sum + (task.maxScore || 0), 0);
                const stIndex = finalremark[category].findIndex(entry => entry.hasOwnProperty('st'));

                if (stIndex !== -1) {
                    finalremark[category][stIndex].st = totalMaxScore; // Update st
                } else {
                    finalremark[category].push({ st: totalMaxScore }); // Add st if not present
                }

                // Now calculate srating independently and add it to the category
                const sst = finalremark[category].find(entry => entry.hasOwnProperty('sst'))?.sst || 0;
                const st = finalremark[category].find(entry => entry.hasOwnProperty('st'))?.st || 0;
                if (sst && st) {
                    const srating = Math.round((sst / st) * 50 + 50); // Apply formula for srating
                    finalremark[category].push({ srating }); // Add srating to finalremark
                }

                // Add rating property with a default value of 100 if not already present
                if (!finalremark[category].some(entry => entry.hasOwnProperty('rating'))) {
                    finalremark[category].push({ rating: 100 }); // Add default rating if not present
                }

                // Add componentRate property based on the category
                //finalremark[category].push({ componentRate: componentRates[category] });
                // ** Update componentRate dynamically whenever scores change **
                const componentRateIndex = finalremark[category].findIndex(entry => entry.hasOwnProperty('componentRate'));
                if (componentRateIndex !== -1) {
                    finalremark[category][componentRateIndex].componentRate = componentRates[category]; // Update componentRate if already present
                } else {
                    finalremark[category].push({ componentRate: componentRates[category] }); // Add componentRate if not present
                }
            });

            // Save the updated taskandscore and finalremark back to the database
            await db.query('UPDATE remarks SET taskandscore = ?, finalremark = ? WHERE id = ? AND classId = ?',
                [JSON.stringify(taskandscore), JSON.stringify(finalremark), studentId, classId]);

            console.log(`Updated taskandscore and finalremark for student ${studentId}:`, { taskandscore, finalremark });
        }

        // Respond with success message
        res.status(200).json({ message: 'Scores, componentRate, and other properties updated successfully!' });
    } catch (err) {
        console.error('Error saving scores:', err);
        res.status(500).json({ message: 'An error occurred while saving the scores' });
    }
};
*/
/*
//=========================================== EVERYTHING WORKS WXCEPT THE FUCKING PERCENTAGE. 0.00 INCORECT AS HELL===================
exports.saveScores = async (req, res) => {
    try {
        const { classId } = req.params; // Extract classId from route params
        const { studentScores } = req.body; // Array of student scores to update

        console.log('Received student scores:', studentScores);

        // Loop through studentScores and update each student's taskandscore
        for (let scoreData of studentScores) {
            const { studentId, taskId, score } = scoreData;

            // Convert taskId to a number to ensure type consistency
            const taskIdNumber = Number(taskId);

            // Validate if the score is a valid number
            if (isNaN(score) || score === null || score < 0) {
                console.error(`Invalid score for student ${studentId}: ${score}`);
                return res.status(400).json({ message: `Invalid score for student ${studentId}` });
            }

            // Get the current taskandscore and finalremark data for the student
            const [remarksRows] = await db.query('SELECT taskandscore, finalremark FROM remarks WHERE id = ? AND classId = ?', [studentId, classId]);

            if (!remarksRows.length) {
                return res.status(404).json({ message: 'No remarks data found for this student' });
            }

            let taskandscore = remarksRows[0].taskandscore;
            let finalremark = remarksRows[0].finalremark;

            // Parse taskandscore and finalremark if they are strings
            if (typeof taskandscore === 'string') taskandscore = JSON.parse(taskandscore);
            if (typeof finalremark === 'string') finalremark = JSON.parse(finalremark);

            // Initialize structures if invalid
            taskandscore = taskandscore || { writtenWork: [], performanceTask: [], exam: [] };
            finalremark = finalremark || { writtenWork: [], performanceTask: [], exam: [] };

            const categories = ['writtenWork', 'performanceTask', 'exam'];

            // Fetch the component rates for the class from the classes table
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

            // Loop through each category and update the score and other properties
            categories.forEach(category => {
                const taskIndex = taskandscore[category].findIndex(task => task.taskId === taskIdNumber);
                if (taskIndex !== -1) {
                    taskandscore[category][taskIndex].score = score; // Update task score
                }

                // Calculate the total score (sst) for the category
                const totalScore = taskandscore[category].reduce((sum, task) => sum + (task.score || 0), 0);
                const sstIndex = finalremark[category].findIndex(entry => entry.hasOwnProperty('sst'));

                if (sstIndex !== -1) {
                    finalremark[category][sstIndex].sst = totalScore; // Update sst
                } else {
                    finalremark[category].push({ sst: totalScore }); // Add sst if not present
                }

                // Calculate the total maxScore for the category and store it in "st"
                const totalMaxScore = taskandscore[category].reduce((sum, task) => sum + (task.maxScore || 0), 0);
                const stIndex = finalremark[category].findIndex(entry => entry.hasOwnProperty('st'));

                if (stIndex !== -1) {
                    finalremark[category][stIndex].st = totalMaxScore; // Update st
                } else {
                    finalremark[category].push({ st: totalMaxScore }); // Add st if not present
                }

                // Now calculate srating independently and update it to the category
                const sst = finalremark[category].find(entry => entry.hasOwnProperty('sst'))?.sst || 0;
                const st = finalremark[category].find(entry => entry.hasOwnProperty('st'))?.st || 0;
                if (sst && st) {
                    const srating = Math.round((sst / st) * 50 + 50); // Apply formula for srating

                    // Update srating (ensure it’s not added multiple times)
                    const sratingIndex = finalremark[category].findIndex(entry => entry.hasOwnProperty('srating'));
                    if (sratingIndex !== -1) {
                        finalremark[category][sratingIndex].srating = srating; // Update existing srating
                    } else {
                        finalremark[category].push({ srating }); // Add srating if not present
                    }
                }

                // Add rating property with a default value of 100 if not already present
                if (!finalremark[category].some(entry => entry.hasOwnProperty('rating'))) {
                    finalremark[category].push({ rating: 100 }); // Add default rating if not present
                }

                // Add componentRate property based on the category (ensure it’s updated and not added multiple times)
                const componentRateIndex = finalremark[category].findIndex(entry => entry.hasOwnProperty('componentRate'));
                if (componentRateIndex !== -1) {
                    finalremark[category][componentRateIndex].componentRate = componentRates[category]; // Update componentRate
                } else {
                    finalremark[category].push({ componentRate: componentRates[category] }); // Add componentRate if not present
                }

                // Add percentage property based on the formula srating * (componentRate / 100) (rounded to 2 decimal places)
                const percentageIndex = finalremark[category].findIndex(entry => entry.hasOwnProperty('percentage'));
                if (percentageIndex === -1) {
                    const srating = finalremark[category].find(entry => entry.hasOwnProperty('srating'))?.srating || 0;
                    const componentRate = finalremark[category].find(entry => entry.hasOwnProperty('componentRate'))?.componentRate || 0;

                    // Apply the correct formula: srating * (componentRate / 100)
                    //const percentage = (srating * (componentRate / 100)).toFixed(2); // Round to 2 decimal places
                    const percentage = Math.round(srating * (componentRate / 100) * 100) / 100; // Round to 2 decimal places as a number


                    finalremark[category].push({ percentage }); // Add percentage if not present
                }
            });

            // Save the updated taskandscore and finalremark back to the database
            await db.query('UPDATE remarks SET taskandscore = ?, finalremark = ? WHERE id = ? AND classId = ?',
                [JSON.stringify(taskandscore), JSON.stringify(finalremark), studentId, classId]);

            console.log(`Updated taskandscore and finalremark for student ${studentId}:`, { taskandscore, finalremark });
        }

        // Respond with success message
        res.status(200).json({ message: 'Scores, componentRate, and other properties updated successfully!' });
    } catch (err) {
        console.error('Error saving scores:', err);
        res.status(500).json({ message: 'An error occurred while saving the scores' });
    }
};
*/

/*
//===================================================TO NOMU NOMU PRECIOUS TO TOUCH========================================
exports.saveScores = async (req, res) => {
    try {
        const { classId } = req.params; // Extract classId from route params
        const { studentScores } = req.body; // Array of student scores to update

        console.log('Received student scores:', studentScores);

        for (let scoreData of studentScores) {
            const { studentId, taskId, score } = scoreData;

            const taskIdNumber = Number(taskId);

            if (isNaN(score) || score === null || score < 0) {
                console.error(`Invalid score for student ${studentId}: ${score}`);
                return res.status(400).json({ message: `Invalid score for student ${studentId}` });
            }

            const [remarksRows] = await db.query('SELECT taskandscore, finalremark FROM remarks WHERE id = ? AND classId = ?', [studentId, classId]);
            if (!remarksRows.length) {
                return res.status(404).json({ message: 'No remarks data found for this student' });
            }

            let taskandscore = remarksRows[0].taskandscore;
            let finalremark = remarksRows[0].finalremark;

            if (typeof taskandscore === 'string') taskandscore = JSON.parse(taskandscore);
            if (typeof finalremark === 'string') finalremark = JSON.parse(finalremark);

            taskandscore = taskandscore || { writtenWork: [], performanceTask: [], exam: [] };
            finalremark = finalremark || { writtenWork: [], performanceTask: [], exam: [] };

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

            categories.forEach(category => {
                const taskIndex = taskandscore[category].findIndex(task => task.taskId === taskIdNumber);
                if (taskIndex !== -1) {
                    taskandscore[category][taskIndex].score = score; // Update task score
                }

                const totalScore = taskandscore[category].reduce((sum, task) => sum + (task.score || 0), 0);
                const totalMaxScore = taskandscore[category].reduce((sum, task) => sum + (task.maxScore || 0), 0);

                finalremark[category] = finalremark[category] || [];

                const sstIndex = finalremark[category].findIndex(entry => entry.hasOwnProperty('sst'));
                if (sstIndex !== -1) {
                    finalremark[category][sstIndex].sst = totalScore;
                } else {
                    finalremark[category].push({ sst: totalScore });
                }

                const stIndex = finalremark[category].findIndex(entry => entry.hasOwnProperty('st'));
                if (stIndex !== -1) {
                    finalremark[category][stIndex].st = totalMaxScore;
                } else {
                    finalremark[category].push({ st: totalMaxScore });
                }

                const srating = totalMaxScore ? Math.round((totalScore / totalMaxScore) * 50 + 50) : 0;

                const sratingIndex = finalremark[category].findIndex(entry => entry.hasOwnProperty('srating'));
                if (sratingIndex !== -1) {
                    finalremark[category][sratingIndex].srating = srating;
                } else {
                    finalremark[category].push({ srating });
                }

                const componentRate = componentRates[category];
                const componentRateIndex = finalremark[category].findIndex(entry => entry.hasOwnProperty('componentRate'));
                if (componentRateIndex !== -1) {
                    finalremark[category][componentRateIndex].componentRate = componentRate;
                } else {
                    finalremark[category].push({ componentRate });
                }

                const percentage = Math.round(srating * (componentRate / 100) * 100) / 100;
                const percentageIndex = finalremark[category].findIndex(entry => entry.hasOwnProperty('percentage'));
                if (percentageIndex !== -1) {
                    finalremark[category][percentageIndex].percentage = percentage;
                } else {
                    finalremark[category].push({ percentage });
                }

                if (!finalremark[category].some(entry => entry.hasOwnProperty('rating'))) {
                    finalremark[category].push({ rating: 100 });
                }
            });

            await db.query('UPDATE remarks SET taskandscore = ?, finalremark = ? WHERE id = ? AND classId = ?',
                [JSON.stringify(taskandscore), JSON.stringify(finalremark), studentId, classId]);

            console.log(`Updated taskandscore and finalremark for student ${studentId}:`, { taskandscore, finalremark });
        }

        res.status(200).json({ message: 'Scores, componentRate, and other properties updated successfully!' });
    } catch (err) {
        console.error('Error saving scores:', err);
        res.status(500).json({ message: 'An error occurred while saving the scores' });
    }
};
//=========================================================================================
exports.saveScores = async (req, res) => {
    try {
        const { classId } = req.params; // Extract classId from route params
        const { studentScores } = req.body; // Array of student scores to update

        console.log('Received student scores:', studentScores);

        for (let scoreData of studentScores) {
            const { studentId, taskId, score } = scoreData;

            const taskIdNumber = Number(taskId);

            if (isNaN(score) || score === null || score < 0) {
                console.error(`Invalid score for student ${studentId}: ${score}`);
                return res.status(400).json({ message: `Invalid score for student ${studentId}` });
            }

            const [remarksRows] = await db.query('SELECT taskandscore, finalremark FROM remarks WHERE id = ? AND classId = ?', [studentId, classId]);
            if (!remarksRows.length) {
                return res.status(404).json({ message: 'No remarks data found for this student' });
            }

            let taskandscore = remarksRows[0].taskandscore;
            let finalremark = remarksRows[0].finalremark;

            if (typeof taskandscore === 'string') taskandscore = JSON.parse(taskandscore);
            if (typeof finalremark === 'string') finalremark = JSON.parse(finalremark);

            taskandscore = taskandscore || { writtenWork: [], performanceTask: [], exam: [] };
            finalremark = finalremark || { writtenWork: [], performanceTask: [], exam: [] };

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
                    taskandscore[category][taskIndex].score = score; // Update task score
                }

                const totalScore = taskandscore[category].reduce((sum, task) => sum + (task.score || 0), 0);
                const totalMaxScore = taskandscore[category].reduce((sum, task) => sum + (task.maxScore || 0), 0);

                finalremark[category] = finalremark[category] || [];

                // Update or add properties for 'sst', 'st', 'srating', 'componentRate', 'percentage'
                const sstIndex = finalremark[category].findIndex(entry => entry.hasOwnProperty('sst'));
                if (sstIndex !== -1) {
                    finalremark[category][sstIndex].sst = totalScore;
                } else {
                    finalremark[category].push({ sst: totalScore });
                }

                const stIndex = finalremark[category].findIndex(entry => entry.hasOwnProperty('st'));
                if (stIndex !== -1) {
                    finalremark[category][stIndex].st = totalMaxScore;
                } else {
                    finalremark[category].push({ st: totalMaxScore });
                }

                const srating = totalMaxScore ? Math.round((totalScore / totalMaxScore) * 50 + 50) : 0;
                const sratingIndex = finalremark[category].findIndex(entry => entry.hasOwnProperty('srating'));
                if (sratingIndex !== -1) {
                    finalremark[category][sratingIndex].srating = srating;
                } else {
                    finalremark[category].push({ srating });
                }

                const componentRate = componentRates[category];
                const componentRateIndex = finalremark[category].findIndex(entry => entry.hasOwnProperty('componentRate'));
                if (componentRateIndex !== -1) {
                    finalremark[category][componentRateIndex].componentRate = componentRate;
                } else {
                    finalremark[category].push({ componentRate });
                }

                const percentage = Math.round(srating * (componentRate / 100) * 100) / 100;
                const percentageIndex = finalremark[category].findIndex(entry => entry.hasOwnProperty('percentage'));
                if (percentageIndex !== -1) {
                    finalremark[category][percentageIndex].percentage = percentage;
                } else {
                    finalremark[category].push({ percentage });
                }

                if (!finalremark[category].some(entry => entry.hasOwnProperty('rating'))) {
                    finalremark[category].push({ rating: 100 });
                }

                totalPercentage += percentage; // Add the percentage to the total
            });

            const initialGrade = totalPercentage; // No rounding, just the sum
            const finalGrade = Math.round(initialGrade); // Round only for the final grade

            // Ensure finalremark.remark exists and update its values
            if (!finalremark.remark) {
                finalremark.remark = [];
            }

            // Update the initialGrade and finalGrade
            const remarkData = finalremark.remark.find(entry => entry.initialGrade);
            if (remarkData) {
                remarkData.initialGrade = initialGrade;
                remarkData.finalGrade = finalGrade;
            } else {
                finalremark.remark.push({ initialGrade, finalGrade });
            }

            // Update remarks in the database
            await db.query('UPDATE remarks SET taskandscore = ?, finalremark = ? WHERE id = ? AND classId = ?',
                [JSON.stringify(taskandscore), JSON.stringify(finalremark), studentId, classId]);

            console.log(`Updated taskandscore and finalremark for student ${studentId}:`, { taskandscore, finalremark });
        }

        res.status(200).json({ message: 'Scores, componentRate, and other properties updated successfully!' });
    } catch (err) {
        console.error('Error saving scores:', err);
        res.status(500).json({ message: 'An error occurred while saving the scores' });
    }
};
*/

/*
//===========================================WORKS EVERYTHING EXCEPT RANK AND REMARKS ==========================================
exports.saveScores = async (req, res) => {
    try {
        const { classId } = req.params; // Extract classId from route params
        const { studentScores } = req.body; // Array of student scores to update

        console.log('Received student scores:', studentScores);

        for (let scoreData of studentScores) {
            const { studentId, taskId, score } = scoreData;

            const taskIdNumber = Number(taskId);

            if (isNaN(score) || score === null || score < 0) {
                console.error(`Invalid score for student ${studentId}: ${score}`);
                return res.status(400).json({ message: `Invalid score for student ${studentId}` });
            }

            const [remarksRows] = await db.query('SELECT taskandscore, finalremark FROM remarks WHERE id = ? AND classId = ?', [studentId, classId]);
            if (!remarksRows.length) {
                return res.status(404).json({ message: 'No remarks data found for this student' });
            }

            let taskandscore = remarksRows[0].taskandscore;
            let finalremark = remarksRows[0].finalremark;

            if (typeof taskandscore === 'string') taskandscore = JSON.parse(taskandscore);
            if (typeof finalremark === 'string') finalremark = JSON.parse(finalremark);

            taskandscore = taskandscore || { writtenWork: [], performanceTask: [], exam: [] };
            finalremark = finalremark || { writtenWork: [], performanceTask: [], exam: [] };

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
                    taskandscore[category][taskIndex].score = score; // Update task score
                }

                const totalScore = taskandscore[category].reduce((sum, task) => sum + (task.score || 0), 0);
                const totalMaxScore = taskandscore[category].reduce((sum, task) => sum + (task.maxScore || 0), 0);

                finalremark[category] = finalremark[category] || [];

                // Update or add properties for 'sst', 'st', 'srating', 'componentRate', 'percentage'
                const sstIndex = finalremark[category].findIndex(entry => entry.hasOwnProperty('sst'));
                if (sstIndex !== -1) {
                    finalremark[category][sstIndex].sst = totalScore;
                } else {
                    finalremark[category].push({ sst: totalScore });
                }

                const stIndex = finalremark[category].findIndex(entry => entry.hasOwnProperty('st'));
                if (stIndex !== -1) {
                    finalremark[category][stIndex].st = totalMaxScore;
                } else {
                    finalremark[category].push({ st: totalMaxScore });
                }

                const srating = totalMaxScore ? Math.round((totalScore / totalMaxScore) * 50 + 50) : 0;
                const sratingIndex = finalremark[category].findIndex(entry => entry.hasOwnProperty('srating'));
                if (sratingIndex !== -1) {
                    finalremark[category][sratingIndex].srating = srating;
                } else {
                    finalremark[category].push({ srating });
                }

                const componentRate = componentRates[category];
                const componentRateIndex = finalremark[category].findIndex(entry => entry.hasOwnProperty('componentRate'));
                if (componentRateIndex !== -1) {
                    finalremark[category][componentRateIndex].componentRate = componentRate;
                } else {
                    finalremark[category].push({ componentRate });
                }

                const percentage = Math.round(srating * (componentRate / 100) * 100) / 100;
                const percentageIndex = finalremark[category].findIndex(entry => entry.hasOwnProperty('percentage'));
                if (percentageIndex !== -1) {
                    finalremark[category][percentageIndex].percentage = percentage;
                } else {
                    finalremark[category].push({ percentage });
                }

                if (!finalremark[category].some(entry => entry.hasOwnProperty('rating'))) {
                    finalremark[category].push({ rating: 100 });
                }

                totalPercentage += percentage; // Add the percentage to the total
            });

            const initialGrade = totalPercentage; // No rounding, just the sum
            let finalGrade = Math.round(initialGrade); // Round only for the final grade

            // Assign proficiency level based on finalGrade
            let proficiencyLevel = '';
            if (finalGrade >= 90) {
                proficiencyLevel = 'A';
            } else if (finalGrade >= 85 && finalGrade <= 89) {
                proficiencyLevel = 'P';
            } else if (finalGrade >= 80 && finalGrade <= 84) {
                proficiencyLevel = 'AP';
            } else if (finalGrade >= 75 && finalGrade <= 79) {
                proficiencyLevel = 'D';
            } else {
                proficiencyLevel = 'B';
            }

            // Ensure finalremark.remark exists and update its values
            if (!finalremark.remark) {
                finalremark.remark = [];
            }

            // Update the initialGrade, finalGrade, and proficiencyLevel (No pushing, just update values)
            const remarkData = finalremark.remark.find(entry => entry.initialGrade);
            if (remarkData) {
                remarkData.initialGrade = initialGrade;
                remarkData.finalGrade = finalGrade;
                remarkData.proficiencyLevel = proficiencyLevel; // Update proficiency level
            } else {
                finalremark.remark.push({ initialGrade, finalGrade, proficiencyLevel });
            }

            // Update remarks in the database
            await db.query('UPDATE remarks SET taskandscore = ?, finalremark = ? WHERE id = ? AND classId = ?',
                [JSON.stringify(taskandscore), JSON.stringify(finalremark), studentId, classId]);

            console.log(`Updated taskandscore, finalremark, and proficiencyLevel for student ${studentId}:`, { taskandscore, finalremark, proficiencyLevel });
        }

        res.status(200).json({ message: 'Scores, componentRate, proficiency level, and other properties updated successfully!' });
    } catch (err) {
        console.error('Error saving scores:', err);
        res.status(500).json({ message: 'An error occurred while saving the scores' });
    }
};
*/
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
                    taskandscore[category][taskIndex].score = score; // Update task score
                }

                const totalScore = taskandscore[category].reduce((sum, task) => sum + (task.score || 0), 0);
                const totalMaxScore = taskandscore[category].reduce((sum, task) => sum + (task.maxScore || 0), 0);

                const srating = totalMaxScore ? Math.round((totalScore / totalMaxScore) * 50 + 50) : 0;
                const componentRate = componentRates[category];
                const percentage = Math.round(srating * (componentRate / 100) * 100) / 100;

                totalPercentage += percentage;

                // Update properties in finalremark
                finalremark[category] = [
                    { sst: totalScore },
                    { st: totalMaxScore },
                    { srating },
                    { componentRate },
                    { percentage }
                ];
            });

            // Calculate grades and proficiency level
            const initialGrade = totalPercentage;
            const finalGrade = Math.round(initialGrade);
            const proficiencyLevel =
                finalGrade >= 90 ? 'A' :
                finalGrade >= 85 ? 'P' :
                finalGrade >= 80 ? 'AP' :
                finalGrade >= 75 ? 'D' : 'B';

            const remarksValue = finalGrade >= 75 ? "P" : "F";

            // Update the remark field in finalremark
            finalremark.rating = [
                { initialGrade },
                { finalGrade },
                { proficiencylvl: proficiencyLevel },
                { rank: 1 }, // Placeholder for rank, update this logic if needed
                { remarks: remarksValue }
            ];

            // Update remarks in the database
            await db.query(
                'UPDATE remarks SET taskandscore = ?, finalremark = ? WHERE id = ? AND classId = ?',
                [JSON.stringify(taskandscore), JSON.stringify(finalremark), studentId, classId]
            );

            console.log(`Updated taskandscore and finalremark for student ${studentId}:`, {
                taskandscore,
                finalremark
            });
        }

        // Fetch all students' finalGrade and IDs for the given classId
const [allRemarksRows] = await db.query(
    'SELECT id, finalremark FROM remarks WHERE classId = ?',
    [classId]
);

// Parse finalremarks to extract and sort by finalGrade
const students = allRemarksRows.map(row => {
    const finalremark = JSON.parse(row.finalremark);
    const finalGrade = finalremark.rating?.find(r => r.finalGrade)?.finalGrade || 0;
    return { id: row.id, finalGrade, finalremark };
});

// Sort students by finalGrade in descending order
students.sort((a, b) => b.finalGrade - a.finalGrade);

// Assign ranks and update finalremarks
for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const rank = i + 1;

    // Update rank within the parsed finalremark object
    student.finalremark.rating = student.finalremark.rating.map(item => {
        if (item.rank !== undefined) {
            return { rank }; // Update the rank field
        }
        return item; // Preserve other fields
    });

    // Ensure default rank field exists if not already present
    if (!student.finalremark.rating.some(item => item.rank !== undefined)) {
        student.finalremark.rating.push({ rank });
    }

    // Update the database with the modified finalremark JSON
    await db.query(
        `UPDATE remarks SET finalremark = ? WHERE id = ? AND classId = ?`,
        [JSON.stringify(student.finalremark), student.id, classId]
    );
}

        //rank ends here

        res.status(200).json({ message: 'Scores, remarks, and other properties updated successfully!' });
    } catch (err) {
        console.error('Error saving scores:', err);
        res.status(500).json({ message: 'An error occurred while saving the scores' });
    }
};
*/
/*
exports.saveScores = async (req, res) => {
    try {
        const { classId } = req.params; // Extract classId from route params
        const { studentScores } = req.body; // Array of student scores to update

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
            finalremark = finalremark || { writtenWork: [], performanceTask: [], exam: [] };

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
                    taskandscore[category][taskIndex].score = score; // Update task score
                }

                const totalScore = taskandscore[category].reduce((sum, task) => sum + (task.score || 0), 0);
                const totalMaxScore = taskandscore[category].reduce((sum, task) => sum + (task.maxScore || 0), 0);

                finalremark[category] = finalremark[category] || [];

                // Update or add properties for 'sst', 'st', 'srating', 'componentRate', 'percentage'
                const srating = totalMaxScore ? Math.round((totalScore / totalMaxScore) * 50 + 50) : 0;
                const componentRate = componentRates[category];
                const percentage = Math.round(srating * (componentRate / 100) * 100) / 100;

                totalPercentage += percentage; // Add the percentage to the total
            });

            const initialGrade = totalPercentage; // No rounding, just the sum
            let finalGrade = Math.round(initialGrade); // Round only for the final grade

            // Assign proficiency level based on finalGrade
            let proficiencyLevel = '';
            if (finalGrade >= 90) {
                proficiencyLevel = 'A';
            } else if (finalGrade >= 85 && finalGrade <= 89) {
                proficiencyLevel = 'P';
            } else if (finalGrade >= 80 && finalGrade <= 84) {
                proficiencyLevel = 'AP';
            } else if (finalGrade >= 75 && finalGrade <= 79) {
                proficiencyLevel = 'D';
            } else {
                proficiencyLevel = 'B';
            }

            // Ensure finalremark.remark exists and update its values
            if (!finalremark.remark) {
                finalremark.remark = [];
            }

            // Update the initialGrade, finalGrade, proficiencyLevel, and remarks
            const remarkData = finalremark.remark.find(entry => entry.initialGrade);
            if (remarkData) {
                remarkData.initialGrade = initialGrade;
                remarkData.finalGrade = finalGrade;
                remarkData.proficiencyLevel = proficiencyLevel;
                remarkData.remarks = finalGrade >= 75 ? "P" : "F"; // Set remarks value
            } else {
                finalremark.remark.push({
                    initialGrade,
                    finalGrade,
                    proficiencyLevel,
                    remarks: finalGrade >= 75 ? "P" : "F" // Set remarks value
                });
            }

            // Update remarks in the database
            await db.query(
                'UPDATE remarks SET taskandscore = ?, finalremark = ? WHERE id = ? AND classId = ?',
                [JSON.stringify(taskandscore), JSON.stringify(finalremark), studentId, classId]
            );

            console.log(`Updated taskandscore, finalremark, and remarks for student ${studentId}:`, {
                taskandscore,
                finalremark
            });
        }

        res.status(200).json({ message: 'Scores, remarks, and other properties updated successfully!' });
    } catch (err) {
        console.error('Error saving scores:', err);
        res.status(500).json({ message: 'An error occurred while saving the scores' });
    }
};
*/

/*
  function renderTestTable() {
    const table = document.querySelector(".testing");
    const tbl = document.createElement('div');
    tbl.innerHTML = `
         <table>
            <tr class="first-row">
                <th class="snLabel">SN</th>
                <th class="studentnameLabel">Learners' Names</th>
                <th class="lrnLabel">LRN</th>
                <th colspan="12">WRITTEN WORKS</th>
                <th colspan="5">PERFORMANCE TASKS</th>
                <th colspan="3">MIDTERM EXAMINATION</th>
                <th colspan="5">MIDTERM RATING</th>
            </tr>
            <tr class="second-row">
                <th></th>
                <th></th>
                <th></th>
                <th colspan="9">ASSIGNMENTS/SEATWORKS/QUIZZES</th>
                <th class="subtotalLabel" rowspan="2">ST</th>
                <th class="ratingsLabel" rowspan="2">R</th>
                <th class="rateLabel" rowspan="2">%</th>
                <th colspan="2">OUPUTS/ACTIVITIES/CL</th>
                <th class="subtotalLabel" rowspan="2">ST</th>
                <th class="ratingsLabel" rowspan="2">R</th>
                <th class="rateLabel" rowspan="2">%</th>
                <th class="subtotalLabel" rowspan="2">S</th>
                <th class="ratingsLabel" rowspan="2">R</th>
                <th class="rateLabel" rowspan="2">%</th>
                <th rowspan="3">INITIAL GRADE</th>
                <th rowspan="3">GRADE</th>
                <th rowspan="3">PL</th>
                <th rowspan="3">RANK</th>
                <th rowspan="3">REMARKS</th>
            </tr>
            <tr class="third-row">
                <td class="taskLabel" colspan="3">Date accomplished</td>
                <td class="taskNum">1</td>
                <td class="taskNum">2</td>
                <td class="taskNum">3</td>
                <td class="taskNum">4</td>
                <td class="taskNum">5</td>
                <td class="taskNum">6</td>
                <td class="taskNum">7</td>
                <td class="taskNum">8</td>
                <td class="taskNum">9</td>
                <td class="taskNum">1</td>
                <td class="taskNum">2</td>
            </tr>
            <tr class="fourth-row">
                <td class="hpsLabel" colspan="3">Highest Posible score</td>
                <td class="hpsValue">15</td>
                <td class="hpsValue">10</td>
                <td class="hpsValue">10</td>
                <td class="hpsValue">15</td>
                <td class="hpsValue">20</td>
                <td class="hpsValue">10</td>
                <td class="hpsValue">30</td>
                <td class="hpsValue">10</td>
                <td class="hpsValue">20</td>
                <td class="wwSubtotal">140</td>
                <td class="wwRatings">100</td>
                <td class="wwComponentRate">35%</td>
                <td class="hpsValuePt">40</td>
                <td class="hpsValuePt">100</td>
                <td class="ptSubtotal">140</td>
                <td class="ptRatings">100</td>
                <td class="ptComponentRate">45%</td>
                <td class="examSubtotal">60</td>
                <td class="examRatings">100</td>
                <td class="examComponentRate">20%</td>
            </tr>
            <tr class="fifth-row">
                <!--SN-->
                <td class="sn">1</td>
                <!--name-->
                <td class="studentName">Amboy, Kerby Jeff B.</td>
                <!--lrn-->
                <td class="lrn">107957120042</td>
                <!--score in written works-->
                <td>10</td>
                <td>10</td>
                <td>10</td>
                <td>14</td>
                <td>18</td>
                <td>10</td>
                <td>29</td>
                <td>10</td>
                <td>20</td>
                <!--st value (WW)-->
                <td class="wwSubtotalValue">131</td>
                <!--ratings value (WW)-->
                <td class="wwRatingsValue">92</td>
                <!--rate total (WW)-->
                <td class="wwRateValue">30.12</td>
                <!--score in performance tasks-->
                <td>40</td>
                <td>99</td>
                <!--st value (PT)-->
                <td class="ptSubtotalValue">139</td>
                <!--ratings value (PT)-->
                <td class="ptRatingsValue">99</td>
                <!--rate total (Pt)-->
                <td class="ptRateValue">45.99</td>
                <!--score in exam-->
                <td class="examSubtotalValue">55</td>
                <!--ratings value (EXAM)-->
                <td class="examRatingsValue">95</td>
                <!--rate total value (EXAM)-->
                <td class="examRateValue">18.99</td>
                <!--Initial Grade-->
                <td class="initialGrade">95.01</td>
                <!--Final Grade-->
                <td class="finalGrade">95</td>
                <!--Proficiency Level-->
                <td class="proficiencyLevel">A</td>
                <!--Rank-->
                <td class="rank">1</td>
                <!--Remarks-->
                <td class="remark">P</td>
            </tr>
        </table>

    `
    table.appendChild(tbl);

  }

window.onload = renderTestTable;
*/
/* ===================================SHOWS TABLE BUT THE VALUES ARE UNDEFINED=========================================
async function renderClassRecord() {
    const classId = getClassIdFromURL();  // Get the `classId` from the URL
 
    if (!classId) {
        console.error('Class ID not found in URL');
        return;
    }

    try {
        const response = await fetch(`/getClassRecordData/${classId}`, {
            method: 'GET',
            credentials: 'include'  // Include session credentials
        });

        if (response.ok) {
            const classRecordData = await response.json();

            const students = classRecordData[0]?.students || [];  // Ensure students exist

            // Create the table and its elements
            const table = document.createElement('table');
            const thead = document.createElement('thead');
            const tbody = document.createElement('tbody');
            
            // Create the table header
            const headerRow = document.createElement('tr');
            const headers = [
                'SN', 'Student Name', 'LRN', 'WW Scores', 'WW Subtotal', 'WW Ratings', 'WW Rate', 
                'PT Scores', 'PT Subtotal', 'PT Ratings', 'PT Rate', 'Exam Subtotal', 'Exam Ratings', 
                'Exam Rate', 'Initial Grade', 'Final Grade', 'Proficiency Level', 'Rank', 'Remark'
            ];

            headers.forEach(headerText => {
                const th = document.createElement('th');
                th.textContent = headerText;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            // Create table rows for each student
            students.forEach((student, index) => {
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td class="sn">${index + 1}</td>
                    <td class="studentName">${student.name}</td>
                    <td class="lrn">${student.lrn}</td>
                    <td>${student.wwScores ? student.wwScores.join('</td><td>') : ''}</td>
                    <td class="wwSubtotalValue">${student.wwSubtotal}</td>
                    <td class="wwRatingsValue">${student.wwRatings}</td>
                    <td class="wwRateValue">${student.wwRateValue}</td>
                    <td>${student.ptScores ? student.ptScores.join('</td><td>') : ''}</td>
                    <td class="ptSubtotalValue">${student.ptSubtotal}</td>
                    <td class="ptRatingsValue">${student.ptRatings}</td>
                    <td class="ptRateValue">${student.ptRateValue}</td>
                    <td class="examSubtotalValue">${student.examScore}</td>
                    <td class="examRatingsValue">${student.examRatings}</td>
                    <td class="examRateValue">${student.examRateValue}</td>
                    <td class="initialGrade">${student.initialGrade}</td>
                    <td class="finalGrade">${student.finalGrade}</td>
                    <td class="proficiencyLevel">${student.proficiencyLevel}</td>
                    <td class="rank">${student.rank}</td>
                    <td class="remark">${student.remarks}</td>
                `;

                tbody.appendChild(row);
            });

            table.appendChild(tbody);

            // Append the table to the container
            const container = document.querySelector('.testfortable'); // Replace with your actual div class
            container.appendChild(table);
        } else {
            const errorData = await response.json();
            console.error('Error fetching class data:', errorData.message);
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

window.onload = renderClassRecord;
*/
/*==================================WORKING HEADER BIRDS OF A FEATHER YAYYY===========================================
async function renderHeader() {
    const classId = getClassIdFromURL();
     try {
        const response = await fetch(`/getClassRecordData/${classId}`, {
            method: 'GET',
            credentials: 'include'  // Include session credentials
        });

        if (response.ok) {
            const classRecordData = await response.json();

            const classDetails = classRecordData[0]?.classDetails || [];
            const teacher = classRecordData[0]?.teacher || [];

            const container = document.createElement('div')
            container.className = "headerSt"
            container.innerHTML = `
           <div class="mainHeader">
            <div class="left-header">
                <div class="left-child">
                    <img src="/images/scclogo.webp">
                    <div>
                        <h3 class="schoolText">SAMUEL CHRISTIAN COLLEGE OF GENERAL TRIAS, INC</h3>
                        <p>Navarro, General Trias CIty, Cavite</p>
                        <h2 class="text">HIGH SCHOOL DEPARTMENT CLASS RECORD</h2>
                    </div>
                </div>
                <div>
                    <div class="right-child">
                        <div class="labels">
                            <p>Department: </p>
                            <p>School Year:</p>
                            <p>Semester, Term: </p>
                        </div>
                        <div class="values">
                            <p>${teacher.department}</p>
                            <p>2024-2025</p>
                            <p>${classDetails.semester}, ${classDetails.term}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="right-header">
                <div class="right-child">
                    <div class="labels">
                        <p>Subject Code, Title: </p>
                        <p>Grade Level, Strand and Section:</p>
                        <p>Teacher: </p>
                    </div>
                    <div class="values">
                        <p>${classDetails.subjectCode} - ${classDetails.subjectTitle}</p>
                        <p>${classDetails.year} ${classDetails.section}</p>
                        <p>${teacher.name}</p>
                    </div>  
                </div>
            </div>
        </div>
    
            `
            document.querySelector('.header').appendChild(container);
        }

     } catch (error) {
        console.log(error);
     }
}

window.onload = renderHeader;
*/
/*
async function renderClassRecord() {
    const classId = getClassIdFromURL();  // Get the `classId` from the URL

    if (!classId) {
        console.error('Class ID not found in URL');
        return;
    }

    try {
        const response = await fetch(`/getClassRecordData/${classId}`, {
            method: 'GET',
            credentials: 'include'  // Include session credentials
        });

        if (response.ok) {
            const classRecordData = await response.json();
            console.log(classRecordData);  // Add this line to inspect the response structure

            const students = classRecordData[0]?.students || [];  // Ensure students exist

            // Create the table and its elements
            const table = document.createElement('table');
            const thead = document.createElement('thead');
            const tbody = document.createElement('tbody');
            
            // Create the table header
            const headerRow = document.createElement('tr');
            const headers = [
                'SN', 'Student Name', 'LRN', 'WW Scores', 'WW Subtotal', 'WW Ratings', 'WW Rate', 
                'PT Scores', 'PT Subtotal', 'PT Ratings', 'PT Rate', 'Exam Subtotal', 'Exam Ratings', 
                'Exam Rate', 'Initial Grade', 'Final Grade', 'Proficiency Level', 'Rank', 'Remark'
            ];

            headers.forEach(headerText => {
                const th = document.createElement('th');
                th.textContent = headerText;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            // Create table rows for each student
            students.forEach((student, index) => {
                const row = document.createElement('tr');

                row.innerHTML = `
                    <td class="sn">${index + 1}</td>
                    <td class="studentName">${student.A || 'N/A'}</td>  <!-- Add default value if missing -->
                    <td class="lrn">${student.B || 'N/A'}</td>
                    <td>${student.wwScores ? student.wwScores.join('</td><td>') : ''}</td>
                    <td class="wwSubtotalValue">${finalRemark.writtenWork[sst] || 'N/A'}</td>
                    <td class="wwRatingsValue">${student.wwRatings || 'N/A'}</td>
                    <td class="wwRateValue">${student.wwRateValue || 'N/A'}</td>
                    <td>${student.ptScores ? student.ptScores.join('</td><td>') : ''}</td>
                    <td class="ptSubtotalValue">${student.ptSubtotal || 'N/A'}</td>
                    <td class="ptRatingsValue">${student.ptRatings || 'N/A'}</td>
                    <td class="ptRateValue">${student.ptRateValue || 'N/A'}</td>
                    <td class="examSubtotalValue">${student.examScore || 'N/A'}</td>
                    <td class="examRatingsValue">${student.examRatings || 'N/A'}</td>
                    <td class="examRateValue">${student.examRateValue || 'N/A'}</td>
                    <td class="initialGrade">${student.initialGrade || 'N/A'}</td>
                    <td class="finalGrade">${student.finalGrade || 'N/A'}</td>
                    <td class="proficiencyLevel">${student.proficiencyLevel || 'N/A'}</td>
                    <td class="rank">${student.rank || 'N/A'}</td>
                    <td class="remark">${student.remarks || 'N/A'}</td>
                `;

                tbody.appendChild(row);
            });

            table.appendChild(tbody);

            // Append the table to the container
            const container = document.querySelector('.testfortable'); // Replace with your actual div class
            container.appendChild(table);
        } else {
            const errorData = await response.json();
            console.error('Error fetching class data:', errorData.message);
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

window.onload = renderClassRecord;
*/

/*
//==================================================CLASS RECORD TABLE FRONT-ENDING MY LIFE CAUSE ITS NOT WORKING HUHU==================================

async function renderClassRecord() {
    const classId = getClassIdFromURL();  // Get the `classId` from the URL

    if (!classId) {
        console.error('Class ID not found in URL');
        return;
    }

    try {
        const response = await fetch(`/getClassRecordData/${classId}`, {
            method: 'GET',
            credentials: 'include'  // Include session credentials
        });

        if (response.ok) {
            const classRecordData = await response.json();

            //=====================HEADERSSS======================= 
            const classDetails = classRecordData[0]?.classDetails || [];
            const teacher = classRecordData[0]?.teacher || [];

            const container = document.createElement('div')
            container.className = "headerSt"
            container.innerHTML = `
            <div class="mainHeader">
            <div class="left-header">
                <div class="left-child">
                    <img src="/images/scclogo.webp">
                    <div>
                        <h3 class="schoolText">SAMUEL CHRISTIAN COLLEGE OF GENERAL TRIAS, INC</h3>
                        <p>Navarro, General Trias CIty, Cavite</p>
                        <h2 class="text">HIGH SCHOOL DEPARTMENT CLASS RECORD</h2>
                    </div>
                </div>
                <div>
                    <div class="right-child">
                        <div class="labels">
                            <p>Department: </p>
                            <p>School Year:</p>
                            <p>Semester, Term: </p>
                        </div>
                        <div class="values">
                            <p>${teacher.department}</p>
                            <p>2024-2025</p>
                            <p>${classDetails.semester}, ${classDetails.term}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="right-header">
                <div class="right-child">
                    <div class="labels">
                        <p>Subject Code, Title: </p>
                        <p>Grade Level, Strand and Section:</p>
                        <p>Teacher: </p>
                    </div>
                    <div class="values">
                        <p>${classDetails.subjectCode} - ${classDetails.subjectTitle}</p>
                        <p>${classDetails.year} ${classDetails.section}</p>
                        <p>${teacher.name}</p>
                    </div>  
                </div>
            </div>
            </div>
            `
            document.querySelector('.header').appendChild(container);

            //================TABLEEEE!================

            const students = classRecordData[0]?.students || [];  // Ensure students exist
            const remarks = classRecordData[0]?.remarks || {};
            const componentRate = classRecordData[0]?.components || {};


            const tableRows = students.map((student, index) =>  `
            <tr class="studentRow">
               <td class="sn">${index + 1}</td>
               <td class="studentName">${student.A}</td>
               <td class="lrn">${student.B || 'N/A'}</td>
               <td>${student.wwScores ? student.wwScores.map(score => `<td>${score}</td>`).join('') : ''}</td>
               <td class="wwSubtotalValue">n/a</td>
               <td class="wwRatingsValue">${student.wwRatings || 'N/A'}</td>
               <td class="wwRateValue">${student.wwRateValue || 'N/A'}</td>
               <td>${student.ptScores ? student.ptScores.map(score => `<td>${score}</td>`).join('') : ''}</td>
               <td class="ptSubtotalValue"> n/a</td>
               <td class="ptRatingsValue">${student.ptRatings || 'N/A'}</td>
               <td class="ptRateValue">${student.ptRateValue || 'N/A'}</td>
               <td class="examSubtotalValue">n/a</td>
               <td class="examRatingsValue">${student.examRatings || 'N/A'}</td>
               <td class="examRateValue">${student.examRateValue || 'N/A'}</td>
               <td class="initialGrade">${student.initialGrade || 'N/A'}</td>
               <td class="finalGrade">${student.finalGrade || 'N/A'}</td>
               <td class="proficiencyLevel">${student.proficiencyLevel || 'N/A'}</td>
               <td class="rank">${student.rank || 'N/A'}</td>
               <td class="remark">${student.remarks || 'N/A'}</td>
            </tr>
                `
            ).join('');
    

            const tableContainer = document.createElement('div');
            tableContainer.className = "tableStyle";
            tableContainer.innerHTML = `
            <table>
            <tr class="first-row">
                <th class="snLabel">SN</th>
                <th class="studentnameLabel">Learners' Names</th>
                <th class="lrnLabel">LRN</th>
                <th colspan="4">WRITTEN WORKS</th>
                <th colspan="4">PERFORMANCE TASKS</th>
                <th colspan="3">MIDTERM EXAMINATION</th>
                <th colspan="5">MIDTERM RATING</th>
            </tr>
            <tr class="second-row">
                <th></th>
                <th></th>
                <th></th>
                <th>ASSIGNMENTS/SEATWORKS/QUIZZES</th>
                <th class="subtotalLabel">ST</th>
                <th class="ratingsLabel">R</th>
                <th class="rateLabel">%</th>
                <th>OUPUTS/ACTIVITIES/CL</th>
                <th class="subtotalLabel">ST</th>
                <th class="ratingsLabel">R</th>
                <th class="rateLabel">%</th>
                <th class="subtotalLabel">S</th>
                <th class="ratingsLabel">R</th>
                <th class="rateLabel">%</th>
                <th class="initialGrade" rowspan="2">INITIAL GRADE</th>
                <th class="finalGrade" rowspan="2">GRADE</th>
                <th class="proficiencyLevel" rowspan="2">PL</th>
                <th class="rank" rowspan="2">RANK</th>
                <th class="remarks" rowspan="2">REMARKS</th>
            </tr>
            <tr class="third-row">
                <td class="hpsLabel" colspan="3">Highest Possible Score</td>
                <td class="wwHPS"></td>
                <td class="wwSubtotal">${remarks.finalRemark.writtenWork[1]?.st}</td>
                <td class="wwRatings">100</td>
                <td class="wwComponentRate">${componentRate.writtenwork}</td>
                <td class="ptHPS"></td>
                <td class="ptSubtotal">${remarks.finalRemark.performanceTask[1]?.st}</td>
                <td class="ptRatings">100</td>
                <td class="ptComponentRate">${componentRate.performancetask}</td>
                <td class="examSubtotal">${remarks.finalRemark.exam[1]?.st}</td>
                <td class="examRatings">100</td>
                <td class="examComponentRate">${componentRate.exam}</td>
            </tr>
            ${tableRows}`

            
            document.querySelector('.tableContainer').appendChild(tableContainer);
        }
        
    } catch(error) {
        console.log(error);
    }

}

window.onload = renderClassRecord;
*/

//=====================================================old
/*
async function renderClassRecord() {
    const classId = getClassIdFromURL();  // Get the `classId` from the URL
    
    if (!classId) {
        console.error('Class ID not found in URL');
        return;
    }

    try {
        const response = await fetch(`/getClassRecordData/${classId}`, {
            method: 'GET',
            credentials: 'include'  // Include session credentials
        });

        if (response.ok) {
            const classRecordData = await response.json();

            console.log(classRecordData);
        } else {
            const errorData = await response.json();
            console.error('Error fetching class data:', errorData.message);
            classSection.innerHTML = `<p>Error loading class data. Please try again later.</p>`;
        }
    } catch (error) {
        console.error('Fetch error:', error);
        classSection.innerHTML = `<p>Error loading class data.</p>`;
    }
}


// Function to automatically generate the table inside the iframe
function generateTableInIframe() {
    // Get the iframe element
    const iframe = document.querySelector('.tableIframe');
    // Access the iframe's document
    const iframeDoc = iframe.contentWindow.document;
    
    // Open the iframe's document for writing
    iframeDoc.open();
    
    // Write the HTML content for the table
    iframeDoc.write(`
      <!DOCTYPE html>
      <html en="lang">
      <head>
           <meta charset="UTF-8">
           <meta name="viewport" content="width=device-width, initial-scale=1.0">

           <style>
               * {
    font-family: 'Arial Narrow', Arial, sans-serif;
    margin: 0;
    padding:0;
   }
   table, tr {
    border: solid 1px black;
    border-collapse: collapse;
    text-align: center;
    font-size: small;
   }

   th {
    border: solid 1px black;
    border-collapse: collapse;
    text-align: center;
    font-size: small;
   }

   td {
    border: solid 1px black;
    border-collapse: collapse;
    text-align: center;
    font-size: small;
    width: 60px;
   }

.studentnameLabel {
width: 300px;
}

.lrnLabel {
width: 280px;
}



.first-row {
    height: 40px;
}

.second-row{
    height: 35px;
}



.taskLabel, .taskNum, .hpsLabel {
    color: rgb(6, 124, 242);
    font-weight: 600;
}


.hpsValue, .hpsValuePt{
     color: rgb(6, 124, 242);
}

.subtotalLabel, .ratingsLabel, .wwSubtotal, .ptSubtotal {
     color: rgb(155, 20, 155);
}


   .wwSubtotal,
   .wwRatings,
   .ptSubtotal,
   .ptRatings,
   .examSubtotal,
   .examRatings,
   .wwSubtotalValue,
   .wwRatingsValue,
   .ptSubtotalValue,
   .ptRatingsValue,
   .examRatingsValue,
   .examSubtotalValue
    {color: rgb(155, 20, 155);}

   .rateLabel,
   .wwComponentRate,
   .ptComponentRate,
   .examComponentRate,
   .wwRateValue,
   .ptRateValue,
   .examRateValue {
    color: green;
   }
   .finalGrade {
    font-weight: 600;
   }

.generate {
    margin-top: 20px;
}

.thegreatestpreview {
    background-color: rgb(217, 217, 220);
    display: flex;
    flex-direction: column;
    padding: 10px 10px;
    width: 90vw;
    height: 40vh;
}

.ipreym {
    width: 90vw;
    height: 35vh;
}

.buttonSquad {
    margin-top: 10px;
}

.mainHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.mainHeader img {
    width: 60px;
}

.schoolText {width: 270px;}
.text {width: 210px; font-size: 15px; margin-top: 12px;}

.left-header {
    display: flex;
    column-gap: 70px;
    align-items: center;
}

.left-child {
    display: flex;
    column-gap: 15px;
    align-items: center;
}

.right-child {
    display: flex;
    column-gap: 25px;
}

.right-header .right-child {
    display: flex;
    column-gap: 50px;
}

.values p {font-weight: bolder;}
</style>
</head>

      <body>
      <div>
           <div class="mainHeader">
            <div class="left-header">
                <div class="left-child">
                    <img src="/images/scclogo.webp">
                    <div>
                        <h3 class="schoolText">SAMUEL CHRISTIAN COLLEGE OF GENERAL TRIAS, INC</h3>
                        <p>Navarro, General Trias CIty, Cavite</p>
                        <h2 class="text">HIGH SCHOOL DEPARTMENT CLASS RECORD</h2>
                    </div>
                </div>
                <div>
                    <div class="right-child">
                        <div class="labels">
                            <p>Department: </p>
                            <p>School Year:</p>
                            <p>Semester, Term: </p>
                        </div>
                        <div class="values">
                            <p>SENIOR HIGH SCHOOL </p>
                            <p>2024-2025</p>
                            <p>1, 2 </p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="right-header">
                <div class="right-child">
                    <div class="labels">
                        <p>Subject Code, Title: </p>
                        <p>Grade Level, Strand and Section:</p>
                        <p>Teacher: </p>
                    </div>
                    <div class="values">
                        <p>ICT6 - Computer Programming JAVA III </p>
                        <p>12, ICT Olivet</p>
                        <p>Mr. Richard Reforma</p>
                    </div>  
                </div>
            </div>
        </div>
      </div>
      <table>
            <tr class="first-row">
                <th class="snLabel">SN</th>
                <th class="studentnameLabel">Learners' Names</th>
                <th class="lrnLabel">LRN</th>
                <th colspan="12">WRITTEN WORKS</th>
                <th colspan="5">PERFORMANCE TASKS</th>
                <th colspan="3">MIDTERM EXAMINATION</th>
                <th colspan="5">MIDTERM RATING</th>
            </tr>
            <tr class="second-row">
                <th></th>
                <th></th>
                <th></th>
                <th colspan="9">ASSIGNMENTS/SEATWORKS/QUIZZES</th>
                <th class="subtotalLabel" rowspan="2">ST</th>
                <th class="ratingsLabel" rowspan="2">R</th>
                <th class="rateLabel" rowspan="2">%</th>
                <th colspan="2">OUPUTS/ACTIVITIES/CL</th>
                <th class="subtotalLabel" rowspan="2">ST</th>
                <th class="ratingsLabel" rowspan="2">R</th>
                <th class="rateLabel" rowspan="2">%</th>
                <th class="subtotalLabel" rowspan="2">S</th>
                <th class="ratingsLabel" rowspan="2">R</th>
                <th class="rateLabel" rowspan="2">%</th>
                <th rowspan="3">INITIAL GRADE</th>
                <th rowspan="3">GRADE</th>
                <th rowspan="3">PL</th>
                <th rowspan="3">RANK</th>
                <th rowspan="3">REMARKS</th>
            </tr>
            <tr class="third-row">
                <td class="taskLabel" colspan="3">Date accomplished</td>
                <td class="taskNum">1</td>
                <td class="taskNum">2</td>
                <td class="taskNum">3</td>
                <td class="taskNum">4</td>
                <td class="taskNum">5</td>
                <td class="taskNum">6</td>
                <td class="taskNum">7</td>
                <td class="taskNum">8</td>
                <td class="taskNum">9</td>
                <td class="taskNum">1</td>
                <td class="taskNum">2</td>
            </tr>
            <tr class="fourth-row">
                <td class="hpsLabel" colspan="3">Highest Posible score</td>
                <td class="hpsValue">15</td>
                <td class="hpsValue">10</td>
                <td class="hpsValue">10</td>
                <td class="hpsValue">15</td>
                <td class="hpsValue">20</td>
                <td class="hpsValue">10</td>
                <td class="hpsValue">30</td>
                <td class="hpsValue">10</td>
                <td class="hpsValue">20</td>
                <td class="wwSubtotal">140</td>
                <td class="wwRatings">100</td>
                <td class="wwComponentRate">35%</td>
                <td class="hpsValuePt">40</td>
                <td class="hpsValuePt">100</td>
                <td class="ptSubtotal">140</td>
                <td class="ptRatings">100</td>
                <td class="ptComponentRate">45%</td>
                <td class="examSubtotal">60</td>
                <td class="examRatings">100</td>
                <td class="examComponentRate">20%</td>
            </tr>
            <tr class="fifth-row">
                <!--SN-->
                <td class="sn">1</td>
                <!--name-->
                <td class="studentName">Amboy, Kerby Jeff B.</td>
                <!--lrn-->
                <td class="lrn">107957120042</td>
                <!--score in written works-->
                <td>10</td>
                <td>10</td>
                <td>10</td>
                <td>14</td>
                <td>18</td>
                <td>10</td>
                <td>29</td>
                <td>10</td>
                <td>20</td>
                <!--st value (WW)-->
                <td class="wwSubtotalValue">131</td>
                <!--ratings value (WW)-->
                <td class="wwRatingsValue">92</td>
                <!--rate total (WW)-->
                <td class="wwRateValue">30.12</td>
                <!--score in performance tasks-->
                <td>40</td>
                <td>99</td>
                <!--st value (PT)-->
                <td class="ptSubtotalValue">139</td>
                <!--ratings value (PT)-->
                <td class="ptRatingsValue">99</td>
                <!--rate total (Pt)-->
                <td class="ptRateValue">45.99</td>
                <!--score in exam-->
                <td class="examSubtotalValue">55</td>
                <!--ratings value (EXAM)-->
                <td class="examRatingsValue">95</td>
                <!--rate total value (EXAM)-->
                <td class="examRateValue">18.99</td>
                <!--Initial Grade-->
                <td class="initialGrade">95.01</td>
                <!--Final Grade-->
                <td class="finalGrade">95</td>
                <!--Proficiency Level-->
                <td class="proficiencyLevel">A</td>
                <!--Rank-->
                <td class="rank">1</td>
                <!--Remarks-->
                <td class="remark">P</td>
            </tr>
        </table>

    </body>
    </html>
    `);

    // Close the iframe's document
    iframeDoc.close();
  }

  let scale = 1; // Default scale value

    const iframe = document.querySelector('.tableIframe');
    const zoomIn = document.getElementById('zoomIn');
    const zoomOut = document.getElementById('zoomOut');
    const resetZoom = document.getElementById('resetZoom');

    zoomIn.addEventListener('click', () => {
      scale += 0.1; // Increase scale
      iframe.style.transform = `scale(${scale})`;
    });

    zoomOut.addEventListener('click', () => {
      scale = Math.max(scale - 0.1, 0.1); // Decrease scale, minimum 0.1
      iframe.style.transform = `scale(${scale})`;
    });

    resetZoom.addEventListener('click', () => {
      scale = 1; // Reset scale to default
      iframe.style.transform = `scale(${scale})`;
    });

     // Automatically generate the table when the page loads
 window.onload = generateTableInIframe;

*/

/*
function getUserFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('username'); // This will retrieve the username from the URL
}

//===========================fetch data from backend============================
async function fetchUserRecords() {
    const username = getUserFromURL();

    try {
        const response = await fetch(`/records/${username}`);

        if (response.ok) {
            const recordsData = await response.json();
            renderRecords(recordsData);  // Call a function to render the records on the page
        } else {
            alert('Failed to load records');
        }
    } catch (error) {
        console.error('Error fetching records:', error);
        alert('An error occurred while fetching the records');
    }
}
*/
/*
//============================render data on ui====================================
function renderRecords(records) {
    const recordsContainer = document.querySelector('.recordsContainer');

    if (records.length === 0) {
        recordsContainer.innerHTML = '<p>No records available for this user.</p>';
        return;
    }

    // Clear the records container before rendering new records
    recordsContainer.innerHTML = ``;

    // Loop through each record and create a separate div for each one
    records.forEach(record => {
        const classDetails = JSON.parse(record.classRecord).classDetails;


        // Create a div element for the current record
        const recordDiv = document.createElement('div');
        recordDiv.classList.add('record');  // Add a class for styling

        // Add the data-class-id attribute dynamically
        recordDiv.setAttribute('data-class-id', record.classId); 

        // Set the HTML content for the record div
        recordDiv.innerHTML = `
            <div class="left">
               <p class="subjCode">${classDetails.subjectCode}</p>
               <p class="subjTitle">${classDetails.subjectTitle}</p>
            </div>
            <p>${classDetails.year}</p>
            <p class="section">${classDetails.section}</p>
            <div class="center">
               <p>${classDetails.semester}</p>
               <p>${classDetails.term}</p>
            </div>
            <div class="right">
               <button class="view">VIEW</button>
                <button class="status">NO STATUS</button>
               <button class="submit">SUBMIT</button>
            </div>
        `;

        // Append the newly created div to the records container
        recordsContainer.appendChild(recordDiv);

        //===========================================================
         // Get the status button and apply the current record status
         const statusStyle = recordDiv.querySelector('.status');

         if (record.status === "pending") {
             statusStyle.style.backgroundColor = '#3388ff';
             statusStyle.textContent = 'PENDING';
         } else {
             statusStyle.style.backgroundColor = 'rgba(188, 187, 187, 0.862)';
             statusStyle.textContent = 'NO STATUS';
         }
 

        //===========================================================

        recordDiv.querySelector(".submit").addEventListener('click', async () => {
            const userConfirm = confirm("Are you sure you want to submit to the admins?")

            if(!userConfirm){
                window.alert("Submission cancelled.");
                return;
            }

            // Retrieve classId dynamically
            const classId = recordDiv.getAttribute('data-class-id'); 

           try {
               const response = await fetch('/updateApprovalStatus', {
                   method: 'POST',
                   headers: {
                       'Content-Type': 'application/json',
                   },
                   body: JSON.stringify({ classId, status: 'pending' }),
               });
       
               if (response.ok) {
                   window.alert('Submission successful!');

                    // Update the status in the UI
                    statusStyle.style.backgroundColor = '#3388ff';
                    statusStyle.textContent = 'PENDING';
               } else {
                   const error = await response.json();
                   window.alert(`Error: ${error.message}`);
               }
           } catch (err) {
               window.alert('An error occurred while submitting the data.');
               console.error(err);
           }

        })
    });
}

// Render data on UI
function renderRecords(records) {
    const recordsContainer = document.querySelector('.recordsContainer');

    if (records.length === 0) {
        recordsContainer.innerHTML = '<p>No records available for this user.</p>';
        return;
    }

    // Clear the records container before rendering new records
    recordsContainer.innerHTML = ``;

    // Loop through each record and create a separate div for each one
    records.forEach(record => {
        const classDetails = JSON.parse(record.classRecord).classDetails;

        // Create a div element for the current record
        const recordDiv = document.createElement('div');
        recordDiv.classList.add('record');  // Add a class for styling

        // Add the data-class-id attribute dynamically
        recordDiv.setAttribute('data-class-id', record.classId); 

        // Set the HTML content for the record div
        recordDiv.innerHTML = `
            <div class="left">
               <p class="subjCode">${classDetails.subjectCode}</p>
               <p class="subjTitle">${classDetails.subjectTitle}</p>
            </div>
            <p>${classDetails.year}</p>
            <p class="section">${classDetails.section}</p>
            <div class="center">
               <p>${classDetails.semester}</p>
               <p>${classDetails.term}</p>
            </div>
            <div class="right">
               <button class="view">VIEW</button>
               <button class="status">${record.status.toUpperCase()}</button>
               <button class="submit">SUBMIT</button>
            </div>
        `;

        // Append the newly created div to the records container
        recordsContainer.appendChild(recordDiv);

        // Get the status button and apply the current record status
        const statusStyle = recordDiv.querySelector('.status');
        if (record.status === "pending") {
            statusStyle.style.backgroundColor = '#3388ff';
        } else if (record.status === "approved") {
            statusStyle.style.backgroundColor = '#33cc33';
            statusStyle.textContent = 'APPROVED';
        } else {
            statusStyle.style.backgroundColor = '#cc3333';
            statusStyle.textContent = 'DISAPPROVED';
        }

        // Handle the submit button click
        recordDiv.querySelector(".submit").addEventListener('click', async () => {
            const userConfirm = confirm("Are you sure you want to submit to the admins?");

            if (!userConfirm) {
                window.alert("Submission cancelled.");
                return;
            }

            const classId = recordDiv.getAttribute('data-class-id'); 

            try {
                const response = await fetch('/updateApprovalStatus', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ classId, status: 'pending' }),
                });

                if (response.ok) {
                    window.alert('Submission successful!');
                    statusStyle.style.backgroundColor = '#3388ff';
                    statusStyle.textContent = 'PENDING';
                } else {
                    const error = await response.json();
                    window.alert(`Error: ${error.message}`);
                }
            } catch (err) {
                window.alert('An error occurred while submitting the data.');
                console.error(err);
            }
        });
    });
}

// Add event listener to the filter dropdown
document.getElementById('statusFilter').addEventListener('change', function() {
    const selectedStatus = this.value;
    filterRecords(selectedStatus);
});

// Filter records by status
function filterRecords(selectedStatus) {
    const recordsContainer = document.querySelector('.recordsContainer');
    const allRecords = recordsContainer.querySelectorAll('.record');
    
    allRecords.forEach(recordDiv => {
        const statusText = recordDiv.querySelector('.status').textContent.toLowerCase();
        
        if (selectedStatus === 'all' || statusText === selectedStatus) {
            recordDiv.style.display = '';  // Show the record
        } else {
            recordDiv.style.display = 'none';  // Hide the record
        }
    });
}

// Render data on UI
function renderRecords(records) {
    const recordsContainer = document.querySelector('.recordsContainer');

    if (records.length === 0) {
        recordsContainer.innerHTML = '<p>No records available for this user.</p>';
        return;
    }

    // Clear the records container before rendering new records
    recordsContainer.innerHTML = ``;

    // Loop through each record and create a separate div for each one
    records.forEach(record => {
        const classDetails = JSON.parse(record.classRecord).classDetails;

        // Create a div element for the current record
        const recordDiv = document.createElement('div');
        recordDiv.classList.add('record');  // Add a class for styling

        // Add the data-class-id attribute dynamically
        recordDiv.setAttribute('data-class-id', record.classId); 

        // Set the HTML content for the record div
        recordDiv.innerHTML = `
            <div class="left">
               <p class="subjCode">${classDetails.subjectCode}</p>
               <p class="subjTitle">${classDetails.subjectTitle}</p>
            </div>
            <p>${classDetails.year}</p>
            <p class="section">${classDetails.section}</p>
            <div class="center">
               <p>${classDetails.semester}</p>
               <p>${classDetails.term}</p>
            </div>
            <div class="right">
               <button class="view">VIEW</button>
               <button class="status">NO STATUS</button> <!-- Default status is NO STATUS -->
               <button class="submit">SUBMIT</button>
            </div>
        `;

        // Append the newly created div to the records container
        recordsContainer.appendChild(recordDiv);

        // Get the status button and apply the current record status
        const statusStyle = recordDiv.querySelector('.status');
        if (record.status === "pending") {
            statusStyle.style.backgroundColor = '#3388ff';
            statusStyle.textContent = 'PENDING';
        } else {
            statusStyle.style.backgroundColor = 'rgba(188, 187, 187, 0.862)';
            statusStyle.textContent = 'NO STATUS'; // Default to NO STATUS
        }

        // Handle the submit button click
        recordDiv.querySelector(".submit").addEventListener('click', async () => {
            const userConfirm = confirm("Are you sure you want to submit to the admins?");

            if (!userConfirm) {
                window.alert("Submission cancelled.");
                return;
            }

            const classId = recordDiv.getAttribute('data-class-id'); 

            try {
                const response = await fetch('/updateApprovalStatus', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ classId, status: 'pending' }),
                });

                if (response.ok) {
                    window.alert('Submission successful!');
                    // Change status to 'PENDING' in the UI
                    statusStyle.style.backgroundColor = '#3388ff';
                    statusStyle.textContent = 'PENDING'; // Set status to PENDING
                } else {
                    const error = await response.json();
                    window.alert(`Error: ${error.message}`);
                }
            } catch (err) {
                window.alert('An error occurred while submitting the data.');
                console.error(err);
            }
        });
    });
}

// Add event listener for the status filter dropdown
document.getElementById('statusFilter').addEventListener('change', filterRecords);

// Function to filter records based on status
function filterRecords() {
    const filterValue = document.getElementById('statusFilter').value;
    const allRecords = document.querySelectorAll('.record'); // Get all records

    allRecords.forEach(record => {
        const statusText = record.querySelector('.status').textContent.toLowerCase();
        if (filterValue === 'all' || statusText === filterValue) {
            record.style.display = 'block';  // Show the record
        } else {
            record.style.display = 'none';   // Hide the record
        }
    });
}

// Render records based on the data received
function renderRecords(records) {
    const recordsContainer = document.querySelector('.recordsContainer');

    if (records.length === 0) {
        recordsContainer.innerHTML = '<p>No records available for this user.</p>';
        return;
    }

    // Clear the records container before rendering new records
    recordsContainer.innerHTML = ``;

    // Loop through each record and create a separate div for each one
    records.forEach(record => {
        const classDetails = JSON.parse(record.classRecord).classDetails;

        // Create a div element for the current record
        const recordDiv = document.createElement('div');
        recordDiv.classList.add('record');  // Add a class for styling

        // Add the data-class-id attribute dynamically
        recordDiv.setAttribute('data-class-id', record.classId); 

        // Set the HTML content for the record div
        recordDiv.innerHTML = `
            <div class="left">
               <p class="subjCode">${classDetails.subjectCode}</p>
               <p class="subjTitle">${classDetails.subjectTitle}</p>
            </div>
            <p>${classDetails.year}</p>
            <p class="section">${classDetails.section}</p>
            <div class="center">
               <p>${classDetails.semester}</p>
               <p>${classDetails.term}</p>
            </div>
            <div class="right">
               <button class="view">VIEW</button>
               <button class="status">NO STATUS</button>  <!-- Default status is NO STATUS -->
               <button class="submit">SUBMIT</button>
            </div>
        `;

        // Append the newly created div to the records container
        recordsContainer.appendChild(recordDiv);

        // Get the status button and apply the current record status
        const statusStyle = recordDiv.querySelector('.status');


        // Handle the submit button click
        recordDiv.querySelector(".submit").addEventListener('click', async () => {
            const userConfirm = confirm("Are you sure you want to submit to the admins?");

            if (!userConfirm) {
                window.alert("Submission cancelled.");
                return;
            }

            const classId = recordDiv.getAttribute('data-class-id'); 

            try {
                const response = await fetch('/updateApprovalStatus', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ classId, status: 'pending' }),
                });

                if (response.ok) {
                    window.alert('Submission successful!');
                    statusStyle.style.backgroundColor = '#3388ff';
                    statusStyle.textContent = 'PENDING';  // Change status to PENDING
                } else {
                    const error = await response.json();
                    window.alert(`Error: ${error.message}`);
                }
            } catch (err) {
                window.alert('An error occurred while submitting the data.');
                console.error(err);
            }
        });
    });
}

// Call the fetch function when the page loads
fetchUserRecords(); */

/*
function fetchPendingRecords() {
    
    const recordDiv = document.createElement('div');
    recordDiv.className = "recordDivStyle";
    recordDiv.innerHTML = `
           <div class="left">
                <p class="subjCode">ICT1</p>
                <p class="subjTitle">.NET</p>
            </div>
                <p class="year">12</p>
                <p class="section">Olivet</p>
            <div class="center">
                <p>1</p>
                <p>2</p>
            </div>
            <div class="right">
                <button class="view">VIEW</button>
                <button class="status">PENDING</button>
                <button class="approve">APPROVE</button>
                <button class="disapprove">DISAPPROVE</button>
            </div>
    `

    const classRecordContainer = document.querySelector(".classRecordContainer");
    classRecordContainer.appendChild(recordDiv);
}

window.onload = fetchPendingRecords; */

/*
/*

async function fetchPendingRecords() {
    try {
        const response = await fetch('/getPendingRecords'); // Fetch data from the backend
        const records = await response.json();

        console.log('Fetched Records:', records); // Log fetched records for debugging

        const classRecordContainer = document.querySelector('.classRecordContainer');
        classRecordContainer.innerHTML = ''; // Clear existing records

        const statusFilter = document.getElementById('statusFilter');
        const selectedStatus = statusFilter.value.toLowerCase();
        console.log('Selected Status:', selectedStatus); // Log selected status

        const filteredRecords = selectedStatus === 'all'
            ? records
            : records.filter(record => (record.status || '').toLowerCase() === selectedStatus);

        console.log('Filtered Records:', filteredRecords); // Log filtered records for debugging

        if (filteredRecords.length === 0) {
            classRecordContainer.innerHTML = `<p>No records match the selected filter.</p>`;
            return;
        }

        // Render each filtered record
        filteredRecords.forEach(record => {
            const recordDiv = document.createElement('div');
            recordDiv.className = 'recordDivStyle';
            recordDiv.setAttribute('data-class-id', record.classId);

            recordDiv.innerHTML = `
                <div class="left">
                    <p class="subjCode">${record.classDetails?.subjectCode || 'N/A'}</p>
                    <p class="subjTitle">${record.classDetails?.subjectTitle || 'N/A'}</p>
                </div>
                <p class="year">${record.classDetails?.year || 'N/A'}</p>
                <p class="section">${record.classDetails?.section || 'N/A'}</p>
                <div class="center">
                    <p>${record.teacherName || 'N/A'}</p>
                </div>
                <div class="right">
                    <button class="view">VIEW</button>
                    <button class="status">${record.status || 'N/A'}</button>
                    <button class="approve">APPROVE</button>
                    <button class="disapprove">DISAPPROVE</button>
                </div>
            `;

            // Update the status button style
            const statusStyle = recordDiv.querySelector('.status');
            if (record.status === "pending") {
                statusStyle.style.backgroundColor = '#3388ff';
            } else if (record.status === "approved") {
                statusStyle.style.backgroundColor = '#33cc33';
                statusStyle.textContent = 'APPROVED';
            } else if (record.status === "disapproved") {
                statusStyle.style.backgroundColor = '#cc3333';
                statusStyle.textContent = 'DISAPPROVED';
            } else {
                statusStyle.style.backgroundColor = 'rgba(188, 187, 187, 0.862)';
                statusStyle.textContent = 'NO STATUS';
            }

            classRecordContainer.appendChild(recordDiv);
        });

    } catch (error) {
        console.error('Error fetching and rendering records:', error);
    }
}

// Event listener for the status filter dropdown change
document.getElementById('statusFilter').addEventListener('change', fetchPendingRecords);

// Initial call to fetch and render records
fetchPendingRecords();

*/
/*===============================================SORTING NOT WORKING BUT ELSE WOKRS FINE==========================================
async function fetchPendingRecords() {
    try {
        const response = await fetch('/getPendingRecords'); // Fetch data from the backend
        const records = await response.json();

        const classRecordContainer = document.querySelector('.classRecordContainer');
        classRecordContainer.innerHTML = ''; // Clear existing records

        // Log the received records to verify their structure
        console.log('Received records:', records);

        // Get the status filter dropdown
        const statusFilter = document.getElementById('statusFilter');

        // Apply the status filter if selected
        const selectedStatus = statusFilter.value;
        const filteredRecords = selectedStatus === 'all' ? records : records.filter(record => record.status === selectedStatus);

        filteredRecords.forEach(record => {
            console.log('ClassDetails:', record.classDetails); // Log classDetails
            console.log('Status:', record.status); // Log status to verify it's available
            console.log('Teacher Name:', record.teacherName);

            const recordDiv = document.createElement('div');
            recordDiv.className = 'recordDivStyle';
            recordDiv.setAttribute('data-class-id', record.classId);

            // Ensure classDetails is properly populated
            recordDiv.innerHTML = `
                <div class="left">
                    <p class="subjCode">${record.classDetails.classDetails.subjectCode || 'N/A'}</p>
                    <p class="subjTitle">${record.classDetails.classDetails.subjectTitle || 'N/A'}</p>
                </div>
                <p class="year">${record.classDetails.classDetails.year || 'N/A'}</p>
                <p class="section">${record.classDetails.classDetails.section || 'N/A'}</p>
                <div class="center">
                    <p>${record.teacherName || 'N/A'}</p>
                </div>
                <div class="right">
                    <button class="view">VIEW</button>
                    <button class="status">${record.status || 'N/A'}</button>
                    <button class="approve">APPROVE</button>
                    <button class="disapprove">DISAPPROVE</button>
                </div>
            `;

            // Update the status button based on the record's status
            const statusStyle = recordDiv.querySelector('.status');
            if (record.status === "pending") {
                statusStyle.style.backgroundColor = '#3388ff';
            } else if (record.status === "approved") {
                statusStyle.style.backgroundColor = '#33cc33';
                statusStyle.textContent = 'APPROVED';
            } else if (record.status === "disapproved") {
                statusStyle.style.backgroundColor = '#cc3333';
                statusStyle.textContent = 'DISAPPROVED';
            } else {
                statusStyle.style.backgroundColor = 'rgba(188, 187, 187, 0.862)';
                statusStyle.textContent = 'NO STATUS';
            }

            classRecordContainer.appendChild(recordDiv);

            recordDiv.querySelector('.approve').addEventListener('click', async () => {
                const adminConfirm = confirm("Are you sure you want to approve this class record?");

                if (!adminConfirm) {
                    window.alert("Approval cancelled.");
                    return;
                }

                const classId = recordDiv.getAttribute('data-class-id');

                try {
                    const response = await fetch('/updateApprovalStatus', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ classId, status: 'approved' }),
                    });

                    if (response.ok) {
                        window.alert('Submission successful!');
                        statusStyle.style.backgroundColor = '#00FF00';
                        statusStyle.textContent = 'APPROVED';
                    } else {
                        const error = await response.json();
                        window.alert(`Error: ${error.message}`);
                    }
                } catch (err) {
                    window.alert('An error occurred while submitting the data.');
                    console.error(err);
                }
            });

            //======================================================================
            recordDiv.querySelector('.disapprove').addEventListener('click', async () => {
                const adminConfirm = confirm("Are you sure you want to approve this class record?");

                if (!adminConfirm) {
                    window.alert("Approval cancelled.");
                    return;
                }

                const classId = recordDiv.getAttribute('data-class-id');

                try {
                    const response = await fetch('/updateApprovalStatus', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ classId, status: 'disapproved' }),
                    });

                    if (response.ok) {
                        window.alert('Submission successful!');
                        statusStyle.style.backgroundColor = '#FF0000';
                        statusStyle.textContent = 'DISAPPROVED';
                    } else {
                        const error = await response.json();
                        window.alert(`Error: ${error.message}`);
                    }
                } catch (err) {
                    window.alert('An error occurred while submitting the data.');
                    console.error(err);
                }
            })
        });

    } catch (error) {
        console.error('Error fetching pending records:', error);
    }
}

// Event listener for the status filter dropdown change
document.getElementById('statusFilter').addEventListener('change', fetchPendingRecords);

// Initial call to fetch and render records
fetchPendingRecords();

*/
// Add event listener to the status filter dropdown
 // Re-fetch records on status change

//=================================================== WOKING SO SO SO FINE =====================================================
/*
async function fetchPendingRecords() {
    try {
        const response = await fetch('/getPendingRecords'); // Fetch data from the backend
        const records = await response.json();

        const classRecordContainer = document.querySelector('.classRecordContainer');
        classRecordContainer.innerHTML = ''; // Clear existing records

        // Log the received records to verify their structure
        console.log('Received records:', records);

        records.forEach(record => {
            // Log each record to ensure the classDetails exist
            //console.log('Record classDetails:', record);
            console.log('ClassDetails:', record.classDetails); // Log classDetails
            console.log('Status:', record.status); // Log status to verify it's available
            console.log('Teacher Name:', record.teacherName);

            const recordDiv = document.createElement('div');
            recordDiv.className = 'recordDivStyle';

            // Ensure classDetails is properly populated
            recordDiv.innerHTML = `
                <div class="left">
                    <p class="subjCode">${record.classDetails.classDetails.subjectCode || 'N/A'}</p>
                    <p class="subjTitle">${record.classDetails.classDetails.subjectTitle || 'N/A'}</p>
                </div>
                <p class="year">${record.classDetails.classDetails.year || 'N/A'}</p>
                <p class="section">${record.classDetails.classDetails.section || 'N/A'}</p>
                <div class="center">
                    <p>${record.teacherName || 'N/A'}</p>
                <!--
                    <p>${record.classDetails.classDetails.semester || 'N/A'}</p>
                    <p>${record.classDetails.classDetails.term || 'N/A'}</p>
                -->
                </div>
                <div class="right">
                    <button class="view">VIEW</button>
                    <button class="status">${record.status || 'N/A'}</button>
                    <button class="approve">APPROVE</button>
                    <button class="disapprove">DISAPPROVE</button>
                </div>
            `;

            classRecordContainer.appendChild(recordDiv);
        });
    } catch (error) {
        console.error('Error fetching pending records:', error);
    }
}

// Call the function when the page loads
window.onload = fetchPendingRecords;
*/

//===============================================GHUESS WORMD==============================================================
/*
async function fetchPendingRecords() {
    try {
        const response = await fetch('/getPendingRecords'); // Fetch data from the backend
        const records = await response.json();

        const classRecordContainer = document.querySelector('.classRecordContainer');
        classRecordContainer.innerHTML = ''; // Clear existing records

        // Log the received records to verify their structure
        console.log('Received records:', records);

        // Save records for filtering
        window.allRecords = records;

        // Call the filter function initially to load all records
        filterRecords('all');
    } catch (error) {
        console.error('Error fetching pending records:', error);
    }
}

function filterRecords(status) {
    const classRecordContainer = document.querySelector('.classRecordContainer');
    classRecordContainer.innerHTML = ''; // Clear current records

    const filteredRecords = status === 'all'
        ? window.allRecords
        : window.allRecords.filter(record => record.status.toLowerCase() === status.toLowerCase());

    filteredRecords.forEach(record => {
        const recordDiv = document.createElement('div');
        recordDiv.className = 'recordDivStyle';
        recordDiv.setAttribute('data-class-id', record.classId);

        recordDiv.innerHTML = `
            <div class="left">
                <p class="subjCode">${record.classDetails.classDetails.subjectCode || 'N/A'}</p>
                <p class="subjTitle">${record.classDetails.classDetails.subjectTitle || 'N/A'}</p>
            </div>
            <p class="year">${record.classDetails.classDetails.year || 'N/A'}</p>
            <p class="section">${record.classDetails.classDetails.section || 'N/A'}</p>
            <div class="center">
                <p>${record.teacherName || 'N/A'}</p>
            </div>
            <div class="right">
                <button class="view">VIEW</button>
                <button class="status">${record.status || 'N/A'}</button>
                <button class="approve">APPROVE</button>
                <button class="disapprove">DISAPPROVE</button>
            </div>
        `;

        classRecordContainer.appendChild(recordDiv);

         // Update the status button based on the record's status
         const statusStyle = recordDiv.querySelector('.status');
         if (record.status === "pending") {
             statusStyle.style.backgroundColor = 'rgba(188, 187, 187, 0.862)';
         } else if (record.status === "approved") {
             statusStyle.style.backgroundColor = '#33cc33';
             statusStyle.textContent = 'APPROVED';
         } else if (record.status === "disapproved") {
             statusStyle.style.backgroundColor = '#cc3333';
             statusStyle.textContent = 'DISAPPROVED';
         } else {
             statusStyle.style.backgroundColor = 'rgba(188, 187, 187, 0.862)';
             statusStyle.textContent = 'NO STATUS';
         }

        recordDiv.querySelector('.approve').addEventListener('click', async () => {
            const adminConfirm = confirm("Are you sure you want to approve this class record?");

            if (!adminConfirm) {
                window.alert("Approval cancelled.");
                return;
            }

            const classId = recordDiv.getAttribute('data-class-id');

            try {
                const response = await fetch('/updateApprovalStatus', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ classId, status: 'approved' }),
                });

                if (response.ok) {
                    window.alert('Submission successful!');
                    statusStyle.style.backgroundColor = '#00FF00';
                    statusStyle.textContent = 'APPROVED';
                } else {
                    const error = await response.json();
                    window.alert(`Error: ${error.message}`);
                }
            } catch (err) {
                window.alert('An error occurred while submitting the data.');
                console.error(err);
            }
        });

        //======================================================================
        recordDiv.querySelector('.disapprove').addEventListener('click', async () => {
            const adminConfirm = confirm("Are you sure you want to approve this class record?");

            if (!adminConfirm) {
                window.alert("Approval cancelled.");
                return;
            }

            const classId = recordDiv.getAttribute('data-class-id');

            try {
                const response = await fetch('/updateApprovalStatus', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ classId, status: 'disapproved' }),
                });

                if (response.ok) {
                    window.alert('Submission successful!');
                    statusStyle.style.backgroundColor = '#FF0000';
                    statusStyle.textContent = 'DISAPPROVED';
                } else {
                    const error = await response.json();
                    window.alert(`Error: ${error.message}`);
                }
            } catch (err) {
                window.alert('An error occurred while submitting the data.');
                console.error(err);
            }
        })


    });
}

document.getElementById('statusFilter').addEventListener('change', event => {
    const selectedStatus = event.target.value;
    filterRecords(selectedStatus);
});

// Call the function when the page loads
window.onload = fetchPendingRecords;

*/

//======================================================================================================
/*
async function fetchPendingRecords() {
    try {
        const response = await fetch('/getPendingRecords'); // Fetch data from the backend
        const records = await response.json();

        const classRecordContainer = document.querySelector('.classRecordContainer');
        classRecordContainer.innerHTML = ''; // Clear existing records

        // Log the received records to verify their structure
        console.log('Received records:', records);

        // Save records for filtering
        window.allRecords = records;

        // Call the filter function initially to load all records
        filterRecords('all');
    } catch (error) {
        console.error('Error fetching pending records:', error);
    }
}

function applyStatusStyle(recordDiv, status) {
    const statusStyle = recordDiv.querySelector('.status');
    if (status === 'pending') {
        statusStyle.style.backgroundColor = 'rgba(188, 187, 187, 0.862)';
        statusStyle.textContent = 'PENDING';
    } else if (status === 'approved') {
        statusStyle.style.backgroundColor = '#33cc33';
        statusStyle.textContent = 'APPROVED';
    } else if (status === 'disapproved') {
        statusStyle.style.backgroundColor = '#cc3333';
        statusStyle.textContent = 'DISAPPROVED';
    } else {
        statusStyle.style.backgroundColor = 'rgba(188, 187, 187, 0.862)';
        statusStyle.textContent = 'NO STATUS';
    }
}

function filterRecords(status) {
    const classRecordContainer = document.querySelector('.classRecordContainer');
    classRecordContainer.innerHTML = ''; // Clear current records

    const filteredRecords = status === 'all'
        ? window.allRecords
        : window.allRecords.filter(record => record.status.toLowerCase() === status.toLowerCase());

    filteredRecords.forEach(record => {
        const recordDiv = document.createElement('div');
        recordDiv.className = 'recordDivStyle';
        recordDiv.setAttribute('data-class-id', record.classId);

        recordDiv.innerHTML = `
            <div class="left">
                <p class="subjCode">${record.classDetails.classDetails.subjectCode || 'N/A'}</p>
                <p class="subjTitle">${record.classDetails.classDetails.subjectTitle || 'N/A'}</p>
            </div>
            <p class="year">${record.classDetails.classDetails.year || 'N/A'}</p>
            <p class="section">${record.classDetails.classDetails.section || 'N/A'}</p>
            <div class="center">
                <p>${record.teacherName || 'N/A'}</p>
            </div>
            <div class="right">
                <button class="view">VIEW</button>
                <button class="status">${record.status || 'N/A'}</button>
                <button class="approve">APPROVE</button>
                <button class="disapprove">DISAPPROVE</button>
            </div>
        `;

        classRecordContainer.appendChild(recordDiv);

        // Apply the status style based on the record's status
        applyStatusStyle(recordDiv, record.status);

        recordDiv.querySelector('.approve').addEventListener('click', async () => {
            const adminConfirm = confirm('Are you sure you want to approve this class record?');
            if (!adminConfirm) {
                window.alert('Approval cancelled.');
                return;
            }

            const classId = recordDiv.getAttribute('data-class-id');

            try {
                const response = await fetch('/updateApprovalStatus', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ classId, status: 'approved' }),
                });

                if (response.ok) {
                    window.alert('Submission successful!');
                    record.status = 'approved'; // Update the record's status in memory
                    applyStatusStyle(recordDiv, 'approved'); // Apply the new style
                } else {
                    const error = await response.json();
                    window.alert(`Error: ${error.message}`);
                }
            } catch (err) {
                window.alert('An error occurred while submitting the data.');
                console.error(err);
            }
        });

        recordDiv.querySelector('.disapprove').addEventListener('click', async () => {
            const adminConfirm = confirm('Are you sure you want to disapprove this class record?');
            if (!adminConfirm) {
                window.alert('Disapproval cancelled.');
                return;
            }

            const classId = recordDiv.getAttribute('data-class-id');

            try {
                const response = await fetch('/updateApprovalStatus', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ classId, status: 'disapproved' }),
                });

                if (response.ok) {
                    window.alert('Submission successful!');
                    record.status = 'disapproved'; // Update the record's status in memory
                    applyStatusStyle(recordDiv, 'disapproved'); // Apply the new style
                } else {
                    const error = await response.json();
                    window.alert(`Error: ${error.message}`);
                }
            } catch (err) {
                window.alert('An error occurred while submitting the data.');
                console.error(err);
            }
        });
    });
}

document.getElementById('statusFilter').addEventListener('change', event => {
    const selectedStatus = event.target.value;
    filterRecords(selectedStatus);
});

// Call the function when the page loads
window.onload = fetchPendingRecords;
*/

//==================================================================================================
/*
exports.getPendingRecords = async (req, res) => {
    const sql = 'SELECT * FROM records WHERE status = "pending"';
    try {
        const [results] = await db.query(sql);

        // Log the raw data to check the structure
        console.log('Raw Results from DB:', results);

        const processedResults = results.map(record => {
            let classDetails = {};
            let status = record.status || 'N/A';
            let teacherName = record.teacherName || 'N/A';
            let classId = record.classId || 'N/A';

            // Check if classRecord exists and handle both cases (string or object)
            if (record.classRecord) {
                if (typeof record.classRecord === 'string') {
                    // Try to parse if it's a string
                    try {
                        classDetails = JSON.parse(record.classRecord);
                    } catch (error) {
                        console.error('Error parsing classRecord:', error);
                        classDetails = {}; // Fallback if JSON is invalid
                    }
                } else if (typeof record.classRecord === 'object') {
                    // If already an object, use it directly
                    classDetails = record.classRecord;
                }
            }

            // Log classDetails to ensure it's being populated
            console.log('Processed classDetails:', {classDetails, status, teacherName, classId});

            return {classDetails, status, teacherName, classId}; // Return the classDetails directly
        });

        res.json(processedResults); // Send processed results to frontend
    } catch (err) {
        console.error('Error fetching records:', err);
        res.status(500).json({ error: 'Database query failed' });
    }
};

*/


// Backend handler for '/getPendingRecords' route
/*
exports.getPendingRecords = async (req, res) => {
    const sql = 'SELECT * FROM records WHERE status = "pending"';
    
    try {
        const [results] = await db.query(sql); // Execute SQL query

        const transformedResults = results.map(record => {
            let classDetails = {};

            // Log the raw classRecord value to see its content
            console.log('Raw classRecord:', record.classRecord);

            // Check if classRecord exists and parse it
            if (record.classRecord) {
                try {
                    // Attempt to parse the classRecord as JSON
                    classDetails = JSON.parse(record.classRecord);
                } catch (parseError) {
                    console.error('Error parsing classRecord:', parseError);
                    classDetails = {}; // Fallback to empty object if parsing fails
                }
            }

            // Log the parsed classDetails to confirm correct structure
            console.log('Parsed classDetails:', classDetails);

            return {
                classDetails: {
                    subjectCode: classDetails.subjectCode,
                    subjectTitle: classDetails.subjectTitle,
                    year: classDetails.year,
                    section: classDetails.section,
                    semester: classDetails.semester,
                    term: classDetails.term,
                },
                status: record.status || 'pending'
            };
        });

        console.log('Transformed Results:', transformedResults); // Log the transformed results
        res.json(transformedResults); // Send transformed results to the client
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database query failed' }); // Error handling
    }
};

*/

//=====================================================================================================
/*
exports.getPendingRecords = async (req, res) => {
    const sql = 'SELECT * FROM records WHERE status = "pending"';
    try {
        const [results] = await db.query(sql);

        // Log raw database results
        console.log('Raw Results from DB:', JSON.stringify(results, null, 2));

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

        // Log final processed results
        console.log('Processed Results:', JSON.stringify(processedResults, null, 2));

        res.json(processedResults);
    } catch (err) {
        console.error('Error fetching records:', err);
        res.status(500).json({ error: 'Database query failed' });
    }
};
*/

//==============================================================================================
//====================================CHANGE ON MY OWNN=====================================================
/*
exports.getFinalClassRecord = async (req, res) => {
    const classId = req.params.classId;

    try {
        const [finalRecord] = await db.query(`
            SELECT user, classId, teacherName, classRecord, sod, status
            FROM records
            WHERE classId = ?
            `, [classId]);

        if (finalRecord.length === 0) {
            return res.status(404).json({message: 'No records found for given class id'});
        }

        res.status(200).json(finalRecord);
    } catch (error) {
        console.error('Error fetching records by user:', error);
        res.status(500).json({ message: 'Failed to fetch records' });

    }
}
    */

/*
//============================================== SAVE CLASS RECORD ==========================================================
exports.saveClassRecord = async (req, res) => {
    const { classId, user } = req.body; // Receive the classId from the frontend
    //const user = req.session.username; 

    try {
        // Fetch class record data from the database
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

        // Build class record
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

        // Prepare the SOD
        const remarks = classRecord.remarks;
        const proficiencyCounts = remarks.reduce((acc, remark) => {
            const level = remark.finalRemark?.rating[2]?.proficiencylvl;
            acc[level] = (acc[level] || 0) + 1; // Increment count
            return acc;
        }, {});

        const total = remarks.length || 1; // Avoid division by zero
        const sodData = [
            { "A": proficiencyCounts['A'] || 0, "frequency": (((proficiencyCounts['A'] || 0) / total) * 100).toFixed(2) },
            { "P": proficiencyCounts['P'] || 0, "frequency": (((proficiencyCounts['P'] || 0) / total) * 100).toFixed(2) },
            { "AP": proficiencyCounts['AP'] || 0, "frequency": (((proficiencyCounts['AP'] || 0) / total) * 100).toFixed(2) },
            { "D": proficiencyCounts['D'] || 0, "frequency": (((proficiencyCounts['D'] || 0) / total) * 100).toFixed(2) },
            { "B": proficiencyCounts['B'] || 0, "frequency": (((proficiencyCounts['B'] || 0) / total) * 100).toFixed(2) },
            { "I": proficiencyCounts['I'] || 0, "frequency": (((proficiencyCounts['I'] || 0) / total) * 100).toFixed(2) },
            { "Dropped": proficiencyCounts['Dropped'] || 0, "frequency": (((proficiencyCounts['Dropped'] || 0) / total) * 100).toFixed(2) }
        ];

        // Insert into records table
        await db.query(`
            INSERT INTO records (user, classId, classRecord, sod, status)
            VALUES (?, ?, ?, ?, ?)
        `, [
            user,
            classId,
            JSON.stringify(classRecord),
            JSON.stringify(sodData),
            'No Status', // You can dynamically set a status
        ]);

        res.status(200).json({ message: 'Class record saved successfully' });
    } catch (error) {
        console.error('Error saving class record:', error);
        res.status(500).json({ message: 'Failed to save class record' });
    }
};

//=================================================================================================================
*/

/*
exports.getClassRecordData = async (req, res) => {
    const classId = req.params.classId;

    try {
        // Query to fetch data by joining multiple tables
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
                u.department AS teacherDepartment 
            FROM classes c
            LEFT JOIN remarks r ON c.id = r.classId
            INNER JOIN users u ON c.user = u.username
            WHERE c.id = ?
        `, [classId]);

        // Log the raw data from the database
        console.log("Raw Data from Database:", rows);

        if (rows.length === 0) {
            console.log("No data found for the specified class ID.");
            return res.status(404).json({ message: 'No data found for the specified class ID' });
        }

        // Format the data, including parsing JSON fields
        const formattedData = rows.map(row => {
            console.log("Processing row:", row);

            const formattedRow = {
                classId: row.classId,
                classDetails: JSON.parse(row.classDetails), // Parse class details
                students: JSON.parse(row.students),        // Parse students
                tasks: JSON.parse(row.tasks),              // Parse tasks
                components: JSON.parse(row.components),    // Parse components
                remarks: {
                    lrn: row.lrn,
                    student: row.student,
                    taskAndScore: JSON.parse(row.taskandscore), // Parse task and score
                    finalRemark: JSON.parse(row.finalremark)    // Parse final remark
                },
                teacher: {
                    name: row.teacherName,
                    department: row.teacherDepartment
                }
            };

            // Log the formatted row
            console.log("Formatted Row:", formattedRow);

            return formattedRow;
        });

        // Log the final formatted data
        console.log("Final Formatted Data:", formattedData);

        res.status(200).json(formattedData);
    } catch (error) {
        console.error("Error fetching class data:", error);
        res.status(500).json({ message: 'Failed to fetch class data' });
    }
};
*/

/*

document.querySelector('.fileUpload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            tableBody.innerHTML = ''; // Clear existing data

            jsonData.forEach((row) => {
                const newRow = document.createElement('tr');

                row.forEach((cell) => {
                    const newCell = document.createElement('td');
                    newCell.textContent = cell;
                    newRow.appendChild(newCell);
                });

                // Create the action cell with the delete button
                const actionCell = document.createElement('td');
                const deleteButton = document.createElement('button');
                deleteButton.innerHTML = "REMOVE";
                deleteButton.className = "removeStudentBtn";
                //deleteButton.addEventListener('click', () => {
                  //  tableBody.removeChild(newRow);
                    //alert('Are you sure you want to remove the student?')
                //});
                deleteButton.addEventListener('click', () => {
                    if (confirm('Are you sure you want to remove the student?')) {
                      tableBody.removeChild(newRow);
                    }
                });

                actionCell.appendChild(deleteButton);
                newRow.appendChild(actionCell);
                
                tableBody.appendChild(newRow);
            });
        };

        reader.readAsArrayBuffer(file);
    }
})
    
*/

//-------------------------------------------------------------------------------------------------------------------------------
//=================================================== BACKUP MALALA VERY SIGNIFICANT ============================================
//-------------------------------------------------------------------------------------------------------------------------------
/*
class AddTask {
    constructor(wwBtn, ptBtn, examBtn) {
        this.wwBtn = wwBtn;
        this.ptBtn = ptBtn;
        this.examBtn = examBtn;
        this.initBtns();
    }

    // initialize event listeners for each button
    initBtns() {
        this.wwBtn.addEventListener('click', () => this.addTask('writtenWork', wwTaskElements));
        this.ptBtn.addEventListener('click', () => this.addTask('performanceTask', ptTaskElements));
        this.examBtn.addEventListener('click', () => this.addTask('exam', examTaskElements));
    }

    // function to add a task to the corresponding container
    addTask(component, container) {
        const taskName = document.querySelector(".taskName").value.trim();
        const maxScore = document.querySelector(".maxScore").value.trim();
        //=======ADD DATE==========
        const dateInput = document.querySelector(".date").value;

        if (taskName === "" || maxScore === "" || dateInput ==="") {
            alert("Please fill out both fields!");
            return;
        }

        //========ADD DATE==========
        const d = new Date(dateInput);
        const date = `${d.getMonth() + 1}-${d.getDate()}`
        console.log("DATE: " + date);

        //const { taskId } = task;
        // Generate a unique taskId (timestamp for simplicity)
        const taskId = `${Date.now()}`;

        const urlParams = new URLSearchParams(window.location.search);
        const classId = urlParams.get('classId');
        const username = urlParams.get('username');

        // construct the URL with query parameters
        const taskUrl = `/tasks.html?classId=${classId}&username=${encodeURIComponent(username)}&taskId=${taskId}`;

        const taskList = document.createElement('ul');
        taskList.className = "wwTaskListStyle";
        taskList.innerHTML = `
            <li class="taskListItems">
                <p class="addedTaskName"><a href="${taskUrl}">${taskName.charAt(0).toUpperCase() + taskName.slice(1)}</a></p>
                <div>
                   <p>${maxScore}</p>
                   <button class="deleteTask"><img src="/images/delete.png"></button>
                </div>
            </li>
        `;
        //http://localhost:5000/tasks.html?classId=2&username=hatdog&taskId=1733748678209
        container.append(taskList);

        document.querySelector(".taskName").value = '';
        document.querySelector(".maxScore").value = '';
        
        // send the task data to the backend
        //this.sendTaskToBackend(component, taskName, maxScore);
        //ADD DATE=============================================
        this.sendTaskToBackend(component, taskName, maxScore, taskId, date)

        const deleteButton = taskList.querySelector(".deleteTask");
        deleteButton.addEventListener('click', () => {
            container.removeChild(taskList); 
            //this.deleteTaskFromBackend(component, taskName, maxScore, taskId); 
            this.deleteTaskFromBackend(component, taskName, maxScore, taskId, date)
        });
    }

    // function to send task data to the backend //======= CHANGES (DATE) =======
    sendTaskToBackend(component, taskName, maxScore, taskId, date) {
        const urlParams = new URLSearchParams(window.location.search);
        const classId = urlParams.get('classId');
        
        fetch(`/addTask/${classId}`, { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                component: component,
                taskName: taskName,
                maxScore: maxScore,
                taskId: taskId,
                date: date //====ADD DATE
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Task saved:', data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
    
    deleteTaskFromBackend(component, taskName, maxScore, taskId, date) {
        const urlParams = new URLSearchParams(window.location.search);
        const classId = urlParams.get('classId'); 
        
        fetch(`/deleteTask/${classId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                classId: classId,
                component: component,
                taskName: taskName,
                maxScore: maxScore,
                taskId: taskId,
                date: date
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Task deleted:', data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}

//======================================================================================================================================================================
function loadTasks() {
    const urlParams = new URLSearchParams(window.location.search);
    const classId = urlParams.get('classId'); 

    fetch(`/getTasks/${classId}`)
        .then(response => response.json())
        .then(tasks => {
            displayTasks(tasks.writtenWork, 'writtenWork', wwTaskElements);
            displayTasks(tasks.performanceTask, 'performanceTask', ptTaskElements);
            displayTasks(tasks.exam, 'exam', examTaskElements);
        })
        .catch(error => {
            console.error('Error loading tasks:', error);
        });
}

function displayTasks(tasksArray, component, container) {
    tasksArray.forEach(task => {
        const { taskId, taskName, maxScore } = task;

        const urlParams = new URLSearchParams(window.location.search);
        const classId = urlParams.get('classId');
        const username = urlParams.get('username');

        // construct the URL with query parameters
        const taskUrl = `/tasks.html?classId=${classId}&username=${encodeURIComponent(username)}&taskId=${taskId}`;

        // maintain the frontend UI format
        const taskList = document.createElement('ul');
        taskList.className = "wwTaskListStyle";
        taskList.innerHTML = `
            <li class="taskListItems">
                <p class="addedTaskName"><a href="${taskUrl}">${taskName.charAt(0).toUpperCase() + taskName.slice(1)}</a></p>
                <div>
                   <p>${maxScore}</p>
                   <button class="deleteTask"><img src="/images/delete.png"></button>
                </div>
            </li>
        `;

        container.append(taskList);
    
        const deleteButton = taskList.querySelector(".deleteTask");
        deleteButton.addEventListener('click', () => {
            const isConfirm = window.confirm("Are you sure you want to delete this task?");
            if (isConfirm) {
                container.removeChild(taskList);
                componentTask.deleteTaskFromBackend(component, taskName, maxScore, taskId); 
            }
        });
    });
}

// instantiate the AddTask class
const componentTask = new AddTask(addWW, addPT, addExam);
*/