



const clientRoleSchema = require("../../client/model/role");
const { getClientDatabaseConnection } = require("../../db/connection");
const roleModel = require("../../model/role");
const userModel = require("../../model/user");
const CustomError = require("../../utils/customeError");
const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");
const stockService = require("../services/stock.service");
const orderService = require("../services/orders.service")
const bcrypt = require("bcrypt");
const httpStatusCode = require("../../utils/http-status-code");
const orderSchema = require("../../client/model/order");
const customerAddressSchema = require("../../client/model/customerAddress");
const productStockSchema = require("../../client/model/productStock");




// list 
// exports.list = async (req, res, next) => {
//     try {

//         const mainUser = req.user;
//         const { clientId, keyword = '', page = 1, perPage = 10 } = req.query;

//         console.log("req.query", req.query);

//         if (!clientId) {
//             return res.status(statusCode.BadRequest).send({
//                 message: message.lblClinetIdIsRequired,
//             });
//         }
//         const filters = {
//             deletedAt: null,
//             ...(keyword && {
//                 $or: [
//                     { orderNumber: { $regex: keyword.trim(), $options: "i" } },
//                 ],
//             }),
//         };
//         const result = await orderService.list(clientId, filters, { page, limit: perPage });
//         return res.status(statusCode.OK).send({
//             message: message.lblStockFoundSuccessfully,
//             data: result,
//         });
//     } catch (error) {
//         next(error);
//     }
// };

// new list
exports.list = async (req, res, next) => {
  try {
    const mainUser = req.user;
    const {
      clientId,
      keyword = "",
      page = 1,
      perPage = 10,
      status = "", // New: Comma-separated statuses (e.g., "PENDING,APPROVED")
      startDate = "", // New: Start date for createdAt (e.g., "2025-04-01")
      endDate = "", // New: End date for createdAt (e.g., "2025-04-30")
    } = req.query;

    console.log("req.query", req.query);

    if (!clientId) {
      return res.status(statusCode.BadRequest).send({
        message: message.lblClinetIdIsRequired,
      });
    }

    // Build filters
    const filters = {
      deletedAt: null,
      ...(keyword && {
        $or: [{ orderNumber: { $regex: keyword.trim(), $options: "i" } }],
      }),
      ...(status && {
        status: { $in: status.split(",").map((s) => s.trim().toUpperCase()) },
      }),
      ...(startDate && {
        createdAt: { $gte: new Date(startDate) },
      }),
      ...(endDate && {
        createdAt: {
          ...filters.createdAt,
          $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
        },
      }),
    };

    // Validate status values
    const validStatuses = [
      "PENDING",
      "APPROVED",
      "DISAPPROVED",
      "IN_PRODUCTION",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];
    if (status) {
      const statusArray = status.split(",").map((s) => s.trim().toUpperCase());
      if (!statusArray.every((s) => validStatuses.includes(s))) {
        return res.status(statusCode.BadRequest).send({
          message: "Invalid status value provided",
        });
      }
    }

    // Validate dates
    if (startDate && isNaN(Date.parse(startDate))) {
      return res.status(statusCode.BadRequest).send({
        message: "Invalid startDate format. Use YYYY-MM-DD",
      });
    }
    if (endDate && isNaN(Date.parse(endDate))) {
      return res.status(statusCode.BadRequest).send({
        message: "Invalid endDate format. Use YYYY-MM-DD",
      });
    }

    const result = await orderService.list(clientId, filters, {
      page: parseInt(page),
      limit: parseInt(perPage),
    });

    return res.status(statusCode.OK).send({
      message: message.lblStockFoundSuccessfully,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};



// get particular 
exports.getParticular = async (req, res, next) => {
  try {
    const { clientId, orderId } = req.params;
    if (!clientId || !orderId) {
      return res.status(400).send({
        message: message.lblRequiredFieldMissing,
      });
    }
    const data = await orderService.getById(clientId, orderId);
    return res.status(200).send({
      message: message.lblOrderFoundSuccessfully,
      data: data,
    });
  } catch (error) {
    next(error)
  }
};


// update order status
exports.updateOrderStatus = async (req, res, next) => {
  let clientConnection;
  let session;
  try {
    const { clientId, status, orderId, itemId } = req.body;
    console.log("req.body", req.body);

    // const { orderId } = req.params;
    const userId = req.user ? req.user._id : null;
    if (!clientId) {
      return res.status(httpStatusCode.BadRequest).json({
        success: false,
        message: "Client ID is required",
      });
    }
    if (!userId) {
      return res.status(httpStatusCode.Unauthorized).json({
        success: false,
        message: "User authentication required",
      });
    }

    if (!itemId) {
      return res.status(httpStatusCode.BadRequest).json({
        success: false,
        message: "Item id is required",
      });
    }
    if (!status || !["APPROVED", "DISAPPROVED", "IN_PRODUCTION", "SHIPPED", "DELIVERED", "CANCELLED"].includes(status)) {
      return res.status(httpStatusCode.BadRequest).json({
        success: false,
        message: "Invalid or missing status",
      });
    }
    clientConnection = await getClientDatabaseConnection(clientId);
    session = await clientConnection.startSession();
    session.startTransaction();
    const Order = clientConnection.model("Order", orderSchema);
    const order = await Order.findById(orderId).session(session);
    if (!order) {
      await session.abortTransaction();
      return res.status(httpStatusCode.NotFound).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.items.length == 0) {
      await session.abortTransaction();
      return res.status(httpStatusCode.BadRequest).json({
        success: false,
        message: "Order item not found.",
      });
    }

    for (let index = 0; index < order.items.length; index++) {
      const element = order.items[index];
      if (element._id == itemId) {
        if (element.status === "PENDING" && status === "PENDING") {
          await session.abortTransaction();
          return res.status(httpStatusCode.BadRequest).json({
            success: false,
            message: "Item is already in PENDING status",
          });
        }
        element.status = status;
        element.activities.push({
          status,
          updatedBy: userId,
          timestamp: new Date(),
          notes: req.body.notes || `Status updated to ${status}`,
        });

      }


    }



    // if (order.status === "PENDING" && status === "PENDING") {
    //   await session.abortTransaction();
    //   return res.status(httpStatusCode.BadRequest).json({
    //     success: false,
    //     message: "Order is already in PENDING status",
    //   });
    // }
    // order.status = status;
    // order.activities.push({
    //   status,
    //   updatedBy: userId,
    //   timestamp: new Date(),
    //   notes: req.body.notes || `Status updated to ${status}`,
    // });
    await order.save({ session });
    await session.commitTransaction();
    res.status(httpStatusCode.OK).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order,
    });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    console.error("Error updating order status:", error);
    next(error);
  } finally {
    if (session) {
      session.endSession();
    }
  }
};



// create order
exports.createOrder = async (req, res, next) => {
  let clientConnection;
  let session;

  try {
    const { clientId, customerId, productStockId, quantity, priceOption, addressId } = req.body;
    const userId = req.user ? req.user._id : null; // From auth middleware

    if (!clientId) {
      return res.status(httpStatusCode.BadRequest).send({
        message: "Client ID is required",
      });
    }

    // Validate input
    if (!productStockId || !quantity || !priceOption || !addressId) {
      return res.status(httpStatusCode.BadRequest).send({
        success: false,
        message: "productStockId, quantity, priceOption, and addressId are required",
      });
    }

    if (quantity < 1) {
      return res.status(httpStatusCode.BadRequest).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    // Handle customization
    const customizationDetails = {};
    const customizationFiles = [];
    for (const [key, value] of Object.entries(req.body)) {
      if (
        key !== "productStockId" &&
        key !== "quantity" &&
        key !== "priceOption" &&
        key !== "sessionId" &&
        key !== "clientId" &&
        key !== "addressId"
      ) {
        customizationDetails[key] = value;
      }
    }

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        customizationFiles.push({
          fieldName: file.fieldname,
          fileUrl: `/public/customizations/${file.filename}`,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
        });
      });
    } else {
      console.log("No files uploaded");
    }

    // Get client-specific database connection
    clientConnection = await getClientDatabaseConnection(clientId);

    // Start session from the client-specific connection
    session = await clientConnection.startSession();
    session.startTransaction();

    // Define models using the client-specific connection
    const CustomerAddress = clientConnection.model("customerAddress", customerAddressSchema);
    const ProductStock = clientConnection.model("productStock", productStockSchema);
    const Order = clientConnection.model("Order", orderSchema); // Consistent with schema

    // Verify address exists and belongs to the user
    const address = await CustomerAddress.findOne({
      _id: addressId,
      customerId: customerId,
      deletedAt: null,
    }).session(session);
    if (!address) {
      await session.abortTransaction();
      return res.status(httpStatusCode.BadRequest).json({
        success: false,
        message: "Address not found or does not belong to user",
      });
    }

    // Fetch and validate product stock
    const stock = await ProductStock.findById(productStockId).session(session);
    if (!stock || !stock.isActive) {
      await session.abortTransaction();
      return res.status(httpStatusCode.NotFound).json({
        success: false,
        message: "Product stock not found or inactive",
      });
    }

    // Validate price option
    const parsedPriceOption = JSON.parse(priceOption);
    console.log("parsedPriceOption", parsedPriceOption);

    const validPriceOption = stock.priceOptions.find(
      (opt) =>
        opt.quantity === parsedPriceOption.quantity &&
        opt.unit === parsedPriceOption.unit &&
        opt.price === parsedPriceOption.price
    );
    if (!validPriceOption) {
      await session.abortTransaction();
      return res.status(httpStatusCode.BadRequest).json({
        success: false,
        message: "Invalid price option",
      });
    }

    // Check stock availability
    if (stock.onlineStock < quantity) {
      await session.abortTransaction();
      return res.status(httpStatusCode.Conflict).json({
        success: false,
        message: "Insufficient stock",
      });
    }

    // Deduct stock
    stock.onlineStock -= quantity;
    stock.totalStock -= quantity;
    await stock.save({ session });

    // Prepare order item
    const orderItem = {
      productStock: productStockId,
      quantity,
      priceOption: parsedPriceOption,
      customizationDetails: new Map(Object.entries(customizationDetails)),
      customizationFiles,
    };

    const count = await Order.countDocuments({
      createdAt: { $gte: new Date().setHours(0, 0, 0, 0) },
    });
    const date = new Date().toISOString().slice(0, 10).replace(/-/, ""); // e.g., "20250411"

    const orderNumber = `ORD-${date}-${String(count + 1).padStart(3, "0")}`

    // Create order (orderNumber will be generated by pre-save hook)
    const order = new Order({
      orderNumber: orderNumber,
      customer: customerId,
      items: [orderItem],
      address: addressId,
      paymentMethod: "COD",
      paymentStatus: "PENDING",
      status: "PENDING",
      createdBy: userId,
      activities: [
        {
          status: "PENDING",
          updatedBy: userId,
        },
      ],
    });

    await order.save({ session });

    // Commit transaction
    await session.commitTransaction();

    res.status(httpStatusCode.Created).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    if (session) {
      await session.abortTransaction();
    }
    if (error.code === 11000) {
      return res.status(httpStatusCode.Conflict).json({
        success: false,
        message: "Order number generation conflict, please try again",
      });
    }
    console.error(error);
    next(error);
  } finally {
    if (session) {
      session.endSession();
    }
  }
};





// create
exports.create = async (req, res, next) => {
  try {
    const {
      clientId,
      product,
      businessUnit,
      branch,
      warehouse,
      totalStock,
      priceOptions,
      onlineStock,
      offlineStock,
      lowStockThreshold,
      restockQuantity,

    } = req.body;
    const mainUser = req.user;
    // Validate required fields
    if (!clientId) {
      return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
    }
    const requiredFields = [
      product,
      businessUnit,
      branch,
      warehouse,
      totalStock,
      priceOptions,
      onlineStock,
      offlineStock,
      lowStockThreshold,
      restockQuantity,
    ];

    if (requiredFields.some((field) => !field)) {
      return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
    }
    // Base data object
    const dataObject = {
      product,
      businessUnit,
      branch,
      warehouse,
      totalStock,
      priceOptions,
      onlineStock,
      offlineStock,
      lowStockThreshold,
      restockQuantity,
    };

    // Create 
    const created = await stockService.create(clientId, dataObject);
    return res.status(statusCode.OK).send({
      message: message.lblStockCreatedSuccess,
      data: { empId: created._id },
    });
  } catch (error) {
    next(error);
  }
};

// update  
exports.update = async (req, res, next) => {

  try {
    const {
      clientId,
      stockId,

      product,
      businessUnit,
      branch,
      warehouse,
      totalStock,
      priceOptions,
      onlineStock,
      offlineStock,
      lowStockThreshold,
      restockQuantity,
    } = req.body;

    const mainUser = req.user;

    // Validate required fields
    if (!clientId) {
      return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
    }

    const requiredFields = [
      product,
      businessUnit,
      branch,
      warehouse,
      totalStock,
      priceOptions,
      onlineStock,
      offlineStock,
      lowStockThreshold,
      restockQuantity,
    ];

    if (requiredFields.some((field) => !field)) {
      return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
    }
    // Base data object
    const dataObject = {
      product,
      businessUnit,
      branch,
      warehouse,
      totalStock,
      priceOptions,
      onlineStock,
      offlineStock,
      lowStockThreshold,
      restockQuantity,
    };

    // Create 
    const updated = await stockService.update(clientId, stockId, dataObject);
    return res.status(statusCode.OK).send({
      message: message.lblStockUpdatedSuccess,
      data: { empId: updated._id },
    });
  } catch (error) {
    next(error);
  }

};




exports.activeinactive = async (req, res, next) => {
  try {
    const { keyword, page, perPage, id, status, clientId } = req.body;
    req.query.clientId = clientId;
    req.query.keyword = keyword;
    req.query.page = page;
    req.query.perPage = perPage;
    if (!clientId || !id) {
      return res.status(400).send({
        message: message.lblRequiredFieldMissing,
      });
    }
    const updated = await stockService.activeInactive(clientId, id, {
      isActive: status == "1",
    });
    this.list(req, res, next)
  } catch (error) {
    next(error);
  }
};

// Soft delete 
exports.softDelete = async (req, res, next) => {
  try {
    const { keyword, page, perPage, stockId, clientId } = req.body;
    console.log("req.body", req.body);

    req.query.keyword = keyword;
    req.query.page = page;
    req.query.perPage = perPage;
    req.query.clientId = clientId;
    if (!clientId || !stockId) {
      return res.status(400).send({
        message: message.lblRequiredFieldMissing,
      });
    }
    await stockService.deleted(clientId, stockId, softDelete = true)
    this.list(req, res, next);
  } catch (error) {
    next(error);
  }
};





