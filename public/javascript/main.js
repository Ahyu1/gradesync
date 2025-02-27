const addClass = document.getElementById("addClass");
const createClassContainer = document.querySelector(".createClassContainer");
const myClassContainer = document.querySelector(".myClassContainer");

/*
// Function to get URL parameters
function getUrlParameter(name) {
   name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
   const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
   const results = regex.exec(location.search);
   return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Get the username from the URL
const username = getUrlParameter('username');
if (username) {
   alert('Welcome, ' + username + '!');
}
*/
// <input type="text" name="term" placeholder="Enter:" class="termInput"></input>
//<input type="text" name="semester" placeholder="Enter:" class="semesterInput"></input>
//

// GRANDPARENT OR MAIN FUNCTION FOR ADDING A CLASS
addClass.addEventListener('click', createClass);

function createClass() {
   // FIRST ACTION: CREATE A SECTION FOR 'CLASS CREATION'
   let classDiv = document.createElement("div");
   classDiv.className = "classStyle";
   classDiv.innerHTML =  `
       <div class="first-row">
           <div>
              <label>Subject Code</label>
              <input type="text" name="subjectCode" placeholder="Enter:" class="subjCodeInput"></input>
           </div>
           <div>
              <label>Subject Title</label>
              <input type="text" name="subjectTitle" placeholder="Enter:" class="subjTitleInput"></input>
           </div>
        </div>
        <div class="second-row">
           <div class="section-row">
              <label>Section</label>
              <input type="text" name="section" placeholder="Enter:" class="sectionInput"></input>
           </div>
           <div class="second-row-child">
              <div>
                 <label>Year</label>
                 <input type="text" name="year" placeholder="Enter:" class="yearInput"></input>
              </div>
              <div >
                 <label>Term</label>
                 <select name="term" class="termInput">
                     <option value="" disabled selected>Enter:</option>
                     <option>Midterm</option>
                     <option>Finalterm</option>
                 </select>
              </div>
              <div>
                 <label>Semester</label>
                  <select name="term" class="semesterInput">
                     <option value="" disabled selected>Enter:</option>
                     <option>First Semester</option>
                     <option>Second Semester</option>
                 </select>
              </div>
           </div>
        </div>
        <div class="third-row">
           <form action="/upload" method="POST" enctype="multipart/form-data">
               <label>Import Student data:</label>
               <input type="file" name="studentData" class="fileUpload" name="fileUpload" accept=".xls, .xlsx">
               <!--<input type="submit" value="Upload" class="sumbitFile">-->
            </form>
            <div class="tr-buttons">
              <button class="closeCreateClassBtn">CLOSE</button>
              <button class="createClassBtn">CREATE</button>
            </div>
        </div>`;  

   createClassContainer.append(classDiv);

   const closeClass = classDiv.querySelector(".closeCreateClassBtn");
   closeClass.addEventListener('click', () => {
       classDiv.style.display = "none"; 
   });

   const create = classDiv.querySelector(".createClassBtn");
   create.addEventListener('click', async () => {

    const subjectCode = classDiv.querySelector(".subjCodeInput").value;
    const subjectTitle = classDiv.querySelector(".subjTitleInput").value;
    const section = classDiv.querySelector(".sectionInput").value;
    const year = classDiv.querySelector(".yearInput").value;
    const term = classDiv.querySelector(".termInput").value;
    const semester = classDiv.querySelector(".semesterInput").value;
    const studentData = classDiv.querySelector(".fileUpload"); 

    const formData = new FormData();

    // add class details to FormData
    formData.append('subjectCode', subjectCode);
    formData.append('subjectTitle', subjectTitle);
    formData.append('section', section);
    formData.append('year', year);
    formData.append('term', term);
    formData.append('semester', semester);


    // attach the file if provided
    if (studentData.files.length > 0) {
        formData.append('fileUpload', studentData.files[0]);
    }

    try {
        const response = await fetch('/createclass', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        const result = await response.json();
        alert(result.message);
        loadClasses();
        
        const listItems = document.createElement("div");
        listItems.classList = "listItemsStyle";
        listItems.innerHTML = `
             <p id="subjkode">${subjectCode}</p>
             <p id="subjectTitle">${subjectTitle}<p>
             <div class="p--items--middle">
                <p>${year}</p>
                <p>${section}</p>
                <p>${term}<p>
                <p>${semester}</p>
             </div>
             <div class="classBtns">
                <!--<button class="approvalStatus">NO STATUS</button>-->
                <button class="openClass">OPEN</button>
                <button class="deleteClass"><img src="/images/delete.png"></button>
             </div>`;  

        createClassContainer.appendChild(listItems);
        createClassContainer.innerHTML = ''; 

        classDiv.style.display = "none";
        //=================================================================================================
        listItems.querySelector('.openClass').addEventListener('click', async () => {
             //window.href.location = '/openclass';
             const classId = listItems.getAttribute('data-class-id'); 
             try {
                 const response = await fetch(`/openclass/${classId}`, {
                    method: 'GET',
                    credentials: 'include'
                 });

             if (response.redirected) {
                  // redirect to the URL provided by the backend
                 window.location.href = response.url;
             } else {
                 const result = await response.json();
                 alert(result.message);
             }
            } catch (error) {
                 console.error('Error opening class:', error);
                 alert('Failed to open class.');
            }
        });
   
        // DELETE A SPECIFIC CLASS
        const deleteClass = listItems.querySelector(".deleteClass");
        deleteClass.addEventListener('click', async ()=> {
            const classId = listItems.getAttribute('data-id'); 
            if (confirm('Are you sure you want to delete the class?')) {
                await deleteClassById(classId);  
                createClassContainer.removeChild(listItems); 
            }
        }); 
        
    } catch (error) {
        console.error('Error:', error);
    }

});
}

async function deleteClassById(classId) {
    try {
        await fetch(`/deleteClass/${classId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        const result = await response.json();
        if(response.ok){
            alert(result.message);
        }else{
            console.error(result.message);
        }
        alert('Class deleted successfully');
    } catch (error) {
        console.error('Error deleting class:', error);
    }
 }


async function loadClasses() { 
   try {
       const response = await fetch('/getClasses', {
           method: 'GET',
           credentials: 'include'
       });
       const classes = await response.json();
       console.log(classes);  

       classes.forEach(classData => {
           const classInfo = JSON.parse(classData.class);
           const studentsInfo = JSON.parse(classData.students); 

           const listItems = document.createElement("div");
           listItems.classList = "listItemsStyle";
           listItems.setAttribute('data-id', classData.id);  
           listItems.innerHTML = `
               <p id="subjkode">${classInfo.subjectCode}</p>
               <p id="subjectTitle">${classInfo.subjectTitle}<p>
               <div class="p--items--middle">
                  <p>${classInfo.year}</p>
                  <p>${classInfo.section}</p>
                  <p>${classInfo.term}<p>
                  <p>${classInfo.semester}</p>
               </div>
               <div class="classBtns">
                  <!--<button class="approvalStatus">NO STATUS</button>-->
                  <button class="openClass">OPEN</button>
                  <button class="deleteClass"><img src="/images/delete.png"></button>
               </div>`;
           createClassContainer.appendChild(listItems);

           
            //==========================================================================================================
            listItems.setAttribute('data-class-id', classData.id);
            listItems.setAttribute('data-username', classData.user);

            listItems.querySelector('.openClass').addEventListener('click', async () => {
                const classId = listItems.getAttribute('data-class-id'); 
                const username = listItems.getAttribute('data-username');
                
                window.location.href = `/openclass/${classId}?username=${encodeURIComponent(username)}`;

                try {
                    const response = await fetch(`/openclass/${classId}`, {
                        method: 'GET',
                        credentials: 'include' 
                    });
            
                    if (response.redirected) {
                        window.location.href = response.url;
                    } else {
                        const result = await response.json();
                        alert(result.message);
                    }
                } catch (error) {
                    console.error('Error opening class:', error);
                }
            });
            

           const deleteClass = listItems.querySelector(".deleteClass");
           deleteClass.addEventListener('click', async ()=>{
            const classId = listItems.getAttribute('data-id');  
            if(confirm('Are you sure do you want to delete the class?')){
                createClassContainer.removeChild(listItems);
                alert("Class Deleted.")
                await deleteClassById(classId);
            }
           })
       });
   } catch (error) {
       console.error('Error loading classes:', error);
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

// call loadClasses when the page loads
window.onload = loadClasses;

