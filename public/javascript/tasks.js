

document.querySelector('.back').addEventListener('click', async () => {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const classId = urlParams.get('classId');
        const username = urlParams.get('username');

        if (classId && username) {
            window.location.href = `/class.html?classId=${encodeURIComponent(classId)}&username=${encodeURIComponent(username)}`;
        } else {
            console.error('classId or username is missing from the URL.');
        }
    } catch (error) {
        console.error('Error handling back button click:', error);
    }
});

function getTaskIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const taskId = urlParams.get('taskId');
    console.log('taskId from URL:', taskId);
    return taskId;
}

async function renderTaskName() {
    const taskId = getTaskIdFromURL();
    const urlParams = new URLSearchParams(window.location.search);
    const classId = urlParams.get('classId');

    if (!taskId || !classId) {
        console.error('Missing taskId or classId in URL');
        document.querySelector('.taskSection').innerHTML = `<p>Invalid task or class information.</p>`;
        return;
    }

    try {
        const response = await fetch(`/getTaskById/${taskId}?classId=${classId}`, {
            method: 'GET',
            credentials: 'include'
        });

        console.log('Fetch Response:', response);

        if (response.ok) {
            const data = await response.json();
            console.log('Task Data:', data); 
            document.querySelector('.taskSection').innerHTML = `<h2>${data.taskName}</h2>`;
        } else {
            console.error('Error fetching task data:', await response.text());
            document.querySelector('.taskSection').innerHTML = `<p>Task not found.</p>`;
        }
    } catch (error) {
        console.error('Fetch error:', error);
        document.querySelector('.taskSection').innerHTML = `<p>Error loading task data.</p>`;
    }
}


// call the function to render taskName on page load
document.addEventListener('DOMContentLoaded', renderTaskName);

/*
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        renderTaskName();
        fetchAndRenderScoringData();
    }, 500); // Adjust the delay as needed
});
*/

//============================================ RENDER REAL-TIME SCORING TABLE ===========================================
async function fetchScoringData(classId, taskId) {
    try {
        const response = await fetch(`/fetchScoringData/${classId}?taskId=${taskId}`);

        if (!response.ok) {
            throw new Error('Failed to fetch scoring data');
        }

        const scoringData = await response.json();

        // display the fetched scoring data
        renderScoringTable(scoringData);
    } catch (error) {
        console.error('Error fetching scoring data:', error);
        alert('An error occurred while fetching the scoring data.');
    }
}

// function to render the scoring data in a table format
function renderScoringTable(scoringData) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';  // Clear any existing data

    scoringData.forEach(item => {
        const row = document.createElement('tr');
        
        const studentCell = document.createElement('td');
        studentCell.textContent = item.student;
        row.appendChild(studentCell);

        const scoreCell = document.createElement('td');
        const scoreInput = document.createElement('input');
        scoreInput.placeholder = "-";
        scoreInput.type = 'number';
        scoreInput.value = item.score || '';  
        scoreInput.classList.add('number-input');
        scoreInput.dataset.studentId = item.id; 
        scoreCell.appendChild(scoreInput);
        row.appendChild(scoreCell);

        const maxScoreCell = document.createElement('td');
        maxScoreCell.textContent = item.maxScore || 'Not Set'; 
        row.appendChild(maxScoreCell);

        tableBody.appendChild(row);
    });
}

async function fetchAndRenderScoringData() {
    const classId = new URLSearchParams(window.location.search).get('classId'); 
    const taskId = new URLSearchParams(window.location.search).get('taskId'); 

    if (!classId || !taskId) {
        alert('Class ID or Task ID is missing.');
        return;
    }

    try {
        const response = await fetch(`/fetchScoringData/${classId}?taskId=${taskId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch scoring data');
        }

        const scoringData = await response.json();
        renderScoringTable(scoringData);
    } catch (error) {
        console.error('Error fetching scoring data:', error);
        alert('An error occurred while fetching scoring data.');
    }
}

// call fetchAndRenderScoringData when the page loads
window.addEventListener('DOMContentLoaded', fetchAndRenderScoringData);

//================================================================ SEARCH STUDENT FUNCTION ================================================================
function filterStudents() {
    const searchQuery = document.querySelector('.searchStudentName').value.toLowerCase(); 
    const rows = document.querySelectorAll('#tableBody tr'); 

    rows.forEach(row => {
        const studentName = row.querySelector('td').textContent.toLowerCase(); 
        
        if (studentName.includes(searchQuery)) {
            row.style.display = ''; 
        } else {
            row.style.display = 'none'; 
        }
    });
}

document.querySelector('.searchStudentName').addEventListener('input', filterStudents);
document.addEventListener('DOMContentLoaded', () => {
    const classId = new URLSearchParams(window.location.search).get('classId');
    const taskId = new URLSearchParams(window.location.search).get('taskId');
    
    if (classId && taskId) {
        fetchScoringData(classId, taskId);
    } else {
        alert('Class ID and Task ID are required to fetch scoring data.');
    }
});

//=======================================================================================================================================================================
async function saveScores() {
    const classId = new URLSearchParams(window.location.search).get('classId'); 
    const taskId = new URLSearchParams(window.location.search).get('taskId'); 

    if (!classId || !taskId) {
        alert('Class ID or Task ID is missing.');
        return;
    }

    const studentScores = [];
    const inputs = document.querySelectorAll('.number-input');

    inputs.forEach(input => {
        const studentId = input.dataset.studentId; 
        const score = input.value.trim(); 

        const validScore = score === '' ? 0 : parseFloat(score); 

        if (isNaN(validScore)) {
            alert(`Invalid score for student ${studentId}`);
            return; 
        }

        studentScores.push({
            studentId,
            taskId,
            score: validScore 
        });
    });

    if (studentScores.length === 0) {
        alert('No scores to save.');
        return;
    }

    try {
        console.log('Student Scores:', studentScores);
        const response = await fetch(`/saveScores/${classId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ studentScores })
        });

        const data = await response.json();

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

// event listener to handle the Save button click
document.querySelector('.saveButton').addEventListener('click', saveScores);

function getUsername() {
    const params = new URLSearchParams(window.location.search);
    return params.get("username");
}

const username = getUsername();
document.querySelector(".account").innerHTML = "Logout " + username;

const logout =  async () => {
    const confirmation = window.confirm("Are you sure you want to logout? ");
    if(!confirmation) {
        return;
    }

    try {
        const resp = await fetch('/auth/logout', {
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
        })
        
        if(resp.ok) {
            window.location.href = '/login';
        } else {
            const error = await resp.text();
            alert(`Failed to logout: ${error}`);
        }


    } catch(err) {
        console.log(err);
    }
}

document.querySelector(".account").addEventListener('click', logout);
