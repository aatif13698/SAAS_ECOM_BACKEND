// services/chairService.js 
const { getClientDatabaseConnection } = require("../../db/connection");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const clientAssetSchema = require("../../client/model/asset");
const quotationSchema = require("../../client/model/saleQuotation");
const { model } = require("mongoose");
const supplierSchema = require("../../client/model/supplier");
const SaleInvoiceSchema = require("../../client/model/saleInvoice");
const crypto = require('crypto');
const clinetUserSchema = require("../../client/model/user");
const salePerformaSchema = require("../../client/model/salePerforma");
const ledgerSchema = require("../../client/model/ledger");
const voucherGroupSchema = require("../../client/model/voucherGroup");
const voucherSchema = require("../../client/model/voucher");
const { v4: uuidv4 } = require('uuid');
const transactionSerialNumebrSchema = require("../../client/model/transactionSeries");



// const create = async (clientId, data, mainUser) => {
//     const clientConnection = await getClientDatabaseConnection(clientId);

//     const SaleInvoice = clientConnection.model('saleInvoice', SaleInvoiceSchema);

//     const Ledger = clientConnection.model("ledger", ledgerSchema);
//     const VoucherGroup = clientConnection.model("voucherGroup", voucherGroupSchema);
//     const Voucher = clientConnection.model("voucher", voucherSchema);
//     const SerialNumber = clientConnection.model('transactionSerialNumebr', transactionSerialNumebrSchema);

//     const session = await clientConnection.startSession();

//     try {
//         const result = await session.withTransaction(async (session) => {
//             let pi;

//             // ── Payment part ───────────────────────────────────────
//             if (data?.paidAmount > 0) {
//                 const customerLedger = await Ledger.findById(data.customerLedger).session(session);
//                 if (!customerLedger) throw new CustomError(400, 'Customer ledger not found.');

//                 const receivedInLedger = await Ledger.findById(data?.receivedIn).session(session);
//                 if (!receivedInLedger) throw new CustomError(400, 'Payment ledger not found.');
               
//                 const voucherGroup = await VoucherGroup.findOne({
//                     warehouse: data?.warehouse,
//                     isWarehouseLevel: true,
//                     name: "Receipt"
//                 }).session(session);

//                 if (!voucherGroup) throw new CustomError(400, 'Voucher group not found.');

//                 const voucherLinkId = uuidv4();

//                 const voucherDocs = [
//                     {
//                         businessUnit: data?.businessUnit,
//                         branch: data?.branch,
//                         warehouse: data?.warehouse,
//                         isWarehouseLevel: true,
//                         voucherGroup: voucherGroup._id,
//                         narration: "Sale invoice receipt.",
//                         voucherLinkId,
//                         ledger: data.customerLedger,
//                         debit: data.paidAmount,
//                         credit: 0,
//                         isSingleEntry: false,
//                         createdBy: mainUser._id,
//                     },
//                     {
//                         businessUnit: data?.businessUnit,
//                         branch: data?.branch,
//                         warehouse: data?.warehouse,
//                         isWarehouseLevel: true,
//                         voucherGroup: voucherGroup._id,
//                         narration: "Sale invoice receipt.",
//                         voucherLinkId,
//                         ledger: data.receivedIn,
//                         debit: 0,
//                         credit: data.paidAmount,
//                         isSingleEntry: false,
//                         createdBy: mainUser._id,
//                     }
//                 ];

//                 // Important: ordered: true when using session + multiple docs
//                 await Voucher.create(voucherDocs, { session, ordered: true });

//                 // Update ledgers
//                 receivedInLedger.balance += Number(data.paidAmount);
//                 await receivedInLedger.save({ session });

//                 customerLedger.balance += Number(data.balance);
//                 await customerLedger.save({ session });

//                 // ── Duplicate check ────────────────────────────────────
//                 const existingPi = await SaleInvoice.findOne({ siNumber: data?.siNumber })
//                     .session(session)
//                     .lean();

//                 if (existingPi) {
//                     throw new CustomError(400, 'Sale invoice number already exists.');
//                 }


//                 // ── Create Purchase Invoice ────────────────────────────
//                 [pi] = await SaleInvoice.create([{ ...data, receivedIn: [{ id: data.receivedIn, paymentType: "Receipt", amount: Number(data.paidAmount) }], status: Number(data.balance) == 0 ? "paid" : "partially_paid" }], {
//                     session,
//                     ordered: true   // safe even for 1 document
//                 });

//                 if (pi) {
//                     await SerialNumber.findOneAndUpdate({ collectionName: "sale_invoice" }, { $inc: { nextNum: 1 } })
//                 }

//                 return pi;

//             } else {
//                 const customerLedger = await Ledger.findById(data.customerLedger).session(session);
//                 if (!customerLedger) throw new CustomError(400, 'Customer ledger not found.');

//                 customerLedger.balance += Number(data.balance);
//                 await customerLedger.save({ session });

//                 // ── Duplicate check ────────────────────────────────────
//                 const existingPi = await SaleInvoice.findOne({ siNumber: data?.siNumber })
//                     .session(session)
//                     .lean();
//                 if (existingPi) {
//                     throw new CustomError(400, 'Sale invoice number already exists.');
//                 }
//                 // ── Create Purchase Invoice ────────────────────────────
//                 [pi] = await SaleInvoice.create([{ ...data, receivedIn: [], paymentMethod: "", status: "full_due" }], {
//                     session,
//                     ordered: true   // safe even for 1 document
//                 });

//                 if (pi) {
//                     await SerialNumber.findOneAndUpdate({ collectionName: "sale_invoice" }, { $inc: { nextNum: 1 } })
//                 }



//                 return pi;
//             }
//         });

//         return result;
//     } catch (error) {
//         throw new CustomError(
//             error.statusCode || 500,
//             `Error creating purchase invoice: ${error.message}`
//         );
//     } finally {
//         session.endSession();
//     }
// };


const create = async (clientId, data, mainUser) => {
    const clientConnection = await getClientDatabaseConnection(clientId);

    const SaleInvoice = clientConnection.model('saleInvoice', SaleInvoiceSchema);
    const Ledger = clientConnection.model("ledger", ledgerSchema);
    const VoucherGroup = clientConnection.model("voucherGroup", voucherGroupSchema);
    const Voucher = clientConnection.model("voucher", voucherSchema);
    const SerialNumber = clientConnection.model('transactionSerialNumebr', transactionSerialNumebrSchema);

    const session = await clientConnection.startSession();

    try {
        return await session.withTransaction(async () => {
            // ── 1. Input sanitization (real-world safeguard) ──
            const paidAmount = Number(data.paidAmount || 0);
            const balanceAmount = Number(data.balance || 0);

            if (paidAmount < 0 || balanceAmount < 0) {
                throw new CustomError(400, 'Amounts cannot be negative.');
            }

            // ── 2. EARLY Duplicate check (critical fix) ─────────────────────
            // Runs before ANY ledger/voucher changes → no wasted work on rollback
            const existingSi = await SaleInvoice.findOne({ 
                siNumber: data.siNumber 
            }).session(session).lean();

            if (existingSi) {
                throw new CustomError(400, 'Sale invoice number already exists.');
            }

            // ── 3. Fetch customer ledger once (used in both paths) ───────────
            const customerLedger = await Ledger.findById(data.customerLedger).session(session);
            if (!customerLedger) throw new CustomError(400, 'Customer ledger not found.');

            let status = "full_due";
            let receivedInArray = [];

            // ── 4. Receipt handling (vouchers + receivedIn ledger) ───────────
            if (paidAmount > 0) {
                const receivedInLedger = await Ledger.findById(data.receivedIn).session(session);
                if (!receivedInLedger) throw new CustomError(400, 'Receipt ledger not found.');

                const voucherGroup = await VoucherGroup.findOne({
                    warehouse: data?.warehouse,
                    isWarehouseLevel: true,
                    name: "Receipt"
                }).session(session);

                if (!voucherGroup) throw new CustomError(400, 'Voucher group not found.');

                const voucherLinkId = uuidv4();

                await Voucher.insertMany([
                    {
                        businessUnit: data?.businessUnit,
                        branch: data?.branch,
                        warehouse: data?.warehouse,
                        isWarehouseLevel: true,
                        voucherGroup: voucherGroup._id,
                        narration: "Sale invoice receipt.",
                        voucherLinkId,
                        ledger: data.customerLedger,
                        debit: paidAmount,
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
                        credit: paidAmount,
                        isSingleEntry: false,
                        createdBy: mainUser._id,
                    }
                ], { session, ordered: true });

                // Update receivedIn ledger (cash/bank increases)
                receivedInLedger.balance = Number(receivedInLedger.balance) + paidAmount;
                await receivedInLedger.save({ session });

                // Set status & reference
                status = balanceAmount === 0 ? "paid" : "partially_paid";
                receivedInArray = [{
                    id: data.receivedIn,
                    paymentType: "Receipt",
                    amount: paidAmount
                }];
            }

            // ── 5. Update customer ledger (outstanding receivable) ───────────
            // Common logic for both paid & unpaid paths (exactly as original)
            if (balanceAmount > 0) {
                customerLedger.balance = Number(customerLedger.balance) + balanceAmount;
                await customerLedger.save({ session });
            }

            // ── 6. Create Sale Invoice ───────────────────────────────────────
            const invoicePayload = {
                ...data,
                receivedIn: receivedInArray,
                status,
                paymentMethod: paidAmount > 0 ? (data.paymentMethod || "") : ""
            };

            const [createdSi] = await SaleInvoice.create([invoicePayload], { 
                session, 
                ordered: true 
            });

            // ── 7. Increment serial number (only on success) ─────────────────
            await SerialNumber.findOneAndUpdate(
                { collectionName: "sale_invoice" },
                { $inc: { nextNum: 1 } },
                { session }
            );

            return createdSi;
        });
    } catch (error) {
        throw new CustomError(
            error.statusCode || 500,
            `Error creating sale invoice: ${error.message}`
        );
    } finally {
        await session.endSession();
    }
};





const update = async (clientId, invoiceId, updateData) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Performa = clientConnection.model('salePerforma', salePerformaSchema);
        const performa = await Performa.findById(invoiceId);
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


const getById = async (clientId, invoiceId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const SaleInvoice = clientConnection.model('saleInvoice', SaleInvoiceSchema);
        const Client = clientConnection.model('clientUsers', clinetUserSchema);
        const saleInvoice = await SaleInvoice.findById(invoiceId)
            .populate({
                path: "customer",
                model: Client,
            });
        if (!saleInvoice) {
            throw new CustomError(statusCode.NotFound, "Invoice not found.");
        }
        return saleInvoice;
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


const changeStatus = async (clientId, invoiceId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const PurchaseOrder = clientConnection.model('saleQuotation', quotationSchema);
        const SaleInvoice = clientConnection.model('SaleInvoice', SaleInvoiceSchema);

        const purchaseOrder = await PurchaseOrder.findById(invoiceId);
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


const unpaid = async (clientId, filters = {}) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const SaleInvoice = clientConnection.model('SaleInvoice', SaleInvoiceSchema);
        const User = clientConnection.model("clientUsers", clinetUserSchema)

        const query = {
            ...filters,
            balance: { $gt: 0 }
        };

        console.log("query", query);


        const [invoices, total] = await Promise.all([
            SaleInvoice.find(query)
                .sort({ createdAt: -1 })  // Sort by creation date descending (latest first)
                .populate({
                    path: "customer",
                    model: User,
                    select: "-items"
                }),
            SaleInvoice.countDocuments(query),
        ]);
        console.log("invoices", invoices);

        return { count: total, invoices };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing: ${error.message}`);
    }
};


const allByCustomer = async (clientId, filters = {}) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const SaleInvoice = clientConnection.model('SaleInvoice', SaleInvoiceSchema);
        const [saleInvoices] = await Promise.all([
            SaleInvoice.find({...filters, isReturnCreated: { $ne: true }})
                .sort({ createdAt: -1 }),  // Sort by creation date descending (latest first)
        ]);
        return { saleInvoices };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing: ${error.message}`);
    }
};



module.exports = {
    create,
    update,
    getById,
    list,
    changeStatus,
    unpaid,
    allByCustomer
}; 