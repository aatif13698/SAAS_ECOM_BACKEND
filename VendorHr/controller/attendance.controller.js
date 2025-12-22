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
    const todayDate = todayStartIST.toUTC().toJSDate();

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

function convertDateFormat(inputDate) {
    // Split the input: "22/12/2025" → ['22', '12', '2025']
    const [day, month, year] = inputDate.split('/');

    // Create a Date object in UTC to avoid local timezone shifts
    // Note: months are 0-indexed in JavaScript Date
    const date = new Date(Date.UTC(year, month - 1, day, 18, 30, 0, 0));

    // Return ISO string (will end with Z since it's UTC)
    return date.toISOString(); // → "2025-12-22T18:30:00.000Z"
}



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


exports.canPunchIn = async (req, res, next) => {
    const { employeeId, clientId } = req.params;

    try {
        // === Get today's date in IST (midnight) ===
        const nowInIST = DateTime.now().setZone('Asia/Kolkata');
        const todayStartIST = nowInIST.startOf('day'); // Midnight in IST
        const tomorrowStartIST = todayStartIST.plus({ days: 1 });

        // Convert to UTC Date objects for MongoDB query (stored in UTC)
        const todayStartUTC = todayStartIST.toUTC().toJSDate();
        const tomorrowStartUTC = tomorrowStartIST.toUTC().toJSDate();

        console.log("Today in IST:", todayStartIST.toISODate()); // e.g., 2025-12-22
        console.log("Query range (UTC):", todayStartUTC, "to", tomorrowStartUTC);

        const clientConnection = await getClientDatabaseConnection(clientId);
        const Attendance = clientConnection.model('attendance', attendanceSchema);
        const User = clientConnection.model('clientUsers', clinetUserSchema); // Note: fix typo 'clinetUserSchema' → 'clientUserSchema'
        const Holiday = clientConnection.model('holiday', holidaySchema);

        const employee = await User.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ canPunch: false, message: 'Employee not found' });
        }

        // Base holiday query: holidays active and starting today (in IST date)
        let holidayQuery = {
            isActive: true,
            startDate: {
                $gte: todayStartUTC,
                $lt: tomorrowStartUTC
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

        console.log("todayStartUTC", todayStartUTC);
        console.log("tomorrowStartUTC", tomorrowStartUTC);


        // Optional: Check if already punched in
        // Note: You need to store 'date' as midnight UTC corresponding to IST date
        const attendance = await Attendance.findOne({
            employeeId,
            date: { $gte: todayStartUTC, $lt: tomorrowStartUTC } // assuming 'date' field in attendance is also midnight UTC
        });

        // const attendance = await Attendance.findOne({ employeeId, date: todayStartUTC });

        console.log("attendance", attendance);



        if (attendance && attendance.punchIn) {
            return res.json({ canPunch: false, message: 'Already punched in today' });
        }

        return res.status(200).json({ canPunch: true, message: 'Can punch in' });

    } catch (error) {
        console.error("Error in canPunchIn:", error);
        next(error);
    }

}