// services/chairService.js 
const { getClientDatabaseConnection } = require("../../db/connection");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const clientAssetSchema = require("../../client/model/asset");
const { model } = require("mongoose");
const supplierSchema = require("../../client/model/supplier");
const purchaseInvoiceSchema = require("../../client/model/purchaseInvoice");
const ledgerSchema = require("../../client/model/ledger");
const voucherGroupSchema = require("../../client/model/voucherGroup");
const voucherSchema = require("../../client/model/voucher");
const { v4: uuidv4 } = require('uuid');


// const create = async (clientId, data, mainUser) => {
//     try {
//         const clientConnection = await getClientDatabaseConnection(clientId);
//         const PurchaseInvoice = clientConnection.model('purchaseInvoice', purchaseInvoiceSchema);
//         const Ledger = clientConnection.model("ledger", ledgerSchema);
//         const VoucherGroup = clientConnection.model("voucherGroup", voucherGroupSchema);
//         const Voucher = clientConnection.model("voucher", voucherSchema);
//         const session = await clientConnection.startSession();
//         session.startTransaction();
//         if (data?.paidAmount > 0) {
//             const supplierLedger = await Ledger.findById(data.supplierLedger);

//             if (!supplierLedger) {
//                 await session.abortTransaction();
//                 session.endSession();
//                 throw new CustomError(statusCode.BadRequest, 'Supplier ledger not found.')
//             }

//             const payedFromLedger = await Ledger.findById(data?.payedFrom);
//             if (!payedFromLedger) {
//                 await session.abortTransaction();
//                 session.endSession();
//                 throw new CustomError(statusCode.BadRequest, 'Payment ledger not found.')
//             }

//             console.log("payedFromLedger", payedFromLedger);

//             if (payedFromLedger.balance < data?.paidAmount) {
//                 await session.abortTransaction();
//                 session.endSession();
//                 throw new CustomError(statusCode.BadRequest, 'Insufficient Amount in payment ledger.')
//             }
//             const voucherGroup = await VoucherGroup.findOne({
//                 warehouse: data?.warehouse,
//                 isWarehouseLevel: true,
//                 name: "Payment"
//             });
//             if (!voucherGroup) {
//                 await session.abortTransaction();
//                 session.endSession();
//                 throw new CustomError(statusCode.BadRequest, 'Voucher group not found.')
//             }
//             // create vouchers
//             const entries = [
//                 { ledger: data.supplierLedger, credit: data?.paidAmount, debit: 0, type: 'credit' }, // First row: Credit
//                 { ledger: data.payedFrom, credit: 0, debit: data?.paidAmount, type: 'debit' },  // Second row: Debit
//             ]
//             const voucherLinkId = uuidv4();
//             const dataObject = {
//                 voucherGroup: voucherGroup._id,
//                 narration: "Purchase invoice payment.",
//                 entries: entries,
//                 isSingleEntry: false,
//                 createdBy: mainUser._id,
//             }
//             await session.withTransaction(async () => {
//                 const voucherPromises = dataObject.entries.map(entry => {
//                     const voucherData = {
//                         ...dataObject,
//                         voucherLinkId,
//                         ledger: entry.ledger,
//                         debit: entry.debit || 0,
//                         credit: entry.credit || 0,
//                     };
//                     return Voucher.create([voucherData], { session });
//                 });
//                 await Promise.all(voucherPromises);
//             });
//             payedFromLedger.balance = payedFromLedger.balance - data?.paidAmount;
//             await payedFromLedger.save({ session });
//             supplierLedger.balance = supplierLedger.balance + data?.paidAmount
//             await supplierLedger.save({ session });
//         }

//         const existingPi = await PurchaseInvoice.findOne({ piNumber: data?.piNumber }).lean();
//         console.log("existingPi", existingPi);
//         if (existingPi) {
//             throw new CustomError(statusCode.BadRequest, 'Purchase invoice number already exists.')
//         }
//         const pi = await PurchaseInvoice.create([{ ...data }, { session }]);
//         return pi
//     } catch (error) {
//         throw new CustomError(error.statusCode || 500, `Error creating: ${error.message}`);
//     }
// };

const create = async (clientId, data, mainUser) => {
    const clientConnection = await getClientDatabaseConnection(clientId);

    const PurchaseInvoice = clientConnection.model('purchaseInvoice', purchaseInvoiceSchema);
    const Ledger = clientConnection.model("ledger", ledgerSchema);
    const VoucherGroup = clientConnection.model("voucherGroup", voucherGroupSchema);
    const Voucher = clientConnection.model("voucher", voucherSchema);

    const session = await clientConnection.startSession();

    try {
        const result = await session.withTransaction(async (session) => {
            let pi;

            // ── Payment part ───────────────────────────────────────
            if (data?.paidAmount > 0) {
                const supplierLedger = await Ledger.findById(data.supplierLedger).session(session);
                if (!supplierLedger) throw new CustomError(400, 'Supplier ledger not found.');

                const payedFromLedger = await Ledger.findById(data?.payedFrom).session(session);
                if (!payedFromLedger) throw new CustomError(400, 'Payment ledger not found.');

                if (payedFromLedger.balance < data.paidAmount) {
                    throw new CustomError(400, 'Insufficient Amount in payment ledger.');
                }

                const voucherGroup = await VoucherGroup.findOne({
                    warehouse: data?.warehouse,
                    isWarehouseLevel: true,
                    name: "Payment"
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
                        narration: "Purchase invoice payment.",
                        voucherLinkId,
                        ledger: data.supplierLedger,
                        debit: 0,
                        credit: data.paidAmount,
                        isSingleEntry: false,
                        createdBy: mainUser._id,
                    },
                    {
                        businessUnit: data?.businessUnit,
                        branch: data?.branch,
                        warehouse: data?.warehouse,
                        isWarehouseLevel: true,
                        voucherGroup: voucherGroup._id,
                        narration: "Purchase invoice payment.",
                        voucherLinkId,
                        ledger: data.payedFrom,
                        debit: data.paidAmount,
                        credit: 0,
                        isSingleEntry: false,
                        createdBy: mainUser._id,
                    }
                ];

                // Important: ordered: true when using session + multiple docs
                await Voucher.create(voucherDocs, { session, ordered: true });

                // Update ledgers
                payedFromLedger.balance -= Number(data.paidAmount);
                await payedFromLedger.save({ session });

                supplierLedger.balance += Number(data.paidAmount);
                await supplierLedger.save({ session });


                // ── Duplicate check ────────────────────────────────────
                const existingPi = await PurchaseInvoice.findOne({ piNumber: data?.piNumber })
                    .session(session)
                    .lean();

                if (existingPi) {
                    throw new CustomError(400, 'Purchase invoice number already exists.');
                }

                console.log("Number(payedFromLedger.balance)", Number(payedFromLedger.balance));
                console.log("");



                // ── Create Purchase Invoice ────────────────────────────
                [pi] = await PurchaseInvoice.create([{ ...data, payedFrom: [{ id: data.payedFrom, paymentType: "Payment", amount: Number(data.paidAmount) }], status: Number(data.balance) == 0 ? "paid" : "partially_paid" }], {
                    session,
                    ordered: true   // safe even for 1 document
                });

                return pi;

            } else {
                console.log("coming here");

                // ── Duplicate check ────────────────────────────────────
                const existingPi = await PurchaseInvoice.findOne({ piNumber: data?.piNumber })
                    .session(session)
                    .lean();
                if (existingPi) {
                    throw new CustomError(400, 'Purchase invoice number already exists.');
                }
                // ── Create Purchase Invoice ────────────────────────────
                [pi] = await PurchaseInvoice.create([{ ...data, payedFrom: [], paymentMethod: "", status: "full_due" }], {
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

const update = async (clientId, purchaseInvoiceId, updateData) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const PurchaseInvoice = clientConnection.model('purchaseInvoice', purchaseInvoiceSchema);
        const purchaseInvoice = await PurchaseInvoice.findById(purchaseInvoiceId);
        if (!purchaseInvoice) {
            throw new CustomError(statusCode.NotFound, message.lblPurchaseInvoiceNotFound);
        }
        Object.assign(purchaseInvoice, updateData);
        await purchaseInvoice.save();
        return purchaseInvoice
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error updating: ${error.message}`);
    }
};


const getById = async (clientId, purchaseInvoiceId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const PurchaseInvoice = clientConnection.model('purchaseInvoice', purchaseInvoiceSchema);
        const Supplier = clientConnection.model('supplier', supplierSchema);
        const purchaseInvoice = await PurchaseInvoice.findById(purchaseInvoiceId)
            .populate({
                path: "supplier",
                model: Supplier,
                select: "-items"
            });
        if (!purchaseInvoice) {
            throw new CustomError(statusCode.NotFound, message.lblPurchaseInvoiceNotFound);
        }
        return purchaseOrder;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting: ${error.message}`);
    }
};


const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const PurchaseInvoice = clientConnection.model('purchaseInvoice', purchaseInvoiceSchema);
        const Supplier = clientConnection.model('supplier', supplierSchema);

        const { page, limit } = options;
        const skip = (Number(page) - 1) * Number(limit);
        console.log("skip", skip);

        const [purchaseInvoices, total] = await Promise.all([
            PurchaseInvoice.find(filters)
                .skip(skip)
                .sort({ createdAt: -1 })  // Sort by creation date descending (latest first)
                .limit(Number(limit))
                .populate({
                    path: "supplier",
                    model: Supplier,
                    select: "-items"
                }),
            PurchaseInvoice.countDocuments(filters),
        ]);
        return { count: total, purchaseInvoices };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing: ${error.message}`);
    }
};


const unpaid = async (clientId, filters = {}) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const PurchaseInvoice = clientConnection.model('purchaseInvoice', purchaseInvoiceSchema);
        const Supplier = clientConnection.model('supplier', supplierSchema);

        const query = {
            ...filters,
            balance: { $gt: 0 }
        };

        const [purchaseInvoices, total] = await Promise.all([
            PurchaseInvoice.find(query)
                .sort({ createdAt: -1 })  // Sort by creation date descending (latest first)
                .populate({
                    path: "supplier",
                    model: Supplier,
                    select: "-items"
                }),
            PurchaseInvoice.countDocuments(query),
        ]);
        return { count: total, purchaseInvoices };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing: ${error.message}`);
    }
};


const changeStatus = async (clientId, purchaseInvoiceId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const PurchaseInvoice = clientConnection.model('purchaseInvoice', purchaseInvoiceSchema);
        const purchaseInvoice = await PurchaseInvoice.findById(purchaseInvoiceId);
        if (!purchaseInvoice) {
            throw new CustomError(statusCode.NotFound, message.lblPurchaseInvoiceNotFound);
        }
        Object.assign(purchaseInvoice, data);
        return await purchaseInvoice.save();
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
    unpaid
}; 