const express = require("express"); 
let router = express.Router(); 


const attendanceController = require("../controller/attendance.controller"); 

router.post('/punch-in/attendance', attendanceController.punchIn); 
router.post('/punch-out/attendance', attendanceController.punchOut); 
router.get('/can-punch-in/attendance/:clientId/:employeeId', attendanceController.canPunchIn); 
router.get('/get/attendance/:clientId/:employeeId', attendanceController.getAttendanceOfEmployee); 

exports.router = router; 