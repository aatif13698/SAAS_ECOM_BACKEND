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

    const nowInIST = DateTime.now().setZone('Asia/Kolkata');
    const todayDateFormated = nowInIST.toUTC();
    const todayDate = todayDateFormated.toJSDate();

    // const todayDate = new Date();


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

exports.punchOut = async (req, res, next) => {
    const { employeeId, clientId } = req.body;
    const nowInIST = DateTime.now().setZone('Asia/Kolkata');
    const todayDateFormated = nowInIST.toUTC();
    const todayDate = todayDateFormated.toJSDate();

    try {

        const clientConnection = await getClientDatabaseConnection(clientId);
        const Attendance = clientConnection.model('attendance', attendanceSchema);
        const User = clientConnection.model('clientUsers', clinetUserSchema);


        const todayIst = DateTime.now().setZone('Asia/Kolkata').minus({ days: 1 });
        const todayUtc = todayIst.toUTC();
        const tomorrowTimeIst = DateTime.now().setZone('Asia/Kolkata')
        const tomorrowUtc = tomorrowTimeIst.toUTC();

        const query = {
            employeeId,
            date: { $gte: todayUtc.toJSDate(), $lt: tomorrowUtc.toJSDate() } // assuming 'date' field in attendance is also midnight UTC
        }

        console.log("query", query);



        const attendance = await Attendance.findOne(query);
        if (!attendance) return res.status(404).json({ message: 'No punch in record today' });
        if (attendance.punchOut) return res.status(400).json({ message: 'Already punched out' });

        attendance.punchOut = todayDate;

        // Calculate totalWorkedMinutes (simplified, exclude breaks if implemented)
        // attendance.totalWorkedMinutes = Math.floor((today - attendance.punchIn) / 60000);

        // // Fetch shift
        // const employee = await Employee.findById(employeeId).populate('shiftId');
        // const expectedEnd = new Date(todayDate);
        // const [endHour, endMin] = employee.shiftId.endTime.split(':').map(Number);
        // expectedEnd.setHours(endHour, endMin, 0, 0);

        // // Early out
        // const graceStart = new Date(expectedEnd.getTime() - employee.shiftId.gracePeriodMinutes * 60000);
        // if (today < graceStart) {
        //     attendance.earlyOutMinutes = Math.ceil((expectedEnd - today) / 60000);
        //     attendance.status = attendance.status === 'late' ? 'late_and_early_out' : 'early_out';
        // }

        // // Overtime (if worked more)
        // if (attendance.totalWorkedMinutes > employee.shiftId.dailyWorkingMinutes) {
        //     attendance.overtimeMinutes = attendance.totalWorkedMinutes - employee.shiftId.dailyWorkingMinutes;
        //     attendance.overtimeType = 'normal'; // Adjust based on day
        // }

        await attendance.save();
        return res.status(statusCode.OK).send({ message: 'Punched out successfully', attendance });
    } catch (error) {
        next(error);
    }

}




exports.canPunchIn = async (req, res, next) => {
    const { employeeId, clientId } = req.params;

    try {

        const todayIst = DateTime.now().setZone('Asia/Kolkata').minus({ days: 1 });
        const todayUtc = todayIst.toUTC();
        const tomorrowTimeIst = DateTime.now().setZone('Asia/Kolkata')
        const tomorrowUtc = tomorrowTimeIst.toUTC();

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
                $gte: todayUtc.toJSDate(),
                $lte: tomorrowUtc.toJSDate()
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

        const startOfTodayIst = DateTime.now()
            .setZone('Asia/Kolkata')
            .startOf('day');

        const endOfTodayIst = DateTime.now()
            .setZone('Asia/Kolkata')
            .endOf('day');

        const startOfTodayUtc = startOfTodayIst.toUTC().toJSDate();
        const endOfTodayUtc = endOfTodayIst.toUTC().toJSDate();
        const query = {
            employeeId,
            date: {
                $gte: startOfTodayUtc,
                $lte: endOfTodayUtc
            },
        }
        const attendance = await Attendance.findOne(query);

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