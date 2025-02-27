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
//============================================================================================================================
document.addEventListener('DOMContentLoaded', function() {
    const recordsContainer = document.querySelector('.pendingContainer');

    async function fetchRecords() {
        const username = new URLSearchParams(window.location.search).get('username'); 

        if (!username) {
            window.alert("Username not found in URL.");
            return;
        }

        try {
            const response = await fetch(`/getPendingRecordsByUser?username=${username}`);

            if (response.ok) {
                const records = await response.json();
                renderRecords(records); 
            } else {
                window.alert("You haven't submitted any class records.");
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

//============================================================================================================================
