const express = require("express"); 
let router = express.Router(); 


const attendanceController = require("../controller/attendance.controller"); 

router.post('/punch-in/attendance', attendanceController.punchIn); 
router.get('/can-punch-in/attendance/:clientId/:employeeId', attendanceController.canPunchIn); 

exports.router = router; 