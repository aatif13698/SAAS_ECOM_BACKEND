// services/chairService.js
const { getClientDatabaseConnection } = require("../../db/connection");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const productStockSchema = require("../../client/model/productStock");
const productBlueprintSchema = require("../../client/model/productBlueprint");
const productMainStockSchema = require("../../client/model/productMainStock");
const clinetSubCategorySchema = require("../../client/model/subCategory");
const clinetCategorySchema = require("../../client/model/category");


const create = async (clientId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Stock = clientConnection.model('productStock', productStockSchema);
        const MainStock = clientConnection.model('productMainStock', productMainStockSchema);

        console.log("dataobject ", data);

        let newStock;
        const existing = await Stock.findOne({
            $or: [{ product: data.product },
            ],
        });
        if (existing) {
            newStock = existing
        } else {
            newStock = await Stock.create({
                product: data?.product,
                businessUnit: data?.businessUnit,
                branch: data?.branch,
                warehouse: data?.warehouse,
            });
        }
        const existingMainStock = await MainStock.findOne({
            product: data.product,
            variant: data.variant,
            varianValue: JSON.parse(data.varianValue),
        });
        if (existingMainStock) {
            throw new CustomError(statusCode.Conflict, message.lblStockAlreadyExists);
        }
        const mainStock = await MainStock.create({
            product: data.product,
            businessUnit: data?.businessUnit,
            branch: data?.branch,
            warehouse: data?.warehouse,
            variant: data?.variant,
            varianValue: JSON.parse(data.varianValue),
            specification: JSON.parse(data.specification),
            totalStock: data?.totalStock,
            images: data?.images,
            defaultImage: data?.images[0],
            onlineStock: data?.onlineStock,
            offlineStock: data?.offlineStock,
            lowStockThreshold: data?.lowStockThreshold,
            restockQuantity: data?.restockQuantity,
            lastRestockedAt: Date.now(),
            isBulkType: false,
            name: data?.name,
            description: data?.description
        })
        const oldStock = newStock.normalSaleStock;
        const newStockArray = [...oldStock, mainStock._id]
        newStock.normalSaleStock = newStockArray;

        await newStock.save();

        const stock = await Stock.findOne({ product: data.product }).populate({
            path: 'normalSaleStock',
            model: MainStock,
        });


        return stock
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating: ${error.message}`);
    }
};

const update = async (clientId, stockId, updateData) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Stock = clientConnection.model('productStock', productStockSchema);
        const MainStock = clientConnection.model('productMainStock', productMainStockSchema);

        const mainStock = await MainStock.findById(stockId);
        console.log("mainStock", mainStock);

        if (!mainStock) {
            throw new CustomError(statusCode.NotFound, message.lblStockNotFound);
        }

        mainStock.product = updateData.product;
        mainStock.businessUnit = updateData.businessUnit;
        mainStock.branch = updateData.branch;
        mainStock.warehouse = updateData.warehouse;
        mainStock.totalStock = updateData.totalStock;
        // mainStock.priceOptions = JSON.parse(updateData.priceOptions);
        mainStock.specification = JSON.parse(updateData.specification);
        mainStock.onlineStock = updateData.onlineStock;
        mainStock.offlineStock = updateData.offlineStock;
        mainStock.lowStockThreshold = updateData.lowStockThreshold;
        mainStock.restockQuantity = updateData.restockQuantity;
        mainStock.lastRestockedAt = Date.now();
        mainStock.name = updateData.name;
        mainStock.description = updateData.description;

        if (updateData?.images && updateData?.images?.length > 0) {
            mainStock.images = updateData?.images;
            mainStock.defaultImage = updateData?.images[0]
        }
        await mainStock.save();


        const stock = await Stock.findOne({ product: updateData.product }).populate({
            path: 'normalSaleStock',
            model: MainStock,
        });

        return stock;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error updating: ${error.message}`);
    }
};

const getById = async (clientId, stockId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Stock = clientConnection.model('productStock', productStockSchema);
        const MainStock = clientConnection.model('productMainStock', productMainStockSchema);

        const stock = await Stock.findById(stockId).populate({
            path: 'normalSaleStock',
            model: MainStock,
        });
        if (!stock) {
            throw new CustomError(statusCode.NotFound, message.lblStockNotFound);
        }
        return stock;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting: ${error.message}`);
    }
};

const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Stock = clientConnection.model('productStock', productStockSchema);
        const ProductBluePrint = clientConnection.model('productBlueprint', productBlueprintSchema);
        const SubCategory = clientConnection.model('clientSubCategory', clinetSubCategorySchema);
        const Category = clientConnection.model('clientCategory', clinetCategorySchema);
        const { page, limit } = options;
        const skip = (page - 1) * limit;
        const [stocks, total] = await Promise.all([
            Stock.find(filters).skip(skip).limit(limit).sort({ _id: -1 }).populate({
                path: 'product',
                model: ProductBluePrint,
                select: 'name categoryId subCategoryId _id ',
                populate: {
                    path: "subCategoryId",
                    model: SubCategory,
                    select: "name _id",
                },
                populate: {
                    path: "categoryId",
                    model: Category,
                    select: "name _id",
                }
            }),
            Stock.countDocuments(filters),
        ]);
        return { count: total, stocks };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing: ${error.message}`);
    }
};

const getAllStock = async (clientId, filters = {}) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Stock = clientConnection.model('productStock', productStockSchema);
        const ProductBluePrint = clientConnection.model('productBlueprint', productBlueprintSchema);

        const [stocks, total] = await Promise.all([
            Stock.find(filters).sort({ _id: -1 }).populate({
                path: 'product',
                model: ProductBluePrint,
                select: 'name _id'
            }),
            Stock.countDocuments(filters),
        ]);
        return { count: total, stocks };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing: ${error.message}`);
    }
};

const activeInactive = async (clientId, stockId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Stock = clientConnection.model('productStock', productStockSchema)
        const stock = await Stock.findById(stockId);
        if (!stock) {
            throw new CustomError(statusCode.NotFound, message.lblStockNotFound);
        }
        Object.assign(stock, data);
        return await stock.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error active inactive: ${error.message}`);
    }
};

const deleted = async (clientId, stockId, softDelete = true) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Stock = clientConnection.model('productStock', productStockSchema)

        const stock = await Stock.findById(stockId);
        if (!stock) {
            throw new CustomError(statusCode.NotFound, message.lblStockNotFound);
        }
        if (softDelete) {
            stock.deletedAt = new Date();
            await stock.save();
        } else {
            await stock.remove();
        }
        return stock;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error soft delete: ${error.message}`);
    }
};



module.exports = {
    create,
    update,
    getById,
    list,
    activeInactive,
    deleted,

    getAllStock
};
