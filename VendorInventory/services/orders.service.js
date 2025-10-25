// services/chairService.js
const { getClientDatabaseConnection } = require("../../db/connection");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const productStockSchema = require("../../client/model/productStock");
const productBlueprintSchema = require("../../client/model/productBlueprint");
const orderSchema = require("../../client/model/order");
const clinetUserSchema = require("../../client/model/user");
const customerAddressSchema = require("../../client/model/customerAddress");
const productMainStockSchema = require("../../client/model/productMainStock");


// const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
//     try {
//         const clientConnection = await getClientDatabaseConnection(clientId);
//         const Stock = clientConnection.model('productStock', productStockSchema);
//         const ProductBluePrint = clientConnection.model('productBlueprint', productBlueprintSchema);
//         const Order = clientConnection.model("Order", orderSchema); // Consistent with schema
//         const User = clientConnection.model("clientUsers", clinetUserSchema)


//         const { page, limit } = options;
//         const skip = (page - 1) * limit;
//         const [orders, total] = await Promise.all([
//             Order.find(filters).skip(skip).limit(limit).sort({ _id: -1 }).populate({
//                 path: 'customer',
//                 model: User,
//                 select: 'firstName lastName email phone _id'
//             }),
//             Order.countDocuments(filters),
//         ]);
//         return { count: total, orders };
//     } catch (error) {
//         throw new CustomError(error.statusCode || 500, `Error listing: ${error.message}`);
//     }
// };

// new
const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Stock = clientConnection.model("productStock", productStockSchema);
        const ProductBluePrint = clientConnection.model("productBlueprint", productBlueprintSchema);
        const Order = clientConnection.model("Order", orderSchema);
        const User = clientConnection.model("clientUsers", clinetUserSchema);

        const { page, limit } = options;
        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            Order.find(filters)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }) // Sort by createdAt (newest first)
                .populate({
                    path: "customer",
                    model: User,
                    select: "firstName lastName email phone _id",
                })
                .populate({
                    path: "items.productStock",
                    model: Stock,
                    populate: {
                        path: "product",
                        model: ProductBluePrint,
                        select: "name images",
                    },
                })
                .lean(), // Use lean for performance
            Order.countDocuments(filters),
        ]);

        // Format orders to match frontend expectations
        //   const formattedOrders = orders.map((order) => ({
        //     id: order._id.toString(),
        //     orderNumber: order.orderNumber,
        //     customer: order.customer,
        //     status: order.status,
        //     createdAt: order.createdAt,
        //     items: order.items.map((item) => ({
        //       productStock: {
        //         product: {
        //           name: item.productStock?.product?.name || "Unnamed Product",
        //           images: item.productStock?.product?.images || [],
        //         },
        //       },
        //       quantity: item.quantity,
        //       priceOption: item.priceOption,
        //       subtotal: item.subtotal,
        //       customizationDetails: item.customizationDetails,
        //     })),
        //     totalAmount: order.totalAmount,
        //     deliveryDate: order.activities?.find((act) => act.status === "DELIVERED")?.timestamp || null,
        //   }));

        return { count: total, orders: orders };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing: ${error.message}`);
    }
};


const getById = async (clientId, orderId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Stock = clientConnection.model('productStock', productStockSchema);
        const MainStock = clientConnection.model('productMainStock', productMainStockSchema);
        const Order = clientConnection.model("Order", orderSchema); // Consistent with schema
        const User = clientConnection.model("clientUsers", clinetUserSchema);
        const ProductBluePrint = clientConnection.model('productBlueprint', productBlueprintSchema);
        const Address = clientConnection.model('customerAddress', customerAddressSchema)
        const order = await Order.findById(orderId).populate({
            path: 'customer',
            model: User,
            select: 'firstName lastName email phone _id'
        }).populate({
            path: 'address',
            model: Address,
        }).populate({
            path: "items.productStock",
            model: Stock,
            populate: {
                path: "product", // Assuming productStock has a 'product' ref
                model: ProductBluePrint,
                select: "name images isCustomizable _id", // Only fetch necessary fields
            },
        }).populate({
            path: "items.productMainStock",
            model: MainStock,
            select: "name images description _id", 
        })
            .lean();

        const arr = [order]

        if (!order) {
            throw new CustomError(statusCode.NotFound, message.lblOrderNotFound);
        }
        return order;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting: ${error.message}`);
    }
};



const create = async (clientId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Stock = clientConnection.model('productStock', productStockSchema)
        const existing = await Stock.findOne({
            $or: [{ product: data.product },
            ],
        });
        if (existing) {
            throw new CustomError(statusCode.Conflict, message.lblStockAlreadyExists);
        }
        return await Stock.create(data);
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating: ${error.message}`);
    }
};

const update = async (clientId, stockId, updateData) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Stock = clientConnection.model('productStock', productStockSchema)
        const stock = await Stock.findById(stockId);
        if (!stock) {
            throw new CustomError(statusCode.NotFound, message.lblStockNotFound);
        }
        const existing = await Stock.findOne({
            $and: [
                { _id: { $ne: stockId } },
                {
                    $or: [{ product: data.product },
                    ],
                },
            ],
        });
        if (existing) {
            throw new CustomError(statusCode.Conflict, message.lblStockAlreadyExists);
        }
        Object.assign(stock, updateData);
        return await stock.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error updating: ${error.message}`);
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
};
