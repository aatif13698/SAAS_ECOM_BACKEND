// services/chairService.js 
const { getClientDatabaseConnection } = require("../../db/connection");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const clientAssetSchema = require("../../client/model/asset");
const purchaseOrderSchema = require("../../client/model/purchaseOrder");
const { model } = require("mongoose");
const supplierSchema = require("../../client/model/supplier");
const purchaseInvoiceSchema = require("../../client/model/purchaseInvoice");
const crypto = require('crypto');
const transactionSerialNumebrSchema = require("../../client/model/transactionSeries");
const purchaseReturnSchema = require("../../client/model/purchaseReturn");


const ledgerSchema = require("../../client/model/ledger");
const voucherGroupSchema = require("../../client/model/voucherGroup");
const voucherSchema = require("../../client/model/voucher");
const { v4: uuidv4 } = require('uuid');
const productMainStockSchema = require("../../client/model/productMainStock");
const clinetBusinessUnitSchema = require("../../client/model/businessUnit");
const clinetBranchSchema = require("../../client/model/branch");
const clinetWarehouseSchema = require("../../client/model/warehouse");
const stockLedgerSchema = require("../../client/model/stockLedger");
const debitNoteSchema = require("../../client/model/debitNote");


// const create = async (clientId, data) => {
//     try {
//         const clientConnection = await getClientDatabaseConnection(clientId);
//         const PurchaseReturn = clientConnection.model('purchaseReturn', purchaseReturnSchema);
//         const SerialNumber = clientConnection.model('transactionSerialNumebr', transactionSerialNumebrSchema);
//         const existingPr = await PurchaseReturn.findOne({ dnNumber: data?.dnNumber }).lean();
//         if (existingPr) {
//             throw new CustomError(statusCode.BadRequest, 'Purchase return number already exists.')
//         }
//         const purchaseReturn = await PurchaseReturn.create(data);
//         if (purchaseReturn) {
//             await SerialNumber.findOneAndUpdate({ collectionName: "debit_note" }, { $inc: { nextNum: 1 } })
//         }
//         return purchaseReturn
//     } catch (error) {
//         throw new CustomError(error.statusCode || 500, `Error creating : ${error.message}`);
//     }
// };


const create = async (clientId, data, mainUser) => {
    const clientConnection = await getClientDatabaseConnection(clientId);
    const DebitNote = clientConnection.model('debitNote', debitNoteSchema);
    const Ledger = clientConnection.model("ledger", ledgerSchema);
    const VoucherGroup = clientConnection.model("voucherGroup", voucherGroupSchema);
    const Voucher = clientConnection.model("voucher", voucherSchema);
    const SerialNumber = clientConnection.model('transactionSerialNumebr', transactionSerialNumebrSchema);

    const session = await clientConnection.startSession();

    try {
        const result = await session.withTransaction(async (session) => {
            let pi;

            console.log("data?.paidAmount", data?.paidAmount);


            // ── Payment part ───────────────────────────────────────
            if (data?.paidAmount > 0) {
                const supplierLedger = await Ledger.findById(data.supplierLedger).session(session);
                if (!supplierLedger) throw new CustomError(400, 'Customer ledger not found.');

                const receivedInLedger = await Ledger.findById(data?.receivedIn).session(session);
                if (!receivedInLedger) throw new CustomError(400, 'Received ledger not found.');

                // if (receivedInLedger.balance < data.paidAmount) {
                //     throw new CustomError(400, 'Insufficient Amount in payment ledger.');
                // }

                const voucherGroup = await VoucherGroup.findOne({
                    warehouse: data?.warehouse,
                    isWarehouseLevel: true,
                    name: "Receipt"
                }).session(session);

                if (!voucherGroup) throw new CustomError(400, 'Voucher group not found.');

                const voucherLinkId = uuidv4();

                console.log("voucherGroup", voucherGroup);
                console.log("mainUser", mainUser);



                const voucherDocs = [
                    {
                        businessUnit: data?.businessUnit,
                        branch: data?.branch,
                        warehouse: data?.warehouse,
                        isWarehouseLevel: true,
                        voucherGroup: voucherGroup._id,
                        narration: "Purchase return receipt.",
                        voucherLinkId,
                        ledger: data.supplierLedger,
                        credit: 0,
                        debit: data.paidAmount,
                        isSingleEntry: false,
                        createdBy: mainUser._id,
                    },
                    {
                        businessUnit: data?.businessUnit,
                        branch: data?.branch,
                        warehouse: data?.warehouse,
                        isWarehouseLevel: true,
                        voucherGroup: voucherGroup._id,
                        narration: "Purchase return receipt.",
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

                supplierLedger.balance -= Number(data.paidAmount);
                await supplierLedger.save({ session });


                // ── Duplicate check ────────────────────────────────────
                const existingPr = await DebitNote.findOne({ dnNumber: data?.dnNumber })
                    .session(session)
                    .lean();

                if (existingPr) {
                    throw new CustomError(400, 'Debit note number already exists.');
                }

                console.log("Number(receivedInLedger.balance)", Number(receivedInLedger.balance));

                // ── Create Purchase Invoice ────────────────────────────
                [pi] = await DebitNote.create([{ ...data, receivedIn: [{ id: data.receivedIn, paymentType: "Receipt", amount: Number(data.paidAmount) }], status: Number(data.balance) == 0 ? "paid" : "partially_paid" }], {
                    session,
                    ordered: true   // safe even for 1 document
                });

                if (pi) {
                    await SerialNumber.findOneAndUpdate({ collectionName: "debit_note" }, { $inc: { nextNum: 1 } })
                }

                return pi;

            } else {

                // ── Duplicate check ────────────────────────────────────
                const existingPr = await DebitNote.findOne({ dnNumber: data?.dnNumber })
                    .session(session)
                    .lean();
                if (existingPr) {
                    throw new CustomError(400, 'Debit note number already exists.');
                }
                // ── Create Purchase Invoice ────────────────────────────
                [pi] = await DebitNote.create([{ ...data, receivedIn: [], paymentMethod: "", status: "full_due" }], {
                    session,
                    ordered: true   // safe even for 1 document
                });

                if (pi) {
                    await SerialNumber.findOneAndUpdate({ collectionName: "debit_note" }, { $inc: { nextNum: 1 } })
                }

                return pi;
            }
        });

        return result;
    } catch (error) {
        throw new CustomError(
            error.statusCode || 500,
            `Error creating debit note: ${error.message}`
        );
    } finally {
        session.endSession();
    }
};

const update = async (clientId, debitNoteId, updateData) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const DebitNote = clientConnection.model('debitNote', debitNoteSchema);
        const purchaseReturn = await DebitNote.findById(debitNoteId);
        if (!purchaseReturn) {
            throw new CustomError(statusCode.NotFound, message.lblPurchaseReturnNotFound);
        }
        Object.assign(purchaseReturn, updateData);
        await purchaseReturn.save();
        return purchaseReturn
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error updating purchase return: ${error.message}`);
    }
};


const getById = async (clientId, debitNoteId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const DebitNote = clientConnection.model('debitNote', debitNoteSchema);
        const Supplier = clientConnection.model('supplier', supplierSchema);
        const debitNote = await DebitNote.findById(debitNoteId)
            .populate({
                path: "supplier",
                model: Supplier,
                select: "-items"
            });
        if (!debitNote) {
            throw new CustomError(statusCode.NotFound, message.lblPurchaseReturnNotFound);
        }
        return debitNote;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting: ${error.message}`);
    }
};


const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const DebitNote = clientConnection.model('debitNote', debitNoteSchema);
        const Supplier = clientConnection.model('supplier', supplierSchema);
        const BusinessUnit = clientConnection.model('businessUnit', clinetBusinessUnitSchema);
        const Branch = clientConnection.model('branch', clinetBranchSchema);
        const Warehouse = clientConnection.model('warehouse', clinetWarehouseSchema);

        const { page, limit } = options;
        const skip = (Number(page) - 1) * Number(limit);

        const [debitNotes, total] = await Promise.all([
            DebitNote.find(filters)
                .skip(skip)
                .sort({ createdAt: -1 })  // Sort by creation date descending (latest first)
                .limit(Number(limit))
                .populate({
                    path: "supplier",
                    model: Supplier,
                    select: "-items"
                })
                .populate({
                    path: "businessUnit",
                    model: BusinessUnit,
                    select: "name"
                })
                .populate({
                    path: "branch",
                    model: Branch,
                    select: "name"
                })
                .populate({
                    path: "warehouse",
                    model: Warehouse,
                    select: "name"
                }),
            ,
            DebitNote.countDocuments(filters),
        ]);
        return { count: total, debitNotes };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing: ${error.message}`);
    }
};


const changeStatus = async (clientId, debitNoteId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const PurchaseOrder = clientConnection.model('purchaseOrder', purchaseOrderSchema);
        const PurchaseInvoice = clientConnection.model('purchaseInvoice', purchaseInvoiceSchema);

        const purchaseOrder = await PurchaseOrder.findById(debitNoteId);
        if (!purchaseOrder) {
            throw new CustomError(statusCode.NotFound, message.lblPurchaseReturnNotFound);
        }
        if (data.status == "invoiced") {
            const Supplier = clientConnection.model("supplier", supplierSchema);
            console.log("purchaseOrder.supplier", purchaseOrder.supplier);

            const supplier = await Supplier.findById(purchaseOrder.supplier.toString());
            let supplierLedger = null;
            if (!supplier) {
                throw new CustomError(statusCode.NotFound, message.lblSupplierNotFound);
            }
            if (!supplier.ledgerLinkedId) {
                throw new CustomError(statusCode.NotFound, "Supplier ledger id not found.");
            }
            supplierLedger = supplier.ledgerLinkedId;
            const invoiceData = {
                businessUnit: purchaseOrder.businessUnit,
                branch: purchaseOrder.branch,
                warehouse: purchaseOrder.warehouse,

                isVendorLevel: purchaseOrder.isVendorLevel,
                isBuLevel: purchaseOrder.isBuLevel,
                isBranchLevel: purchaseOrder.isBranchLevel,
                isWarehouseLevel: purchaseOrder.isWarehouseLevel,

                supplier: purchaseOrder.supplier, // Assumed ref to Supplier model
                supplierLedger: supplierLedger,
                shippingAddress: purchaseOrder.shippingAddress,
                piNumber: crypto.randomInt(100000, 1000000).toString(), // Unique for business integrity
                items: purchaseOrder.items,
                notes: purchaseOrder.notes,
                isInterState: purchaseOrder.isInterState, // Determines IGST vs CGST/SGST
                roundOff: purchaseOrder.roundOff,
                status: "full_due",
                balance: purchaseOrder.grandTotal,
                createdBy: purchaseOrder.createdBy,
            }

            await PurchaseInvoice.create(invoiceData)
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