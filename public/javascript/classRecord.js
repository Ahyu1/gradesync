//alert('welcome to hell');

//=================================================== NOTICE! ============================================================
function getClassIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('classId');  
}

function getUserFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('username');
}


// wrap the class record inside iframe
function injectScriptIntoIframe() {
    const iframe = document.querySelector(".tableIframe");
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

    iframeDoc.open();
    iframeDoc.write(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Class Record</title>

<style>
.container {
    padding: 40px;
}

.tableIframe {
    width: 100%;
    height: 80vh;
}

.buttons, .controls {
    display: flex;
    column-gap: 14px;
    margin-top: 30px;
}

.buttons button, .controls button{
    padding: 10px 10px;
    width: 300px;
}

.testing {
    margin-top: 20px;
}

/*=======================================================for table testing=========================================*/
* {
    font-family: 'Arial Narrow', Arial, sans-serif;
    margin: 0;
    padding:0;
   }

table, tr {
    border: solid 1px black;
    border-collapse: collapse;
    text-align: center;
    font-size: small;
   }

th {
    border: solid 1px black;
    border-collapse: collapse;
    text-align: center;
    font-size: small;
   }

td {
    border: solid 1px black;
    border-collapse: collapse;
    text-align: center;
    font-size: small;
    width: 60px;
}

.studentnameLabel {
    width: 300px;
}

.studentName {
    text-align: left;
    padding-left: 5px;
}

.lrnLabel {
    width: 250px;
}

.first-row {
    height:40px;
}

.second-row{
    height: 35px;
}

.taskLabel, .taskNum, .hpsLabel, .dateLabel {
    color: rgb(6, 124, 242);
    font-weight: 600;
}

.hpsValue, .hpsValuePt, .wwDate, .ptDate{
     color: rgb(6, 124, 242);
}

.wwHPS, .ptHPS, .examSubtotal {
    color: rgb(6, 124, 242);
}

.subtotalLabel, .ratingsLabel, .wwSubtotal, .ptSubtotal {
     color: rgb(155, 20, 155);
}

.wwSubtotal,
.wwRatings,
.ptSubtotal,
.ptRatings,
.examRatings,
.wwSubtotalValue,
.wwRatingsValue,
.ptSubtotalValue,
.ptRatingsValue,
.examRatingsValue,
.examSubtotalValue {
    color: rgb(155, 20, 155);
}

.rateLabel,
.wwComponentRate,
.ptComponentRate,
.examComponentRate,
.wwRateValue,
.ptRateValue,
.examRateValue {
    color: green;

}

.finalGrade {
    font-weight: 600;
}

/*================================IFRAME TEST=========================*/
.generate {
    margin-top: 20px;
}

.thegreatestpreview {
    background-color: rgb(217, 217, 220);
    display: flex;
    flex-direction: column;
    padding: 10px 10px;
    width: 90vw;
    height: 40vh;
}

.ipreym {
    width: 90vw;
    height: 35vh;
}

.buttonSquad {
    margin-top: 10px;
}

/*======================== SCC CLASS RECORD HEADER====================*/
.mainHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 20px;
}

.mainHeader img {
    width: 60px;
}

.tableContainer {
    margin-top: 5px;
}

.schoolText {width: 270px;}
.text {width: 210px; font-size: 15px; margin-top: 12px;}

.left-header {
    display: flex;
    column-gap: 70px;
    align-items: center;
}

.left-child {
    display: flex;
    column-gap: 15px;
    align-items: center;
}

.right-child {
    display: flex;
    column-gap: 25px;
}

.right-header .right-child {
    display: flex;
    column-gap: 50px;
}

.values p {font-weight: bolder;}

.dept, .sensei, .sbjcode-sbj  {text-transform: uppercase;}

.studentRow {
    height: 20px;
}

.legendStyle {
   font-size: 12px;
   margin-top: 10px;
}


</style>
</head>
       <body>
            <div class="header"></div>
            <div class="tableContainer"></div>
            <div class="legendContainer"></div>
            <script>
                function getClassIdFromURL() {
                    const params = new URLSearchParams(window.location.search);
                    return params.get('classId'); 
                }
                // Place the renderClassRecord function inside the iframe
                async function renderClassRecord() {
                    const classId = getClassIdFromURL(); 

                    if (!classId) {
                        console.error('Class ID not found in URL');
                        return;
                    }

                    try {
                        const response = await fetch(\`/getClassRecordData/\${classId}\`, {
                            method: 'GET',
                            credentials: 'include', // Include session credentials
                        });

                        if (!response.ok) {
                            console.error("Failed to fetch class data");
                            return;
                        }

                        const classRecordData = await response.json();

                        // Ensure all required data is available
                        const {
                            classDetails = {},
                            teacher = {},
                            students = [],
                            tasks = {},
                            remarks = {},
                            components = {},
                        } = classRecordData;

                        // Render header
                        const headerContainer = document.querySelector('.header');
                        if (headerContainer) {
                            headerContainer.innerHTML = \`
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
                                            <p class="dept">\${teacher.department}</p>
                                            <p>2024-2025</p>
                                            <p>\${classDetails.semester}, \${classDetails.term}</p>
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
                                        <p class="sbjcode-sbj">\${classDetails.subjectCode} - \${classDetails.subjectTitle}</p>
                                        <p>\${classDetails.year} \${classDetails.section}</p>
                                        <p class="sensei">\${teacher.name}</p>
                                    </div>  
                                </div>
                            </div>
                            </div>
                            \`;
                        }

                        // Render table
                        const tableContainer = document.querySelector('.tableContainer');
                        if (tableContainer) {
                            const tableRows = students.map((student, index) => \`
                            <tr class="studentRow">
                               <td class="sn">\${index + 1}</td>
                               <td class="studentName">\${student.A}</td>
                               <td class="lrn">\${student.B || 'N/A'}</td>
                               \${remarks[index]?.taskAndScore?.writtenWork
                                ? remarks[index].taskAndScore.writtenWork.map(task => \`<td>\${task.score}</td>\`).join('')
                                : ''}
                               <td class="wwSubtotalValue">\${remarks[index]?.finalRemark.writtenWork[0]?.sst}</td>
                               <td class="wwRatingsValue">\${remarks[index].finalRemark.writtenWork[2]?.srating}</td>
                               <td class="wwRateValue">\${remarks[index].finalRemark.writtenWork[4]?.percentage}</td>
                               \${remarks[index]?.taskAndScore?.performanceTask
                                ? remarks[index].taskAndScore.performanceTask.map(task => \`<td>\${task.score}</td>\`).join('')
                                : ''}
                               <td class="ptSubtotalValue">\${remarks[index]?.finalRemark.performanceTask[0]?.sst}</td>
                               <td class="ptRatingsValue">\${remarks[index].finalRemark.performanceTask[2]?.srating}</td>
                               <td class="ptRateValue">\${remarks[index].finalRemark.performanceTask[4]?.percentage}</td>
                               <td class="examSubtotalValue">\${remarks[index]?.finalRemark.exam[0]?.sst}</td>
                               <td class="examRatingsValue">\${remarks[index].finalRemark.exam[2]?.srating}</td>
                               <td class="examRateValue">\${remarks[index].finalRemark.exam[4]?.percentage}</td>
                               <td class="initialGrade">\${remarks[index].finalRemark.rating[0].initialGrade}</td>
                               <td class="finalGrade">\${remarks[index].finalRemark.rating[1].finalGrade}</td>
                               <td class="proficiencyLevel">\${remarks[index].finalRemark.rating[2].proficiencylvl}</td>
                               <td class="rank">\${remarks[index].finalRemark.rating[3].rank}</td>
                               <td class="remark">\${remarks[index].finalRemark.rating[4].remarks}</td>
                            </tr>
                            \`).join("");

                            tableContainer.innerHTML = \`
                            <table>
                            <tr class="first-row">
                                <th class="snLabel">SN</th>
                                <th class="studentnameLabel">Learners' Names</th>
                                <th class="lrnLabel">LRN</th>
                                <th colspan="\${remarks[0].taskAndScore?.writtenWork?.length + 3}">WRITTEN WORKS</th> 
                                <th colspan="\${remarks[0].taskAndScore?.performanceTask?.length + 3}">PERFORMANCE TASKS</th>
                                <th colspan="3">MIDTERM EXAMINATION</th>
                                <th colspan="5">MIDTERM RATING</th>
                            </tr>
                            
                            <tr class="second-row">
                                <th></th>
                                <th></th>
                                <th></th>
                                <th colspan="\${remarks[0].taskAndScore?.writtenWork?.length || 1}">ASSIGNMENTS/SEATWORKS/QUIZZES</th>
                                <th class="subtotalLabel" rowspan="2">ST</th>
                                <th class="ratingsLabel" rowspan="2">R</th>
                                <th class="rateLabel" rowspan="2">%</th>
                                <th colspan="\${remarks[0].taskAndScore?.performanceTask?.length || 1}">OUPUTS/ACTIVITIES/CL</th>
                                <th class="subtotalLabel" rowspan="2">ST</th>
                                <th class="ratingsLabel" rowspan="2">R</th>
                                <th class="rateLabel" rowspan="2">%</th>
                                <th class="subtotalLabel" rowspan="2">S</th>
                                <th class="ratingsLabel" rowspan="2">R</th>
                                <th class="rateLabel" rowspan="2">%</th>
                                <th class="initialGrade" rowspan="3">INITIAL GRADE</th>
                                <th class="finalGrade" rowspan="3">GRADE</th>
                                <th class="proficiencyLevel" rowspan="3">PL</th>
                                <th class="rank" rowspan="3">RANK</th>
                                <th class="remarks" rowspan="3">REMARKS</th>
                            </tr>

                            <td class="dateLabel" colspan="3" class="dateLabel">Date Accomplished</td>
                                \${remarks[0]?.taskAndScore?.writtenWork
                                ? remarks[0].taskAndScore.writtenWork.map(task => \`<td class="wwDate">\${task.date}</td>\`).join('')
                                : ''}
                                \${remarks[0]?.taskAndScore?.performanceTask
                                ? remarks[0].taskAndScore.performanceTask.map(task => \`<td class="ptDate">\${task.date}</td>\`).join('')
                                : ''}
                            </tr>

                            <tr class="third-row">
                                <td class="hpsLabel" colspan="3">Highest Possible Score</td>
                                \${remarks[0]?.taskAndScore?.writtenWork
                                ? remarks[0].taskAndScore.writtenWork.map(task => \`<td class="wwHPS">\${task.maxScore}</td>\`).join('')
                                : ''}
                                <td class="wwSubtotal">\${remarks[0].finalRemark.writtenWork[1]?.st}</td>
                                <td class="wwRatings">100</td>
                                <td class="wwComponentRate">\${components.writtenwork}</td>
                                \${remarks[0]?.taskAndScore?.performanceTask
                                ? remarks[0].taskAndScore.performanceTask.map(task => \`<td class="ptHPS">\${task.maxScore}</td>\`).join('')
                                : ''}
                                <td class="ptSubtotal">\${remarks[0].finalRemark.performanceTask[1]?.st}</td>
                                <td class="ptRatings">100</td>
                                <td class="ptComponentRate">\${components.performancetask}</td>
                                <td class="examSubtotal">\${remarks[0].finalRemark.exam[1]?.st}</td>
                                <td class="examRatings">100</td>
                                <td class="examComponentRate">\${components.exam}</td>
                            </tr>
                            \${tableRows}
                            </table>\`;
                        }

                        //render legend
                        const legendContainer = document.querySelector(".legendContainer");
                        const legend = document.createElement('p');
                        legend.className = "legendStyle";
                        legend.innerHTML = \`LEGEND:LRN-Learner's Reference Number;ST-Subtotal;S-Score;R-Rating;PL-ProficiencyLevel;INC-Incomplete;DR-Dropped;\`;
                        legendContainer.appendChild(legend);

                    } catch (error) {
                        console.error("Error rendering class record:", error);
                    }
                }

                window.onload = renderClassRecord;
           </script>
       </body>
</html>
    `);
    iframeDoc.close();
}

// Inject the script and HTML content into the iframe when the page loads
//window.onload = injectScriptIntoIframe;

//=========================================================== SOD with Iframe ==============================================================
function injectSODIntoIframe() {
    const iframe = document.querySelector(".sodIframe");
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

    iframeDoc.open();
    iframeDoc.write(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Class Record</title>
    <style>
        * {
            font-family: 'Arial Narrow', Arial, sans-serif;
            margin: 0;
            padding:0;
        }

        .sodTable {
           display: flex;
           flex-direction: column;
           align-items: start;
           row-gap: 10px;
        }

        .sodMainHeader {
            margin-top: 30px;
            align-items: start;
        }
        .sodHeader {
            display: flex;
            flex-direction: column;
            row-gap: 15px;
        }
        .scclogo {width: 60px;}

        .schoolText {width: 270px;}
        .text {width: 210px; font-size: 15px; margin-top: 12px;}
        .values p {font-weight: bolder;}
        .dept, .sensei, .sbjcode-sbj  {text-transform: uppercase;}
        .left-child {
            display: flex;
            column-gap: 15px;
            align-items: center;
        }
        
        .right-child {
            display: flex;
            column-gap: 25px;
        }

        .right-header .right-child {
            display: flex;
            column-gap: 50px;
        }

        .right-child .labels p, .right-child .values p {font-size: 13px;}

        .sodContainer h5 {
            font-weight: bolder;
            font-size: 14px;
        }
        .empty {
            height: 10px;
        }
        .plLabel {
            width: 280px;
        }
        .freqLabel {
            width: 170px;
        }
        .remarksLabel {
            width: 240px;
        }
       
        .percentLabel {width: 100px;}

        .sodTable table, tr, th, td { 
            border: solid 1px black;
            border-collapse: collapse;
            text-align: center;
        }

        .sodTable table tr td {
            height: 50px;
            font-size: 13px;
        }

/*======= sign ==========*/

.signContainer {
    margin-top: 44px;
    display: flex;
    column-gap: 20rem;
}

.signContainer .sleft, .signContainer .sright {
    display: flex;
    flex-direction: column;
    row-gap: 40px;
}

.signContainer .sleft p, .signContainer .sright p{
    font-size: 13px;
}

.signContainer .sleft div h6, .signContainer .sright div h6 {
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
}

.signContainer .sleft div p, .signContainer .sright div p {
    font-size: 13px;
}

.adminRecommendingApproval{
    border: solid 1px white;
    font-weight: bolder;
    text-transform: uppercase;
    padding:0;
    outline: none;
}

.adminRecommendingApproval option {
    border: none;
    text-transform: capitalize;
}

.adminPosition {
    border: solid 1px white;
    font-weight: lighter;
    text-transform: capitalize;
    padding: 0;
    outline: none;
}

.uniqueDate {
   margin-left: 5px;
}
/*===============*/
.bRemark, .aRemark, .apRemark, .pRemark, .dRemark, .droppedRemark, .iRemark {
    height: 50px;
    width: 90%;
    border: #fff solid 0px;
    white-space: normal;
    text-align: justify;
    text-align-last: center;
}

    </style>
</head>
<body>
    <div class="sodContainer">
    </div>
    <script>
        function getClassIdFromURL() {
            const params = new URLSearchParams(window.location.search);
            return params.get('classId');
        }

        async function renderSummaryOfDistribution() {
            const classId = getClassIdFromURL();

            if (!classId) {
                console.error('Class ID not found in URL');
                return;
            }

            try {
                const response = await fetch(\`/getClassRecordData/\${classId}\`, {
                    method: 'GET',
                    credentials: 'include', // Include session credentials
                });

                if (!response.ok) {
                    console.error("Failed to fetch class data");
                    return;
                }

                const classRecordData = await response.json();
                const { classDetails = {}, teacher = {}, remarks = [], sod = [] } = classRecordData;

                const proficiencyCounts = remarks.reduce((acc, remark) => {
                    const level = remark.finalRemark?.rating[2]?.proficiencylvl;
                    acc[level] = (acc[level] || 0) + 1;
                    return acc;
                }, {});

                const total = remarks.length;

                const recordRemark = sod.map(item => item.remark)

                const sodtable = document.createElement('div');
                sodtable.className = "sodTable"
                sodtable.innerHTML = \`
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
                                        <p>\${teacher.department}</p>
                                        <p>2024-2025</p>
                                        <p>\${classDetails.semester}, \${classDetails.term}</p>
                                        <p class="sbjcode-sbj">\${classDetails.subjectCode} - \${classDetails.subjectTitle}</p>
                                        <p>\${classDetails.year} \${classDetails.section}</p>
                                        <p class="sensei">\${teacher.name}</p>
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
                                <td>Advanced >= 90</td>
                                <td>\${proficiencyCounts['A'] || 0}</td>
                                <td>\${(((proficiencyCounts['A'] || 0) / total) * 100).toFixed(2)}</td>
                                <td><textarea rows="3" class="aRemark">\${recordRemark[0]}</textarea></td>
                            </tr>
                            <tr>
                                <td>Proficient 85 - 89</td>
                                <td>\${proficiencyCounts['P'] || 0}</td>
                                <td>\${(((proficiencyCounts['P'] || 0) / total) * 100).toFixed(2)}</td>
                                <td><textarea rows="3" class="pRemark">\${recordRemark[1]}</textarea></td>
                            </tr>
                            <tr>
                                <td>Approaching Proficient 80 - 84</td>
                                <td>\${proficiencyCounts['AP'] || 0}</td>
                                <td>\${(((proficiencyCounts['AP'] || 0) / total) * 100).toFixed(2)}</td>
                                <td><textarea rows="3" class="apRemark">\${recordRemark[2]}</textarea></td>
                            </tr>
                            <tr>
                                <td>Developing 75 - 79</td>
                                <td>\${proficiencyCounts['D'] || 0}</td>
                                <td>\${(((proficiencyCounts['D'] || 0)  / total) * 100).toFixed(2)}</td>
                                <td><textarea rows="3" class="dRemark">\${recordRemark[3]}</textarea></td>
                            </tr>
                            <tr>
                                <td>Beginning &lt; 75</td>
                                <td>\${proficiencyCounts['B'] || 0}</td>
                                <td>\${(((proficiencyCounts['B'] || 0)  / total) * 100).toFixed(2)}</td>
                                <td><textarea rows="3" class="bRemark">\${recordRemark[4]}</textarea></td>
                            </tr>
                            <tr>
                                <td>Incomplete</td>
                                <td>\${proficiencyCounts['I'] || 0}</td>
                                <td>\${(((proficiencyCounts['I'] || 0)  / total) * 100).toFixed(2)}</td>
                                <td><textarea rows="3" class="iRemark">\${recordRemark[5]}</textarea></td>
                            </tr>
                            <tr>
                                <td>Dropped</td>
                                <td>\${proficiencyCounts['D'] || 0}</td>
                                <td>\${(((proficiencyCounts['D'] || 0)  / total) * 100).toFixed(2)}</td>
                                <td><textarea rows="3" class="droppedRemark">\${recordRemark[6]}</textarea></td>
                            </tr>
                            <tr>
                                <td>TOTAL</td>
                                <td>\${total}</td>
                                <td>\${((total / total) * 100).toFixed(2)}</td>
                                <td></td>
                            </tr>
                        </table>
                    </div>
                    <div class="signContainer">
                    <div class="sleft">
                    <p>Prepared By:</p>
                    <div>
                        <h6>\${teacher.name}</h6>
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
                        <!--<h6>MS. JOELIZA T. PABLO </h6>-->
                        <select class="adminRecommendingApproval">
                             <option>Ms. Joeliza T. Pablo</option>
                             <option>Mrs. Elizabeth N. Arriesgado</option>
                        </select><br>
                        <select class="adminPosition">
                             <option>High School Vice Principal</option>
                             <option>SAS Administrator</option>
                        </select>
                        <p class="uniqueDate">Date Signed:_______________</p>
                    </div>
                    <p>APPROVED:</p>
                    <div>
                        <h6>MR. JEZEREEL JAMES M. COLINA</h6>
                        <p>High School Principal</p>
                        <p>Date Signed:_______________</p>
                    </div>
                    </div>
                    </div>
                \`;

                const sodContainer = document.querySelector(".sodContainer");
                sodContainer.appendChild(sodtable);

            } catch (error) {
                console.log(error);
            }
        }

        window.onload = function() {
            renderSummaryOfDistribution(); // Call function on load
        }
    </script>
</body>
</html>
`);

    iframeDoc.close();
}

//====================================================================================================================================================================

//================================================================== DL TABLES IN PDF PORMAT =========================================================================
document.querySelector(".downloadPDF").addEventListener('click', async () => {
    const userConfirmed = confirm("Do you want to save the PDF?");
    
    if (!userConfirmed) {
      window.alert("PDF save cancelled.");
      return; 
    }
  
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape', 'mm', 'a4');
  
    const addIframeToPDF = (iframe, isFirstPage) => {
      return new Promise((resolve, reject) => {
        const iframeLoadCheck = setInterval(() => {
          if (iframe.contentDocument.readyState === 'complete') {
            clearInterval(iframeLoadCheck);
            console.log("Iframe loaded successfully!");
            
            html2canvas(iframe.contentDocument.body, {
              scale: 2, 
              logging: false, 
              useCORS: true, 
            }).then(canvas => {
              console.log("Canvas created:", canvas); 
              const imgData = canvas.toDataURL('image/jpeg', 1.0);
              const pageWidth = doc.internal.pageSize.getWidth();
              const pageHeight = doc.internal.pageSize.getHeight();
  
              if (!isFirstPage) {
                doc.addPage();
              }
  
              doc.addImage(imgData, 'JPEG', 10, 10, pageWidth - 20, pageHeight - 20);
              resolve();
            }).catch(reject);
          }
        }, 100); 
      });
    };
  
    try {
      await addIframeToPDF(document.querySelector(".tableIframe"), true);
      await addIframeToPDF(document.querySelector(".sodIframe"), false);
      
      console.log("Saving PDF...");
      doc.save('class-record.pdf'); 
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  });

//============================================================= NOT WOKRING ===============================================================
function launchConfetti() {
    if (document.body) {
      var pumpkin = confetti.shapeFromPath({
        path: 'M449.4 142c-5 0-10 .3-15 1...',
        matrix: [0.020491803278688523, 0, 0, 0.020491803278688523, -7.172131147540983, -5.9016393442622945]
      });
  
      var defaults = {
        scalar: 2,
        spread: 180,
        particleCount: 30,
        origin: { y: -0.1 },
        startVelocity: -35
      };
  
      confetti({
        ...defaults,
        shapes: [pumpkin],
        colors: ['#ff9a00', '#ff7400', '#ff4d00']
      });
    }
  }
  

//============================================================= CALL MY WONDERFUL FUNCTIONS =========================================================================
window.onload = function() {
    injectScriptIntoIframe();
    injectSODIntoIframe();
    launchConfetti();
}

document.querySelector(".closePrev").addEventListener('click', () => {
    window.close();
})

document.querySelector('.saveClassRecord').addEventListener('click', async () => {

    const userConfirm = confirm("Are you sure you want to save this Class Record?");

    if(!userConfirm) {
        window.alert("Class Record save cancelled.");
        return;
    }

    //=================
    const iframe = document.querySelector(".sodIframe");
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

    const aRemark = iframeDoc.querySelector(".aRemark").value;
    const pRemark = iframeDoc.querySelector(".pRemark").value;
    const apRemark = iframeDoc.querySelector(".apRemark").value;
    const dRemark = iframeDoc.querySelector(".dRemark").value;
    const bRemark = iframeDoc.querySelector(".bRemark").value;
    const droppedRemark = iframeDoc.querySelector(".droppedRemark").value;
    const iRemark = iframeDoc.querySelector(".iRemark").value;

    //yung suggestion ni boss rich
    const adminRecommendingApproval = iframeDoc.querySelector(".adminRecommendingApproval").value;
    const adminPosition = iframeDoc.querySelector(".adminPosition").value;

    if(!aRemark && pRemark && apRemark && dRemark && bRemark && droppedRemark && iRemark) {
        window.alert("No remarks was saved")
    }
    
    if(!adminRecommendingApproval || !adminPosition){
        window.alert("No admin details was saved")
    }
    //=================

    const classId = getClassIdFromURL();
    const user = getUserFromURL();
    
    try {
        const response = await fetch('/saveClassRecord', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ classId, user, aRemark, pRemark, apRemark, dRemark, bRemark, droppedRemark, iRemark, adminRecommendingApproval, adminPosition}), 
        });
        

        const result = await response.json();
        if (response.ok) {
            alert(result.message || 'Class record saved successfully!');
        } else {
            alert(result.message || 'Failed to save class record');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while saving the class record.');
    }
});


/*---------------------------------------------------------------------------------------------------------------------
//======================================== WORKING SO FINEEEEEEEEEEE BUT WITHOUT IFRAME ===============================
//---------------------------------------------------------------------------------------------------------------------

async function renderClassRecord() {
    const classId = getClassIdFromURL(); // Get the `classId` from the URL

    if (!classId) {
        console.error('Class ID not found in URL');
        return;
    }

    try {
        const response = await fetch(`/getClassRecordData/${classId}`, {
            method: 'GET',
            credentials: 'include', // Include session credentials
        });

        if (!response.ok) {
            console.error("Failed to fetch class data");
            return;
        }

        const classRecordData = await response.json();

        // Ensure all required data is available
        const {
            classDetails = {},
            teacher = {},
            students = [],
            tasks = {},
            remarks = {},
            components = {},
        } = classRecordData;

        // Render header
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
                            <p class="dept">${teacher.department}</p>
                            <p>2024-2025</p>
                            <p>${classDetails.semester}, ${classDetails.term}</p>
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
                        <p class="sbjcode-sbj">${classDetails.subjectCode} - ${classDetails.subjectTitle}</p>
                        <p>${classDetails.year} ${classDetails.section}</p>
                        <p class="sensei">${teacher.name}</p>
                    </div>  
                </div>
            </div>
            </div>
                `;
        }

        // Render table
        const tableContainer = document.querySelector('.tableContainer');
        if (tableContainer) {
            const tableRows = students.map((student, index) => `
            <tr class="studentRow">
               <td class="sn">${index + 1}</td>
               <td class="studentName">${student.A}</td>
               <td class="lrn">${student.B || 'N/A'}</td>
               ${remarks[index]?.taskAndScore?.writtenWork
                ? remarks[index].taskAndScore.writtenWork.map(task => `<td>${task.score}</td>`).join('')
                : ''}
               <td class="wwSubtotalValue">${remarks[index]?.finalRemark.writtenWork[0]?.sst}</td>
               <td class="wwRatingsValue">${remarks[index].finalRemark.writtenWork[2]?.srating}</td>
               <td class="wwRateValue">${remarks[index].finalRemark.writtenWork[4]?.percentage}</td>
               ${remarks[index]?.taskAndScore?.performanceTask
                ? remarks[index].taskAndScore.performanceTask.map(task => `<td>${task.score}</td>`).join('')
                : ''}
               <td class="ptSubtotalValue">${remarks[index]?.finalRemark.performanceTask[0]?.sst}</td>
               <td class="ptRatingsValue">${remarks[index].finalRemark.performanceTask[2]?.srating}</td>
               <td class="ptRateValue">${remarks[index].finalRemark.performanceTask[4]?.percentage}</td>
               <td class="examSubtotalValue">${remarks[index]?.finalRemark.exam[0]?.sst}</td>
               <td class="examRatingsValue">${remarks[index].finalRemark.exam[2]?.srating}</td>
               <td class="examRateValue">${remarks[index].finalRemark.exam[4]?.percentage}</td>
               <td class="initialGrade">${remarks[index].finalRemark.rating[0].initialGrade}</td>
               <td class="finalGrade">${remarks[index].finalRemark.rating[1].finalGrade}</td>
               <td class="proficiencyLevel">${remarks[index].finalRemark.rating[2].proficiencylvl}</td>
               <td class="rank">${remarks[index].finalRemark.rating[3].rank}</td>
               <td class="remark">${remarks[index].finalRemark.rating[4].remarks}</td>
            </tr>
            `).join("");

            tableContainer.innerHTML = `
            <table>
            <tr class="first-row">
                <th class="snLabel">SN</th>
                <th class="studentnameLabel">Learners' Names</th>
                <th class="lrnLabel">LRN</th>
                <th colspan="${remarks[0].taskAndScore?.writtenWork?.length + 3}">WRITTEN WORKS</th> 
                <th colspan="${remarks[0].taskAndScore?.performanceTask?.length + 3}">PERFORMANCE TASKS</th>
                <th colspan="3">MIDTERM EXAMINATION</th>
                <th colspan="5">MIDTERM RATING</th>
            </tr>
            
            <tr class="second-row">
                <th></th>
                <th></th>
                <th></th>
                <th colspan="${remarks[0].taskAndScore?.writtenWork?.length || 1}">ASSIGNMENTS/SEATWORKS/QUIZZES</th>
                <th class="subtotalLabel" rowspan="2">ST</th>
                <th class="ratingsLabel" rowspan="2">R</th>
                <th class="rateLabel" rowspan="2">%</th>
                <th colspan="${remarks[0].taskAndScore?.performanceTask?.length || 1}">OUPUTS/ACTIVITIES/CL</th>
                <th class="subtotalLabel" rowspan="2">ST</th>
                <th class="ratingsLabel" rowspan="2">R</th>
                <th class="rateLabel" rowspan="2">%</th>
                <th class="subtotalLabel" rowspan="2">S</th>
                <th class="ratingsLabel" rowspan="2">R</th>
                <th class="rateLabel" rowspan="2">%</th>
                <th class="initialGrade" rowspan="3">INITIAL GRADE</th>
                <th class="finalGrade" rowspan="3">GRADE</th>
                <th class="proficiencyLevel" rowspan="3">PL</th>
                <th class="rank" rowspan="3">RANK</th>
                <th class="remarks" rowspan="3">REMARKS</th>
            </tr>
            
            <tr class="date-row">
                <td class="dateLabel" colspan="3">Date Accomplished</td>
                ${remarks[0]?.taskAndScore?.writtenWork
                    ? remarks[0].taskAndScore.writtenWork.map(task => `<td class="wwDate">${task.date}</td>`).join('')
                    : ''}
                 ${remarks[0]?.taskAndScore?.performanceTask
                    ? remarks[0].taskAndScore.performanceTask.map(task => `<td class="wwDate">${task.date}</td>`).join('')
                    : ''}
                 ${remarks[0]?.taskAndScore?.exam
                    ? remarks[0].taskAndScore.exam.map(task => `<td class="wwDate">${task.date}</td>`).join('')
                    : ''}
            </tr>
            
            <tr class="third-row">
                <td class="hpsLabel" colspan="3">Highest Possible Score</td>
                ${remarks[0]?.taskAndScore?.writtenWork
                ? remarks[0].taskAndScore.writtenWork.map(task => `<td class="wwHPS">${task.maxScore}</td>`).join('')
                : ''}
                <td class="wwSubtotal">${remarks[0].finalRemark.writtenWork[1]?.st}</td>
                <td class="wwRatings">100</td>
                <td class="wwComponentRate">${components.writtenwork}</td>
                ${remarks[0]?.taskAndScore?.performanceTask
                ? remarks[0].taskAndScore.performanceTask.map(task => `<td class="ptHPS">${task.maxScore}</td>`).join('')
                : ''}
                <td class="ptSubtotal">${remarks[0].finalRemark.performanceTask[1]?.st}</td>
                <td class="ptRatings">100</td>
                <td class="ptComponentRate">${components.performancetask}</td>
                <td class="examSubtotal">${remarks[0].finalRemark.exam[1]?.st}</td>
                <td class="examRatings">100</td>
                <td class="examComponentRate">${components.exam}</td>
            </tr>
            ${tableRows}
            </table>`;
        }
    } catch (error) {
        console.error("Error rendering class record:", error);
    }
}

window.onload = renderClassRecord;


//---------------------------------------------------------------------------------------------------------------------------------------------
//================================================= WORKING BUT WITHOUT IFRAME ================================================================
//---------------------------------------------------------------------------------------------------------------------------------------------
/*
async function renderSummaryOfDistribution() {
    const classId = getClassIdFromURL(); // Get the `classId` from the URL

    if (!classId) {
        console.error('Class ID not found in URL');
        return;
    }

    try {
        const response = await fetch(`/getClassRecordData/${classId}`, {
            method: 'GET',
            credentials: 'include', // Include session credentials
        });

        if (!response.ok) {
            console.error("Failed to fetch class data");
            return;
        }

        const classRecordData = await response.json();

        // Ensure all required data is available
        const {
            classDetails = {},
            teacher = {},
            remarks = []
        } = classRecordData;

        // Count the proficiency levels
        const proficiencyCounts = remarks.reduce((acc, remark) => {
           const level = remark.finalRemark?.rating[2]?.proficiencylvl;
           acc[level] = (acc[level] || 0) + 1; // Increment the count for the proficiency level
           return acc;
        }, {});

        const total = remarks.length;

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
                                <p>${teacher.department}</p>
                                <p>2024-2025</p>
                                <p>${classDetails.semester}, ${classDetails.term}</p>
                                <p class="sbjcode-sbj">${classDetails.subjectCode} - ${classDetails.subjectTitle}</p>
                                <p>${classDetails.year} ${classDetails.section}</p>
                                <p class="sensei">${teacher.name}</p>
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
                        <td>The students have submitted all the assessment with excellent application of knowledge and skills</td>
                    </tr>
                    <tr>
                        <td>Proficient 85 - 89</td>
                        <td>${proficiencyCounts['P'] || 0}</td>
                        <td>${(((proficiencyCounts['P'] || 0) / total) * 100).toFixed(2)}</td>
                        <td>The student have submitted all the requirements with above average application of knowledge and skills</td>
                    </tr>
                    <tr>
                        <td>Approaching Proficient 80 - 84</td>
                        <td>${proficiencyCounts['AP'] || 0}</td>
                        <td>${(((proficiencyCounts['AP'] || 0) / total) * 100).toFixed(2)}</td>
                        <td>The student did not fully submit most of their assessments with average skills and practice</td>
                    </tr>
                    <tr>
                        <td>Developing 75 - 79</td>
                        <td>${proficiencyCounts['D'] || 0}</td>
                        <td>${(((proficiencyCounts['D'] || 0)  / total) * 100).toFixed(2)}</td>
                        <td>The student did not fully submit most of their assessments with average skills and practice</td>
                    </tr>
                    <tr>
                        <td>Beginning &lt; 75</td>
                        <td>${proficiencyCounts['B'] || 0}</td>
                        <td>${(((proficiencyCounts['B'] || 0)  / total) * 100).toFixed(2)}</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>Incomplete</td>
                        <td>${proficiencyCounts['I'] || 0}</td>
                        <td>${(((proficiencyCounts['I'] || 0)  / total) * 100).toFixed(2)}</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>Dropped</td>
                        <td>${proficiencyCounts['D'] || 0}</td>
                        <td>${(((proficiencyCounts['D'] || 0)  / total) * 100).toFixed(2)}</td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>TOTAL</td>
                        <td>${total}</td>
                        <td>${((total / total) * 100).toFixed(2)}</td>
                        <td></td>
                    </tr>
                
                </table>
            </div>
            
        `;

        const sodContainer = document.querySelector(".sodContainer");
        sodContainer.appendChild(sodtable);
        


    } catch(error) {
        console.log(error);
    }

}
*/