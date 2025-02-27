
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

//=========================================================================================================
document.getElementById("linkClass").addEventListener('click', () => window.alert("Class page directory was not available."))

//=========================================================================================================

async function fetchTotalCounts() {
    try {
        const response = await fetch('/getTotalCounts');
        const count = await response.json();

        document.querySelector('.totalClasses').innerHTML = count.totalClasses;
        document.querySelector('.totalRecords').innerHTML = count.totalRecords;
        document.querySelector('.totalTeachers').innerHTML = count.totalUsers - 1;
        document.querySelector('.totalApproves').innerHTML = count.approvedCount;
        document.querySelector('.totalDisapproves').innerHTML = count.disapprovedCount;
        document.querySelector('.totalPending').innerHTML = count.pendingCount;
        

    } catch(err) {
        console.error(err);
    }
}

window.onload = fetchTotalCounts;