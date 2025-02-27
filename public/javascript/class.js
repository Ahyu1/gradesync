//const settings = document.querySelectorAll(".settings");
//const componentRateContainer = document.querySelector(".component--rate--Container");

const classSection = document.querySelector(".classSection");

function getClassIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('classId');
}

function getUsernameFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('username');
}

document.querySelector('.studentList').addEventListener('click', () => {
    const classId = getClassIdFromURL();  
    const username = getUsernameFromURL();
    window.location.href = `/students.html?classId=${classId}&username=${username}`; 
});

document.querySelector('.generateRecordBtn').addEventListener('click', () => {
    const classId = getClassIdFromURL();  
    const username = getUsernameFromURL();

    const userConfirm = confirm("Are you sure you want to generate class record?");

    if(userConfirm) {
        window.open(`/classRecord.html?classId=${classId}&username=${username}`, '_blank');  // Redirect to student page with classId in the URL
    }else {
        window.alert("Class record generation cancelled.");
        return;
    }
});

async function renderClassSection() {
    const classId = getClassIdFromURL(); 
    
    if (!classId) {
        console.error('Class ID not found in URL');
        return;
    }

    try {
        const response = await fetch(`/getClassById/${classId}`, {
            method: 'GET',
            credentials: 'include' 
        });

        if (response.ok) {
            const classData = await response.json();

            classSection.innerHTML = `
                <h1>${classData.subjectCode} - ${classData.year} ${classData.section}</h1>`;
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

// call the function to render the class data when the page loads
window.onload = renderClassSection;

//======================================================================================================================================================================

const settings = document.querySelectorAll(".settings");
const componentRateContainer = document.querySelector(".component--rate--Container");
settings.forEach(button => { 
    button.addEventListener('click', () => {
        const componentTitle = button.closest('div').querySelector('h2').innerText;
        openSetting(componentTitle);
    });
});

function openSetting(title) {
    const componentSection = document.createElement('div');
    componentSection.className = "component--rate--Section";
    componentSection.innerHTML = `
        <div class="componentRateHeader">
            <h1 class="componentTitle">${title}</h1>
            <button class="exit"><img src="/images/x-mark.png" alt="exitIcon"></button>
        </div>
        <label class="crsl" for="rateInput">Component's Rate: </label><br>
        <input type="number" class="rateInput" placeholder="Enter rate" min="0" max="100"><br><br>
        <input type="button" class="saveRate" value="SAVE">
    `;
    
    componentRateContainer.append(componentSection);

    const exit = componentSection.querySelector(".exit");
    exit.addEventListener('click', () => {
        componentRateContainer.removeChild(componentSection);
    });

    const saveButton = componentSection.querySelector(".saveRate");
    saveButton.addEventListener('click', () => {
        const rateInput = componentSection.querySelector(".rateInput").value.trim();
        
        if (rateInput === "" || isNaN(rateInput) || rateInput < 0 || rateInput > 100) {
            alert("Please enter a valid rate between 0 and 100.");
            return;
        }

        saveComponentRate(title, rateInput);
        componentRateContainer.removeChild(componentSection);
    });
}

function saveComponentRate(componentTitle, rate) {
    const urlParams = new URLSearchParams(window.location.search);
    const classId = urlParams.get('classId'); 

    fetch(`/saveComponentRate/${classId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            component: componentTitle.toLowerCase().replace(" ", ""),
            rate: rate
        })
    })
    .then(response => response.text())
    .then(data => {
        console.log('Rate saved:', data);
        alert('Component rate saved successfully');
    })
    .catch(error => {
        console.error('Error saving component rate:', error);
        alert('An error occurred while saving the component rate');
    });
}


const taskName = document.querySelector(".taskName").value.trim();
const maxScore = document.querySelector(".maxScore").value.trim();
const addWW = document.querySelector(".addWW");
const addPT = document.querySelector(".addPT");
const addExam = document.querySelector(".addExam");
const wwTaskElements = document.querySelector(".wwTaskElements");
const ptTaskElements = document.querySelector(".ptTaskElements");
const examTaskElements = document.querySelector(".examTaskElements");

const clear = document.querySelector(".clear");
clear.addEventListener('click', () => {
    document.querySelector(".taskName").value = '';
    document.querySelector(".maxScore").value = '';
})

const urlParams = new URLSearchParams(window.location.search);
const classId = urlParams.get('classId');
const username = urlParams.get('username');

if (!classId || !username) {
    console.error('classId or username missing in URL');
} else {
    console.log('classId:', classId);
    console.log('username:', username);
}

//=================================================================================================================================
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
            alert("Please fill out all the fields.");
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

//=================================================================================================================================
function getUsername() {
    const params = new URLSearchParams(window.location.search);
    return params.get("username");
}

const user = getUsername();
document.querySelector(".account").innerHTML = "Logout " + user;

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

window.addEventListener('DOMContentLoaded', loadTasks);


//{"writtenWork": [{"taskName": "activity 1", "maxScore": 12}, {"taskName": "output 1", "maxScore": 40}, {"taskName": "seatwork 2", "maxScore": 60}], "performanceTask": [{"taskName": "pt 1", "maxScore": 12}, {"taskName": "pt 2", "maxScore": 40}, {"taskName": "pt 3", "maxScore": 60}], "exam": [{"taskName": "midterm", "maxScore": 12}, {"taskName": "finals", "maxScore": 40}]}
