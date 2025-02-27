//IMPORTS
const express = require('express');
const mainController = require('../controllers/mainClass');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Initialize router
const router = express.Router();

// Login and Register routes
router.get('/login', (req, res) => res.render('login'));
router.get('/register', (req, res) => res.render('register'));

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),  // Directory for uploads
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))  // Unique filename
});
const upload = multer({ storage });

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// Route to create class with file upload
router.post('/createclass', upload.single('fileUpload'), mainController.createclass);

//============================= for teacher ===================================

router.get('/main', mainController.backToMain);

router.get('/recordPage', mainController.recordPage);

router.get('/pendingPage', mainController.pendingPage);

router.get('/approvedPage', mainController.approvedPage);

router.get('/disapprovedPage', mainController.disapprovedPage);

//============================= for admin =====================================
router.get('/adminDashboard', mainController.adminDashboard);

router.get('/adminRecord', mainController.adminRecord);

router.get('/adminFaculty', mainController.adminFaculty);

router.get('/adminforApproval', mainController.adminforApproval);

router.get('/adminApproved', mainController.adminApproved);

router.get('/adminDisapproved', mainController.adminDisapproved);


// GET CLASSES
router.get('/getClasses', mainController.getClasses);

router.get('/openclass/:classId', mainController.openclass);

router.get('/getClassById/:classId', mainController.getClassById);

router.get('/getStudentById/:classId', mainController.getStudentById);

// DELETE CLASSES
router.delete('/deleteClass/:classId', mainController.deleteClass);

// GET/POST TASKS
router.post('/addTask/:classId', mainController.addTask);

router.get('/getTasks/:classId', mainController.getTasks);

router.get('/openTask', mainController.openTask);

router.get('/getTaskById/:taskId', mainController.getTaskById);


// OTHERS
router.post('/saveComponentRate/:classId', mainController.saveComponentRate);

router.delete('/deleteStudent/:classId/:lrn', mainController.deleteStudentByLRN);

router.delete('/deleteTask/:classId', mainController.deleteTask);

router.get('/fetchScoringData/:classId', mainController.fetchScoringData);

router.post('/saveScores/:classId', mainController.saveScores);


// Route to serve classRecord.html
router.get('/classRecord.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../Pages/classRecord.html')); // Adjust path as needed
  });

// Route to serve finalclassrecord.html
router.get('/finalClassRecord.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../Pages/finalClassRecord.html'));
})

// OTHERS (RECORDS)
router.get('/getClassRecordData/:classId', mainController.getClassRecordData);

router.post('/saveClassRecord', mainController.saveClassRecord);

router.get('/records/:username', mainController.getAllClassRecordsByUser);

router.post('/updateApprovalStatus', mainController.updateApprovalStatus);

router.get('/records', mainController.getRecordsByUser);

//========================================= admin landing page ============================================

router.get('/admin-dashboard.html', (req, res) => {
  // Check if session exists and if the user is an admin
  if (req.session.user && req.session.user.username === 'admin') {
      res.sendFile(path.join(__dirname, '../Pages', 'admin-dashboard.html'));  // serve the admin dashboard
  } else {
      res.redirect('/login'); 
  }
});
//===========================================================================================================

// OTHERS 
router.get('/getPendingRecords', mainController.getPendingRecords);

router.get('/getFinalClassRecord/:classId', mainController.getFinalClassRecord);

router.get('/getTotalCounts', mainController.getTotalCounts);

router.get('/getUserDetails', mainController.getUserDetails);

//===============================
router.get('/getForApprovalRecords', mainController.getForApprovalRecords);

router.get('/getApprovedRecords', mainController.getApprovedRecords);

router.get('/getDisapprovedRecords', mainController.getDisapprovedRecords);

//================================

router.get('/getPendingRecordsByUser', mainController.getPendingRecordsByUser);

router.get('/getApprovedRecordsByUser', mainController.getApprovedRecordsByUser);

router.get('/getDisapprovedRecordsByUser', mainController.getDisapprovedRecordsByUser);

router.get('/getNoStatusRecordsByUser', mainController.getNoStatusRecordsByUser);
// EXPORT 
module.exports = router;
