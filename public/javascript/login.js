/* ======================================================= good but no admin ===============================================
document.addEventListener('DOMContentLoaded', () => {
   const form = document.querySelector('form');
   form.addEventListener('submit', async (event) => {
       event.preventDefault();

       const username = document.getElementById('email').value;
       const password = document.getElementById('password').value;

       // Show confirmation before submitting
       const isConfirmed = window.confirm(
           `Are you sure you want to log in with the username: ${username}?`
       );

       if (!isConfirmed) {
           // If the user cancels, stop the form submission
           return;
       }

       try {
           const response = await fetch('/auth/login', {
               method: 'POST',
               headers: {
                   'Content-Type': 'application/json',
               },
               body: JSON.stringify({ username, password })
           });
           const data = await response.json();

           if (response.ok) {
               // Redirect to the main page if login is successful
               window.location.href = `/main.html?username=${encodeURIComponent(data.username)}`;
           } else {
               // If login failed, show the error message from the backend
               window.alert(data.message);
           }
       } catch (error) {
           console.error('Login error:', error);
           window.alert('An error occurred while trying to log in. Please try again.');
       }
   });
});
*/

//=============================================================== yehey ====================================================

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const isConfirmed = window.confirm(
            `Are you sure you want to log in with the username: ${username}?`
        );

        if (!isConfirmed) {
            return;
        }

        try {
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();

            if (response.ok) {
                if (data.username === 'admin') {
                    window.location.href = '/admin-dashboard.html'; 
                } else {
                    window.location.href = `/main.html?username=${encodeURIComponent(data.username)}`;
                }
            } else {
                window.alert(data.message);
            }
        } catch (error) {
            console.error('Login error:', error);
            window.alert('An error occurred while trying to log in. Please try again.');
        }
    });
});

//=============================================================================================================================================

document.querySelector('.forgotPass').addEventListener('click', () => {
    const form = document.createElement('div');
    form.className = 'fpCon'
    form.innerHTML = `
        <div class="forgetPassheader">
           <h3>Set new password:</h3>
           <img class="exit" src="/images/x-mark.png">
        </div>
        <div class="usernameDiv">
           <h5>Username</h5>
           <input type="text" class="username">
        </div>
        <div class="employeeDiv">
           <h5>Employee Id</h5>
           <input type="number" class="employeeID">
        </div>
        <div class="newpassDiv">
           <h5>New Password</h5>
           <input type="password" class="newPass">
        </div>
        <div class="confirmpassDiv">
           <h5>Confirm Password</h5>
           <input type="password" class="confirmPass">
        </div>
        <p class="error"></p>
        <div class="showpassDiv">
           <input type="checkbox" class="showpassword" name="showpass">
           <label for="showpass">Show Password</label>
        </div>
        <button class="savePass">SAVE</button>
    `

    document.querySelector(".fpContainer").appendChild(form);

    form.querySelector('.exit').addEventListener('click', () => document.querySelector(".fpContainer").removeChild(form));

    form.querySelector('.showpassword').addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        const newPassField = form.querySelector('.newPass');
        const confirmPassField = form.querySelector('.confirmPass');

        newPassField.type = isChecked ? 'text' : 'password';
        confirmPassField.type = isChecked ? 'text' : 'password';
    });

    form.querySelector(".savePass").addEventListener('click', async () => {
        const usercon = confirm("Are you sure you want to change password?")
        if(!usercon) {
            window.alert("Action cancelled.")
            return;
        }
        
        const employeeID = form.querySelector('.employeeID').value;
        const username = form.querySelector(".username").value;
        const newPass = form.querySelector('.newPass').value;
        const confirmPass = form.querySelector('.confirmPass').value;

        if(!employeeID || !username || !newPass || !confirmPass) {
            form.querySelector(".error").innerHTML = 'All field requires an input.';
            return;
        }

        if(newPass !== confirmPass){
            form.querySelector(".error").innerHTML = 'Passwords do not match.'
            return;
        }

        try {
            const response = await fetch('/auth/forgetPassword', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, employeeID, newPass })
            });
    
            const data = await response.json();
    
            if (response.ok) {
                window.alert(data.message);
                //form.reset();
            } else {
                window.alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            window.alert('An error occurred. Please try again.');
        }
        
    })

})


//====================================================================================================================================================
document.querySelector(".info").addEventListener('click', ()=> {
    const infoDiv = document.createElement('div');
    infoDiv.className = 'infoStyle';
    infoDiv.innerHTML = `
         <div>
            <div class="info--header">
               <h2>ABOUT GRADESYNC</h2>
               <img src="images/x-mark.png" class="x">
            </div>
            <p>"Gradesync is a process of updating grades from a system automatically, ensuring consistent transfer records to another"</p>
         </div>
    `

    const loginContainer = document.querySelector('.loginContainer');

    loginContainer.append(infoDiv);

    document.querySelector('.x').addEventListener('click', ()=> loginContainer.removeChild(infoDiv));

    console.error(error);

})
