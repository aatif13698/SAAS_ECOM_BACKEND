// const cron = require('node-cron');
// const { DateTime } = require('luxon');
// const mongoose = require('mongoose');
// const { getClientDatabaseConnection } = require('../db/clientConnection'); // your multi-tenant connection fn

// // Schemas (assume they are imported or accessible)
// const attendanceSchema = require('../schemas/attendanceSchema');
// const leaveRequestSchema = require('../schemas/leaveRequestSchema'); // your leave schema
// const clientUsersSchema = require('../schemas/clientUsersSchema'); // employee schema

// // Run every day at 11:00 PM IST
// cron.schedule('0 23 * * *', async () => {
//     console.log('Daily Attendance Close Job started at 11:00 PM IST');

//     const now = DateTime.now().setZone('Asia/Kolkata');
//     const today = now.startOf('day').toJSDate(); // Midnight IST today

//     try {
//         // Get all active clients (tenants)
//         const clients = await mongoose.connection.db.collection('clients').find({ isActive: true }).toArray();

//         for (const client of clients) {
//             const clientId = client._id.toString();
//             console.log(`Processing client: ${clientId}`);

//             const connection = await getClientDatabaseConnection(clientId);

//             const Attendance = connection.model('Attendance', attendanceSchema);
//             const LeaveRequest = connection.model('LeaveRequest', leaveRequestSchema);
//             const Employee = connection.model('ClientUser', clientUsersSchema); // adjust model name

//             // Step 1: Find all active employees
//             const employees = await Employee.find({
//                 isActive: true,
//                 // Optional: filter by shift/workday if needed
//             }).populate('shiftId');

//             for (const employee of employees) {
//                 const employeeId = employee._id;

//                 // Check if employee has attendance for today
//                 let attendance = await Attendance.findOne({ employeeId, date: today });

//                 // Step 2: Check if on approved leave today
//                 const isOnLeave = await LeaveRequest.exists({
//                     employeeId,
//                     status: 'approved',
//                     startDate: { $lte: today },
//                     endDate: { $gte: today },
//                 });

//                 if (!attendance) {
//                     // No attendance record → create one

//                     const newAttendance = new Attendance({
//                         employeeId,
//                         date: today,
//                         expectedMinutes: employee.shiftId?.dailyWorkingMinutes || 480,
//                         status: isOnLeave ? 'on_leave' : 'absent',
//                         notes: isOnLeave ? 'Auto-generated: On approved leave' : 'Auto-generated: Absent - no punch',
//                         createdBy: null, // System
//                     });

//                     await newAttendance.save();
//                     console.log(`Created attendance for ${employee.employeeId || employee._id} → ${newAttendance.status}`);
//                 } else if (attendance.punchIn && !attendance.punchOut) {
//                     // Has punch-in but no punch-out → auto close at shift end time

//                     const shift = employee.shiftId;
//                     if (!shift) continue;

//                     const [endHour, endMin] = shift.endTime.split(':').map(Number);
//                     const autoPunchOutTime = DateTime.fromJSDate(today)
//                         .setZone('Asia/Kolkata')
//                         .set({ hour: endHour, minute: endMin, second: 0, millisecond: 0 })
//                         .toJSDate();

//                     // Update attendance
//                     attendance.punchOut = autoPunchOutTime;
//                     attendance.totalWorkedMinutes = Math.floor((autoPunchOutTime - attendance.punchIn) / 60000);
//                     attendance.status = 'present'; // or 'early_out' if you want to mark it
//                     attendance.notes = attendance.notes ? attendance.notes + ' | Auto punch-out at shift end' : 'Auto punch-out at shift end';

//                     await attendance.save();
//                     console.log(`Auto punch-out for ${employee.employeeId || employee._id} at ${autoPunchOutTime}`);
//                 }
//             }
//         }

//         console.log('Daily Attendance Close Job completed successfully');
//     } catch (error) {
//         console.error('Error in Daily Attendance Close Job:', error);
//     }
// }, {
//     timezone: 'Asia/Kolkata' // Important: ensures job runs at 11 PM IST regardless of server timezone
// });

// module.exports = () => {
//     console.log('Attendance close cron job scheduled (every day 11:00 PM IST)');
// };