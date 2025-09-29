// services/chairService.js
const { getClientDatabaseConnection } = require("../../db/connection");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const clientLedgerGroupSchema = require("../../client/model/ledgerGroup");
const ledgerSchema = require("../../client/model/ledger");
const currencySchema = require("../../client/model/currency");
const ledgerCustomDataSchema = require("../../client/model/ledgerCustomData");


// const create = async (clientId, data, mainUser, options = {}) => {
//     try {
//         const { session } = options; 
//         const clientConnection = await getClientDatabaseConnection(clientId);
//         const Ledger = clientConnection.model("ledger", ledgerSchema);
//         const Currency = clientConnection.model("currency", currencySchema);
//         const currentCurrency = await Currency.findOne({isActive: true});
//         console.log("currentCurrency", currentCurrency);

//         if(!currentCurrency){
//             throw new CustomError(statusCode.BadRequest, "Curreny has not been setup yet. Please setup currency first.");
//         }
//         const ledger = await Ledger.create([{...data, currency: currentCurrency.code, currencySymbol: currentCurrency.symbol  }], { session }); 
//         return ledger[0]; 
//     } catch (error) {
//         throw new CustomError(error.statusCode || 500, `Error creating ledger: ${error.message}`);
//     }
// };

const create = async (clientId, data, mainUser, options = {}) => {
    try {
        const { session } = options;
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Ledger = clientConnection.model("ledger", ledgerSchema);
        const Currency = clientConnection.model("currency", currencySchema);
        const currentCurrency = await Currency.findOne({ isActive: true });
        console.log("currentCurrency", currentCurrency);

        if (!currentCurrency) {
            throw new CustomError(statusCode.BadRequest, "Curreny has not been setup yet. Please setup currency first.");
        }
        const ledger = await Ledger.create([{ ...data, currency: currentCurrency.code, currencySymbol: currentCurrency.symbol }], { session });
        return ledger[0];
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating ledger: ${error.message}`);
    }
};

const update = async (clientId, ledgerId, updateData, mainUser, options = {}) => {
    try {
        const { session } = options;
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Ledger = clientConnection.model("ledger", ledgerSchema);
        const ledger = await Ledger.findById(ledgerId);
        if (!ledger) {
            throw new CustomError(statusCode.NotFound, message.lblLedgerNotFound);
        }
        Object.assign(ledger, updateData);
        await session.withTransaction(async () => {
            await ledger.save({ session });
        });
        return ledger
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error updating ledger: ${error.message}`);
    }
};

const getById = async (clientId, ledgerId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Ledger = clientConnection.model("ledger", ledgerSchema);
        const ledger = await Ledger.findById(shiftId);
        if (!ledger) {
            throw new CustomError(statusCode.NotFound, message.lblLedgerNotFound);
        }
        return ledger;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing ledger: ${error.message}`);
    }
};

const getCustomData = async (clientId, ledgerId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Ledger = clientConnection.model("ledger", ledgerSchema);
        const LedgerCustomData = clientConnection.model("ledgerCustomData", ledgerCustomDataSchema);

        const ledger = await Ledger.findById(ledgerId);
        if (!ledger) {
            throw new CustomError(statusCode.NotFound, message.lblLedgerNotFound);
        }
        const customData = await LedgerCustomData.findOne({ ledgerId: ledgerId })
        return customData;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing ledger: ${error.message}`);
    }
};

const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Ledger = clientConnection.model("ledger", ledgerSchema);
        const LedgerGroup = clientConnection.model("ledgerGroup", clientLedgerGroupSchema);

        const { page, limit } = options;
        const skip = (Number(page) - 1) * Number(limit);
        const [ledgers, total] = await Promise.all([
            Ledger.find(filters).skip(skip).limit(limit)
                .populate({
                    path: "ledgerGroupId",
                    model: LedgerGroup,
                    select: "groupName "
                }),
            Ledger.countDocuments(filters),
        ]);
        return { count: total, ledgers };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing ledger: ${error.message}`);
    }
};

const activeInactive = async (clientId, groupId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const LedgerGroup = clientConnection.model("ledgerGroup", clientLedgerGroupSchema);
        const ledgerGroup = await LedgerGroup.findById(groupId);
        if (!ledgerGroup) {
            throw new CustomError(statusCode.NotFound, message.lblLedgerGroupNotFound);
        }
        Object.assign(ledgerGroup, data);
        return await ledgerGroup.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error active inactive: ${error.message}`);
    }
};






module.exports = {
    create,
    getById,
    list,
    update,
    activeInactive,
    getCustomData
};
