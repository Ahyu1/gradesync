
/* 
document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData(this);
    
    fetch('/auth/register', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            window.alert(data.message);  // Show the message as a window alert
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});
*/

/*
document.querySelector('form').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData(this);
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    fetch('/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'  // Tell the server you're sending JSON
        },
        body: JSON.stringify(data)  // Send JSON data
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            window.alert(data.message);  // Show the message as a window alert
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });

    /*
    document.getElementById("fullName").value = ''; document.getElementById("employeeID").value = '';
    document.getElementById("department").value = ''; document.getElementById("advisory").value = '';
    document.getElementById("username").value = ''; document.getElementById("password").value = '';

    
});

*/
//const form = document.getElementById('registerForm');
document.addEventListener('DOMContentLoaded', () => {
const form = document.getElementById('registerForm');
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const fullName = document.getElementById('fullName').value;
    const employeeID = document.getElementById('employeeID').value;
    const department = document.getElementById('department').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const advisory = document.getElementById('advisory').value;

    //=========================================================
    if (!fullName.trim() || !employeeID.trim() || !department.trim() || !username.trim() || !password.trim() || !advisory.trim()) {
        window.alert("All fields require an input.");
        return; 
    }

    const isConfirmed = window.confirm(
        `Are you sure about your details?\n Full Name: ${fullName} Employee ID: ${employeeID} Department: ${department} Username: ${username} Advisory: ${advisory}`
    );

    if (!isConfirmed) {
        return;
    }
 
    if(isConfirmed){
        try {
            const response = await fetch('/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ fullName, employeeID, department, username, password, advisory })
            });
            const data = await response.json();
            console.log("Server Response:", data);

            if(response.ok) {
                window.alert(data.message);
                form.reset();
            } else {
                window.alert(data.message);  
            }
     
        } catch (error) {
            console.error("Fetch error:", error);
        }
        //form.submit();
    }
    /*
    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fullName, employeeID, department, username, password, advisory })
        });
        const data = await response.json();
        console.log("Server Response:", data);
 
    } catch (error) {
        console.error("Fetch error:", error);
    }
        */
});


document.querySelector(".info").addEventListener('click', ()=> {
    const infoDiv = document.createElement('div');
    infoDiv.className = 'infoStyle';
    infoDiv.innerHTML = `
         <div>
            <div class="info--header">
               <h2>ABOUT GRADESYNC</h2>
               <img src="images/x-mark.png" class="x">
            </div>
            <p>"This is the final capstone project developed by group three... blah blah"</p>
         </div>
    `

    const registerContainer = document.querySelector('.registerContainer');

    registerContainer.append(infoDiv);

    document.querySelector('.x').addEventListener('click', ()=> registerContainer.removeChild(infoDiv));

    console.error(error);

})

});