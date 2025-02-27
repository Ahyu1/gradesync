
/*
document.addEventListener('DOMContentLoaded', function() {
    const statusFilter = document.getElementById('statusFilter');
    const recordsContainer = document.querySelector('.recordsContainer');

    async function fetchRecords() {
        const username = new URLSearchParams(window.location.search).get('username'); 

        if (!username) {
            window.alert("Username not found in URL.");
            return;
        }

        try {
            const response = await fetch(`/records?username=${username}`);

            if (response.ok) {
                const records = await response.json();
                renderRecords(records); 
            } else {
                window.alert("Error fetching records.");
            }
        } catch (err) {
            window.alert("An error occurred while fetching records.");
            console.error(err);
        }
    }

    function renderRecords(records) {
        recordsContainer.innerHTML = ''; 

        if (records.length === 0) {
            recordsContainer.innerHTML = '<p>No records found for this user.</p>';
            return;
        }

        const selectedStatus = statusFilter.value;
        const filteredRecords = selectedStatus === 'all' ? records : records.filter(record => record.status === selectedStatus);

        filteredRecords.forEach(record => {
            const classDetails = JSON.parse(record.classRecord).classDetails;

            const recordDiv = document.createElement('div');
            recordDiv.classList.add('record');
            recordDiv.setAttribute('data-class-id', record.classId);

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
                   <button class="unsubmit">UNSUBMIT</button>
                </div>
            `;

            recordsContainer.appendChild(recordDiv);

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
                        headers: { 'Content-Type': 'application/json' },
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

            // go to final class record
            recordDiv.querySelector('.view').addEventListener('click', async () => {
                const classId = recordDiv.getAttribute('data-class-id');

                window.open(`/finalClassRecord.html?classId=${classId}`, '_blank');
            })

            //=====unsubmit
            recordDiv.querySelector('.unsubmit').addEventListener('click', async () => {
                const userConfirm = confirm("Do you want to unsubmit this class record?")
                if (!userConfirm) {
                    window.alert("Action cancelled.")
                    return;
                }

                const classId = recordDiv.getAttribute('data-class-id');

                try {
                    const response = await fetch('/updateApprovalStatus', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json'},
                        body: JSON.stringify({ classId, status: 'no status'})
                    })

                    if (response.ok) {
                        //window.alert('Unsubmission successful!');
                        statusStyle.style.backgroundColor = 'rgba(188, 187, 187, 0.862)';
                        statusStyle.textContent = 'NO STATUS';
                    } else {
                        const error = await response.json();
                        window.alert(`Error: ${error.message}`);
                    }

                } catch (err) {
                    console.error(err);
                }
            })

        });
    }

    // event listener for status filter dropdown change
    statusFilter.addEventListener('change', fetchRecords);

    // call fetchRecords initially to load records
    fetchRecords();
});
*/
//========================================================================================================================================================
document.addEventListener('DOMContentLoaded', function() {
    const recordsContainer = document.querySelector('.recordsContainer');

    async function fetchRecords() {
        const username = new URLSearchParams(window.location.search).get('username'); 

        if (!username) {
            window.alert("Username not found in URL.");
            return;
        }

        try {
            const response = await fetch(`/getNoStatusRecordsByUser?username=${username}`);

            if (response.ok) {
                const records = await response.json();
                renderRecords(records); 
            } else {
                window.alert("You haven't saved any class record.");
            }
        } catch (err) {
            window.alert("An error occurred while fetching records.");
            console.error(err);
        }
    }

    function renderRecords(records) {
        recordsContainer.innerHTML = ''; 

        if (records.length === 0) {
            recordsContainer.innerHTML = '<p>No records found for this user.</p>';
            return;
        }

        records.forEach(record => {
            const classDetails = JSON.parse(record.classRecord).classDetails;

            const recordDiv = document.createElement('div');
            recordDiv.classList.add('record');
            recordDiv.setAttribute('data-class-id', record.classId);

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

            recordsContainer.appendChild(recordDiv);

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

            // go to final class record
            recordDiv.querySelector('.view').addEventListener('click', async () => {
                const classId = recordDiv.getAttribute('data-class-id');

                window.open(`/finalClassRecord.html?classId=${classId}`, '_blank');
            })

            recordDiv.querySelector('.submit').addEventListener('click', async () => {
                const userConfirm = confirm("Do you want to submit this class record?")
                if (!userConfirm) {
                    window.alert("Action cancelled.")
                    return;
                }

                const classId = recordDiv.getAttribute('data-class-id');

                try {
                    const response = await fetch('/updateApprovalStatus', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json'},
                        body: JSON.stringify({ classId, status: 'pending'})
                    })

                    if (response.ok) {
                        //window.alert('Unsubmission successful!');
                        statusStyle.style.backgroundColor = '#3388ff';
                        statusStyle.textContent = 'PENDING';
                        recordsContainer.removeChild(recordDiv);
                    } else {
                        const error = await response.json();
                        window.alert(`Error: ${error.message}`);
                    }

                } catch (err) {
                    console.error(err);
                }
            })

        });
    }

    // call fetchRecords initially to load records
    fetchRecords();
});
//========================================================================================================================================================

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
