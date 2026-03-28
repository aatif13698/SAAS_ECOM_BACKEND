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
const saleReturnSchema = require("../../client/model/saleReturn");
const clinetUserSchema = require("../../client/model/user");
const creditNoteSchema = require("../../client/model/creditNote");
const saleInvoiceAndCrditConnectionSchema = require("../../client/model/saleInvoiceAndCreditConnection");
const saleInvoiceSchema = require("../../client/model/saleInvoice");


// const create = async (clientId, data) => {
//     try {
//         const clientConnection = await getClientDatabaseConnection(clientId);
//         const SaleReturn = clientConnection.model('purchaseReturn', purchaseReturnSchema);
//         const SerialNumber = clientConnection.model('transactionSerialNumebr', transactionSerialNumebrSchema);
//         const existing = await SaleReturn.findOne({ cnNumber: data?.cnNumber }).lean();
//         if (existing) {
//             throw new CustomError(statusCode.BadRequest, 'Purchase return number already exists.')
//         }
//         const purchaseReturn = await SaleReturn.create(data);
//         if (purchaseReturn) {
//             await SerialNumber.findOneAndUpdate({ collectionName: "purchase_return" }, { $inc: { nextNum: 1 } })
//         }
//         return purchaseReturn
//     } catch (error) {
//         throw new CustomError(error.statusCode || 500, `Error creating : ${error.message}`);
//     }
// };


const create = async (clientId, data, mainUser) => {
    const clientConnection = await getClientDatabaseConnection(clientId);

    const CreditNote = clientConnection.model('creditNote', creditNoteSchema);
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
                        narration: "Credit note receipt.",
                        voucherLinkId,
                        ledger: data.customerLedger,
                        credit: data.paidAmount,
                        debit: 0,
                        isSingleEntry: false,
                        createdBy: mainUser._id,
                    },
                    {
                        businessUnit: data?.businessUnit,
                        branch: data?.branch,
                        warehouse: data?.warehouse,
                        isWarehouseLevel: true,
                        voucherGroup: voucherGroup._id,
                        narration: "Credit Note receipt.",
                        voucherLinkId,
                        ledger: data.receivedIn,
                        debit: data.paidAmount,
                        credit: 0,
                        isSingleEntry: false,
                        createdBy: mainUser._id,
                    }
                ];

                // Important: ordered: true when using session + multiple docs
                await Voucher.create(voucherDocs, { session, ordered: true });

                // Update ledgers
                receivedInLedger.balance -= Number(data.paidAmount);
                await receivedInLedger.save({ session });

                customerLedger.balance += Number(data.paidAmount);
                await customerLedger.save({ session });


                // ── Duplicate check ────────────────────────────────────
                const existing = await CreditNote.findOne({ cnNumber: data?.cnNumber })
                    .session(session)
                    .lean();

                if (existing) {
                    throw new CustomError(400, 'Credit Note number already exists.');
                }

                // ── Create Purchase Invoice ────────────────────────────
                [pi] = await CreditNote.create([{ ...data, receivedIn: [{ id: data.receivedIn, paymentType: "Payment", amount: Number(data.paidAmount) }], status: Number(data.balance) == 0 ? "paid" : "partially_paid" }], {
                    session,
                    ordered: true   // safe even for 1 document
                });

                if (pi) {
                    await SerialNumber.findOneAndUpdate({ collectionName: "credit_note" }, { $inc: { nextNum: 1 } })
                }

                return pi;

            } else {

                // ── Duplicate check ────────────────────────────────────
                const existing = await CreditNote.findOne({ cnNumber: data?.cnNumber })
                    .session(session)
                    .lean();
                if (existing) {
                    throw new CustomError(400, 'Sale invoice number already exists.');
                }
                // ── Create Purchase Invoice ────────────────────────────
                [pi] = await CreditNote.create([{ ...data, receivedIn: [], paymentMethod: "", status: "full_due" }], {
                    session,
                    ordered: true   // safe even for 1 document
                });

                if (pi) {
                    await SerialNumber.findOneAndUpdate({ collectionName: "credit_note" }, { $inc: { nextNum: 1 } })
                }

                return pi;
            }
        });

        return result;
    } catch (error) {
        throw new CustomError(
            error.statusCode || 500,
            `Error creating purchase returns: ${error.message}`
        );
    } finally {
        session.endSession();
    }
};

const update = async (clientId, saleReturnId, updateData) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const SaleReturn = clientConnection.model('saleReturn', saleReturnSchema)

        const purchaseReturn = await SaleReturn.findById(saleReturnId);
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


const getById = async (clientId, creditNoteId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const SaleReturn = clientConnection.model('saleReturn', saleReturnSchema)
        const Client = clientConnection.model('clientUsers', clinetUserSchema);
        const CreditNote = clientConnection.model('creditNote', creditNoteSchema);

        const creditNote = await CreditNote.findById(creditNoteId)
            .populate({
                path: "customer",
                model: Client,
                select: "-items"
            });
        if (!creditNote) {
            throw new CustomError(statusCode.NotFound, "Credit note not found.");
        }
        return creditNote;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting: ${error.message}`);
    }
};


const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const SaleReturn = clientConnection.model('saleReturn', saleReturnSchema);
        const BusinessUnit = clientConnection.model('businessUnit', clinetBusinessUnitSchema);
        const Branch = clientConnection.model('branch', clinetBranchSchema);
        const Warehouse = clientConnection.model('warehouse', clinetWarehouseSchema);
        const Client = clientConnection.model('clientUsers', clinetUserSchema);
        const CreditNote = clientConnection.model('creditNote', creditNoteSchema);


        const { page, limit } = options;
        const skip = (Number(page) - 1) * Number(limit);

        const [creditNotes, total] = await Promise.all([
            CreditNote.find(filters)
                .skip(skip)
                .sort({ createdAt: -1 })  // Sort by creation date descending (latest first)
                .limit(Number(limit))
                .populate({
                    path: "customer",
                    model: Client,
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
                })
            ,
            CreditNote.countDocuments(filters)
        ]);
        return { count: total, creditNotes };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing: ${error.message}`);
    }
};

const applyCreditToInvoice = async (clientId, data, mainUser) => {
    const clientConnection = await getClientDatabaseConnection(clientId);
    const Ledger = clientConnection.model("ledger", ledgerSchema);
    const VoucherGroup = clientConnection.model("voucherGroup", voucherGroupSchema);
    const Voucher = clientConnection.model("voucher", voucherSchema);
    const CreditNote = clientConnection.model('creditNote', creditNoteSchema);
    const SaleInvoice = clientConnection.model('saleInvoice', saleInvoiceSchema);
    const SaleInvoiceAndCreditConnection = clientConnection.model('saleInvoiceAndCreditConnection', saleInvoiceAndCrditConnectionSchema)
    const SerialNumber = clientConnection.model('transactionSerialNumebr', transactionSerialNumebrSchema);

    const session = await clientConnection.startSession();
    try {
        const result = await session.withTransaction(async (session) => {
            let po;
            // ── Payment part ───────────────────────────────────────
            if (data?.paidAmount > 0) {
                // settlement of invoice 
                const linkedId = uuidv4();
                const invoices = data?.payments;
                const noInvoice = [];
                const settledInvoices = [];

                for (let index = 0; index < invoices.length; index++) {
                    const invoiceId = invoices[index].purchaseInvoice;
                    const amount = invoices[index].amount;
                    if (amount > 0) {
                        const invoice = await SaleInvoice.findById(invoiceId);
                        if (!invoice) {
                            noInvoice.push(invoiceId);
                        } else {
                            invoice.paidAmount += Number(amount);

                            invoice.receivedIn = [...invoice.receivedIn, { paymentType: "Credit Applied", linkedId: linkedId, amount: Number(amount) }];
                            let newBalance;
                            if (invoice.balance == 0) {

                            } else {
                                newBalance = Number(invoice.balance) - Number(amount);
                            }

                            if (newBalance == 0) {
                                invoice.status = "paid"
                            } else {
                                invoice.status = "partially_paid"
                            }
                            invoice.balance = newBalance;
                            await invoice.save({ session });
                            settledInvoices.push({ id: invoice._id, settlementAmount: Number(amount) })
                        }
                    } else {
                        noInvoice.push(invoiceId);
                    }
                }


                // // Update ledgers
                // payedFromLedger.balance -= Number(data.paidAmount);
                // await payedFromLedger.save({ session });

                // supplierLedger.balance += Number(data.paidAmount);
                // await supplierLedger.save({ session });


                // // ── Duplicate check ────────────────────────────────────
                // const existingPaymentOut = await PaymentOut.findOne({ paymentOutNumber: data?.paymentOutNumber })
                //     .session(session)
                //     .lean();

                // if (existingPaymentOut) {
                //     throw new CustomError(400, 'Payment out number already exists.');
                // }

                // ── Create Purchase Invoice ────────────────────────────
                // [po] = await PaymentOut.create([{ ...data, payedFrom: [{ id: data.payedFrom }], linkedId: linkedId }], {
                //     session,
                //     ordered: true   // safe even for 1 document
                // });

                // payment out and invoices connection


                // // voucher creation
                // const voucherGroup = await VoucherGroup.findOne({
                //     warehouse: data?.warehouse,
                //     isWarehouseLevel: true,
                //     name: "Payment"
                // }).session(session);

                // if (!voucherGroup) throw new CustomError(400, 'Voucher group not found.');
                // const voucherLinkId = uuidv4();
                // const voucherDocs = [
                //     {
                //         businessUnit: data?.businessUnit,
                //         branch: data?.branch,
                //         warehouse: data?.warehouse,
                //         isWarehouseLevel: true,
                //         voucherGroup: voucherGroup._id,
                //         narration: "Purchase invoice payment.",
                //         voucherLinkId,
                //         ledger: data.supplierLedger,
                //         debit: 0,
                //         credit: data.paidAmount,
                //         isSingleEntry: false,
                //         createdBy: mainUser._id,
                //         paymentOutId: po._id
                //     },
                //     {
                //         businessUnit: data?.businessUnit,
                //         branch: data?.branch,
                //         warehouse: data?.warehouse,
                //         isWarehouseLevel: true,
                //         voucherGroup: voucherGroup._id,
                //         narration: "Purchase invoice payment.",
                //         voucherLinkId,
                //         ledger: data.payedFrom,
                //         debit: data.paidAmount,
                //         credit: 0,
                //         isSingleEntry: false,
                //         createdBy: mainUser._id,
                //         paymentOutId: po._id
                //     }
                // ];

                // // Important: ordered: true when using session + multiple docs
                // await Voucher.create(voucherDocs, { session, ordered: true });

                // if (po) {
                //     await SerialNumber.findOneAndUpdate({ collectionName: "payment_out" }, { $inc: { nextNum: 1 } })
                // }



                // credit note updation
                const cn = await CreditNote.findById(data.creditNoteId);

                if (!cn) {
                    throw new CustomError(404, 'Credit note not found.');
                } else {
                    cn.paidAmount += Number(data.paidAmount);

                    cn.receivedIn = [...cn.receivedIn, { id: null, paymentType: "Credit Used", linkedId: linkedId, amount: Number(data.paidAmount) }];
                    let newBalance;
                    if (cn.balance == 0) {

                    } else {
                        newBalance = Number(cn.balance) - Number(data.paidAmount);
                    }

                    if (newBalance == 0) {
                        cn.status = "paid"
                    } else {
                        cn.status = "partially_paid"
                    }
                    cn.balance = newBalance;
                    await cn.save({ session });
                }

                await SaleInvoiceAndCreditConnection.create(
                    [{
                        creditNote: cn._id,
                        invoices: settledInvoices
                    }],
                    { session }
                );

                return cn;

            }
        });

        return result;
    } catch (error) {
        throw new CustomError(
            error.statusCode || 500,
            `Error creating payment out: ${error.message}`
        );
    } finally {
        session.endSession();
    }
};


const changeStatus = async (clientId, saleReturnId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const PurchaseOrder = clientConnection.model('purchaseOrder', purchaseOrderSchema);
        const PurchaseInvoice = clientConnection.model('purchaseInvoice', purchaseInvoiceSchema);

        const purchaseOrder = await PurchaseOrder.findById(saleReturnId);
        if (!purchaseOrder) {
            throw new CustomError(statusCode.NotFound, message.lblPurchaseReturnNotFound);
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
    applyCreditToInvoice,
    update,
    getById,
    list,
    changeStatus,
}; 