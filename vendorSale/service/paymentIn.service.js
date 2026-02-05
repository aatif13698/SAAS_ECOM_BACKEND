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
const paymentOutSchema = require("../../client/model/paymentOut");
const purchaseInvoiceAndPaymentConnectionSchema = require("../../client/model/purchaseInvoiceAndPaymentConnection");
const { path } = require("pdfkit");
const clinetWarehouseSchema = require("../../client/model/warehouse");
const clinetBranchSchema = require("../../client/model/branch");
const clinetBusinessUnitSchema = require("../../client/model/businessUnit");
const saleInvoiceSchema = require("../../client/model/saleInvoice");
const paymentInSchema = require("../../client/model/paymentIn");
const saleInvoiceAndPaymentConnectionSchema = require("../../client/model/saleInvoiceAndPaymentConnection");
const clinetUserSchema = require("../../client/model/user");



const create = async (clientId, data, mainUser) => {
    const clientConnection = await getClientDatabaseConnection(clientId);
    const PurchaseInvoice = clientConnection.model('purchaseInvoice', purchaseInvoiceSchema);
    const SaleInvoice = clientConnection.model('SaleInvoice', saleInvoiceSchema);

    const PaymentOut = clientConnection.model('payementOut', paymentOutSchema);
    const PaymentIn = clientConnection.model('payementIn', paymentInSchema);
    const Ledger = clientConnection.model("ledger", ledgerSchema);
    const VoucherGroup = clientConnection.model("voucherGroup", voucherGroupSchema);
    const Voucher = clientConnection.model("voucher", voucherSchema);
    const PurchaseInvoiceAndPaymentConnection = clientConnection.model("purchaseInvoiceAndPaymentConnection", purchaseInvoiceAndPaymentConnectionSchema)
    const SaleInvoiceAndPaymentConnection = clientConnection.model("saleInvoiceAndPaymentConnection", saleInvoiceAndPaymentConnectionSchema)
    const session = await clientConnection.startSession();
    try {
        const result = await session.withTransaction(async (session) => {
            let po;
            // ── Payment part ───────────────────────────────────────
            if (data?.paidAmount > 0) {
                const customerLedger = await Ledger.findById(data.customerLedger).session(session);
                if (!customerLedger) throw new CustomError(400, 'Customer ledger not found.');

                const receivedInLedger = await Ledger.findById(data?.receivedIn).session(session);
                if (!receivedInLedger) throw new CustomError(400, 'Received In ledger not found.');

                // if (payedFromLedger.balance < data.paidAmount) {
                //     throw new CustomError(400, 'Insufficient Amount in payment ledger.');
                // }


                // settlement of invoice 
                const linkedId = uuidv4();
                const invoices = data?.payments;
                const noInvoice = [];
                const settledInvoices = [];

                for (let index = 0; index < invoices.length; index++) {
                    const invoiceId = invoices[index].saleInvoice;
                    const amount = invoices[index].amount;
                    if (amount > 0) {
                        const invoice = await SaleInvoice.findById(invoiceId);
                        if (!invoice) {
                            noInvoice.push(invoiceId);
                        } else {
                            invoice.paidAmount += Number(amount);

                            invoice.receivedIn = [...invoice.receivedIn, { id: data.receivedIn, paymentType: "Settlement", linkedId: linkedId, amount: Number(amount) }];
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


                // Update ledgers
                receivedInLedger.balance += Number(data.paidAmount);
                await receivedInLedger.save({ session });

                customerLedger.balance -= Number(data.paidAmount);
                await customerLedger.save({ session });


                // ── Duplicate check ────────────────────────────────────
                const existingPaymentIn = await PaymentIn.findOne({ paymentInNumber: data?.paymentInNumber })
                    .session(session)
                    .lean();

                if (existingPaymentIn) {
                    throw new CustomError(400, 'Payment in number already exists.');
                }

                // ── Create Purchase Invoice ────────────────────────────
                [po] = await PaymentIn.create([{ ...data, receivedIn: [{ id: data.receivedIn }], linkedId: linkedId }], {
                    session,
                    ordered: true   // safe even for 1 document
                });

                // payment out and invoices connection
                await SaleInvoiceAndPaymentConnection.create(
                    [{
                        paymentIn: po._id,
                        invoices: settledInvoices
                    }],
                    { session }
                );

                // voucher creation
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
                        narration: "Sale invoice payment.",
                        voucherLinkId,
                        ledger: data.customerLedger,
                        debit: 0,
                        credit: data.paidAmount,
                        isSingleEntry: false,
                        createdBy: mainUser._id,
                        paymentInId: po._id
                    },
                    {
                        businessUnit: data?.businessUnit,
                        branch: data?.branch,
                        warehouse: data?.warehouse,
                        isWarehouseLevel: true,
                        voucherGroup: voucherGroup._id,
                        narration: "Sale invoice payment.",
                        voucherLinkId,
                        ledger: data.receivedIn,
                        debit: data.paidAmount,
                        credit: 0,
                        isSingleEntry: false,
                        createdBy: mainUser._id,
                        paymentInId: po._id
                    }
                ];

                // Important: ordered: true when using session + multiple docs
                await Voucher.create(voucherDocs, { session, ordered: true });
                return po;

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

const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Supplier = clientConnection.model('supplier', supplierSchema);
        const PaymentOut = clientConnection.model('payementOut', paymentOutSchema);
        const PaymentIn = clientConnection.model('payementIn', paymentInSchema);
        const User = clientConnection.model("clientUsers", clinetUserSchema)

        const { page, limit } = options;
        const skip = (Number(page) - 1) * Number(limit);
        const [paymentIn, total] = await Promise.all([
            PaymentIn.find(filters)
                .skip(skip)
                .sort({ createdAt: -1 })
                .limit(Number(limit))
                .populate({
                    path: "customer",
                    model: User,
                    select: "-items"
                }),
            PaymentIn.countDocuments(filters),
        ]);
        return { count: total, paymentIn };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing: ${error.message}`);
    }
};

const getById = async (clientId, id) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const PaymentOut = clientConnection.model('payementOut', paymentOutSchema);
        const PaymentIn = clientConnection.model('payementIn', paymentInSchema);
        const SaleInvoiceAndPaymentConnection = clientConnection.model("saleInvoiceAndPaymentConnection", saleInvoiceAndPaymentConnectionSchema)
        const PurchaseInvoiceAndPaymentConnection = clientConnection.model("purchaseInvoiceAndPaymentConnection", purchaseInvoiceAndPaymentConnectionSchema)
        const PurchaseInvoice = clientConnection.model('purchaseInvoice', purchaseInvoiceSchema);
        const Warehouse = clientConnection.model('warehouse', clinetWarehouseSchema);
        const Branch = clientConnection.model('branch', clinetBranchSchema);
        const BusinessUnit = clientConnection.model('businessUnit', clinetBusinessUnitSchema);
        const User = clientConnection.model("clientUsers", clinetUserSchema);
        const SaleInvoice = clientConnection.model('SaleInvoice', saleInvoiceSchema);

        const paymentIn = await PaymentIn.findById(id)
            .populate({ path: "customer", model: User, select: "-items" })
            .populate({ path: "businessUnit", model: BusinessUnit, select: "name" })
            .populate({ path: "branch", model: Branch, select: "name" })
            .populate({ path: "warehouse", model: Warehouse, select: "name" })
            .lean();
        if (!paymentIn) {
            throw new CustomError(statusCode.NotFound, "Payment in not found.");
        }

        const connection = await SaleInvoiceAndPaymentConnection.findOne({
            paymentIn: paymentIn._id
        }).populate({
            path: "invoices.id",
            model: SaleInvoice,
            select: "-shippingAddress -bankDetails"
        });

        if (!connection) {
            throw new CustomError(statusCode.NotFound, "Connection out not found.");
        }

        return { ...paymentIn, invoices: connection.invoices };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting business unit: ${error.message}`);
    }
};


module.exports = {
    create,
    list,
    getById
}; 