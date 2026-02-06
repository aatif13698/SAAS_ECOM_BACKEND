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


const create = async (clientId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Quotation = clientConnection.model('saleQuotation', quotationSchema);
        const existingSq = await Quotation.findOne({ sqNumber: data?.poNumber }).lean();
        if (existingSq) {
            throw new CustomError(statusCode.BadRequest, 'Quotation number already exists.')
        }
        return await Quotation.create(data);
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating : ${error.message}`);
    }
};

const update = async (clientId, quotationId, updateData) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Quotation = clientConnection.model('saleQuotation', quotationSchema);
        const quotation = await Quotation.findById(quotationId);
        if (!quotation) {
            throw new CustomError(statusCode.NotFound, "Quotation not found.");
        }
        Object.assign(quotation, updateData);
        await quotation.save();
        return quotation
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error updating: ${error.message}`);
    }
};


const getById = async (clientId, quotationId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Quotation = clientConnection.model('saleQuotation', quotationSchema);
        const Client = clientConnection.model('clientUsers', clinetUserSchema);
        const quotation = await Quotation.findById(quotationId)
            .populate({
                path: "customer",
                model: Client,
            });
        if (!quotation) {
            throw new CustomError(statusCode.NotFound, "Quotation not found.");
        }
        return quotation;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting: ${error.message}`);
    }
};


const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Quotation = clientConnection.model('saleQuotation', quotationSchema);
        const Supplier = clientConnection.model('supplier', supplierSchema);
        const User = clientConnection.model("clientUsers", clinetUserSchema)

        console.log("options", options);


        const { page, limit } = options;
        const skip = (Number(page) - 1) * Number(limit);
        console.log("skip", skip);

        const [quotations, total] = await Promise.all([
            Quotation.find(filters)
                .skip(skip)
                .sort({ createdAt: -1 })  // Sort by creation date descending (latest first)
                .limit(Number(limit))
                .populate({
                    path: "customer",
                    model: User,
                }),
            Quotation.countDocuments(filters),
        ]);
        return { count: total, quotations };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing: ${error.message}`);
    }
};


const changeStatus = async (clientId, quotationId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const SalePerforma = clientConnection.model('salePerforma', salePerformaSchema);
        const Quotation = clientConnection.model('saleQuotation', quotationSchema);
        const SaleInvoice = clientConnection.model('saleInvoice', saleInvoiceSchema)


        const quotation = await Quotation.findById(quotationId);
        if (!quotation) {
            throw new CustomError(statusCode.NotFound, "Quotation not found");
        }
        if (data.status == "invoice_conversion") {
            const User = clientConnection.model("clientUsers", clinetUserSchema)
            const customer = await User.findById(quotation.customer.toString());
            let customerLedger = null;
            if (!customer) {
                throw new CustomError(statusCode.NotFound, "Customer");
            }
            if (!customer.ledgerLinkedId) {
                throw new CustomError(statusCode.NotFound, "Customer ledger id not found.");
            }
            customerLedger = customer.ledgerLinkedId;
            const invoiceaData = {
                businessUnit: quotation.businessUnit,
                branch: quotation.branch,
                warehouse: quotation.warehouse,

                isVendorLevel: quotation.isVendorLevel,
                isBuLevel: quotation.isBuLevel,
                isBranchLevel: quotation.isBranchLevel,
                isWarehouseLevel: quotation.isWarehouseLevel,

                customer: quotation.customer, // Assumed ref to Supplier model
                customerLedger: customerLedger,
                shippingAddress: quotation.shippingAddress,
                siNumber: crypto.randomInt(100000, 1000000).toString(), // Unique for business integrity
                items: quotation.items,
                notes: quotation.notes,
                isInterState: quotation.isInterState, // Determines IGST vs CGST/SGST
                roundOff: quotation.roundOff,
                status: "full_due",
                grandTotal: quotation.grandTotal,
                balance: quotation.grandTotal,
                createdBy: quotation.createdBy,
            }

            if (data?.workOrderNumber) {
                invoiceaData.workOrderNumber = data?.workOrderNumber
            }

            if (data?.workOrderDate) {
                invoiceaData.workOrderDate = data?.workOrderDate
            }

            await SaleInvoice.create(invoiceaData)

        } else if (data.status == "performa_conversion") {
            const User = clientConnection.model("clientUsers", clinetUserSchema)


            const customer = await User.findById(quotation.customer.toString());
            let customerLedger = null;
            if (!customer) {
                throw new CustomError(statusCode.NotFound, "Customer");
            }
            if (!customer.ledgerLinkedId) {
                throw new CustomError(statusCode.NotFound, "Customer ledger id not found.");
            }
            customerLedger = customer.ledgerLinkedId;
            const performaData = {
                businessUnit: quotation.businessUnit,
                branch: quotation.branch,
                warehouse: quotation.warehouse,

                isVendorLevel: quotation.isVendorLevel,
                isBuLevel: quotation.isBuLevel,
                isBranchLevel: quotation.isBranchLevel,
                isWarehouseLevel: quotation.isWarehouseLevel,

                customer: quotation.customer, // Assumed ref to Supplier model
                customerLedger: customerLedger,
                shippingAddress: quotation.shippingAddress,
                spNumber: crypto.randomInt(100000, 1000000).toString(), // Unique for business integrity
                items: quotation.items,
                notes: quotation.notes,
                isInterState: quotation.isInterState, // Determines IGST vs CGST/SGST
                roundOff: quotation.roundOff,
                status: "draft",
                grandTotal: quotation.grandTotal,
                createdBy: quotation.createdBy,
            }


            if (data?.workOrderNumber) {
                performaData.workOrderNumber = data?.workOrderNumber
            }

            if (data?.workOrderDate) {
                performaData.workOrderDate = data?.workOrderDate
            }

            await SalePerforma.create(performaData)

        }


        Object.assign(quotation, data);
        return await quotation.save();
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