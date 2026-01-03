


const bcrypt = require("bcrypt");

const { getClientDatabaseConnection } = require("../../db/connection");
const httpStatusCode = require("../../utils/http-status-code");
const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");
const ledgerService = require("../services/ledger.service");

const ledgerCustomDataSchema = require("../../client/model/ledgerCustomData");
const { default: mongoose } = require("mongoose");

const { v4: uuidv4 } = require('uuid');
const path = require('path');
const AWS = require('aws-sdk');
const clientLedgerGroupSchema = require("../../client/model/ledgerGroup");
const supplierSchema = require("../../client/model/supplier");
const clinetUserSchema = require("../../client/model/user");
const clientRoleSchema = require("../../client/model/role");
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
const uploadFilesToS3 = async (file, clientId) => {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const fileName = `saasEcommerce/${clientId}/customFiles/${uuidv4()}${fileExtension}`;
    const params = {
        Bucket: process.env.DO_SPACES_BUCKET,
        Key: fileName,
        Body: file.buffer,
        ACL: "public-read", // Consider changing to 'private' for sensitive files
        ContentType: file.mimetype || "application/octet-stream", // Fallback for unknown MIME types
        ContentDisposition: "attachment", // Prevent execution of uploaded files
        Metadata: {
            "original-filename": file.originalname,
        },
    };
    try {
        const { Location } = await s3.upload(params).promise();
        return {
            success: true,
            url: Location,
            key: fileName,
            fieldName: file.fieldname,
            originalName: file.originalname,
            mimeType: file.mimetype || "application/octet-stream",
            size: file.size,
        };
    } catch (error) {
        throw new Error(`Failed to upload file: ${error.message}`);
    }
};

// create
exports.create = async (req, res, next) => {

    try {
        const {
            clientId,
            level,
            businessUnit,
            branch,
            warehouse,
            ledgerName,
            alias,
            ledgerGroupId,
            ledgerType,
            isCustomer,
            isSupplier,
            isEmployee,
            isNone,
            isCredit,
            isDebit,
            creditLimit,
            creditDays,
            openingBalance,
            openingDate,
        } = req.body;

        const mainUser = req.user;

        // Validate required fields
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }

        const requiredFields = [
            ledgerName,
            alias,
            ledgerGroupId,
            ledgerType,
            creditLimit,
            creditDays,
            openingBalance,
            openingDate,
        ];

        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }

        // Base data object
        const dataObject = {
            ledgerName,
            alias,
            ledgerGroupId,
            ledgerType,
            isCustomer,
            isSupplier,
            isEmployee,
            isNone,
            isCredit,
            isDebit,
            creditLimit,
            creditDays,
            openingBalance,
            balance: openingBalance,
            openingDate,
            createdBy: mainUser._id,
        };

        // Level-specific validation and assignment
        const levelConfig = {
            vendor: { isVendorLevel: true, isBuLevel: false, isBranchLevel: false, isWarehouseLevel: false },
            business: { isVendorLevel: false, isBuLevel: true, isBranchLevel: false, isWarehouseLevel: false },
            branch: { isVendorLevel: false, isBuLevel: false, isBranchLevel: true, isWarehouseLevel: false },
            warehouse: { isVendorLevel: false, isBuLevel: false, isBranchLevel: false, isWarehouseLevel: true },
        };
        if (!levelConfig[level]) {
            return res.status(statusCode.BadRequest).send({ message: message.lblInvalidLevel });
        }
        Object.assign(dataObject, levelConfig[level]);
        if (['business', 'branch', 'warehouse'].includes(level) && !businessUnit) {
            return res.status(statusCode.BadRequest).send({ message: message.lblBusinessUnitIdIdRequired });
        }
        if (['branch', 'warehouse'].includes(level) && !branch) {
            return res.status(statusCode.BadRequest).send({ message: message.lblBranchIdIdRequired });
        }
        if (level === 'warehouse' && !warehouse) {
            return res.status(statusCode.BadRequest).send({ message: message.lblWarehouseIdIdRequired });
        }
        // Add optional fields based on level
        if (businessUnit) {
            dataObject.businessUnit = businessUnit;
        }
        if (branch) {
            dataObject.businessUnit = businessUnit;
            dataObject.branch = branch;
        }
        if (warehouse) {
            dataObject.businessUnit = businessUnit;
            dataObject.branch = branch;
            dataObject.warehouse = warehouse;
        }

        const otherThanFiles = {};
        for (const [key, value] of Object.entries(req.body)) {
            if (key !== "clientId"
                && key !== "level"
                && key !== "businessUnit"
                && key !== "branch"
                && key !== "warehouse"
                && key !== "ledgerName"
                && key !== "alias"
                && key !== "ledgerGroupId"
                && key !== "ledgerType"
                && key !== "isCustomer"
                && key !== "isSupplier"
                && key !== "isEmployee"
                && key !== "isNone"
                && key !== "isCredit"
                && key !== "isDebit"
                && key !== "creditLimit"
                && key !== "creditDays"
                && key !== "openingBalance"
                && key !== "openingDate"
            ) {
                otherThanFiles[key] = value;
            }
        }

        // All validations passed; now start the DB transaction on the client-specific connection
        const clientConnection = await getClientDatabaseConnection(clientId);
        const LedgerGroup = clientConnection.model("ledgerGroup", clientLedgerGroupSchema);
        const Supplier = clientConnection.model('supplier', supplierSchema);
        const User = clientConnection.model('clientUsers', clinetUserSchema); // Note: fix typo 'clinetUserSchema' → 'clientUserSchema'


        const session = await clientConnection.startSession(ledgerGroupId);
        session.startTransaction();

        try {

            // Create ledger with session
            const newLedger = await ledgerService.create(clientId, dataObject, mainUser, { session });

            const files = [];
            if (req.files && req.files.length > 0) {
                for (const file of req.files) {
                    const uploadResult = await uploadFilesToS3(file, clientId);
                    files.push({
                        fieldName: uploadResult.fieldName,
                        fileUrl: uploadResult.url,
                        originalName: uploadResult.originalName,
                        mimeType: uploadResult.mimeType,
                        size: uploadResult.size,
                        key: uploadResult.key,
                    });
                }
            }

            // Create custom data with session
            const LedgerCustomData = clientConnection.model("ledgerCustomData", ledgerCustomDataSchema);
            const ledgerCustomData = new LedgerCustomData({
                otherThanFiles: new Map(Object.entries(otherThanFiles || {})),
                files,
                ledgerId: newLedger._id
            });


            const existingGroup = await LedgerGroup.findById(ledgerGroupId).session(session);
            if (!existingGroup) {
                await session.abortTransaction();
                return res.status(statusCode.BadRequest).send({
                    success: false,
                    message: "Group not found"
                })
            }
            if (existingGroup.groupName == "Sundry Creditor" && isSupplier) {
                const newSupplier = await Supplier.create(
                    [{
                        businessUnit: dataObject.businessUnit,
                        branch: dataObject.branch,
                        warehouse: dataObject.warehouse,
                        isVendorLevel: dataObject.isVendorLevel,
                        isBuLevel: dataObject.isBuLevel,
                        isBranchLevel: dataObject.isBranchLevel,
                        isWarehouseLevel: dataObject.isWarehouseLevel,
                        name: ledgerName,
                        contactPerson: otherThanFiles["Contact Person"],
                        emailContact: otherThanFiles["Email"],
                        contactNumber: otherThanFiles["Phone"],
                        ledgerLinkedId: newLedger._id
                    }],
                    { session }  // Pass the session in options
                );
            }

            if (existingGroup.groupName == "Sundry Debtors" && isCustomer) {
                const Role = clientConnection.model('clientRoles', clientRoleSchema);
                const role = await Role.findOne({ id: 0 }).session(session);
                if (!role) {
                    await session.abortTransaction();
                    return res.status(statusCode.BadRequest).send({
                        success: false,
                        message: "Customer Role not found"
                    })
                }
                const existingCustomer = await User.findOne({
                    $or: [{ email: otherThanFiles["Email"] },
                    { phone: otherThanFiles["Phone"] }
                    ],
                }).session(session);

                if (existingCustomer) {
                    await session.abortTransaction();
                    return res.status(statusCode.BadRequest).send({
                        success: false,
                        message: "Customer already exists with this email or phone"
                    })
                }
                // Hash password
                const hashedPassword = await bcrypt.hash("AES@1234", 10);
                const newCustomer = await User.create(
                    [
                        {
                            firstName: ledgerName,
                            email: otherThanFiles["Email"],
                            phone: otherThanFiles["Phone"],
                            role: role._id,
                            roleId: role.id,
                            password: hashedPassword,
                            createdBy: mainUser._id,
                            tc: true,
                            isUserVerified: true,
                            ledgerLinkedId: newLedger._id
                        }
                    ],
                    { session }  // Pass the session in options
                );
            }

            await ledgerCustomData.save({ session });

            await session.commitTransaction();

            return res.status(httpStatusCode.OK).json({
                success: true,
                message: "created successfully",
                data: {
                    data: { ledgerId: newLedger._id, ledgerCustomDataId: ledgerCustomData._id },
                },
            });
        } catch (error) {
            await session.abortTransaction();
            throw error; // Rethrow to outer catch
        } finally {
            session.endSession();
        }
    } catch (error) {
        console.error("Form creation error:", error);
        return res.status(httpStatusCode.InternalServerError).json({
            success: false,
            message: "Internal server error",
            errorCode: "SERVER_ERROR",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};

// update
exports.update = async (req, res, next) => {
    let session = null;
    let clientConnection = null;
    try {
        const {
            clientId,
            ledgerCustomDataId,
            ledgerId,
            level,
            businessUnit,
            branch,
            warehouse,
            ledgerName,
            alias,
            ledgerGroupId,
            ledgerType,
            isCustomer,
            isSupplier,
            isEmployee,
            isCredit,
            isDebit,
            creditLimit,
            creditDays,
            openingBalance,
            openingDate,
            status
        } = req.body;

        console.log("req.body", req.body);

        const mainUser = req.user;

        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }

        if (!ledgerCustomDataId) {
            return res.status(statusCode.BadRequest).send({ message: "Ledger custom field id is required" });
        }

        if (!ledgerId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblLedgerIdIdRequired });
        }

        const requiredFields = [
            ledgerCustomDataId,
            ledgerId,
            ledgerName,
            alias,
            ledgerGroupId,
            ledgerType,
            isCustomer,
            isSupplier,
            isEmployee,
            isCredit,
            isDebit,
            creditLimit,
            creditDays,
            openingBalance,
            openingDate,
        ];

        console.log("requiredFields", requiredFields);

        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }

        // Base data object
        const dataObject = {
            ledgerName,
            alias,
            ledgerGroupId,
            ledgerType,
            isCustomer,
            isSupplier,
            isEmployee,
            isCredit,
            isDebit,
            creditLimit,
            creditDays,
            openingBalance,
            openingDate,
            updatedBy: mainUser._id, // Changed from createdBy to updatedBy for updates
        };

        // Level-specific validation and assignment
        const levelConfig = {
            vendor: { isVendorLevel: true, isBuLevel: false, isBranchLevel: false, ascend: false },
            business: { isVendorLevel: false, isBuLevel: true, isBranchLevel: false, isWarehouseLevel: false },
            branch: { isVendorLevel: false, isBuLevel: false, isBranchLevel: true, isWarehouseLevel: false },
            warehouse: { isVendorLevel: false, isBuLevel: false, isBranchLevel: false, isWarehouseLevel: true },
        };
        if (!levelConfig[level]) {
            return res.status(statusCode.BadRequest).send({ message: message.lblInvalidLevel });
        }
        Object.assign(dataObject, levelConfig[level]);
        if (['business', 'branch', 'warehouse'].includes(level) && !businessUnit) {
            return res.status(statusCode.BadRequest).send({ message: message.lblBusinessUnitIdIdRequired });
        }
        if (['branch', 'warehouse'].includes(level) && !branch) {
            return res.status(statusCode.BadRequest).send({ message: message.lblBranchIdIdRequired });
        }
        if (level === 'warehouse' && !warehouse) {
            return res.status(statusCode.BadRequest).send({ message: message.lblWarehouseIdIdRequired });
        }
        // Add optional fields based on level
        if (businessUnit) {
            dataObject.businessUnit = businessUnit;
        }
        if (branch && branch !== null && branch !== "undefined") {
            dataObject.businessUnit = businessUnit;
            dataObject.branch = branch;
        }
        if (warehouse && warehouse !== null && warehouse !== "undefined") {
            dataObject.businessUnit = businessUnit;
            dataObject.branch = branch;
            dataObject.warehouse = warehouse;
        }

        console.log("dataObject", dataObject);


        // Get client connection and start session
        clientConnection = await getClientDatabaseConnection(clientId);
        const LedgerGroup = clientConnection.model("ledgerGroup", clientLedgerGroupSchema);
        const Supplier = clientConnection.model('supplier', supplierSchema);
        const User = clientConnection.model('clientUsers', clinetUserSchema); // Note: fix typo 'clinetUserSchema' → 'clientUserSchema'


        session = await clientConnection.startSession();
        session.startTransaction();

        const otherThanFiles = {};
        for (const [key, value] of Object.entries(req.body)) {
            if (key !== "clientId"
                && key !== "level"
                && key !== "businessUnit"
                && key !== "branch"
                && key !== "warehouse"
                && key !== "ledgerName"
                && key !== "alias"
                && key !== "ledgerGroupId"
                && key !== "ledgerType"
                && key !== "isCustomer"
                && key !== "isSupplier"
                && key !== "isEmployee"
                && key !== "isCredit"
                && key !== "isDebit"
                && key !== "creditLimit"
                && key !== "creditDays"
                && key !== "openingBalance"
                && key !== "openingDate"
                && key !== "ledgerCustomDataId"
                && key !== "ledgerId"
            ) {
                if (typeof value === "string" && !value.startsWith("https://billionforms-files") && !value.startsWith("https://blr1.digitaloceanspaces.com/billionforms-files")) {
                    otherThanFiles[key] = value;
                }
            }
        }

        const ledger = await ledgerService.update(clientId, ledgerId, dataObject, mainUser, { session });

        const LedgerCustomData = clientConnection.model("ledgerCustomData", ledgerCustomDataSchema);
        const formData = await LedgerCustomData.findById(ledgerCustomDataId).session(session);
        if (!formData) {
            await session.abortTransaction();
            await session.endSession();
            return res.status(httpStatusCode.NotFound).json({
                success: false,
                message: "Ledger custom data not found",
                errorCode: "NOT_FOUND",
            });
        }

        const files = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const uploadResult = await uploadFilesToS3(file, clientId);
                files.push({
                    fieldName: uploadResult.fieldName,
                    fileUrl: uploadResult.url,
                    originalName: uploadResult.originalName,
                    mimeType: uploadResult.mimeType,
                    size: uploadResult.size,
                    key: uploadResult.key,
                });
            }
        }

        formData.otherThanFiles = new Map(Object.entries(otherThanFiles || {}));
        if (files.length > 0) {
            formData.files = files; // Replace files array
        }


        // new part

        const existingGroup = await LedgerGroup.findById(ledgerGroupId).session(session);
        if (!existingGroup) {
            await session.abortTransaction();
            return res.status(statusCode.BadRequest).send({
                success: false,
                message: "Group not found"
            })
        }
        if (existingGroup.groupName == "Sundry Creditor" && isSupplier) {
            const existingSupplier = await Supplier.findOne({ ledgerLinkedId: ledgerId }).session(session);
            if (!existingSupplier) {
                await session.abortTransaction();
                await session.endSession();
                return res.status(httpStatusCode.NotFound).json({
                    success: false,
                    message: "Supplier data not found",
                    errorCode: "NOT_FOUND",
                });
            }
            existingSupplier.name = ledgerName,
                existingSupplier.contactPerson = otherThanFiles["Contact Person"],
                existingSupplier.emailContact = otherThanFiles["Email"],
                existingSupplier.contactNumber = otherThanFiles["Phone"],
                await existingSupplier.save({ session })
        }

        if (existingGroup.groupName == "Sundry Debtors" && isCustomer) {
            const existingCustomer = await User.findOne({ ledgerLinkedId: ledgerId }).session(session);
            if (!existingCustomer) {
                await session.abortTransaction();
                await session.endSession();
                return res.status(httpStatusCode.NotFound).json({
                    success: false,
                    message: "Customer data not found",
                    errorCode: "NOT_FOUND",
                });
            }
            const existing = await User.findOne({
                $and: [
                    { ledgerLinkedId: { $ne: ledgerId } },
                    {
                        $or: [{ email: otherThanFiles["Email"] },
                        { phone: otherThanFiles["Phone"] }
                        ],
                    },
                ],
            }).session(session);

            if (existing) {
                await session.abortTransaction();
                return res.status(statusCode.BadRequest).send({
                    success: false,
                    message: "Customer already exists with this email or phone"
                })
            }

            existingCustomer.firstName = ledgerName;
            existingCustomer.email = otherThanFiles["Email"];
            existingCustomer.phone = otherThanFiles["Phone"];
            await existingCustomer.save({ session })

        }

        await formData.save({ session });
        await session.commitTransaction();
        await session.endSession();

        return res.status(httpStatusCode.OK).json({
            success: true,
            message: "updated successfully",
            data: {
                data: { ledgerId: ledger._id, ledgerCustomDataId: formData._id },
            },
        });
    } catch (error) {
        if (session) {
            await session.abortTransaction();
            await session.endSession();
        }
        console.error("Form creation error:", error);
        return res.status(httpStatusCode.InternalServerError).json({
            success: false,
            message: "Internal server error",
            errorCode: "SERVER_ERROR",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    } finally {
        if (clientConnection) {
            // Ensure client connection is closed if necessary
            // Adjust based on how getClientDatabaseConnection manages connections
            // await clientConnection.close();
        }
    }
};

// get particular ledger
exports.getParticular = async (req, res, next) => {
    try {
        const mainUser = req.user;
        const { clientId, ledgerId } = req.params;
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }
        if (!ledgerId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblLedgerIdIdRequired,
            });
        }
        const result = await ledgerService.getById(clientId, ledgerId);
        return res.status(statusCode.OK).send({
            message: message.lblLedgerFoundSucessfully,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

exports.getCustomData = async (req, res, next) => {
    try {
        const mainUser = req.user;
        const { clientId, ledgerId } = req.params;
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }
        if (!ledgerId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblLedgerIdIdRequired,
            });
        }
        const result = await ledgerService.getCustomData(clientId, ledgerId);
        return res.status(statusCode.OK).send({
            message: message.lblLedgerFoundSucessfully,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// list
exports.list = async (req, res, next) => {
    try {

        const mainUser = req.user;
        const { clientId, keyword = '', page = 1, perPage = 10, level = "vendor", levelId = "" } = req.query;
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }
        let filters = {
            deletedAt: null,
            ...(keyword && {
                $or: [
                    { ledgerName: { $regex: keyword.trim(), $options: "i" } },
                ],
            }),
        };

        if (level == "vendor") {

        } else if (level == "business" && levelId) {
            filters = {
                ...filters,
                // isBuLevel: true,
                businessUnit: levelId
            }
        } else if (level == "branch" && levelId) {
            filters = {
                ...filters,
                // isBranchLevel: true,
                branch: levelId
            }
        } else if (level == "warehouse" && levelId) {
            filters = {
                ...filters,
                // isBuLevel: true,
                warehouse: levelId
            }
        }

        const result = await ledgerService.list(clientId, filters, { page, limit: perPage });
        return res.status(statusCode.OK).send({
            message: message.lblLedgerFoundSucessfully,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// all
exports.all = async (req, res, next) => {
    try {

        const mainUser = req.user;
        const { clientId, level = "vendor", levelId = "" } = req.query;
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }
        let filters = {
        };

        if (level == "vendor") {

        } else if (level == "business" && levelId) {
            filters = {
                ...filters,
                isBuLevel: true,
                businessUnit: levelId
            }
        } else if (level == "branch" && levelId) {
            filters = {
                ...filters,
                isBranchLevel: true,
                branch: levelId
            }
        } else if (level == "warehouse" && levelId) {
            filters = {
                ...filters,
                isWarehouseLevel: true,
                warehouse: levelId
            }
        }

        const result = await ledgerService.all(clientId, filters);
        return res.status(statusCode.OK).send({
            message: message.lblLedgerFoundSucessfully,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// active inactive
exports.activeinactive = async (req, res, next) => {
    try {
        const { keyword, page, perPage, id, status, clientId } = req.body;
        req.query.clientId = clientId;
        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        if (!clientId || !id) {
            return res.status(400).send({
                message: message.lblEmployeeIdIdAndClientIdRequired,
            });
        }
        const updated = await ledgerService.activeInactive(clientId, id, {
            isActive: status == "1",
        });
        this.list(req, res, next)
    } catch (error) {
        next(error);
    }
};




























































































