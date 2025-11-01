



const { default: mongoose } = require("mongoose");
const customerAddressSchema = require("../../client/model/customerAddress");
const clientRoleSchema = require("../../client/model/role");
const supplierSchema = require("../../client/model/supplier");
const clinetUserSchema = require("../../client/model/user");
const { getClientDatabaseConnection } = require("../../db/connection");
const roleModel = require("../../model/role");
const userModel = require("../../model/user");
const CustomError = require("../../utils/customeError");
const httpStatusCode = require("../../utils/http-status-code");
const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");
const supplierService = require("../services/supplier.service");
const bcrypt = require("bcrypt")

// create
exports.create = async (req, res, next) => {
    try {
        const {
            clientId,

            name,
            contactPerson,
            emailContact,
            contactNumber,
            url,
            GstVanNumber,

            city,
            state,
            country,
            ZipCode,
            address,
        } = req.body;

        const mainUser = req.user;

        // Validate required fields
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }

        const requiredFields = [name,
            contactPerson,
            emailContact,
            contactNumber,
            url,
            GstVanNumber,];
        console.log("requiredFields", requiredFields);

        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }
        // Base data object
        const dataObject = {
            name,
            contactPerson,
            emailContact,
            contactNumber,
            url,
            GstVanNumber,
            city,
            state,
            country,
            ZipCode,
            address,
        };

        // Create 
        const created = await supplierService.create(clientId, dataObject);
        return res.status(statusCode.OK).send({
            message: message.lblSubCategoryCreatedSuccess,
            data: { empId: created._id },
        });
    } catch (error) {
        next(error);
    }
};

// update  
exports.update = async (req, res, next) => {

    try {
        const {
            clientId,
            supplierId,

            name,
            contactPerson,
            emailContact,
            contactNumber,
            url,
            GstVanNumber,

            city,
            state,
            country,
            ZipCode,
            address,
        } = req.body;

        const mainUser = req.user;

        // Validate required fields
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }

        const requiredFields = [name,
            contactPerson,
            emailContact,
            contactNumber,
            url,
            GstVanNumber,];
        console.log("requiredFields", requiredFields);

        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }
        // Base data object
        const dataObject = {
            name,
            contactPerson,
            emailContact,
            contactNumber,
            url,
            GstVanNumber,
            city,
            state,
            country,
            ZipCode,
            address,
        };

        // Create 
        const updated = await supplierService.update(clientId, supplierId, dataObject);
        return res.status(statusCode.OK).send({
            message: message.lblSupplierUpdatedSuccess,
            data: { empId: updated._id },
        });
    } catch (error) {
        next(error);
    }

};


// add items
exports.addItems = async (req, res, next) => {

    try {
        const {
            clientId,
            supplierId,
            productStock,
            productMainStock
        } = req.body;

        console.log("req.body", req.body);


        const mainUser = req.user;

        // Validate required fields
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }

        const requiredFields = [
            supplierId,
            productStock,
            productMainStock
        ];

        console.log("requiredFields", requiredFields);


        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }
        // Base data object
        const dataObject = {
            productStock,
            productMainStock
        };

        // Create 
        const updated = await supplierService.addItems(clientId, supplierId, dataObject);
        return res.status(statusCode.OK).send({
            message: message.lblSupplierUpdatedSuccess,
            data: { supplier: updated },
        });
    } catch (error) {
        next(error);
    }

};

// DELETE /supplier/remove/items
exports.removeItems = async (req, res, next) => {
    try {
        const { clientId, supplierId, productStock, productMainStock } = req.body;

        if (!clientId || !supplierId || !productStock || !productMainStock) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const clientConn = await getClientDatabaseConnection(clientId);
        const Supplier = clientConn.model('supplier', supplierSchema);

        const result = await Supplier.updateOne(
            { _id: supplierId },
            {
                $pull: {
                    items: {
                        productStock: new mongoose.Types.ObjectId(productStock),
                        productMainStock: new mongoose.Types.ObjectId(productMainStock),
                    },
                },
            }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ success: false, message: 'Item not found in supplier' });
        }

        return res.json({ success: true, message: 'Item removed' });
    } catch (err) {
        next(err);
    }
};

// get particular 
exports.getParticular = async (req, res, next) => {
    try {
        const { clientId, supplierId } = req.params;
        if (!clientId || !supplierId) {
            return res.status(400).send({
                message: message.lblSupplierIdIdAndClientIdRequired,
            });
        }
        const supplier = await supplierService.getById(clientId, supplierId);
        return res.status(200).send({
            message: message.lblSupplierFoundSucessfully,
            data: supplier,
        });
    } catch (error) {
        next(error)
    }
};

// list 
exports.list = async (req, res, next) => {
    try {

        const mainUser = req.user;
        const { clientId, keyword = '', page = 1, perPage = 10 } = req.query;
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }
        const filters = {
            deletedAt: null,
            ...(keyword && {
                $or: [
                    { name: { $regex: keyword.trim(), $options: "i" } },
                    { contactPerson: { $regex: keyword.trim(), $options: "i" } },
                    { emailContact: { $regex: keyword.trim(), $options: "i" } },
                    { contactNumber: { $regex: keyword.trim(), $options: "i" } },
                ],
            }),
        };
        const result = await supplierService.list(clientId, filters, { page, limit: perPage });
        return res.status(statusCode.OK).send({
            message: message.lblSupplierFoundSucessfully,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

exports.activeinactive = async (req, res, next) => {
    try {
        const { keyword, page, perPage, id, status, clientId } = req.body;
        req.query.clientId = clientId;
        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        if (!clientId || !id) {
            return res.status(400).send({
                message: message.lblBranchIdAndClientIdRequired,
            });
        }
        const updated = await supplierService.activeInactive(clientId, id, {
            isActive: status == "1",
        });
        this.list(req, res, next)
    } catch (error) {
        next(error);
    }
};

// Soft delete 
exports.softDelete = async (req, res, next) => {
    try {
        const { keyword, page, perPage, supplierId, clientId } = req.body;
        console.log("req.body", req.body);

        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        req.query.clientId = clientId;
        if (!clientId || !supplierId) {
            return res.status(400).send({
                message: message.lblSupplierIdIdAndClientIdRequired,
            });
        }
        await supplierService.deleted(clientId, supplierId, softDelete = true)
        this.list(req, res, next);
    } catch (error) {
        next(error);
    }
};


// get all active 
exports.getAllActive = async (req, res, next) => {
    try {
        const { clientId } = req.params;
        if (!clientId) {
            return res.status(400).send({
                message: message.lblSupplierIdIdRequired,
            });
        }
        const supplier = await supplierService.getAllActive(clientId);
        return res.status(200).send({
            message: message.lblSupplierFoundSucessfully,
            data: supplier,
        });
    } catch (error) {
        next(error)
    }
};


// add address
exports.addNewAddress = async (req, res, next) => {
    try {
        const {
            clientId,
            fullName,
            phone,
            alternamtivePhone,
            country,
            state,
            city,
            ZipCode,
            houseNumber,
            roadName,
            nearbyLandmark,
            address,
            customerId
        } = req.body;
        const user = req.user;
        if (!clientId) {
            return res
                .status(httpStatusCode.BadRequest)
                .send({ message: message.lblClinetIdIsRequired });
        }
        const requiredFields = [
            fullName,
            phone,
            alternamtivePhone,
            country,
            state,
            city,
            ZipCode,
            houseNumber,
            roadName,
            nearbyLandmark,
            address,
            customerId
        ];
        if (requiredFields.some((field) => !field)) {
            return res
                .status(httpStatusCode.BadRequest)
                .send({ message: message.lblRequiredFieldMissing });
        }
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Supplier = clientConnection.model('supplier', supplierSchema)

        const customerAddress = clientConnection.model(
            "customerAddress",
            customerAddressSchema
        );
        const customer = await Supplier.findById(customerId);
        if (!customer) {
            return res.status(httpStatusCode.NotFound).send({
                message: "User not found.",
            });
        }
        const createdAddress = await customerAddress.create({
            customerId: customerId,
            fullName,
            phone,
            alternamtivePhone,
            country,
            state,
            city,
            ZipCode,
            houseNumber,
            roadName,
            nearbyLandmark,
            address,
        });
        return res.status(httpStatusCode.OK).send({
            message: "Address added successfully!",
            createdAddress: createdAddress,
        });
    } catch (error) {
        next(error);
    }
};

// update address
exports.updateAddress = async (req, res, next) => {
    try {
        const {
            clientId,
            addressId,
            fullName,
            phone,
            alternamtivePhone,
            country,
            state,
            city,
            ZipCode,
            houseNumber,
            roadName,
            nearbyLandmark,
            address,
            customerId
        } = req.body;
        const user = req.user;
        if (!clientId) {
            return res
                .status(httpStatusCode.BadRequest)
                .send({ message: message.lblClinetIdIsRequired });
        }
        if (!addressId) {
            return res
                .status(httpStatusCode.BadRequest)
                .send({ message: message.lblAddressIdIdRequired });
        }
        const requiredFields = [
            fullName,
            phone,
            alternamtivePhone,
            country,
            state,
            city,
            ZipCode,
            houseNumber,
            roadName,
            nearbyLandmark,
            address,
        ];
        if (requiredFields.some((field) => !field)) {
            return res
                .status(httpStatusCode.BadRequest)
                .send({ message: message.lblRequiredFieldMissing });
        }
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Supplier = clientConnection.model('supplier', supplierSchema)

        const customerAddress = clientConnection.model(
            "customerAddress",
            customerAddressSchema
        );
        const customer = await Supplier.findById(customerId);
        if (!customer) {
            return res.status(httpStatusCode.NotFound).send({
                message: "User not found.",
            });
        }
        const existingAddress = await customerAddress.findById(addressId);

        if (!existingAddress) {
            return res
                .status(httpStatusCode.BadRequest)
                .send({ message: message.lblAddressNotFound });
        }

        const updatedAddress = await customerAddress.findByIdAndUpdate(
            addressId,
            {
                fullName,
                phone,
                alternamtivePhone,
                country,
                state,
                city,
                ZipCode,
                houseNumber,
                roadName,
                nearbyLandmark,
                address,
            },
            { new: true }
        );

        return res.status(httpStatusCode.OK).json({
            message: message.lblAddressUpdatedSuccess,
            data: updatedAddress,
        });
    } catch (error) {
        next(error);
    }
};

// delete address
exports.deleteAddress = async (req, res, next) => {
    try {
        const { clientId, addressId } = req.body;
        if (!clientId) {
            return res
                .status(httpStatusCode.BadRequest)
                .json({ message: message.lblClinetIdIsRequired });
        }
        if (!addressId) {
            return res
                .status(httpStatusCode.BadRequest)
                .json({ message: message.lblAddressIdIdRequired });
        }
        const clientConnection = await getClientDatabaseConnection(clientId);
        const customerAddress = clientConnection.model(
            "customerAddress",
            customerAddressSchema
        );
        const existingAddress = await customerAddress.findOne({
            _id: addressId,
            deletedAt: null,
        });
        if (!existingAddress) {
            return res
                .status(httpStatusCode.NotFound)
                .json({ message: message.lblAddressNotFound });
        }
        await customerAddress.findByIdAndUpdate(addressId, {
            deletedAt: new Date(),
        });
        return res.status(httpStatusCode.OK).json({
            message: message.lblAddressSoftDeletedSuccess,
        });
    } catch (error) {
        next(error);
    }
};

// get address
exports.getAddresses = async (req, res, next) => {
    try {
        const { clientId, customerId } = req.params;

        const user = req.user;
        if (!clientId) {
            return res
                .status(httpStatusCode.BadRequest)
                .send({ message: message.lblClinetIdIsRequired });
        }
        if (!customerId) {
            return res
                .status(httpStatusCode.BadRequest)
                .send({ message: message.lblCustomerIdIsRequired });
        }
        const clientConnection = await getClientDatabaseConnection(clientId);
        const clientUser = clientConnection.model("clientUsers", clinetUserSchema);
        const Supplier = clientConnection.model('supplier', supplierSchema)

        const customerAddress = clientConnection.model(
            "customerAddress",
            customerAddressSchema
        );
        const customer = await Supplier.findById(customerId);
        if (!customer) {
            return res.status(httpStatusCode.NotFound).send({
                message: "User not found.",
            });
        }
        const addresses = await customerAddress.find({
            customerId: customerId,
            deletedAt: null,
        });
        return res.status(httpStatusCode.OK).send({
            message: message.lblAddressFoundSuccessfully,
            addresses: addresses,
        });
    } catch (error) {
        next(error);
    }
};







