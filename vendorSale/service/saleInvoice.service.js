// services/chairService.js 
const { getClientDatabaseConnection } = require("../../db/connection");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const clientAssetSchema = require("../../client/model/asset");
const quotationSchema = require("../../client/model/saleQuotation");
const { model } = require("mongoose");
const supplierSchema = require("../../client/model/supplier");
const SaleInvoiceSchema = require("../../client/model/SaleInvoice");
const crypto = require('crypto');
const clinetUserSchema = require("../../client/model/user");
const salePerformaSchema = require("../../client/model/salePerforma");
const ledgerSchema = require("../../client/model/ledger");
const voucherGroupSchema = require("../../client/model/voucherGroup");
const voucherSchema = require("../../client/model/voucher");
const { v4: uuidv4 } = require('uuid');


// const create = async (clientId, data) => {
//     try {
//         const clientConnection = await getClientDatabaseConnection(clientId);
//         const SaleInvoice = clientConnection.model('saleInvoice', SaleInvoiceSchema);
//         const existing = await SaleInvoice.findOne({ siNumber: data?.siNumber }).lean();
//         if (existing) {
//             throw new CustomError(statusCode.BadRequest, 'Sale invoice number already exists.')
//         }
//         return await SaleInvoice.create(data);
//     } catch (error) {
//         throw new CustomError(error.statusCode || 500, `Error creating : ${error.message}`);
//     }
// };

const create = async (clientId, data, mainUser) => {
    const clientConnection = await getClientDatabaseConnection(clientId);

    const SaleInvoice = clientConnection.model('saleInvoice', SaleInvoiceSchema);

    const Ledger = clientConnection.model("ledger", ledgerSchema);
    const VoucherGroup = clientConnection.model("voucherGroup", voucherGroupSchema);
    const Voucher = clientConnection.model("voucher", voucherSchema);

    const session = await clientConnection.startSession();

    try {
        const result = await session.withTransaction(async (session) => {
            let pi;

            // ── Payment part ───────────────────────────────────────
            if (data?.paidAmount > 0) {
                const customerLedger = await Ledger.findById(data.customerLedger).session(session);
                if (!customerLedger) throw new CustomError(400, 'Customer ledger not found.');

                const receivedInLedger = await Ledger.findById(data?.receivedIn).session(session);
                if (!receivedInLedger) throw new CustomError(400, 'Payment ledger not found.');

                if (receivedInLedger.balance < data.paidAmount) {
                    throw new CustomError(400, 'Insufficient Amount in payment ledger.');
                }

                const voucherGroup = await VoucherGroup.findOne({
                    warehouse: data?.warehouse,
                    isWarehouseLevel: true,
                    name: "Receipt"
                }).session(session);

                if (!voucherGroup) throw new CustomError(400, 'Voucher group not found.');

                const voucherLinkId = uuidv4();

                const voucherDocs = [
                    {
                        businessUnit: data?.businessUnit,
                        branch: data?.branch,
                        warehouse: data?.warehouse,
                        isWarehouseLevel: true,
                        voucherGroup: voucherGroup._id,
                        narration: "Sale invoice receipt.",
                        voucherLinkId,
                        ledger: data.customerLedger,
                        debit: data.paidAmount,
                        credit: 0,
                        isSingleEntry: false,
                        createdBy: mainUser._id,
                    },
                    {
                        businessUnit: data?.businessUnit,
                        branch: data?.branch,
                        warehouse: data?.warehouse,
                        isWarehouseLevel: true,
                        voucherGroup: voucherGroup._id,
                        narration: "Sale invoice receipt.",
                        voucherLinkId,
                        ledger: data.receivedIn,
                        debit: 0,
                        credit: data.paidAmount,
                        isSingleEntry: false,
                        createdBy: mainUser._id,
                    }
                ];

                // Important: ordered: true when using session + multiple docs
                await Voucher.create(voucherDocs, { session, ordered: true });

                // Update ledgers
                receivedInLedger.balance += Number(data.paidAmount);
                await receivedInLedger.save({ session });

                customerLedger.balance -= Number(data.paidAmount);
                await customerLedger.save({ session });


                // ── Duplicate check ────────────────────────────────────
                const existingPi = await SaleInvoice.findOne({ siNumber: data?.siNumber })
                    .session(session)
                    .lean();

                if (existingPi) {
                    throw new CustomError(400, 'Sale invoice number already exists.');
                }

                console.log("Number(receivedInLedger.balance)", Number(receivedInLedger.balance));

                // ── Create Purchase Invoice ────────────────────────────
                [pi] = await SaleInvoice.create([{ ...data, receivedIn: [{ id: data.receivedIn, paymentType: "Receipt", amount: Number(data.paidAmount) }], status: Number(data.balance) == 0 ? "paid" : "partially_paid" }], {
                    session,
                    ordered: true   // safe even for 1 document
                });

                return pi;

            } else {
                console.log("coming here");

                // ── Duplicate check ────────────────────────────────────
                const existingPi = await SaleInvoice.findOne({ siNumber: data?.siNumber })
                    .session(session)
                    .lean();
                if (existingPi) {
                    throw new CustomError(400, 'Purchase invoice number already exists.');
                }
                // ── Create Purchase Invoice ────────────────────────────
                [pi] = await SaleInvoice.create([{ ...data, receivedIn: [], paymentMethod: "", status: "full_due" }], {
                    session,
                    ordered: true   // safe even for 1 document
                });
                return pi;
            }
        });

        return result;
    } catch (error) {
        throw new CustomError(
            error.statusCode || 500,
            `Error creating purchase invoice: ${error.message}`
        );
    } finally {
        session.endSession();
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
        const SaleInvoice = clientConnection.model('saleInvoice', SaleInvoiceSchema);
        const Supplier = clientConnection.model('supplier', supplierSchema);
        const User = clientConnection.model("clientUsers", clinetUserSchema)

        console.log("options", options);

        const { page, limit } = options;
        const skip = (Number(page) - 1) * Number(limit);
        console.log("skip", skip);

        const [invoices, total] = await Promise.all([
            SaleInvoice.find(filters)
                .skip(skip)
                .sort({ createdAt: -1 })  // Sort by creation date descending (latest first)
                .limit(Number(limit))
                .populate({
                    path: "customer",
                    model: User,
                }),
            SaleInvoice.countDocuments(filters),
        ]);
        return { count: total, invoices };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing: ${error.message}`);
    }
};


const changeStatus = async (clientId, performaId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const PurchaseOrder = clientConnection.model('saleQuotation', quotationSchema);
        const SaleInvoice = clientConnection.model('SaleInvoice', SaleInvoiceSchema);

        const purchaseOrder = await PurchaseOrder.findById(performaId);
        if (!purchaseOrder) {
            throw new CustomError(statusCode.NotFound, message.lblPurchaseOrderNotFound);
        }
        if (data.status == "invoiced") {
            const Supplier = clientConnection.model("supplier", supplierSchema);
            console.log("purchaseOrder.supplier", purchaseOrder.supplier);

            const supplier = await Supplier.findById(purchaseOrder.supplier.toString());
            let customerLedger = null;
            if (!supplier) {
                throw new CustomError(statusCode.NotFound, message.lblSupplierNotFound);
            }
            if (!supplier.ledgerLinkedId) {
                throw new CustomError(statusCode.NotFound, "Supplier ledger id not found.");
            }
            customerLedger = supplier.ledgerLinkedId;
            const invoiceData = {
                businessUnit: purchaseOrder.businessUnit,
                branch: purchaseOrder.branch,
                warehouse: purchaseOrder.warehouse,

                isVendorLevel: purchaseOrder.isVendorLevel,
                isBuLevel: purchaseOrder.isBuLevel,
                isBranchLevel: purchaseOrder.isBranchLevel,
                isWarehouseLevel: purchaseOrder.isWarehouseLevel,

                supplier: purchaseOrder.supplier, // Assumed ref to Supplier model
                customerLedger: customerLedger,
                shippingAddress: purchaseOrder.shippingAddress,
                siNumber: crypto.randomInt(100000, 1000000).toString(), // Unique for business integrity
                items: purchaseOrder.items,
                notes: purchaseOrder.notes,
                isInterState: purchaseOrder.isInterState, // Determines IGST vs CGST/SGST
                roundOff: purchaseOrder.roundOff,
                status: "full_due",
                balance: purchaseOrder.grandTotal,
                createdBy: purchaseOrder.createdBy,
            }

            await SaleInvoice.create(invoiceData);
        }


        Object.assign(purchaseOrder, data);
        return await purchaseOrder.save();
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