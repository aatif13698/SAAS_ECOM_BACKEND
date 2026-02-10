// services/chairService.js 
const { getClientDatabaseConnection } = require("../../db/connection");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const clientAssetSchema = require("../../client/model/asset");
const quotationSchema = require("../../client/model/saleQuotation");
const { model } = require("mongoose");
const supplierSchema = require("../../client/model/supplier");
const purchaseInvoiceSchema = require("../../client/model/purchaseInvoice");
const crypto = require('crypto');
const clinetUserSchema = require("../../client/model/user");
const salePerformaSchema = require("../../client/model/salePerforma");
const saleInvoiceSchema = require("../../client/model/saleInvoice");
const transactionSerialNumebrSchema = require("../../client/model/transactionSeries");


const create = async (clientId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Performa = clientConnection.model('salePerforma', salePerformaSchema);
        const SerialNumber = clientConnection.model('transactionSerialNumebr', transactionSerialNumebrSchema);

        const existingSp = await Performa.findOne({ spNumber: data?.spNumber }).lean();
        if (existingSp) {
            throw new CustomError(statusCode.BadRequest, 'Performa number already exists.')
        }
        const performa = await Performa.create(data);
        if (performa) {
            await SerialNumber.findOneAndUpdate({ collectionName: "sale_performa" }, { $inc: { nextNum: 1 } })
        }
        return performa
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating : ${error.message}`);
    }
};

const update = async (clientId, performaId, updateData) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Performa = clientConnection.model('salePerforma', salePerformaSchema);
        const performa = await Performa.findById(performaId);
        if (!performa) {
            throw new CustomError(statusCode.NotFound, "Performa not found.");
        }
        Object.assign(performa, updateData);
        await performa.save();
        return performa
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error updating: ${error.message}`);
    }
};


const getById = async (clientId, performaId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Performa = clientConnection.model('salePerforma', salePerformaSchema);
        const Client = clientConnection.model('clientUsers', clinetUserSchema);
        const performa = await Performa.findById(performaId)
            .populate({
                path: "customer",
                model: Client,
            });
        if (!performa) {
            throw new CustomError(statusCode.NotFound, "Performa not found.");
        }
        return performa;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting: ${error.message}`);
    }
};


const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Performa = clientConnection.model('salePerforma', salePerformaSchema);
        const Supplier = clientConnection.model('supplier', supplierSchema);
        const User = clientConnection.model("clientUsers", clinetUserSchema)

        console.log("options", options);

        const { page, limit } = options;
        const skip = (Number(page) - 1) * Number(limit);
        console.log("skip", skip);

        const [performas, total] = await Promise.all([
            Performa.find(filters)
                .skip(skip)
                .sort({ createdAt: -1 })  // Sort by creation date descending (latest first)
                .limit(Number(limit))
                .populate({
                    path: "customer",
                    model: User,
                }),
            Performa.countDocuments(filters),
        ]);
        return { count: total, performas };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing: ${error.message}`);
    }
};


const changeStatus = async (clientId, performaId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Performa = clientConnection.model('salePerforma', salePerformaSchema);
        const SaleInvoice = clientConnection.model('saleInvoice', saleInvoiceSchema)

        const performa = await Performa.findById(performaId);
        if (!performa) {
            throw new CustomError(statusCode.NotFound, "Performa not found.");
        }
        if (data.status == "invoiced") {
            const User = clientConnection.model("clientUsers", clinetUserSchema)
            const customer = await User.findById(performa.customer.toString());
            let customerLedger = null;
            if (!customer) {
                throw new CustomError(statusCode.NotFound, "Customer");
            }
            if (!customer.ledgerLinkedId) {
                throw new CustomError(statusCode.NotFound, "Customer ledger id not found.");
            }
            customerLedger = customer.ledgerLinkedId;
            const invoiceaData = {
                businessUnit: performa.businessUnit,
                branch: performa.branch,
                warehouse: performa.warehouse,

                isVendorLevel: performa.isVendorLevel,
                isBuLevel: performa.isBuLevel,
                isBranchLevel: performa.isBranchLevel,
                isWarehouseLevel: performa.isWarehouseLevel,

                customer: performa.customer, // Assumed ref to Supplier model
                customerLedger: customerLedger,
                shippingAddress: performa.shippingAddress,
                siNumber: crypto.randomInt(100000, 1000000).toString(), // Unique for business integrity
                items: performa.items,
                notes: performa.notes,
                isInterState: performa.isInterState, // Determines IGST vs CGST/SGST
                roundOff: performa.roundOff,
                status: "full_due",
                grandTotal: performa.grandTotal,
                balance: performa.grandTotal,
                createdBy: performa.createdBy,
            }

            if (data?.workOrderNumber) {
                invoiceaData.workOrderNumber = data?.workOrderNumber
            }

            if (data?.workOrderDate) {
                invoiceaData.workOrderDate = data?.workOrderDate
            }

            await SaleInvoice.create(invoiceaData)
        }
        Object.assign(performa, data);
        return await performa.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error in changing status: ${error.message}`);
    }
};


module.exports = {
    create,
    update,
    getById,
    list,
    changeStatus,
}; 