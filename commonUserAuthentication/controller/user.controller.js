

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const dotnev = require("dotenv");


const User = require("../../model/user");


const { generateOtp } = require("../../helper/common");
const { mailSender } = require("../../email/emailSend");
const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");

const { commonCheckForClient, commonCheckForCustomer } = require("../util/commonCheck");
const { staffInfo } = require("../util/staffInfo");
const { getClientDatabaseConnection } = require("../../db/connection");
const clientRoleSchema = require("../../client/model/role");
const CustomError = require("../../utils/customeError");
const clinetUserSchema = require("../../client/model/user");
const customerAddressSchema = require("../../client/model/customerAddress");

// env 
dotnev.config();
const PRIVATEKEY = process.env.PRIVATEKEY;

// sign up
exports.signup = async (req, res, next) => {
    try {
        const { clientId, roleId, firstName, lastName, identifier, password } = req.body;

        console.log("req.body", req.body);


        // Validate required fields
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }

        const requiredFields = [firstName, lastName, identifier, password];

        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }


        // Determine if identifier is an email or phone
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
        const isPhone = /^\d{10}$/.test(identifier);

        if (!isEmail && !isPhone) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblInvalidEmailOrPhone
            });
        }

        // Construct query based on identifier type
        const query = isEmail ? { email: identifier } : { phone: identifier };

        const clientConnection = await getClientDatabaseConnection(clientId);
        const Role = clientConnection.model('clientRoles', clientRoleSchema);
        const clientUser = clientConnection.model('clientUsers', clinetUserSchema);

        const existing = await clientUser.findOne(query);

        if (existing) {
            if (existing.isUserVerified) {
                return res.status(statusCode.Conflict).send({
                    message: message.lblEmailOrPhoneAlreadyExists,
                });
            } else {
                const otp = generateOtp();

                await clientUser.updateOne(query, {
                    verificationOtp: otp,
                    otpGeneratedAt: new Date()
                });

                const mailOptions = {
                    from: process.env.EMAIL_FROM,
                    to: isEmail ? identifier : null, // Only send email if it's an email identifier
                    subject: "Email Verification for Ecom",
                    template: "email",
                    context: {
                        otp,
                        name: firstName,
                        emailSignature: process.env.EMAIL_SIGNATURE,
                        appName: process.env.APP_NAME
                    },
                };

                if (isEmail) {
                    await mailSender(mailOptions);
                    return res.status(statusCode.OK).send({
                        message: "An Email Verification OTP Has Been Sent To Your Mail Id."
                    });
                }

                return res.status(statusCode.OK).send({
                    message: "OTP has been sent to your phone number."
                });
            }
        } else {
            const roleObj = await Role.findOne({ id: roleId });
            if (!roleObj) {
                return res.status(statusCode.BadRequest).send({ message: "Invalid roleId." });
            }

            const otp = generateOtp();
            const hash = bcrypt.hashSync(password, 10);

            const newUser = {
                firstName,
                lastName,
                password: hash,
                roleId,
                Role: roleObj._id,
                verificationOtp: otp,
                otpGeneratedAt: new Date(),
                tc: true,
            };

            if (isEmail) {
                newUser.email = identifier;
            } else {
                newUser.phone = identifier;
            }

            await clientUser.create(newUser);

            const mailOptions = {
                from: process.env.EMAIL_FROM,
                to: isEmail ? identifier : null,
                subject: "Email Verification for Ecom",
                template: "email",
                context: {
                    otp,
                    name: firstName,
                    emailSignature: process.env.EMAIL_SIGNATURE,
                    appName: process.env.APP_NAME
                },
            };

            if (isEmail) {
                await mailSender(mailOptions);
            }

            return res.status(statusCode.OK).send({
                message: isEmail
                    ? "An Email Verification OTP Has Been Sent To Your Mail Id."
                    : "OTP has been sent to your phone number."
            });
        }
    } catch (error) {
        next(error);
    }
};


// verify otp
exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp, clientId } = req.body;

        const clientConnection = await getClientDatabaseConnection(clientId);
        const clientUser = clientConnection.model('clientUsers', clinetUserSchema);
        const userExist = await clientUser.findOne({ email: email });
        if (userExist) {
            const currentTimestamp = new Date();
            if (userExist.otpGeneratedAt && currentTimestamp - userExist.otpGeneratedAt <= 5 * 60 * 1000) {
                if (userExist.verificationOtp == otp) {
                    await clientUser.updateOne({ email: email }, { isUserVerified: true });
                    return res.status(statusCode.OK).send({
                        message: "Verification Success"
                    });
                } else {
                    return res.status(statusCode.Conflict).send({
                        message: "OTP not matched"
                    });
                }
            } else {
                return res.status(statusCode.BadRequest).send({
                    message: "OTP has expired. Please request a new one."
                });
            }
        } else {
            return res.status(statusCode.BadRequest).send({
                message: "User not found"
            });
        }
    } catch (error) {
        return res.status(statusCode.InternalServerError).send({
            message: message.lblInternalServerError
        });
    }
};

// Sign in
exports.signIn = async (req, res, next) => {
    try {

        const { identifier, password, clientId } = req.body;

        // Validate input data
        if (!identifier || !password) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblMissingEmailOrPassword
            });
        }

        // Determine if identifier is an email or phone
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

        // Check if the identifier is a valid 10-digit phone number
        const isPhone = /^\d{10}$/.test(identifier);

        // If neither a valid email nor a 10-digit phone number, return error
        if (!isEmail && !isPhone) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblInvalidEmailOrPhone
            });
        }

        // Construct the query based on whether it's email or phone
        const query = isEmail ? { email: identifier } : { phone: identifier };

        const clientConnection = await getClientDatabaseConnection(clientId);
        const clientUser = clientConnection.model('clientUsers', clinetUserSchema);
        const userExist = await clientUser.findOne(query);

        await commonCheckForCustomer(userExist);

        // Validate password
        const isPasswordValid = await userExist.isPasswordCorrect(password);
        if (!isPasswordValid) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblIncorrectPassword
            });
        }

        const expiresIn = '180d';
        const token = jwt.sign({ id: clientId, identifier: identifier }, process.env.PRIVATEKEY, { expiresIn });
        const expiryTime = new Date().getTime() + 180 * 24 * 60 * 60 * 1000;

        return res.status(statusCode.OK).send({
            token,
            expiryTime,
            customerInfo: userExist,
            message: message.lblLoginSuccess
        });

    } catch (error) {
        next(error)
    }
};

// sign in with otp
exports.signInByOtp = async (req, res, next) => {

    try {
        const { identifier, otp, rememberMe } = req.body;  // Can be email or phone number

        // Validate input data
        if (!identifier || !otp) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblMissingEmailOrOtp
            });
        }

        // Check if identifier is email or phone number
        const isEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(identifier);
        const isPhone = /^\d{10}$/.test(identifier);  // Validates 10-digit phone number

        // If it's neither email nor phone number, return error
        if (!isEmail && !isPhone) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblInvalidEmailOrPhone
            });
        }

        // Query based on whether it's email or phone
        const query = isEmail ? { email: identifier } : { phone: identifier };

        // Find user and check if exists
        const user = await User.findOne(query).select('-password  -createdBy -isCreatedBySuperAdmin -deletedAt -createdAt -updatedAt -otpGeneratedAt ').populate('role', '-isActive -createdAt -updatedAt');

        await commonCheckForClient(user);

        // Validate OTP
        if (otp !== user.verificationOtp) {
            return res.status(statusCode.Unauthorized).send({
                message: message.lblOtpNotMatched
            });
        }

        const accessUnits = user?.accessUnit;
        console.log("accessUnits", accessUnits);

        if (accessUnits?.length == 0) {

            return res.status(statusCode.NotFound).send({
                message: "You dont have any access."
            })

        }

        // Set token expiration time
        const expiresIn = rememberMe ? '7d' : '1d';
        const token = jwt.sign({ id: accessUnits[0].id, email: user.email }, process.env.PRIVATEKEY, { expiresIn });
        const expiryTime = new Date().getTime() + (rememberMe ? 7 : 1) * 24 * 60 * 60 * 1000;


        const client = await staffInfo(accessUnits[0].id, user?.email);
        console.log("staff", client.role.capability);


        return res.status(statusCode.OK).send({
            token,
            expiryTime,
            adminInfo: client,
            clientId: accessUnits[0].id,
            businessUnitId: client?.businessUnit,
            message: message.lblLoginSuccess
        });

    } catch (error) {
        next(error)
    }
};

// resend signIn Otp
exports.resendSignInOtp = async (req, res, next) => {
    try {
        const { identifier } = req.body;  // Can be email or phone

        // Validate input
        if (!identifier) {
            return res.status(statusCode.BadRequest).send({
                message: "Identifier (email or phone) is required."
            });
        }

        // Check if identifier is an email or phone number
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
        const isPhone = /^\d{10}$/.test(identifier);  // Validates 10-digit phone number

        // If it's neither email nor phone number, return error
        if (!isEmail && !isPhone) {
            return res.status(statusCode.BadRequest).send({
                message: "Invalid email or phone number format."
            });
        }

        // Query based on whether it's email or phone
        const query = isEmail ? { email: identifier } : { phone: identifier };

        // Check if user exists
        const user = await User.findOne(query);

        await commonCheckForClient(user);

        // Generate OTP
        const otp = generateOtp();

        // Update OTP in the user record
        const otpUpdate = await User.updateOne(
            query,
            { verificationOtp: otp, otpGeneratedAt: new Date() }
        );

        if (!otpUpdate.acknowledged) {
            return res.status(statusCode.InternalServerError).send({
                message: "Failed to generate OTP, please try again."
            });
        }

        // Send OTP to email
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: "Sign-In OTP Verification",
            template: "loginOtp",
            context: {
                otp,
                name: user.firstName,
                emailSignature: process.env.EMAIL_SIGNATURE,
                appName: process.env.APP_NAME
            },
        };
        await mailSender(mailOptions);
        return res.status(statusCode.OK).send({
            message: "A sign-in verification OTP has been sent to your email."
        });


    } catch (error) {
        next(error)
    }
};


// forget passwoed 
exports.forgetPassword = async (req, res, next) => {
    try {
        const { identifier } = req.body;

        // Validate input
        if (!identifier) {
            return res.status(statusCode.BadRequest).send({
                message: "Identifier (email or phone) is required."
            });
        }

        // Check if the identifier is an email or phone
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
        const isPhone = /^\d{10}$/.test(identifier);  // Validates 10-digit phone numbers

        // If it's neither email nor phone number, return error
        if (!isEmail && !isPhone) {
            return res.status(statusCode.BadRequest).send({
                message: "Invalid email or phone number format."
            });
        }

        // Query based on whether it's email or phone
        const query = isEmail ? { email: identifier } : { phone: identifier };

        // Check if user exists
        const user = await User.findOne(query);

        await commonCheckForClient(user);

        // Generate OTP
        const otp = generateOtp();

        // Update OTP in the user record
        const otpUpdate = await User.updateOne(
            query,
            { OTP: otp, otpGeneratedAt: new Date() }
        );

        if (!otpUpdate.acknowledged) {
            return res.status(statusCode.InternalServerError).send({
                message: "Failed to generate OTP, please try again."
            });
        }

        // Send OTP to email
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: "Password Reset OTP",
            template: "forgetPassword",
            context: {
                otp,
                name: user.firstName,
                emailSignature: process.env.EMAIL_SIGNATURE,
                appName: process.env.APP_NAME
            }
        };
        await mailSender(mailOptions);
        return res.status(statusCode.OK).send({
            message: "OTP has been sent to your email."
        });

    } catch (error) {
        next(error)
    }
};

// reset password
exports.resetPassword = async (req, res, next) => {

    try {
        const { identifier, password, otp } = req.body;  // Can be email or phone

        // Validate input
        if (!identifier || !password || !otp) {
            return res.status(statusCode.BadRequest).send({
                message: "Identifier (email or phone), password, and OTP are required."
            });
        }

        // Check if identifier is email or phone number
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
        const isPhone = /^\d{10}$/.test(identifier);  // Validates 10-digit phone number

        // If it's neither email nor phone number, return error
        if (!isEmail && !isPhone) {
            return res.status(statusCode.BadRequest).send({
                message: "Invalid email or phone number format."
            });
        }

        // Query based on whether it's email or phone
        const query = isEmail ? { email: identifier } : { phone: identifier };

        // Check if user exists
        const user = await User.findOne(query);

        await commonCheckForClient(user);

        // Check if OTP exists (user must have requested a password reset)
        if (!user.OTP) {
            return res.status(statusCode.Conflict).send({
                message: "You did not request a password reset."
            });
        }

        // Check OTP match and reset password if valid
        if (otp !== user.OTP) {
            return res.status(statusCode.Conflict).send({
                message: "OTP does not match."
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user password and clear OTP
        const updateResult = await User.updateOne(
            query,  // Use email or phone as query
            { password: hashedPassword, OTP: null }  // Clear OTP after successful password reset
        );

        if (!updateResult.acknowledged) {
            throw new Error("Failed to update password.");
        }

        return res.status(statusCode.OK).send({
            message: "Password reset successful."
        });

    } catch (error) {
        next(error)
    }
};

// edit profile
exports.editProfile = async (req, res) => {
    try {
        const user = req.user;
        const {
            clientId, firstName, lastName,
            removeProfileImage
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName) {
            return res.status(statusCode.BadRequest).send({
                message: "First name and last name are required."
            });
        }
        // Build the update profile object
        const profileUpdates = {
            firstName,
            lastName,
            profileCreated: true,
        };
        // Update profile image if provided
        if (req.file?.filename) {
            profileUpdates.profileImage = req.file.filename;
        }
        // Remove profile image if requested
        if (removeProfileImage === "true") {
            profileUpdates.profileImage = null;
        }
        const clientConnection = await getClientDatabaseConnection(clientId);
        const clientUser = clientConnection.model('clientUsers', clinetUserSchema);
        const updatedUser = await clientUser.findOneAndUpdate(
            { _id: user._id },
            { $set: profileUpdates },
            { new: true, runValidators: true }
        );
        if (!updatedUser) {
            return res.status(statusCode.NotFound).send({
                message: "User not found."
            });
        }
        // Return the updated profile
        const updatedProfile = {
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            profileImage: updatedUser.profileImage
        };
        return res.status(statusCode.OK).send({
            message: "Profile edited successfully.",
            data: updatedProfile
        });

    } catch (error) {
        console.error("edit Profile Error:", error);
        return res.status(statusCode.InternalServerError).send({
            message: errorMessage.lblInternalServerError
        });
    }
};

// Helper function to parse 'dd/mm/yyyy' to 'yyyy-mm-dd'
const parseDate = (dateStr) => {
    // Check if the date is in 'dd/mm/yyyy' format
    const dateParts = dateStr.split('/');
    if (dateParts.length === 3) {
        const [day, month, year] = dateParts;
        const date = new Date(`${year}-${month}-${day}`); // Reformat as 'yyyy-mm-dd'
        return isNaN(date.getTime()) ? null : date; // Return date if valid, else null
    }
    return null; // Return null if the date format is invalid
};

// get profile
exports.getProfile = async (req, res) => {
    try {
        const { clientId, customerId } = req.params;
        const clientConnection = await getClientDatabaseConnection(clientId);
        const clientUser = clientConnection.model('clientUsers', clinetUserSchema);
        const user = await clientUser.findById(customerId).select(
            'profileImage firstName lastName  email profileCreated '
        );
        if (!user) {
            return res.status(statusCode.NotFound).send({
                message: "User not found."
            });
        }
        return res.status(statusCode.OK).send({
            data: user,
            message: "Profile retrieved successfully."
        });
    } catch (error) {
        console.error("Error in getProfile:", error);
        return res.status(statusCode.InternalServerError).send({
            message: errorMessage.lblInternalServerError
        });
    }
};



// add new address
exports.addNewAddress = async (req, res, next) => {
    try {
        const { clientId, fullName, phone, alternamtivePhone, country, state, city, ZipCode, houseNumber, roadName, nearbyLandmark, address } = req.body;
        const user = req.user;
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }
        const requiredFields = [fullName, phone, alternamtivePhone, country, state, city, ZipCode, houseNumber, roadName, nearbyLandmark, address];
        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Role = clientConnection.model('clientRoles', clientRoleSchema);
        const clientUser = clientConnection.model('clientUsers', clinetUserSchema);
        const customerAddress = clientConnection.model('customerAddress', customerAddressSchema);
        const customer = await clientUser.findById(user?._id);
        if (!customer) {
            return res.status(statusCode.NotFound).send({
                message: "User not found."
            });
        }
        const createdAddress = await customerAddress.create({
            customerId: user?._id,
            fullName, phone, alternamtivePhone, country, state, city, ZipCode, houseNumber, roadName, nearbyLandmark, address
        });
        return res.status(statusCode.OK).send({
            message: "Address added successfully!",
            createdAddress: createdAddress
        });
    } catch (error) {
        next(error);
    }
};



// create business info
exports.createBusinessInfo = async (req, res) => {
    try {
        const user = req.user;
        const {
            clientId, businessName, tanNumber,
            licenseNumber, gstin, businessAddress
        } = req.body;
        // Validate required fields
        if (!businessName || !tanNumber || !licenseNumber || !gstin || !businessAddress) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblRequiredFieldMissing
            });
        }
        // Build the update business object
        const businessUpdates = {
            businessName, tanNumber,
            licenseNumber, gstin, businessAddress,
            isBusinessAccount : true
        };
        const clientConnection = await getClientDatabaseConnection(clientId);
        const clientUser = clientConnection.model('clientUsers', clinetUserSchema);
        const updatedUser = await clientUser.findOneAndUpdate(
            { _id: user._id },
            { $set: businessUpdates },
            { new: true, runValidators: true }
        );
        if (!updatedUser) {
            return res.status(statusCode.NotFound).send({
                message: "User not found."
            });
        }
        // Return the updated profile
        const updatedBusiness = {
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            profileImage: updatedUser.profileImage
        };
        return res.status(statusCode.OK).send({
            message: "Business updated successfully.",
            data: updatedBusiness
        });
    } catch (error) {
        console.error("Business Updatation Error:", error);
        return res.status(statusCode.InternalServerError).send({
            message: errorMessage.lblInternalServerError
        });
    }
};



// get business info
exports.getBusinessInfo = async (req, res) => {
    try {
        const { clientId, customerId } = req.params;
        const clientConnection = await getClientDatabaseConnection(clientId);
        const clientUser = clientConnection.model('clientUsers', clinetUserSchema);
        const user = await clientUser.findById(customerId).select('businessName tanNumber licenseNumber gstin businessAddress isBusinessAccount');
        if (!user) {
            return res.status(statusCode.NotFound).send({
                message: "User not found."
            });
        }
        return res.status(statusCode.OK).send({
            data: user,
            message: "Business Data Found successfully."
        });
    } catch (error) {
        console.error("Error in getting business data:", error);
        return res.status(statusCode.InternalServerError).send({
            message: errorMessage.lblInternalServerError
        });
    }
};
