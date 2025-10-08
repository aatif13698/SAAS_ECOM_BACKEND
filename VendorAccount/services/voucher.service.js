// services/chairService.js
const { getClientDatabaseConnection } = require("../../db/connection");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const voucherSchema = require("../../client/model/voucher");
const financialYearSchema = require("../../client/model/financialYear");
const { v4: uuidv4 } = require('uuid');
const ledgerSchema = require("../../client/model/ledger");
const currencySchema = require("../../client/model/currency");



const create = async (clientId, dataObject) => {
    let session;
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Voucher = clientConnection.model("voucher", voucherSchema);
        const voucherLinkId = uuidv4()
        // for (let index = 0; index < data.entries.length; index++) {
        //     const element = data.entries[index];
        //     const dataObject = {
        //         ...data,
        //         voucherLinkId: voucherLinkId,
        //         ledger: element.ledger,
        //         debit: element.debit,
        //         credit: element.credit
        //     }
        //     await Voucher.create(dataObject);
        // }
        session = await clientConnection.startSession();
        await session.withTransaction(async () => {
            const voucherPromises = dataObject.entries.map(entry => {
                const voucherData = {
                    ...dataObject,
                    voucherLinkId,
                    ledger: entry.ledger,
                    debit: entry.debit || 0,
                    credit: entry.credit || 0,
                };
                return Voucher.create([voucherData], { session });
            });
            await Promise.all(voucherPromises);
        });
        return true
    } catch (error) {
        if (session) {
            await session.endSession();
        }
        throw new CustomError(error.statusCode || 500, `Error creating voucher : ${error.message}`);
    }
};

const update = async (clientId, voucherLinkId, dataObject) => {
    let session;
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Voucher = clientConnection.model("voucher", voucherSchema);
        const vouchers = await Voucher.find({ voucherLinkId }).session(session);
        if (!vouchers?.length) {
            throw new CustomError(statusCode.NotFound, message.lblVoucherNotFound);
        }
        if (vouchers.length > 2 || (vouchers.length !== dataObject.entries.length && !dataObject.isSingleEntry)) {
            throw new CustomError(statusCode.BadRequest, 'Invalid number of vouchers for update.');
        }

        // for (let index = 0; index < dataObject.entries.length; index++) {
        //     const entry = dataObject.entries[index];
        //     for (let index = 0; index < vouchers.length; index++) {
        //         const element = vouchers[index];
        //         if (element.ledger == entry.ledger) {
        //             const uniqueVoucher = await Voucher.findOne({ ledger: element.ledger, voucherLinkId })
        //             Object.assign(uniqueVoucher, {
        //                 ...dataObject,
        //                 ledger: entry.ledger,
        //                 debit: entry.debit,
        //                 credit: entry.credit
        //             });
        //             await uniqueVoucher.save()
        //         }
        //     }
        // }

        session = await clientConnection.startSession();
        await session.withTransaction(async () => {
            const updatePromises = dataObject.entries.map(async (entry, index) => {
                const voucher = vouchers.find(v => v.ledger.toString() === entry.ledger.toString());
                if (!voucher) {
                    throw new CustomError(statusCode.BadRequest, `Ledger ${entry.ledger} not found for voucherLinkId ${voucherLinkId}`);
                }
                return Voucher.updateOne(
                    { _id: voucher._id, voucherLinkId },
                    {
                        $set: {
                            ...dataObject,
                            ledger: entry.ledger,
                            debit: entry.debit || 0,
                            credit: entry.credit || 0,
                        },
                    },
                    { session }
                );
            });
            await Promise.all(updatePromises);
        });
        return true
    } catch (error) {
        if (session) {
            await session.endSession();
        }
        throw new CustomError(error.statusCode || 500, `Error updating voucher group: ${error.message}`);
    }
};


const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Voucher = clientConnection.model("voucher", voucherSchema);
        const FinancialYear = clientConnection.model("financialYear", financialYearSchema);
        const Ledger = clientConnection.model("ledger", ledgerSchema);
        const Currency = clientConnection.model("currency", currencySchema);

        const { page, limit } = options;
        const skip = (Number(page) - 1) * Number(limit);
        const [vouchers, total] = await Promise.all([
            Voucher.find(filters).skip(skip).limit(limit)
                .populate({
                    path: "financialYear",
                    model: FinancialYear
                })
                .populate({
                    path: "ledger",
                    model: Ledger
                })
                 .populate({
                    path: "currency",
                    model: Currency
                }),
            Voucher.countDocuments(filters),
        ]);
        return { count: total, vouchers };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing voucher: ${error.message}`);
    }
};

const activeInactive = async (clientId, voucherGroupId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Voucher = clientConnection.model("voucher", voucherSchema);
        const voucherGroup = await VoucherGroup.findById(voucherGroupId);
        if (!voucherGroup) {
            throw new CustomError(statusCode.NotFound, message.lblVoucherGroupNotFound);
        }
        Object.assign(voucherGroup, data);
        return await voucherGroup.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error active inactive: ${error.message}`);
    }
};



module.exports = {
    create,
    list,
    update,
    activeInactive,
};
