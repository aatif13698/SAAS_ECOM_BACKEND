const attendanceSchema = require("../../client/model/attendance");
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



exports.punchIn = async (req, res, next) => {
    const { employeeId, clientId } = req.body;
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()); // Midnight date

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
        attendance.punchIn = today;

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



exports.canPunchIn = async (req, res, next) => {
    const { employeeId, clientId } = req.params;
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Attendance = clientConnection.model('attendance', attendanceSchema);
        const User = clientConnection.model('clientUsers', clinetUserSchema);
        const employee = await User.findById(employeeId);
        if (!employee) return res.status(statusCode.NotFound).json({ canPunch: false, message: 'Employee not found' });

        // // Check holiday
        // const holiday = await Holiday.findOne({ date: todayDate });
        // if (holiday && holiday.applicableToAll) {
        //     return res.json({ canPunch: false, message: 'Today is a holiday' });
        // }

        // Check weekend/non-working day
        // const dayOfWeek = today.getDay();
        // if (!employee.shiftId.workingDays.includes(dayOfWeek)) {
        //     return res.json({ canPunch: false, message: 'Today is a non-working day' });
        // }

        // Check if already punched in (optional, for better UX)
        const attendance = await Attendance.findOne({ employeeId, date: todayDate });
        if (attendance && attendance.punchIn) {
            return res.json({ canPunch: false, message: 'Already punched in today' });
        }

        return res.status(statusCode.OK).send({ canPunch: true });
    } catch (error) {
        next(error);
    }
}