const attendanceSchema = require("../../client/model/attendance");
const holidaySchema = require("../../client/model/holiday");
const clientRoleSchema = require("../../client/model/role");
const clinetUserSchema = require("../../client/model/user");
const { getClientDatabaseConnection } = require("../../db/connection");
const roleModel = require("../../model/role");
const userModel = require("../../model/user");
const CustomError = require("../../utils/customeError");
const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");
const holidayService = require("../service/holiday.service");
const bcrypt = require("bcrypt")
const { DateTime } = require('luxon'); // Recommended: install luxon for reliable timezone handling



function getUTCForISTDate(dateStr, isStart = true) {  // dateStr = "2025-12-22"
    const dt = DateTime.fromFormat(dateStr, 'yyyy-MM-dd', { zone: 'Asia/Kolkata' });
    return (isStart ? dt.startOf('day') : dt.endOf('day')).toUTC().toJSDate();
}

exports.punchIn = async (req, res, next) => {
    const { employeeId, clientId } = req.body;
    // const nowInIST = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    // // Parse the IST string to get local date components
    // const todayInIST = new Date(nowInIST);
    // // Create todayDate using LOCAL components (not UTC)
    // const todayDate1 = new Date(
    //     todayInIST.getFullYear(),    // 2025 (local year)
    //     todayInIST.getMonth(),       // 11 (December, local month)
    //     todayInIST.getDate(),        // 22 (local date)
    //     0, 0, 0, 0                   // Midnight local time
    // );
    // const todayDate = convertDateFormat(todayDate1.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" }));


    const nowInIST = DateTime.now().setZone('Asia/Kolkata');
    const todayStartIST = nowInIST.startOf('day'); // Midnight in IST
    const tomorrowStartIST = todayStartIST.plus({ days: 1 });

    // Convert to UTC Date objects for MongoDB query (stored in UTC)
    const todayDate = new Date();

    try {

        const clientConnection = await getClientDatabaseConnection(clientId);
        const Attendance = clientConnection.model('attendance', attendanceSchema);
        const User = clientConnection.model('clientUsers', clinetUserSchema);

        // Fetch employee 
        const employee = await User.findById(employeeId);
        if (!employee) return res.status(statusCode.NotFound).send({ message: 'Employee not found' });

        // Check if holiday
        // const holiday = await Holiday.findOne({ date: todayDate });
        // if (holiday && holiday.applicableToAll) {
        //     return res.status(403).json({ message: 'Punch In disabled on holiday' });
        // }

        // Check if weekend/non-working day
        // const dayOfWeek = today.getDay();
        // if (!employee.shiftId.workingDays.includes(dayOfWeek)) {
        //     return res.status(403).json({ message: 'Punch In disabled on non-working day' });
        // }

        // Check existing attendance
        let attendance = await Attendance.findOne({ employeeId, date: todayDate });
        if (attendance && attendance.punchIn) {
            return res.status(statusCode.BadRequest).send({ message: 'Already punched in today' });
        }
        if (!attendance) {
            attendance = new Attendance({
                employeeId,
                date: todayDate,
                status: 'present',
            });
        }
        attendance.punchIn = todayDate;

        // // Calculate lateInMinutes (parse times)
        // const expectedStart = new Date(todayDate);
        // const [startHour, startMin] = employee.shiftId.startTime.split(':').map(Number);
        // expectedStart.setHours(startHour, startMin, 0, 0);
        // const graceEnd = new Date(expectedStart.getTime() + employee.shiftId.gracePeriodMinutes * 60000);

        // if (today > graceEnd) {
        //     attendance.lateInMinutes = Math.ceil((today - expectedStart) / 60000);
        //     attendance.status = 'late';
        // }

        await attendance.save();
        res.status(statusCode.OK).json({ message: 'Punched in successfully', attendance });
    } catch (error) {
        next(error);
    }

};





// exports.canPunchIn = async (req, res, next) => {
//     const { employeeId, clientId } = req.params;
//     // Fix: Use Indian Standard Time (IST) for "today"
//     // Get current time in IST
//     // const nowInIST = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
//     // const today = new Date(nowInIST);

//     // // Strip time to get midnight in IST (correct date only)
//     // const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

//     // console.log("todayDate", todayDate);


//     // // Log formatted for clarity (shows "2025-12-22" in IST)
//     // console.log("todayDate (IST formatted)", todayDate.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" }));

//     // Get current time in IST as string
//     const nowInIST = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

//     // Parse the IST string to get local date components
//     const todayInIST = new Date(nowInIST);

//     // Create todayDate using LOCAL components (not UTC)
//     const todayDate1 = new Date(
//         todayInIST.getFullYear(),    // 2025 (local year)
//         todayInIST.getMonth(),       // 11 (December, local month)
//         todayInIST.getDate(),        // 22 (local date)
//         0, 0, 0, 0                   // Midnight local time
//     );

//     // console.log("todayDate (IST formatted)", convertDateFormat(todayDate1.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })));

//     const todayDate = convertDateFormat(todayDate1.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" }));

//     console.log("todayDate", todayDate);



//     try {
//         const clientConnection = await getClientDatabaseConnection(clientId);
//         const Attendance = clientConnection.model('attendance', attendanceSchema);
//         const User = clientConnection.model('clientUsers', clinetUserSchema);
//         const Holiday = clientConnection.model('holiday', holidaySchema);

//         const employee = await User.findById(employeeId);
//         if (!employee) return res.status(statusCode.NotFound).json({ canPunch: false, message: 'Employee not found' });

//         let holidayQuery = {
//             isActive: true,
//             startDate: {
//                 $gte: todayDate,
//                 $lt: tomorrowStart
//             },
//             // endDate: { $gte: todayDate },
//         };

//         if (employee.isBuLevel) {
//             holidayQuery = {
//                 ...holidayQuery,
//                 businessUnit: employee.businessUnit
//             }
//         } else if (employee.isBranchLevel) {
//             holidayQuery = {
//                 ...holidayQuery,
//                 businessUnit: employee.businessUnit,
//                 branch: employee.branch
//             }
//         } else if (employee.isWarehouseLevel) {
//             holidayQuery = {
//                 ...holidayQuery,
//                 businessUnit: employee.businessUnit,
//                 branch: employee.branch,
//                 warehouse: employee.warehouse
//             }
//         }

//         console.log("holidayQuery", holidayQuery);



//         const holiday = await Holiday.findOne(holidayQuery);

//         console.log("holiday", holiday);


//         // // Check holiday
//         // const holiday = await Holiday.findOne({ date: todayDate });
//         // if (holiday && holiday.applicableToAll) {
//         //     return res.json({ canPunch: false, message: 'Today is a holiday' });
//         // }

//         // Check weekend/non-working day
//         // const dayOfWeek = today.getDay();
//         // if (!employee.shiftId.workingDays.includes(dayOfWeek)) {
//         //     return res.json({ canPunch: false, message: 'Today is a non-working day' });
//         // }

//         // Check if already punched in (optional, for better UX)
//         const attendance = await Attendance.findOne({ employeeId, date: todayDate });

//         console.log("attendance", attendance);


//         if (attendance && attendance.punchIn) {
//             return res.json({ canPunch: false, message: 'Already punched in today' });
//         }

//         return res.status(statusCode.OK).send({ canPunch: true });
//     } catch (error) {
//         next(error);
//     }
// }


function convertDateFormat(inputDate) {
    // Split the input: "22/12/2025" → ['22', '12', '2025']
    const [day, month, year] = inputDate.split('/');

    // Create a Date object in UTC to avoid local timezone shifts
    // Note: months are 0-indexed in JavaScript Date
    const date = new Date(Date.UTC(year, month - 1, day, 18, 30, 0, 0));

    // Return ISO string (will end with Z since it's UTC)
    return date.toISOString(); // → "2025-12-22T18:30:00.000Z"
}


exports.canPunchIn = async (req, res, next) => {
    const { employeeId, clientId } = req.params;

    try {

        const today = new Date();
        const a = new Date(today);
        const tomorrow = new Date(today.getDate() + 1);



        const clientConnection = await getClientDatabaseConnection(clientId);
        const Attendance = clientConnection.model('attendance', attendanceSchema);
        const User = clientConnection.model('clientUsers', clinetUserSchema); // Note: fix typo 'clinetUserSchema' → 'clientUserSchema'
        const Holiday = clientConnection.model('holiday', holidaySchema);

        const employee = await User.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ canPunch: false, message: 'Employee not found' });
        }


        console.log("todayDate", today);
        console.log("tomorrowDate", tomorrow);

        // Base holiday query: holidays active and starting today (in IST date)
        let holidayQuery = {
            isActive: true,
            startDate: {
                $gte: today,
                $lte: tomorrow
            }
        };

        // Apply scope based on employee level
        if (employee.isBuLevel || employee.isBuLevel === undefined) {
            holidayQuery.businessUnit = employee.businessUnit;
        } else if (employee.isBranchLevel) {
            holidayQuery.businessUnit = employee.businessUnit;
            holidayQuery.branch = employee.branch;
        } else if (employee.isWarehouseLevel) {
            holidayQuery.businessUnit = employee.businessUnit;
            holidayQuery.branch = employee.branch;
            holidayQuery.warehouse = employee.warehouse;
        }
        // Add vendor level if needed later

        console.log("Holiday Query:", holidayQuery);

        const holiday = await Holiday.findOne(holidayQuery);

        console.log("Found Holiday:", holiday ? holiday.name : 'None');

        if (holiday) {
            return res.json({
                canPunch: false,
                message: `Today is a holiday: ${holiday.name}`,
                holiday: {
                    name: holiday.name,
                    code: holiday.code,
                    isHalfDay: holiday.isHalfDay
                }
            });
        }

        // Optional: Check if already punched in
        // Note: You need to store 'date' as midnight UTC corresponding to IST date
        const attendance = await Attendance.findOne({
            employeeId,
            date: { $gte: today, $lt: tomorrow } // assuming 'date' field in attendance is also midnight UTC
        });

        console.log("attendance", attendance);

        if (attendance && attendance.punchIn) {
            return res.json({ canPunch: true, canPunchIn: false, message: 'Already punched in today', attendance: attendance });
        }

        return res.status(200).json({ canPunch: true, canPunchIn: true, message: 'Can punch in', attendance: null });

    } catch (error) {
        console.error("Error in canPunchIn:", error);
        next(error);
    }

}






// const { DateTime } = require('luxon');  // Ensure Luxon is imported

// exports.punchIn = async (req, res, next) => {
//     const { employeeId, clientId } = req.body;
//     const TZ = 'Asia/Kolkata';  // Centralize TZ for easy changes (e.g., for multi-region apps)

//     const nowInIST = DateTime.now().setZone(TZ);
//     const todayStartIST = nowInIST.startOf('day');  // Midnight IST
//     const todayDateUTC = todayStartIST.toUTC().toJSDate();  // Midnight IST in UTC
//     const todayStr = todayStartIST.toFormat('yyyy-MM-dd');  // "2025-12-22" in IST
//     const nowUTC = nowInIST.toUTC().toJSDate();  // Actual current time in UTC

//     try {
//         const clientConnection = await getClientDatabaseConnection(clientId);
//         const Attendance = clientConnection.model('attendance', attendanceSchema);
//         const User = clientConnection.model('clientUsers', clinetUserSchema);

//         const employee = await User.findById(employeeId);
//         if (!employee) return res.status(404).send({ message: 'Employee not found' });

//         // Check existing attendance using dateStr for consistency
//         let attendance = await Attendance.findOne({ employeeId, dateStr: todayStr });
//         if (attendance && attendance.punchIn) {
//             return res.status(400).send({ message: 'Already punched in today' });
//         }

//         if (!attendance) {
//             attendance = new Attendance({
//                 employeeId,
//                 date: todayDateUTC,  // UTC midnight for IST day
//                 dateStr: todayStr,   // Local date string
//                 status: 'present',
//             });
//         }

//         attendance.punchIn = nowUTC;  // Actual punch time in UTC

//         // Uncomment and fix late calculation (using Luxon for accuracy)
//         // const shiftStartIST = DateTime.fromObject({
//         //     year: todayStartIST.year,
//         //     month: todayStartIST.month,
//         //     day: todayStartIST.day,
//         //     hour: parseInt(employee.shiftId.startTime.split(':')[0]),
//         //     minute: parseInt(employee.shiftId.startTime.split(':')[1]),
//         // }, { zone: TZ });
//         // const graceEndIST = shiftStartIST.plus({ minutes: employee.shiftId.gracePeriodMinutes });
//         // if (nowInIST > graceEndIST) {
//         //     attendance.lateInMinutes = Math.ceil(nowInIST.diff(shiftStartIST, 'minutes').minutes);
//         //     attendance.status = 'late';
//         // }

//         await attendance.save();
//         // For response, convert times to IST for user-friendliness
//         const response = {
//             message: 'Punched in successfully',
//             attendance: {
//                 ...attendance.toObject(),
//                 punchInIST: DateTime.fromJSDate(attendance.punchIn).setZone(TZ).toISO(),
//                 dateIST: todayStr,
//             }
//         };
//         res.status(200).json(response);
//     } catch (error) {
//         next(error);
//     }
// };