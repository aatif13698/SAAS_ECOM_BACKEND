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
const productVariantSchema = require("../../client/model/productVariant");
const productRateSchema = require("../../client/model/productRate");
const { default: mongoose } = require("mongoose");
const supplierSchema = require("../../client/model/supplier");


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
            paymentOPtions: JSON.parse(data.paymentOPtions),
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
        mainStock.paymentOPtions = JSON.parse(updateData.paymentOPtions);
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

const getByProduct = async (clientId, product) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Stock = clientConnection.model('productStock', productStockSchema);
        const MainStock = clientConnection.model('productMainStock', productMainStockSchema);
        const stock = await Stock.find({ product: product }).populate({
            path: 'normalSaleStock',
            model: MainStock,
            select: "name"
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

// const getListStock = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
//     try {
//         const clientConnection = await getClientDatabaseConnection(clientId);
//         const Stock = clientConnection.model('productStock', productStockSchema);
//         const ProductBluePrint = clientConnection.model('productBlueprint', productBlueprintSchema);
//         const SubCategory = clientConnection.model('clientSubCategory', clinetSubCategorySchema);
//         const Category = clientConnection.model('clientCategory', clinetCategorySchema);
//         const MainStock = clientConnection.model('productMainStock', productMainStockSchema);
//         const ProductVariant = clientConnection.model('productVariant', productVariantSchema);
//         const ProductRate = clientConnection.model('productRate', productRateSchema);

//         const { page, limit } = options;
//         const skip = (page - 1) * limit;
//         const [stocks, total] = await Promise.all([
//             Stock.find(filters).skip(skip).limit(limit).sort({ _id: -1 })
//                 .populate({
//                     path: 'product',
//                     model: ProductBluePrint,
//                     select: 'name categoryId subCategoryId _id ',
//                     populate: [
//                         {
//                             path: "categoryId",
//                             model: Category,
//                             select: "name _id",
//                         },
//                         {
//                             path: "subCategoryId",
//                             model: SubCategory,
//                             select: "name _id",
//                         }
//                     ],

//                 })
//                 .populate({
//                     path: 'normalSaleStock',
//                     model: MainStock,
//                     select: "-paymentOPtions -product -businessUnit -branch -warehouse -totalStock -specification -onlineStock -offlineStock -lowStockThreshold -restockQuantity -lastRestockedAt -isBulkType -isActive -averageRating -reviewCount -deletedAt -updatedAt -createdAt",
//                     populate: [
//                         {
//                             path: 'variant',
//                             model: ProductVariant,
//                             populate: {
//                                 path: 'priceId',
//                                 model: ProductRate,
//                                 select: "price"
//                             }
//                         }
//                     ]
//                 })
//             ,
//             Stock.countDocuments(filters),
//         ]);
//         return { count: total, stocks };
//     } catch (error) {
//         throw new CustomError(error.statusCode || 500, `Error listing: ${error.message}`);
//     }
// };

const getListStock = async (
    clientId,
    keyword = '',
    categoryId = null,
    subCategoryId = null,
    level = 'vendor',
    levelId = '',
    options = { page: 1, limit: 10 }
) => {
    try {
        const { page, limit } = options;

        // Ensure they are numbers
        const pageNum = Number(page);
        const limitNum = Number(limit);

        if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
            throw new CustomError(400, "Invalid pagination values");
        }

        const skip = (pageNum - 1) * limitNum;

        const clientConnection = await getClientDatabaseConnection(clientId);
        const Stock = clientConnection.model('productStock', productStockSchema);
        const ProductBlueprint = clientConnection.model('productBlueprint', productBlueprintSchema);
        const Category = clientConnection.model('clientCategory', clinetCategorySchema);
        const SubCategory = clientConnection.model('clientSubCategory', clinetSubCategorySchema);
        const MainStock = clientConnection.model('productMainStock', productMainStockSchema);
        const ProductVariant = clientConnection.model('productVariant', productVariantSchema);
        const ProductRate = clientConnection.model('productRate', productRateSchema);

        // Build level filter
        let stockMatch = { deletedAt: null };
        if (level === 'business' && levelId) {
            stockMatch.businessUnit = new mongoose.Types.ObjectId(levelId);
        } else if (level === 'branch' && levelId) {
            stockMatch.branch = new mongoose.Types.ObjectId(levelId);
        } else if (level === 'warehouse' && levelId) {
            stockMatch.warehouse = new mongoose.Types.ObjectId(levelId);
        }

        // Count aggregation
        const countPipeline = [
            { $match: stockMatch },
            {
                $lookup: {
                    from: ProductBlueprint.collection.name,
                    localField: 'product',
                    foreignField: '_id',
                    as: 'productDoc'
                }
            },
            { $unwind: '$productDoc' },
            ...(categoryId !== "null" ? [{ $match: { 'productDoc.categoryId': new mongoose.Types.ObjectId(categoryId) } }] : []),
            ...(subCategoryId !== "null" ? [{ $match: { 'productDoc.subCategoryId': new mongoose.Types.ObjectId(subCategoryId) } }] : []),
            ...(keyword ? [{ $match: { 'productDoc.name': { $regex: keyword, $options: 'i' } } }] : []),
            { $count: 'total' }
        ];

        const [countResult] = await Stock.aggregate(countPipeline);
        const total = countResult?.total || 0;

        // Data aggregation
        const dataPipeline = [
            { $match: stockMatch },
            {
                $lookup: {
                    from: ProductBlueprint.collection.name,
                    localField: 'product',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            ...(categoryId !== "null" ? [{ $match: { 'product.categoryId': new mongoose.Types.ObjectId(categoryId) } }] : []),
            ...(subCategoryId !== "null" ? [{ $match: { 'product.subCategoryId': new mongoose.Types.ObjectId(subCategoryId) } }] : []),
            ...(keyword ? [{ $match: { 'product.name': { $regex: keyword, $options: 'i' } } }] : []),
            { $sort: { _id: -1 } },
            { $skip: skip },
            { $limit: limitNum }, // ← Now a number
            {
                $lookup: {
                    from: Category.collection.name,
                    localField: 'product.categoryId',
                    foreignField: '_id',
                    as: 'product.categoryId'
                }
            },
            { $unwind: { path: '$product.categoryId', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: SubCategory.collection.name,
                    localField: 'product.subCategoryId',
                    foreignField: '_id',
                    as: 'product.subCategoryId'
                }
            },
            { $unwind: { path: '$product.subCategoryId', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: MainStock.collection.name,
                    localField: 'normalSaleStock',
                    foreignField: '_id',
                    as: 'normalSaleStock',
                    pipeline: [
                        {
                            $project: {
                                paymentOPtions: 0, product: 0, businessUnit: 0, branch: 0,
                                warehouse: 0, totalStock: 0, specification: 0, onlineStock: 0,
                                offlineStock: 0, lowStockThreshold: 0, restockQuantity: 0,
                                lastRestockedAt: 0, isBulkType: 0, isActive: 0,
                                averageRating: 0, reviewCount: 0, deletedAt: 0,
                                updatedAt: 0, createdAt: 0
                            }
                        },
                        {
                            $lookup: {
                                from: ProductVariant.collection.name,
                                localField: 'variant',
                                foreignField: '_id',
                                as: 'variant'
                            }
                        },
                        { $unwind: '$variant' },
                        {
                            $lookup: {
                                from: ProductRate.collection.name,
                                localField: 'variant.priceId',
                                foreignField: '_id',
                                as: 'variant.priceId',
                                pipeline: [{ $project: { price: 1 } }]
                            }
                        },
                        { $unwind: { path: '$variant.priceId', preserveNullAndEmptyArrays: true } }
                    ]
                }
            }
        ];

        const stocks = await Stock.aggregate(dataPipeline);

        return { count: total, stocks };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing: ${error.message}`);
    }
};

const getListStockOfSupplier = async (
    clientId,
    keyword = '',
    categoryId = null,
    subCategoryId = null,
    level = 'vendor',
    levelId = '',
    supplierId = null,
    options = { page: 1, limit: 10 }
) => {
    try {
        const { page, limit } = options;

        // Ensure they are numbers
        const pageNum = Number(page);
        const limitNum = Number(limit);

        if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
            throw new CustomError(400, "Invalid pagination values");
        }

        if (!supplierId) {
            throw new CustomError(400, "Supplier ID is required");
        }

        const skip = (pageNum - 1) * limitNum;

        const clientConnection = await getClientDatabaseConnection(clientId);
        const Stock = clientConnection.model('productStock', productStockSchema);
        const ProductBlueprint = clientConnection.model('productBlueprint', productBlueprintSchema);
        const Category = clientConnection.model('clientCategory', clinetCategorySchema);
        const SubCategory = clientConnection.model('clientSubCategory', clinetSubCategorySchema);
        const MainStock = clientConnection.model('productMainStock', productMainStockSchema);
        const ProductVariant = clientConnection.model('productVariant', productVariantSchema);
        const ProductRate = clientConnection.model('productRate', productRateSchema);
        const Supplier = clientConnection.model('supplier', supplierSchema);

        const supplier = await Supplier.findById(supplierId);

        if (!supplier) {
            throw new CustomError(404, "Supplier not found.");
        }

        if (supplier.items.length === 0) {
            return {
                stocks: [],
                total: 0,
                currentPage: pageNum,
                totalPages: 0,
                perPage: limitNum
            };
        }

        const productStockIds = supplier.items.map(item => item.productStock);
        const productMainStockIds = supplier.items.map(item => item.productMainStock);

        console.log("productMainStockIds", productMainStockIds);


        // Build level filter
        let match = {
            deletedAt: null,
            _id: { $in: productStockIds }
        };

        if (level === 'business' && levelId) {
            match.businessUnit = new mongoose.Types.ObjectId(levelId);
        } else if (level === 'branch' && levelId) {
            match.branch = new mongoose.Types.ObjectId(levelId);
        } else if (level === 'warehouse' && levelId) {
            match.warehouse = new mongoose.Types.ObjectId(levelId);
        }

        // Base pipeline
        let pipeline = [
            { $match: match },
            {
                $lookup: {
                    from: 'productblueprints',
                    localField: 'product',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' }
        ];

        // Add category filter if provided
        if (categoryId && categoryId !== "null") {
            // Optional: Validate category existence
            const categoryExists = await Category.findById(categoryId);
            if (!categoryExists) {
                throw new CustomError(404, "Category not found.");
            }
            pipeline.push({
                $match: { 'product.categoryId': new mongoose.Types.ObjectId(categoryId) }
            });
        }

        // Add sub-category filter if provided
        if (subCategoryId && subCategoryId !== "null") {
            // Optional: Validate sub-category existence
            const subCategoryExists = await SubCategory.findById(subCategoryId);
            if (!subCategoryExists) {
                throw new CustomError(404, "Sub-category not found.");
            }
            pipeline.push({
                $match: { 'product.subCategoryId': new mongoose.Types.ObjectId(subCategoryId) }
            });
        }

        // Add keyword search if provided (assuming search on product name)
        if (keyword) {
            pipeline.push({
                $match: { 'product.name': { $regex: new RegExp(keyword, 'i') } }
            });
        }

        // Sort by _id descending (matching the previous code)
        pipeline.push({ $sort: { _id: -1 } });

        // Get total count (clone pipeline without skip/limit)
        const countPipeline = [...pipeline, { $count: 'total' }];
        const totalResult = await Stock.aggregate(countPipeline);
        const total = totalResult.length > 0 ? totalResult[0].total : 0;

        // Add pagination
        pipeline.push(
            { $skip: skip },
            { $limit: limitNum }
        );

        // Add lookups for category and sub-category after pagination
        pipeline.push(
            {
                $lookup: {
                    from: Category.collection.name,
                    localField: 'product.categoryId',
                    foreignField: '_id',
                    as: 'product.categoryId'
                }
            },
            { $unwind: { path: '$product.categoryId', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: SubCategory.collection.name,
                    localField: 'product.subCategoryId',
                    foreignField: '_id',
                    as: 'product.subCategoryId'
                }
            },
            { $unwind: { path: '$product.subCategoryId', preserveNullAndEmptyArrays: true } }
        );

        // Define the pipeline for main stock lookups
        const mainStockPipeline = [
            {
                $project: {
                    paymentOptions: 0, product: 0, businessUnit: 0, branch: 0,
                    warehouse: 0, totalStock: 0, specification: 0, onlineStock: 0,
                    offlineStock: 0, lowStockThreshold: 0, restockQuantity: 0,
                    lastRestockedAt: 0, isBulkType: 0, isActive: 0,
                    averageRating: 0, reviewCount: 0, deletedAt: 0,
                    updatedAt: 0, createdAt: 0
                }
            },
            {
                $lookup: {
                    from: ProductVariant.collection.name,
                    localField: 'variant',
                    foreignField: '_id',
                    as: 'variant'
                }
            },
            { $unwind: '$variant' },
            {
                $lookup: {
                    from: ProductRate.collection.name,
                    localField: 'variant.priceId',
                    foreignField: '_id',
                    as: 'variant.priceId',
                    pipeline: [{ $project: { price: 1 } }]
                }
            },
            { $unwind: { path: '$variant.priceId', preserveNullAndEmptyArrays: true } }
        ];

        // Lookup normalSaleStock and bulkSaleStock with pipeline
        pipeline.push(
            {
                $lookup: {
                    from: 'productmainstocks',
                    localField: 'normalSaleStock',
                    foreignField: '_id',
                    as: 'normalSaleStock',
                    pipeline: mainStockPipeline
                }
            },
            {
                $lookup: {
                    from: 'productmainstocks',
                    localField: 'bulkSaleStock',
                    foreignField: '_id',
                    as: 'bulkSaleStock',
                    pipeline: mainStockPipeline
                }
            }
        );

        const stocks = await Stock.aggregate(pipeline);

        for (let index = 0; index < productMainStockIds.length; index++) {
            const element = productMainStockIds[index].toString();
            for (let j = 0; j < stocks.length; j++) {
                const st = stocks[j].normalSaleStock;
                console.log("st", st);
            }
        }

        console.log("stocks", stocks);


        const filteredStock = stocks.map((item) => {
            const mainStockArrayBefore = item?.normalSaleStock;

            const normalSaleStockAfterFilter = mainStockArrayBefore.filter((stock) => {
                const stockId = stock._id.toString();
                for (let index = 0; index < productMainStockIds.length; index++) {
                    const id = productMainStockIds[index].toString();
                    if (id == stockId ) {
                        return stock
                    }
                }
            });

            return {
                ...item,
                normalSaleStock: normalSaleStockAfterFilter
            }

            
        })






        return {
            stocks: filteredStock,
            total,
            currentPage: pageNum,
            totalPages: Math.ceil(total / limitNum),
            perPage: limitNum
        };
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
    getByProduct,
    list,
    activeInactive,
    deleted,

    getAllStock,
    getListStock,
    getListStockOfSupplier
};
