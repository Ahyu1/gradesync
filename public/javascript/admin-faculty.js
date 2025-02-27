
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

document.getElementById("account").addEventListener('click', logout);

//======================================================================================
async function renderFacultyTable() {
    try {
        const response = await fetch('/getUserDetails'); 
        const users = await response.json(); 

        console.log(users); 

        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>EMPLOYEE ID</th>
                    <th>NAME</th>
                    <th>ADVISORY</th>
                    <th>DEPARTMENT</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        `;

        const tbody = table.querySelector('tbody');
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.employeeID}</td>
                <td>${user.fullName}</td>
                <td>${user.advisory}</td>
                <td>${user.department}</td>
            `;
            tbody.appendChild(row);
        });

        const container = document.querySelector('.content'); 
        container.innerHTML ='';
        container.appendChild(table);

    } catch (err) {
        console.error('Error rendering faculty table:', err);
    }
}

// call the function when the page loads
window.onload = renderFacultyTable;
