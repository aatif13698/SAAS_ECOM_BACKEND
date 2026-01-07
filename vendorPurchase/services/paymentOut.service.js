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



const create = async (clientId, data, mainUser) => {
    const clientConnection = await getClientDatabaseConnection(clientId);
    const PaymentOut = clientConnection.model('payementOut', paymentOutSchema);
    const Ledger = clientConnection.model("ledger", ledgerSchema);
    const VoucherGroup = clientConnection.model("voucherGroup", voucherGroupSchema);
    const Voucher = clientConnection.model("voucher", voucherSchema);
    const session = await clientConnection.startSession();
    try {
        const result = await session.withTransaction(async (session) => {
            let po;

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
                const existingPaymentOut = await PaymentOut.findOne({ paymentOutNumber: data?.paymentOutNumber })
                    .session(session)
                    .lean();

                if (existingPaymentOut) {
                    throw new CustomError(400, 'Payment out number already exists.');
                }

                // ── Create Purchase Invoice ────────────────────────────
                [po] = await PaymentOut.create([{ ...data, payedFrom: [{ id: data.payedFrom }] }], {
                    session,
                    ordered: true   // safe even for 1 document
                });

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
        const { page, limit } = options;
        const skip = (Number(page) - 1) * Number(limit);
        const [paymentOut, total] = await Promise.all([
            PaymentOut.find(filters)
                .skip(skip)
                .sort({ createdAt: -1 }) 
                .limit(Number(limit))
                .populate({
                    path: "supplier",
                    model: Supplier,
                    select: "-items"
                }),
            PaymentOut.countDocuments(filters),
        ]);
        return { count: total, paymentOut };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing: ${error.message}`);
    }
};


module.exports = {
    create,
    list
}; 