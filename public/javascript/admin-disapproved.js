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

//==================================================================================================================

async function fetchDisapprovedRecords() {
    try {
        const response = await fetch('/getDisapprovedRecords'); 
        const records = await response.json();

        const classRecordContainer = document.querySelector('.classRecordContainer');
        classRecordContainer.innerHTML = '';

        console.log('Received records:', records);

        records.forEach(record => {
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
                    
                </div>
            `;

            classRecordContainer.appendChild(recordDiv);


            applyStatusStyle(recordDiv, record.status);

            recordDiv.querySelector('.view').addEventListener('click', () => {
                const classId = recordDiv.getAttribute('data-class-id');
                window.open(`/finalClassRecord.html?classId=${classId}`, '_blank');
            });
        });
    } catch (error) {
        console.error('Error fetching pending records:', error);
    }
}

function applyStatusStyle(recordDiv, status) {
    const statusStyle = recordDiv.querySelector('.status');
    statusStyle.style.backgroundColor = 'rgb(220, 82, 82)';
    statusStyle.style.border = 'none';
    statusStyle.style.color = 'white';
    statusStyle.style.fontWeight = 'bold';
    statusStyle.style.fontSize = '12px';
    statusStyle.style.padding = '9px';
    statusStyle.style.borderRadius = '4px';
    statusStyle.style.width = '100px';
    statusStyle.textContent = status.toUpperCase();
}

window.onload = fetchDisapprovedRecords;