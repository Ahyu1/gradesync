
function getClassIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('classId');
}

function getClassIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('classId');
}

//----------------------------------------------------------------------------------------------------------------------------------------
//=================================================== WORKS FINE BUT WITHOUT  IFRAME =====================================================
//----------------------------------------------------------------------------------------------------------------------------------------

async function fetchFinalClassRecord() {
    const classId = getClassIdFromURL();

    try {
        const response = await fetch(`/getFinalClassRecord/${classId}`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            console.error("Failed to fetch final class record data");
            return;
        }

        const finalrecord = await response.json();
        console.log('Fetched Record:', finalrecord);  

        if (finalrecord.length > 0) {
            const record = finalrecord[0]; 

            const {
                classRecord = {},
                sod = [],
                teacherName = 'No teacher available',
            } = record;
            
            const parsedClassRecord = typeof classRecord === 'string' ? JSON.parse(classRecord) : classRecord;
            
            console.log('Parsed Class Record: ', parsedClassRecord);
            console.log('Class Details: ', parsedClassRecord?.classDetails);
            console.log('Year from Class Details: ', parsedClassRecord?.classDetails?.year);

            console.log('Class Details from sod column: ', sod);
            console.log('Teacher Name: ', teacherName);

        const headerContainer = document.querySelector('.header');
        if (headerContainer) {
            headerContainer.innerHTML = `
            <div class="mainHeader">
            <div class="left-header">
                <div class="left-child">
                    <img src="/images/scclogo.webp">
                    <div>
                        <h3 class="schoolText">SAMUEL CHRISTIAN COLLEGE OF GENERAL TRIAS, INC</h3>
                        <p>Navarro, General Trias CIty, Cavite</p>
                        <h2 class="text">HIGH SCHOOL DEPARTMENT CLASS RECORD</h2>
                    </div>
                </div>
                <div>
                    <div class="right-child">
                        <div class="labels">
                            <p>Department: </p>
                            <p>School Year:</p>
                            <p>Semester, Term: </p>
                        </div>
                        <div class="values">
                            <p class="dept">SENIOR HIGH SCHOOL(SHS)</p>
                            
                            <p>2024-2025</p>
                            <p class="termsem">${parsedClassRecord?.classDetails?.term}, ${parsedClassRecord?.classDetails?.semester}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="right-header">
                <div class="right-child">
                    <div class="labels">
                        <p>Subject Code, Title: </p>
                        <p>Grade Level, Strand and Section:</p>
                        <p>Teacher: </p>
                    </div>
                    <div class="values">
                        <p class="sbjcode-sbj">${parsedClassRecord?.classDetails?.subjectCode}, ${parsedClassRecord?.classDetails?.subjectTitle}</p>
                        <p>${parsedClassRecord?.classDetails?.year}, ${parsedClassRecord?.classDetails?.section}</p>
                        <p class="sensei">${teacherName}</p>
                    </div>  
                </div>
            </div>
            </div>
                `;
        }

        const tableContainer = document.querySelector('.tableContainer');
        if (tableContainer) {
            const tableRows = parsedClassRecord?.students.map((student, index) => `
            <tr class="studentRow">
               <td class="sn">${index + 1}</td>
               <td class="studentName">${student.A}</td>
               <td class="lrn">${student.B || 'N/A'}</td>
               ${parsedClassRecord?.remarks[index]?.taskAndScore?.writtenWork
                ? parsedClassRecord?.remarks[index].taskAndScore.writtenWork.map(task => `<td>${task.score}</td>`).join('')
                : ''}
               <td class="wwSubtotalValue">${parsedClassRecord?.remarks[index]?.finalRemark.writtenWork[0]?.sst}</td>
               <td class="wwRatingsValue">${parsedClassRecord?.remarks[index].finalRemark.writtenWork[2]?.srating}</td>
               <td class="wwRateValue">${parsedClassRecord?.remarks[index].finalRemark.writtenWork[4]?.percentage}</td>
               ${parsedClassRecord?.remarks[index]?.taskAndScore?.performanceTask
                ? parsedClassRecord?.remarks[index].taskAndScore.performanceTask.map(task => `<td>${task.score}</td>`).join('')
                : ''}
               <td class="ptSubtotalValue">${parsedClassRecord?.remarks[index]?.finalRemark.performanceTask[0]?.sst}</td>
               <td class="ptRatingsValue">${parsedClassRecord?.remarks[index].finalRemark.performanceTask[2]?.srating}</td>
               <td class="ptRateValue">${parsedClassRecord?.remarks[index].finalRemark.performanceTask[4]?.percentage}</td>
               <td class="examSubtotalValue">${parsedClassRecord?.remarks[index]?.finalRemark.exam[0]?.sst}</td>
               <td class="examRatingsValue">${parsedClassRecord?.remarks[index].finalRemark.exam[2]?.srating}</td>
               <td class="examRateValue">${parsedClassRecord?.remarks[index].finalRemark.exam[4]?.percentage}</td>
               <td class="initialGrade">${parsedClassRecord?.remarks[index].finalRemark.rating[0].initialGrade}</td>
               <td class="finalGrade">${parsedClassRecord?.remarks[index].finalRemark.rating[1].finalGrade}</td>
               <td class="proficiencyLevel">${parsedClassRecord?.remarks[index].finalRemark.rating[2].proficiencylvl}</td>
               <td class="rank">${parsedClassRecord?.remarks[index].finalRemark.rating[3].rank}</td>
               <td class="remark">${parsedClassRecord?.remarks[index].finalRemark.rating[4].remarks}</td>
            </tr>
            `).join("");

            tableContainer.innerHTML = `
            <table>
            <tr class="first-row">
                <th class="snLabel">SN</th>
                <th class="studentnameLabel">Learners' Names</th>
                <th class="lrnLabel">LRN</th>
                <th colspan="${parsedClassRecord?.remarks[0].taskAndScore?.writtenWork?.length + 3}">WRITTEN WORKS</th> 
                <th colspan="${parsedClassRecord?.remarks[0].taskAndScore?.performanceTask?.length + 3}">PERFORMANCE TASKS</th>
                <th colspan="3">MIDTERM EXAMINATION</th>
                <th colspan="5">MIDTERM RATING</th>
            </tr>
            
            <tr class="second-row">
                <th></th>
                <th></th>
                <th></th>
                <th colspan="${parsedClassRecord?.remarks[0].taskAndScore?.writtenWork?.length || 1}">ASSIGNMENTS/SEATWORKS/QUIZZES</th>
                <th class="subtotalLabel" rowspan="2">ST</th>
                <th class="ratingsLabel"  rowspan="2">R</th>
                <th class="rateLabel"  rowspan="2">%</th>
                <th colspan="${parsedClassRecord?.remarks[0].taskAndScore?.performanceTask?.length || 1}">OUPUTS/ACTIVITIES/CL</th>
                <th class="subtotalLabel"  rowspan="2">ST</th>
                <th class="ratingsLabel"  rowspan="2">R</th>
                <th class="rateLabel"  rowspan="2">%</th>
                <th class="subtotalLabel"  rowspan="2">S</th>
                <th class="ratingsLabel"  rowspan="2">R</th>
                <th class="rateLabel"  rowspan="2">%</th>
                <th class="initialGrade" rowspan="3">INITIAL GRADE</th>
                <th class="finalGrade" rowspan="3">GRADE</th>
                <th class="proficiencyLevel" rowspan="3">PL</th>
                <th class="rank" rowspan="3">RANK</th>
                <th class="remarks" rowspan="3">REMARKS</th>
            </tr>
            
            <tr>
            <td class="dateLabel" colspan="3" class="dateLabel">Date Accomplished</td>
                ${parsedClassRecord?.remarks[0]?.taskAndScore?.writtenWork
                ? parsedClassRecord?.remarks[0].taskAndScore.writtenWork.map(task => `<td class="wwDate">${task.date}</td>`).join('')
                : ''}
                ${parsedClassRecord?.remarks[0]?.taskAndScore?.performanceTask
                ? parsedClassRecord?.remarks[0].taskAndScore.performanceTask.map(task => `<td class="ptDate">${task.date}</td>`).join('')
                : ''}
            </tr>

            <tr class="third-row">
                <td class="hpsLabel" colspan="3">Highest Possible Score</td>
                ${parsedClassRecord?.remarks[0]?.taskAndScore?.writtenWork
                ? parsedClassRecord?.remarks[0].taskAndScore.writtenWork.map(task => `<td class="wwHPS">${task.maxScore}</td>`).join('')
                : ''}
                <td class="wwSubtotal">${parsedClassRecord?.remarks[0].finalRemark.writtenWork[1]?.st}</td>
                <td class="wwRatings">100</td>
                <td class="wwComponentRate">${parsedClassRecord?.components.writtenwork}</td>
                ${parsedClassRecord?.remarks[0]?.taskAndScore?.performanceTask
                ? parsedClassRecord?.remarks[0].taskAndScore.performanceTask.map(task => `<td class="ptHPS">${task.maxScore}</td>`).join('')
                : ''}
                <td class="ptSubtotal">${parsedClassRecord?.remarks[0].finalRemark.performanceTask[1]?.st}</td>
                <td class="ptRatings">100</td>
                <td class="ptComponentRate">${parsedClassRecord?.components.performancetask}</td>
                <td class="examSubtotal">${parsedClassRecord?.remarks[0].finalRemark.exam[1]?.st}</td>
                <td class="examRatings">100</td>
                <td class="examComponentRate">${parsedClassRecord?.components.exam}</td>
            </tr>
            ${tableRows}
            </table>`;
        }
        
    }


    } catch (error) {
        console.error('Error fetching class record:', error);
    }
}

// Run fetchFinalClassRecord when the page loads
//window.onload = fetchFinalClassRecord;

//-====================================================================================================================================================================

async function fetchFinalSummarOfDistribution() {
    const classId = getClassIdFromURL();

    try {
        const response = await fetch(`/getFinalClassRecord/${classId}`, {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            console.error("Failed to fetch final class record data");
            return;
        }

        const finalrecord = await response.json();
        console.log('Fetched Record:', finalrecord);  

        if (finalrecord.length > 0) {
            const record = finalrecord[0]; 

            const {
                classRecord = {},
                sod = [],
                teacherName = 'No teacher available',
            } = record;
            
            const parsedClassRecord = typeof classRecord === 'string' ? JSON.parse(classRecord) : classRecord;
            
        // logic for sod
        const proficiencyCounts = parsedClassRecord?.remarks.reduce((acc, remark) => {
            const level = remark?.finalRemark?.rating[2]?.proficiencylvl;
            acc[level] = (acc[level] || 0) + 1; 
            return acc;
         }, {});

        const parsedSOD = typeof sod === 'string' ? JSON.parse(sod): sod;
        const freqA = parsedSOD[0].remark;
        const freqP = parsedSOD[1].remark;
        const freqAP = parsedSOD[2].remark;
        const freqD = parsedSOD[3].remark;
        const freqB = parsedSOD[4].remark;
        const freqI = parsedSOD[5].remark;
        const freqDropped = parsedSOD[6].remark;

        //pina add ni sirrr
        const adminName = parsedSOD[7].adminName;
        const adminPosition = parsedSOD[7].adminPosition;
        
        const total = parsedClassRecord?.remarks.length;
 
         // render sod table
         const sodtable = document.createElement('div');
         sodtable.innerHTML = `
             <div class="sodMainHeader">
                 <div class="sodHeader">
                     <div class="left-header">
                         <div class="left-child">
                             <img class="scclogo" src="/images/scclogo.webp">
                             <div>
                                 <h3 class="schoolText">SAMUEL CHRISTIAN COLLEGE OF GENERAL TRIAS, INC</h3>
                                 <p>Navarro, General Trias CIty, Cavite</p>
                                 <h2 class="text">HIGH SCHOOL DEPARTMENT CLASS RECORD</h2>
                             </div>
                         </div>
                     </div>
                     <div class="right-header">
                         <div class="right-child">
                             <div class="labels">
                                 <p>Department: </p>
                                 <p>School Year: </p>
                                 <p>Semester, Term: </p>
                                 <p>Subject Code, Title: </p>
                                 <p>Grade Level, Strand and Section:</p>
                                 <p>Teacher/Instructor: </p>
                             </div>
                             <div class="values">
                                 <p>SENIOR HIGH SCHOOL (SHS)</p>
                                 <p>2024-2025</p>
                                 <p>${parsedClassRecord?.classDetails.semester}, ${parsedClassRecord?.classDetails.term}</p>
                                 <p class="sbjcode-sbj">${parsedClassRecord?.classDetails.subjectCode} - ${parsedClassRecord?.classDetails.subjectTitle}</p>
                                 <p>${parsedClassRecord?.classDetails.year} ${parsedClassRecord?.classDetails.section}</p>
                                 <p class="sensei">${teacherName}</p>
                             </div>  
                         </div>
                     </div>
                     </div>
             </div>
             <h5>SUMMARY OF DISTRIBUTION</h5>
             <div class="sodTable">
                 <table>
                     <tr>
                         <th class="plLabel">PROFICIENCY LEVEL</th>
                         <th class="freqLabel">FREQUENCY</th>
                         <th class="percentLabel">%</th>
                         <th class="remarksLabel">REMARKS</th>
                     </tr>
                     <tr>
                         <th class="empty"></th>
                         <th class="empty"></th>
                         <th class="empty"></th>
                         <th class="empty"></th>
                     </tr>
                     <tr>
                         <td>Advanced >= 90</td>
                         <td>${proficiencyCounts['A'] || 0}</td>
                         <td>${(((proficiencyCounts['A'] || 0) / total) * 100).toFixed(2)}</td>
                         <td>${freqA}</td>
                     </tr>
                     <tr>
                         <td>Proficient 85 - 89</td>
                         <td>${proficiencyCounts['P'] || 0}</td>
                         <td>${(((proficiencyCounts['P'] || 0) / total) * 100).toFixed(2)}</td>
                         <td>${freqP}</td>
                     </tr>
                     <tr>
                         <td>Approaching Proficient 80 - 84</td>
                         <td>${proficiencyCounts['AP'] || 0}</td>
                         <td>${(((proficiencyCounts['AP'] || 0) / total) * 100).toFixed(2)}</td>
                         <td>${freqAP}</td>
                     </tr>
                     <tr>
                         <td>Developing 75 - 79</td>
                         <td>${proficiencyCounts['D'] || 0}</td>
                         <td>${(((proficiencyCounts['D'] || 0)  / total) * 100).toFixed(2)}</td>
                         <td>${freqD}</td>
                     </tr>
                     <tr>
                         <td>Beginning &lt; 75</td>
                         <td>${proficiencyCounts['B'] || 0}</td>
                         <td>${(((proficiencyCounts['B'] || 0)  / total) * 100).toFixed(2)}</td>
                         <td>${freqB}</td>
                     </tr>
                     <tr>
                         <td>Incomplete</td>
                         <td>${proficiencyCounts['I'] || 0}</td>
                         <td>${(((proficiencyCounts['I'] || 0)  / total) * 100).toFixed(2)}</td>
                         <td>${freqI}</td>
                     </tr>
                     <tr>
                         <td>Dropped</td>
                         <td>${proficiencyCounts['D'] || 0}</td>
                         <td>${(((proficiencyCounts['D'] || 0)  / total) * 100).toFixed(2)}</td>
                         <td>${freqDropped}</td>
                     </tr>
                     <tr>
                         <td>TOTAL</td>
                         <td>${total}</td>
                         <td>${((total / total) * 100).toFixed(2)}</td>
                         <td></td>
                     </tr>
                 
                 </table>
             </div>
             <div class="signContainer">
                 <div class="sleft">
                    <p>Prepared By:</p>
                    <div>
                        <h6>${teacherName}</h6>
                        <p>Subject Teacher</p>
                        <p>Date Signed:______________</p>
                    </div>
                    <p>Checked By:</p>
                    <div>
                        <h6>MR. JEZEREEL JAMES M. COLINA</h6>
                        <p>Academic Head, Math, Science, and Technology</p>
                        <p>Date Signed:_______________</p>
                    </div>
                 </div>
                 <div class="sright">
                    <p>Recommending Approval:</p>
                    <div>
                        <h6>${adminName}</h6>
                        <p>${adminPosition}</p>
                        <p>Date Signed:_______________</p>
                    </div>
                    <p>APPROVED:</p>
                    <div>
                        <h6>MR. JEZEREEL JAMES M. COLINA</h6>
                        <p>High School Principal</p>
                        <p>Date Signed:_______________</p>
                    </div>
                 </div>
             </div>
             
         `;
 
         const sodContainer = document.querySelector(".sodContainer");
         sodContainer.appendChild(sodtable);
         
 
 
        }
    } catch (err) {
        console.error(err);
    }
}

window.onload = function () {
    fetchFinalClassRecord()
    fetchFinalSummarOfDistribution()
}

