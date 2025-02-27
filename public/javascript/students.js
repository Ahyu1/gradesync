
const classSection = document.querySelector(".classSection");

function getClassIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('classId'); 
}


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

// Call the function to render the class data when the page loads
//window.onload = renderClassSection; 

document.addEventListener('DOMContentLoaded', renderClassSection);

async function renderStudentTable() {
    const classId = getClassIdFromURL();

    if (!classId) {
        console.error('Class ID not found in URL');
        return;
    }

    try {
        const response = await fetch(`/getStudentById/${classId}`, {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            const result = await response.json();
            const studentData = result.studentData;

            if (Array.isArray(studentData)) {
                const studentSection = document.querySelector('.studentDataContainer');
                const tableHTML = `
                    <table id="dataTable">
                        <thead>
                            <tr>
                                <th>STUDENT NAME</th>
                                <th>LRN</th>
                                <th>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${studentData.map(student => `
                                <tr>
                                    <td>${student.A}</td>
                                    <td>${student.B}</td>
                                    <td><button class="removeStudentBtn">REMOVE</button></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>`;
                
                studentSection.innerHTML = tableHTML;
               //==================CHANGES====================
               // add event listener to remove buttons
               document.querySelectorAll('.removeStudentBtn').forEach(button => {
                   button.addEventListener('click', async (event) => {
                   const row = event.target.closest('tr');
                   const studentName = row.querySelector('td:first-child').textContent;
                   const studentLRN = row.querySelector('td:nth-child(2)').textContent;

                   if (confirm(`Are you sure you want to remove student ${studentName}?`)) {
                      try {
                        const classId = getClassIdFromURL();
                        const response = await fetch(`/deleteStudent/${classId}/${studentLRN}`, {
                             method: 'DELETE',
                             credentials: 'include'
                        });

                        if (response.ok) {
                             row.remove();
                             alert('Student removed successfully.');
                        } else {
                             const result = await response.json();
                             alert(`Error: ${result.message}`);
                        }
                      } catch (error) {
                          console.error('Error deleting student:', error);
                          alert('An error occurred while trying to remove the student.');
                        }
                      }
                    });
                });


                // add search functionality
                const searchInput = document.querySelector('.searchStudentName');
                searchInput.addEventListener('input', function () {
                    const searchValue = searchInput.value.toLowerCase();
                    const rows = document.querySelectorAll('#dataTable tbody tr');
                    rows.forEach(row => {
                        const nameCell = row.querySelector('td:first-child');
                        const name = nameCell.textContent.toLowerCase();
                        row.style.display = name.includes(searchValue) ? '' : 'none';
                    });
                });

            } else {
                console.error('Invalid student data:', studentData);
                studentSection.innerHTML = `<p>Error: No student data available.</p>`;
            }
        } else {
            console.error('Error fetching student data:', await response.json());
            studentSection.innerHTML = `<p>Error loading student data. Please try again later.</p>`;
        }
    } catch (error) {
        console.error('Fetch error:', error);
        document.querySelector('.studentDataContainer').innerHTML = `<p>Error loading student data.</p>`;
    }
}

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

// Run when the page is loaded
window.onload = renderStudentTable;

