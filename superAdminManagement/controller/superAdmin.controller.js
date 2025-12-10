

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const dotnev = require("dotenv");


const User = require("../../model/user");


const { generateOtp } = require("../../helper/common");
const { mailSender } = require("../../email/emailSend");
const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");


// env 
dotnev.config();
const PRIVATEKEY = process.env.PRIVATEKEY;



const { v4: uuidv4 } = require('uuid');
const path = require('path');
const AWS = require('aws-sdk');
const { getClientDatabaseConnection } = require("../../db/connection");
// DigitalOcean Spaces setup
const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACES_ENDPOINT);
const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
    s3ForcePathStyle: true,
    maxRetries: 5,
    retryDelayOptions: { base: 500 },
    httpOptions: { timeout: 60000 },
});

// Helper function to upload file to DigitalOcean Spaces
const uploadIconToS3 = async (file, clientId) => {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const fileName = `saasEcommerce/${clientId}/employee/${uuidv4()}${fileExtension}`;
    const params = {
        Bucket: process.env.DO_SPACES_BUCKET,
        Key: fileName,
        Body: file.buffer,
        ACL: 'public-read',
        ContentType: file.mimetype,
        Metadata: {
            'original-filename': file.originalname
        }
    };
    try {
        const { Location } = await s3.upload(params).promise();
        return {
            success: true,
            url: Location,
            key: fileName
        };
    } catch (error) {
        console.log("error in s3", error);

        throw new Error(`Failed to upload to S3: ${error.message}`);
    }
};






// Sign in
exports.signIn = async (req, res) => {
    try {
        const { identifier, password } = req.body;

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

        // Debugging logs
        console.log("isEmail:", isEmail);
        console.log("isPhone:", isPhone);

        // If neither a valid email nor a 10-digit phone number, return error
        if (!isEmail && !isPhone) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblInvalidEmailOrPhone
            });
        }

        // Construct the query based on whether it's email or phone
        const query = isEmail ? { email: identifier } : { phone: identifier };

        // Check if user exists
        const user = await User.findOne(query).populate('role');
        if (!user) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblNotFoundUser
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(statusCode.Unauthorized).send({
                message: message.lblAccountDeactivate
            });
        }

        // Check if user is verified
        if (!user.isUserVerified) {
            return res.status(statusCode.Unauthorized).send({
                message: message.lblUnVerified
            });
        }

        // Check role authorization
        if (user.roleId > 2) {
            return res.status(statusCode.Unauthorized).send({
                message: message.lblUnauthorize
            });
        }

        // Validate password
        const isPasswordValid = await user.isPasswordCorrect(password);
        if (!isPasswordValid) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblIncorrectPassword
            });
        }

        // Generate OTP and update user document
        const otp = generateOtp();
        const otpUpdate = await User.updateOne(
            { _id: user._id },
            { verificationOtp: otp, otpGeneratedAt: new Date() }
        );

        if (!otpUpdate.acknowledged) {
            throw new Error('Failed to update OTP');
        }

        // Send OTP email or SMS based on login type
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: "Email Verification for DYNO",
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
            message: message.lblSigninVerificationOtpSent
        });

    } catch (error) {
        console.error("SignIn Error:", error);
        return res.status(statusCode.InternalServerError).send({
            message: message.lblInternalServerError
        });
    }
};

// sign in with otp
exports.signInByOtp = async (req, res) => {
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
        const user = await User.findOne(query).populate('role');
        if (!user) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblNotFoundUser
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(statusCode.Unauthorized).send({
                message: message.lblAccountDeactivate
            });
        }

        // Check if account is verified
        if (!user.isUserVerified) {
            return res.status(statusCode.Unauthorized).send({
                message: message.lblUnVerified
            });
        }

        // Check if user has the appropriate role
        if (user.roleId > 2) {
            return res.status(statusCode.Unauthorized).send({
                message: message.lblUnauthorize
            });
        }

        // Validate OTP
        if (otp !== user.verificationOtp) {
            return res.status(statusCode.Unauthorized).send({
                message: message.lblOtpNotMatched
            });
        }

        // Set token expiration time
        const expiresIn = rememberMe ? '7d' : '1d';
        const token = jwt.sign({ id: user._id }, process.env.PRIVATEKEY, { expiresIn });

        // Calculate expiry timestamp for frontend use
        const expiryTime = new Date().getTime() + (rememberMe ? 7 : 1) * 24 * 60 * 60 * 1000;

        return res.status(statusCode.OK).send({
            token,
            expiryTime,
            adminInfo: user,
            message: message.lblLoginSuccess
        });

    } catch (error) {
        console.error("SignInByOtp Error:", error);
        return res.status(statusCode.InternalServerError).send({
            message: message.lblInternalServerError
        });
    }
};


// resend signIn Otp
exports.resendSignInOtp = async (req, res) => {
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
        const user = await User.findOne(query).populate('role');
        if (!user) {
            return res.status(statusCode.BadRequest).send({
                message: "User not found."
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(statusCode.Unauthorized).send({
                message: "Your account has been deactivated, please contact support."
            });
        }

        // Check if account is verified
        if (!user.isVerified) {
            return res.status(statusCode.Unauthorized).send({
                message: "Unverified user, please verify your email."
            });
        }

        // Check if user has appropriate role
        if (user.roleId > 2) {
            return res.status(statusCode.Unauthorized).send({
                message: "Unauthorized access."
            });
        }

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
        console.error("ResendSignInOtp Error:", error);
        return res.status(statusCode.InternalServerError).send({
            message: "Internal Server Error"
        });
    }
};


// forget passwoed 
exports.forgetPassword = async (req, res) => {
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
        if (!user) {
            return res.status(statusCode.BadRequest).send({
                message: "User not found."
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(statusCode.Unauthorized).send({
                message: "Your account has been deactivated, please contact support."
            });
        }

        // Check if account is verified
        if (!user.isUserVerified) {
            return res.status(statusCode.Unauthorized).send({
                message: "Unverified user, please verify your account."
            });
        }

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
        console.error("ForgetPassword Error:", error);
        return res.status(statusCode.InternalServerError).send({
            message: "Internal Server Error"
        });
    }
};

// reset password 
exports.resetPassword = async (req, res) => {
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
        if (!user) {
            return res.status(statusCode.BadRequest).send({
                message: "User not found."
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(statusCode.Unauthorized).send({
                message: "Your account has been deactivated, please contact support."
            });
        }

        // Check if account is verified
        if (!user.isUserVerified) {
            return res.status(statusCode.Unauthorized).send({
                message: "Unverified user, please verify your email."
            });
        }

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
        console.error("ResetPassword Error:", error);
        return res.status(statusCode.InternalServerError).send({
            message: "Internal Server Error"
        });
    }
};


// update profile
exports.updateProfile = async (req, res) => {
    try {
        const user = req.user;
        const {
            clientId, useId, firstName, lastName, gender,
            phone, city, state, country
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !useId) {
            return res.status(statusCode.BadRequest).send({
                message: "First name, last name, and useId are required."
            });
        }

        // Build the update profile object
        const profileUpdates = {
            firstName, lastName, gender,
            phone, city, state, country,
            profileCreated: true,
        };


        const clientConnection = await getClientDatabaseConnection(clientId);
        const User = clientConnection.model('clientUsers', clinetUserSchema);

        const profile = await User.findById(useId);

        if (!profile) {
            return res.status(statusCode.NotFound).send({
                success: false,
                message: "Profile not found."
            })
        }

         if (req.file) {
            const uploadResult = await uploadIconToS3(req.file, clientId);
            profileUpdates.profileImage = uploadResult.url;
            profileUpdates.iconKey = uploadResult.key; // Store S3 key for potential future deletion
        }

        Object.assign(profile, profileUpdates);

        await profile.save()
        return res.status(statusCode.OK).send({
            message: "Profile updated successfully.",
            data: profile
        });

    } catch (error) {
        console.error("Update Profile Error:", error);
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
        const { id } = req.params;

        // Fetch user by ID and select only required fields
        const user = await User.findById(id).select(
            'profileImage firstName middleName lastName  gender dateOfBirth  optionalEmail emergencyPhone phone city state country ZipCode address  email profileCreated '
        );

        // Check if user exists and profile is created
        if (!user) {
            return res.status(statusCode.NotFound).send({
                message: "User not found."
            });
        }

        if (!user.profileCreated) {
            return res.status(statusCode.NotFound).send({
                message: "Profile not found."
            });
        }

        // Return profile data
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


