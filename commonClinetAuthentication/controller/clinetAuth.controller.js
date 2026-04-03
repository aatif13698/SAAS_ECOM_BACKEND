

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const dotnev = require("dotenv");


const User = require("../../model/user");


const { generateOtp } = require("../../helper/common");
const { mailSender } = require("../../email/emailSend");
const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");

const { commonCheckForClient } = require("../util/commonCheck");
const { clientInfo } = require("../util/clientInfo");



const { v4: uuidv4 } = require('uuid');
const path = require('path');
const AWS = require('aws-sdk');
const companyConfigureSchema = require("../../client/model/companyConfigure");
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
const uploadToS3 = async (file, clientId, type) => {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const fileName = `saasEcommerce/${clientId}/org/${type}/${uuidv4()}${fileExtension}`;

    const params = {
        Bucket: process.env.DO_SPACES_BUCKET,
        Key: fileName,
        Body: file.buffer,
        ACL: 'public-read',
        ContentType: file.mimetype,
        Metadata: {
            'original-filename': file.originalname,
        },
    };

    const { Location } = await s3.upload(params).promise();

    return {
        url: Location,
        key: fileName,
    };
};




// env 
dotnev.config();
const PRIVATEKEY = process.env.PRIVATEKEY;


// Sign in
exports.signIn = async (req, res, next) => {
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

        await commonCheckForClient(user);

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

        // Set token expiration time
        const expiresIn = rememberMe ? '7d' : '1d';
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.PRIVATEKEY, { expiresIn });

        // Calculate expiry timestamp for frontend use
        const expiryTime = new Date().getTime() + (rememberMe ? 7 : 1) * 24 * 60 * 60 * 1000;

        const client = await clientInfo(user?._id, user?.email);

        return res.status(statusCode.OK).send({
            token,
            expiryTime,
            adminInfo: client,
            clientId: user?._id,
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

// update profile
exports.updateProfile = async (req, res) => {
    try {
        const user = req.user;
        const {
            firstName, middleName, lastName, password, gender, dateOfBirth,
            optionalEmail, emergencyPhone, phone, city, state, ZipCode, address,
            removeProfileImage
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !dateOfBirth) {
            return res.status(statusCode.BadRequest).send({
                message: "First name, last name, and date of birth are required."
            });
        }

        let parsedDateOfBirth = dateOfBirth;
        if (typeof dateOfBirth === 'string') {
            parsedDateOfBirth = parseDate(dateOfBirth);
            if (!parsedDateOfBirth) {
                return res.status(statusCode.BadRequest).send({
                    message: "Invalid date format. Please use dd/mm/yyyy format or a valid ISO date."
                });
            }
        }
        else if (dateOfBirth instanceof Date && !isNaN(dateOfBirth)) {
            parsedDateOfBirth = dateOfBirth;
        } else {
            return res.status(statusCode.BadRequest).send({
                message: "Invalid date format. Please provide a valid date."
            });
        }

        // Build the update profile object
        const profileUpdates = {
            firstName,
            middleName,
            lastName,
            gender,
            dateOfBirth: parsedDateOfBirth,
            optionalEmail,
            emergencyPhone,
            phone,
            city,
            state,
            ZipCode,
            address,
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

        // Hash password if provided
        if (password) {
            profileUpdates.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await User.findOneAndUpdate(
            { email: user.email },
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
            middleName: updatedUser.middleName,
            lastName: updatedUser.lastName,
            gender: updatedUser.gender,
            dateOfBirth: updatedUser.dateOfBirth,
            optionalEmail: updatedUser.optionalEmail,
            emergencyPhone: updatedUser.emergencyPhone,
            phone: updatedUser.phone,
            city: updatedUser.city,
            state: updatedUser.state,
            ZipCode: updatedUser.ZipCode,
            address: updatedUser.address,
            profileImage: updatedUser.profileImage
        };

        return res.status(statusCode.OK).send({
            message: "Profile updated successfully.",
            data: updatedProfile
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
            'profileImage firstName middleName lastName  gender dateOfBirth  optionalEmail emergencyPhone phone city state ZipCode address  email profileCreated '
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


// ✅ createOrganization
exports.createOrganization = async (req, res, next) => {
    try {
        const {
            clientId,
            name,
            description,
            fullAddress,
            phone,
            email,
            instaLink,
            showInsta,
            facebookLink,
            showFacebook,
            linkedinLink,
            showLinkedin,
            telegramLink,
            showTelegram,
        } = req.body;

        console.log("req.body", req.body);


        const mainUser = req.user;

        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }

        // Basic validation
        if (!name || !description || !fullAddress || !phone || !email) {
            return res.status(400).json({
                success: false,
                message: "Name, description, full address, phone and email are required fields.",
            });
        }

        // Check file uploads
        if (!req.files?.longLogo?.[0] || !req.files?.shortLogo?.[0]) {
            return res.status(400).json({
                success: false,
                message: "Both longLogo and shortLogo are required.",
            });
        }

        // Upload to S3
        const longLogoUpload = await uploadToS3(
            req.files.longLogo[0],
            mainUser.clientId || mainUser._id, // adjust as per your auth
            'longLogo'
        );

        const shortLogoUpload = await uploadToS3(
            req.files.shortLogo[0],
            mainUser.clientId || mainUser._id,
            'shortLogo'
        );

        const organizationData = {
            name: name.trim(),
            description: description.trim(),
            longLogo: longLogoUpload.url,
            longLogoKey: longLogoUpload.key,
            shortLogo: shortLogoUpload.url,
            shortLogoKey: shortLogoUpload.key,
            fullAddress: fullAddress.trim(),
            phone: phone.trim(),
            email: email.trim(),
            instaLink: instaLink || null,
            showInsta: showInsta === 'true' || showInsta === true,
            facebookLink: facebookLink || null,
            showFacebook: showFacebook === 'true' || showFacebook === true,
            linkedinLink: linkedinLink || null,
            showLinkedin: showLinkedin === 'true' || showLinkedin === true,
            telegramLink: telegramLink || null,
            showTelegram: showTelegram === 'true' || showTelegram === true,
            createdBy: mainUser._id,
        };

        const clientConnection = await getClientDatabaseConnection(clientId);
        const CompanyConfigure = clientConnection.model('companyConfigure', companyConfigureSchema);

        // Save to DB (using the schema you showed)
        const newOrg = await CompanyConfigure.create(organizationData); // ← Your model name

        return res.status(201).json({
            success: true,
            message: "Organization created successfully.",
            data: newOrg,
        });
    } catch (error) {
        console.error("Create Organization Error:", error);
        next(error);
    }
};

// ✅ updateOrganization
exports.updateOrganization = async (req, res, next) => {
    try {
        const { id } = req.params;
        const mainUser = req.user;

        const clientId = req.body.clientId;
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }

        const clientConnection = await getClientDatabaseConnection(clientId);
        const CompanyConfigure = clientConnection.model('companyConfigure', companyConfigureSchema);

        const org = await CompanyConfigure.findById(id);
        if (!org) {
            return res.status(404).json({ success: false, message: "Organization not found." });
        }

        // Allow partial updates
        const updateData = {
            name: req.body.name?.trim(),
            description: req.body.description?.trim(),
            fullAddress: req.body.fullAddress?.trim(),
            phone: req.body.phone?.trim(),
            email: req.body.email?.trim(),
            instaLink: req.body.instaLink || null,
            showInsta: req.body.showInsta === 'true' || req.body.showInsta === true,
            facebookLink: req.body.facebookLink || null,
            showFacebook: req.body.showFacebook === 'true' || req.body.showFacebook === true,
            linkedinLink: req.body.linkedinLink || null,
            showLinkedin: req.body.showLinkedin === 'true' || req.body.showLinkedin === true,
            telegramLink: req.body.telegramLink || null,
            showTelegram: req.body.showTelegram === 'true' || req.body.showTelegram === true,
        };

        // Handle logo re-upload if new file is sent
        if (req.files?.longLogo?.[0]) {
            const upload = await uploadToS3(req.files.longLogo[0], mainUser.clientId || mainUser._id, 'longLogo');
            updateData.longLogo = upload.url;
            updateData.longLogoKey = upload.key;
        }

        if (req.files?.shortLogo?.[0]) {
            const upload = await uploadToS3(req.files.shortLogo[0], mainUser.clientId || mainUser._id, 'shortLogo');
            updateData.shortLogo = upload.url;
            updateData.shortLogoKey = upload.key;
        }



        const updatedOrg = await CompanyConfigure.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: "Organization updated successfully.",
            data: updatedOrg,
        });
    } catch (error) {
        console.error("Update Organization Error:", error);
        next(error);
    }
};


exports.getOrganization = async (req, res, next) => {
    try {
        const { clientId } = req.params;
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }

        const clientConnection = await getClientDatabaseConnection(clientId);
        const CompanyConfigure = clientConnection.model('companyConfigure', companyConfigureSchema);


        const org = await CompanyConfigure.findOne({ createdBy: req.user._id, deletedAt: null })
            .sort({ createdAt: -1 });

        if (!org) {
            return res.status(200).json({ success: true, data: null }); // No data = create mode
        }

        res.status(200).json({ success: true, data: org });
    } catch (error) {
        next(error);
    }
};
