const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const { getClientDatabaseConnection } = require("../../db/connection");
const purhcasePaymentConfigSchema = require("../../client/model/purchasePaymentConfig");
const ledgerSchema = require("../../client/model/ledger");
const { path } = require("pdfkit");
const salePaymentInConfigSchema = require("../../client/model/salePaymentInConfigure");


// create
exports.upsertPaymentInConfig = async (req, res, next) => {
    try {
        const {
            clientId,
            level,
            businessUnit,
            branch,
            warehouse,

            type, ledgers
        } = req.body;

        const mainUser = req.user;

        // Validate required fields
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }

        const requiredFields = [
            type, ledgers
        ];

        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }

        if (!['cash', 'bank'].includes(type)) {
            return res.status(400).json({ success: false, message: 'Invalid type' });
        }

        if (!Array.isArray(ledgers) || ledgers.length === 0) {
            return res.status(400).json({ success: false, message: 'Ledgers array required' });
        }

        // Ensure exactly one primary
        const primaries = ledgers.filter(l => l.isPrimary);
        if (primaries.length !== 1) {
            return res.status(400).json({
                success: false,
                message: 'Exactly one ledger must be marked as primary'
            });
        }

        // Base data object
        const dataObject = {
            type,
            createdBy: mainUser._id,
        };

        // Level-specific validation and assignment
        const levelConfig = {
            vendor: { isVendorLevel: true, isBuLevel: false, isBranchLevel: false, isWarehouseLevel: false },
            business: { isVendorLevel: false, isBuLevel: true, isBranchLevel: false, isWarehouseLevel: false },
            branch: { isVendorLevel: false, isBuLevel: false, isBranchLevel: true, isWarehouseLevel: false },
            warehouse: { isVendorLevel: false, isBuLevel: false, isBranchLevel: false, isWarehouseLevel: true },
        };

        if (!levelConfig[level]) {
            return res.status(statusCode.BadRequest).send({ message: message.lblInvalidLevel });
        }

        Object.assign(dataObject, levelConfig[level]);

        if (['business', 'branch', 'warehouse'].includes(level) && !businessUnit) {
            return res.status(statusCode.BadRequest).send({ message: message.lblBusinessUnitIdIdRequired });
        }

        if (['branch', 'warehouse'].includes(level) && !branch) {
            return res.status(statusCode.BadRequest).send({ message: message.lblBranchIdIdRequired });
        }

        if (level === 'warehouse' && !warehouse) {
            return res.status(statusCode.BadRequest).send({ message: message.lblWarehouseIdIdRequired });
        }

        // Add optional fields based on level
        if (businessUnit) {
            dataObject.businessUnit = businessUnit;
        }
        if (branch) {
            dataObject.businessUnit = businessUnit;
            dataObject.branch = branch;
        }
        if (warehouse) {
            dataObject.businessUnit = businessUnit;
            dataObject.branch = branch;
            dataObject.warehouse = warehouse;
        }

        const clientConnection = await getClientDatabaseConnection(clientId);
        const PurchasePaymentConfig = clientConnection.model("purchasePaymentConfig", purhcasePaymentConfigSchema);
        const SalePaymentinConfig = clientConnection.model("salePaymentInConfig", salePaymentInConfigSchema);

        const existing = await SalePaymentinConfig.findOne(dataObject);

        const update = {
            ledgers: ledgers.map(l => ({
                id: l.id,
                isPrimary: !!l.isPrimary
            })),
            updatedBy: mainUser._id, // assuming you have auth middleware
        };

        let config;
        if (!existing) {
            console.log("existing", "ssssss");

            config = await SalePaymentinConfig.create({
                ...dataObject,
                ...update
            })
        } else {
            config = await SalePaymentinConfig.findOneAndUpdate(
                dataObject,
                { $set: update },
                { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
            ).populate('ledgers.id', 'ledgerName');
        }
        return res.json({ success: true, data: config });

    } catch (error) {
        next(error);
    }
};


exports.getPaymentInConfigs = async (req, res) => {
    try {
        const { clientId, level, levelId } = req.query;
        let filters = {};
        if (level == "vendor") {

        } else if (level == "business" && levelId) {
            filters = {
                ...filters,
                isBuLevel: true,
                businessUnit: levelId
            }
        } else if (level == "branch" && levelId) {
            filters = {
                ...filters,
                isBranchLevel: true,
                branch: levelId
            }
        } else if (level == "warehouse" && levelId) {
            filters = {
                ...filters,
                isWarehouseLevel: true,
                warehouse: levelId
            }
        }

        const clientConnection = await getClientDatabaseConnection(clientId);
        const PurchasePaymentConfig = clientConnection.model("purchasePaymentConfig", purhcasePaymentConfigSchema);
        const SalePaymentinConfig = clientConnection.model("salePaymentInConfig", salePaymentInConfigSchema);


        const configs = await SalePaymentinConfig.find(filters)
            .lean();

        const cash = configs.find(c => c.type === 'cash') || { ledgers: [] };
        const bank = configs.find(c => c.type === 'bank') || { ledgers: [] };

        res.json({
            success: true,
            data: {
                cashLedgers: cash.ledgers,
                bankLedgers: bank.ledgers
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getPaymentInFromConfigs = async (req, res) => {
    try {
        const { clientId, level, levelId } = req.query;
        let filters = {};
        if (level == "vendor") {

        } else if (level == "business" && levelId) {
            filters = {
                ...filters,
                isBuLevel: true,
                businessUnit: levelId
            }
        } else if (level == "branch" && levelId) {
            filters = {
                ...filters,
                isBranchLevel: true,
                branch: levelId
            }
        } else if (level == "warehouse" && levelId) {
            filters = {
                ...filters,
                isWarehouseLevel: true,
                warehouse: levelId
            }
        }

        const clientConnection = await getClientDatabaseConnection(clientId);
        const PurchasePaymentConfig = clientConnection.model("purchasePaymentConfig", purhcasePaymentConfigSchema);
        const SalePaymentinConfig = clientConnection.model("salePaymentInConfig", salePaymentInConfigSchema);

        const Ledger = clientConnection.model("ledger", ledgerSchema);

        const configs = await SalePaymentinConfig.find(filters)
            .populate({
                path: 'ledgers.id',
                model: Ledger,
            })
            .lean();

        const cash = configs.find(c => c.type === 'cash') || { ledgers: [] };
        const bank = configs.find(c => c.type === 'bank') || { ledgers: [] };

        res.json({
            success: true,
            data: {
                cashLedgers: cash.ledgers,
                bankLedgers: bank.ledgers
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
