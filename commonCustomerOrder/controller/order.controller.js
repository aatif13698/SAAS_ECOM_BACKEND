const cartSchema = require("../../client/model/cart");
const customerAddressSchema = require("../../client/model/customerAddress");
const orderSchema = require("../../client/model/order");
const productBlueprintSchema = require("../../client/model/productBlueprint");
const productMainStockSchema = require("../../client/model/productMainStock");
const productRateSchema = require("../../client/model/productRate");
const productStockSchema = require("../../client/model/productStock");
const productVariantSchema = require("../../client/model/productVariant");
const clinetUserSchema = require("../../client/model/user");
const { getClientDatabaseConnection } = require("../../db/connection");
const { convertPricingTiers, groupByStockId } = require("../../helper/common");
const httpStatusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");
const mongoose = require("mongoose");


const { v4: uuidv4 } = require('uuid');
const path = require('path');
const AWS = require('aws-sdk');
// DigitalOcean Spaces setup
const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACES_ENDPOINT);
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_SPACES_KEY,
  secretAccessKey: process.env.DO_SPACES_SECRET,
  s3ForcePathStyle: true,
  maxRetries: 5,
  retryDelayOptions: { base: 500 },
  httpOptions: { timeout: 60000 },
});


const uploadCustomizationFileToS3 = async (file, clientId) => {
  const fileExtension = path.extname(file.originalname).toLowerCase();
  const fileName = `saasEcommerce/${clientId}/customization/${uuidv4()}${fileExtension}`;
  const params = {
    Bucket: process.env.DO_SPACES_BUCKET,
    Key: fileName,
    Body: file.buffer,
    ACL: 'public-read',
    ContentType: file.mimetype,
    Metadata: {
      'original-filename': file.originalname
    }
  };
  try {
    const { Location } = await s3.upload(params).promise();
    return {
      success: true,
      url: Location,
      key: fileName
    };
  } catch (error) {
    console.log("error in s3", error);

    throw new Error(`Failed to upload to S3: ${error.message}`);
  }
};

// place normal order
exports.placeOrderTypeOne = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      clientId,
      productStockId,
      quantity,
      priceOption,
      customizationDetails,
      addressId,
    } = req.body;
    const userId = req.user._id;

    if (!clientId) {
      return res
        .status(httpStatusCode.BadRequest)
        .send({ message: message.lblClinetIdIsRequired });
    }

    // Validate input
    if (!productStockId || !quantity || !priceOption || !addressId) {
      await session.abortTransaction();
      return res.status(httpStatusCode.BadRequest).json({
        success: false,
        message:
          "productStockId, quantity, priceOption, and addressId are required",
      });
    }

    if (quantity < 1) {
      await session.abortTransaction();
      return res.status(httpStatusCode.BadRequest).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const clientConnection = await getClientDatabaseConnection(clientId);
    const CustomerAddress = clientConnection.model(
      "customerAddress",
      customerAddressSchema
    );
    const ProductStock = clientConnection.model(
      "productStock",
      productStockSchema
    );
    const Order = clientConnection.model("order", orderSchema);

    // Verify address exists and belongs to the user
    const address = await CustomerAddress.findOne({
      _id: addressId,
      customerId: userId,
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
    const validPriceOption = stock.priceOptions.find(
      (opt) =>
        opt.quantity === priceOption.quantity &&
        opt.unit === priceOption.unit &&
        opt.price === priceOption.price
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
      priceOption,
      customizationDetails: customizationDetails
        ? new Map(Object.entries(customizationDetails))
        : new Map(),
    };

    // Create order
    const order = new Order({
      customer: userId,
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
      // Note: orderNumber is NOT set here; the pre-save hook generates it automatically
    });

    await order.save({ session }); // orderNumber is generated here (e.g., "ORD-20250325-001")

    // Commit transaction
    await session.commitTransaction();

    res.status(httpStatusCode.Created).json({
      success: true,
      message: "Order placed successfully",
      data: order, // Includes the generated orderNumber
    });
  } catch (error) {
    await session.abortTransaction();
    if (error.code === 11000) {
      // MongoDB duplicate key error (unlikely but possible)
      return res.status(httpStatusCode.Conflict).json({
        success: false,
        message: "Order number generation conflict, please try again",
      });
    }
    console.error(error);
    next(error);
  } finally {
    session.endSession();
  }
};

// place normal order new
exports.placeOrderTypeOneNew = async (req, res, next) => {
  let clientConnection;
  let session;

  try {
    const { clientId, productStockId, productMainStockId, quantity, priceOption, addressId } = req.body;
    const userId = req.user ? req.user._id : null; // From auth middleware

    if (!clientId) {
      return res.status(httpStatusCode.BadRequest).send({
        message: "Client ID is required",
      });
    }

    // Validate input
    if (!productStockId || !productMainStockId || !quantity || !priceOption || !addressId) {
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
        key !== "productMainStockId" &&
        key !== "quantity" &&
        key !== "priceOption" &&
        key !== "sessionId" &&
        key !== "clientId" &&
        key !== "addressId"
      ) {
        customizationDetails[key] = value;
      }
    }

    // // Handle file uploads
    // if (req.files && req.files.length > 0) {
    //   req.files.forEach((file) => {
    //     customizationFiles.push({
    //       fieldName: file.fieldname,
    //       fileUrl: `/public/customizations/${file.filename}`,
    //       originalName: file.originalname,
    //       mimeType: file.mimetype,
    //       size: file.size,
    //     });
    //   });
    // } else {
    //   console.log("No files uploaded");
    // }

    // Handle file uploads to S3
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async (file) => {
        try {
          const { url, key } = await uploadCustomizationFileToS3(file, clientId);
          return {
            fieldName: file.fieldname,
            fileUrl: url,
            key: key,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
          };
        } catch (error) {
          throw new Error(`Failed to upload file ${file.originalname}: ${error.message}`);
        }
      });

      try {
        customizationFiles.push(...await Promise.all(uploadPromises));
      } catch (error) {
        return res.status(httpStatusCode.StatusCodes.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: error.message,
        });
      }
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
    const MainStock = clientConnection.model('productMainStock', productMainStockSchema);
    const ProductVariant = clientConnection.model('productVariant', productVariantSchema);
    const ProductRate = clientConnection.model('productRate', productRateSchema);
    const ProductBluePrint = clientConnection.model('productBlueprint', productBlueprintSchema);


    // Verify address exists and belongs to the user
    const address = await CustomerAddress.findOne({
      _id: addressId,
      customerId: userId,
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



    const productMainStock = await MainStock.findById(productMainStockId).populate({
      path: 'product',
      model: ProductBluePrint
    }).populate({
      path: 'variant',
      model: ProductVariant,
      populate: {
        path: 'priceId',
        model: ProductRate
      }

    });

    if (!productMainStock || !productMainStock.isActive) {
      return res.status(httpStatusCode.NotFound).json({
        success: false,
        message: "Product stock not found or inactive",
      });
    }

    const priceArray = productMainStock.variant.priceId.price;
    const priceTiers = convertPricingTiers(priceArray);
    const priceObject = priceTiers.find(item =>
      quantity >= item.minQuantity &&
      (item.maxQuantity === null || quantity <= item.maxQuantity)
    ) || null;

    let calculatedPrice;

    if (!priceObject) {
      return res.status(httpStatusCode.Conflict).json({
        success: false,
        message: "Invalid price calculation occured.",
      });
    }

    if (priceObject?.hasDiscount == true) {
      const discountedUnitPrice = priceObject?.unitPrice - priceObject?.unitPrice * (priceObject?.discountPercent / 100);
      calculatedPrice = quantity * discountedUnitPrice
    } else {
      calculatedPrice = quantity * priceObject?.unitPrice
    }

    if (calculatedPrice !== JSON.parse(priceOption)?.price) {
      return res.status(httpStatusCode.Conflict).json({
        success: false,
        message: "Invalid price calculation occured.",
      });
    }

    // Validate price option
    // const parsedPriceOption = JSON.parse(priceOption);
    // console.log("parsedPriceOption", parsedPriceOption);

    // const validPriceOption = stock.priceOptions.find(
    //   (opt) =>
    //     opt.quantity === parsedPriceOption.quantity &&
    //     opt.unit === parsedPriceOption.unit &&
    //     opt.price === parsedPriceOption.price
    // );
    // if (!validPriceOption) {
    //   await session.abortTransaction();
    //   return res.status(httpStatusCode.BadRequest).json({
    //     success: false,
    //     message: "Invalid price option",
    //   });
    // }

    // Check stock availability
    if (productMainStock.onlineStock < quantity) {
      await session.abortTransaction();
      return res.status(httpStatusCode.Conflict).json({
        success: false,
        message: "Insufficient stock",
      });
    }

    // Deduct stock
    productMainStock.onlineStock -= quantity;
    productMainStock.totalStock -= quantity;
    await stock.save({ session });

    // Prepare order item
    const orderItem = {
      productStock: productStockId,
      productMainStock: productMainStock,
      quantity,
      priceOption: JSON.parse(priceOption),
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
      customer: userId,
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

exports.placeOrderFromCart = async (req, res, next) => {
  let clientConnection;
  let session;

  try {
    const { clientId, addressId } = req.body;
    const userId = req.user ? req.user._id : null; // From auth middleware

    if (!clientId || !addressId) {
      return res.status(httpStatusCode.BadRequest).json({
        success: false,
        message: "Client ID and address ID are required",
      });
    }

    if (!userId) {
      return res.status(httpStatusCode.Unauthorized).json({
        success: false,
        message: "User authentication required",
      });
    }

    // Get client-specific database connection
    clientConnection = await getClientDatabaseConnection(clientId);
    session = await clientConnection.startSession();
    session.startTransaction();

    // Define models
    const Cart = clientConnection.model("cart", cartSchema);
    const CustomerAddress = clientConnection.model("customerAddress", customerAddressSchema);
    const ProductStock = clientConnection.model("productStock", productStockSchema);
    const Order = clientConnection.model("Order", orderSchema);
    const MainStock = clientConnection.model('productMainStock', productMainStockSchema);


    // Fetch cart
    const cart = await Cart.findOne({ user: userId, status: "active", deletedAt: null })
      .populate({
        path: "items.productStock",
        model: ProductStock,
        select: "product warehouse branch businessUnit"
      })
      .session(session);


    const arrayOfObjects = groupByStockId(cart.items)

    console.log("cart aa", arrayOfObjects);

    // return null;

    // if (!cart || !cart.items.length) {
    //   await session.abortTransaction();
    //   return res.status(httpStatusCode.BadRequest).json({
    //     success: false,
    //     message: "Cart is empty or not found",
    //   });
    // }

    // Verify address
    const address = await CustomerAddress.findOne({
      _id: addressId,
      customerId: userId,
      deletedAt: null,
    }).session(session);
    if (!address) {
      await session.abortTransaction();
      return res.status(httpStatusCode.BadRequest).json({
        success: false,
        message: "Address not found or does not belong to user",
      });
    }

    // Validate stock for all items
    for (const item of cart.items) {
      const stock = await MainStock.findById(item.productMainStock).session(session);
      if (!stock || !stock.isActive) {
        await session.abortTransaction();
        return res.status(httpStatusCode.NotFound).json({
          success: false,
          message: `Product stock not found or inactive for item: ${item.productMainStock}`,
        });
      }
      if (stock.onlineStock < item.quantity) {
        await session.abortTransaction();
        return res.status(httpStatusCode.Conflict).json({
          success: false,
          message: `Insufficient stock for item: ${item.productStock}`,
        });
      }
      // Deduct stock
      stock.onlineStock -= item.quantity;
      stock.totalStock -= item.quantity;
      await stock.save({ session });
    }

    const count = await Order.countDocuments({
      createdAt: { $gte: new Date().setHours(0, 0, 0, 0) },
    });

    let orderCount = count;

    for (let index = 0; index < arrayOfObjects.length; index++) {
      const element = arrayOfObjects[index];
      // Prepare order items
      const orderItems = element.map((item) => ({
        productStock: item.productStock,
        productMainStock: item.productMainStock,
        quantity: item.quantity,
        priceOption: item.priceOption,
        customizationDetails: item.customizationDetails,
        customizationFiles: item.customizationFiles,
        subtotal: item.subtotal,
      }));
      orderCount = orderCount + 1;
      const date = new Date().toISOString().slice(0, 10).replace(/-/, ""); // e.g., "20250411"
      const orderNumber = `ORD-${date}-${String(orderCount).padStart(3, "0")}`
      // Create order
      const order = new Order({
        warehouse: orderItems[0].productStock.warehouse,
        orderNumber: orderNumber,
        customer: userId,
        items: orderItems,
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
    }

    // // Prepare order items
    // const orderItems = cart.items.map((item) => ({
    //   productStock: item.productStock,
    //   productMainStock: item.productMainStock,
    //   quantity: item.quantity,
    //   priceOption: item.priceOption,
    //   customizationDetails: item.customizationDetails,
    //   customizationFiles: item.customizationFiles,
    //   subtotal: item.subtotal,
    // }));

    // const count = await Order.countDocuments({
    //   createdAt: { $gte: new Date().setHours(0, 0, 0, 0) },
    // });
    // const date = new Date().toISOString().slice(0, 10).replace(/-/, ""); // e.g., "20250411"
    // const orderNumber = `ORD-${date}-${String(count + 1).padStart(3, "0")}`

    // // Create order
    // const order = new Order({
    //   orderNumber: orderNumber,
    //   customer: userId,
    //   items: orderItems,
    //   address: addressId,
    //   paymentMethod: "COD",
    //   paymentStatus: "PENDING",
    //   status: "PENDING",
    //   createdBy: userId,
    //   activities: [
    //     {
    //       status: "PENDING",
    //       updatedBy: userId,
    //     },
    //   ],
    // });


    // Update cart status
    cart.status = "converted";
    cart.lastModified = Date.now();
    await cart.save({ session });

    // Commit transaction
    await session.commitTransaction();

    return res.status(httpStatusCode.Created).json({
      success: true,
      message: "Order placed successfully",
      // data: order,
    });
  } catch (error) {
    console.log("ererer", error);

    if (session) {
      await session.abortTransaction();
    }
    if (error.code === 11000) {
      return res.status(httpStatusCode.Conflict).json({
        success: false,
        message: "Order number generation conflict, please try again",
      });
    }
    console.error("Error placing order from cart:", error);
    res.status(httpStatusCode.InternalServerError).json({
      success: false,
      message: "Failed to place order",
      error: error.message,
    });
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

// testin push

// place order from the cart
exports.placeOrderTypeTwo = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { addressId, clientId } = req.body;
    const userId = req.user._id;

    // Validate addressId
    if (!addressId) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Address ID is required",
      });
    }

    // Verify address exists and belongs to the user
    const address = await CustomerAddress.findOne({
      _id: addressId,
      customerId: userId,
      deletedAt: null,
    }).session(session);
    if (!address) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Address not found or does not belong to user",
      });
    }

    // Fetch user's active cart
    const cart = await Cart.findOne({ user: userId, status: "active" }).session(
      session
    );
    if (!cart || cart.items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Cart is empty or not found",
      });
    }

    // Check stock availability and filter items
    const orderItems = [];
    const unavailableItems = [];

    for (const cartItem of cart.items) {
      const stock = await ProductStock.findById(cartItem.productStock).session(
        session
      );

      // Check if product exists and is active
      if (!stock || !stock.isActive) {
        unavailableItems.push({
          productStock: cartItem.productStock,
          quantity: cartItem.quantity,
          priceOption: cartItem.priceOption,
          reason: !stock ? "Product not found" : "Product inactive",
        });
        continue;
      }

      // Validate price option
      const validPriceOption = stock.priceOptions.find(
        (opt) =>
          opt.quantity === cartItem.priceOption.quantity &&
          opt.unit === cartItem.priceOption.unit &&
          opt.price === cartItem.priceOption.price
      );
      if (!validPriceOption) {
        unavailableItems.push({
          productStock: cartItem.productStock,
          quantity: cartItem.quantity,
          priceOption: cartItem.priceOption,
          reason: "Invalid price option",
        });
        continue;
      }

      // Check stock availability
      if (stock.onlineStock < cartItem.quantity) {
        unavailableItems.push({
          productStock: cartItem.productStock,
          quantity: cartItem.quantity,
          priceOption: cartItem.priceOption,
          reason: "Insufficient stock",
        });
        continue;
      }

      // Product is available, deduct stock
      stock.onlineStock -= cartItem.quantity;
      stock.totalStock -= cartItem.quantity;
      await stock.save({ session });

      // Add to order items
      orderItems.push({
        productStock: cartItem.productStock,
        quantity: cartItem.quantity,
        priceOption: cartItem.priceOption,
        customizationDetails: cartItem.customizationDetails || new Map(), // Use cart's customization if present
      });
    }

    // If no items are available, abort
    if (orderItems.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "No available items to order",
        unavailableItems,
      });
    }

    // Create order for available items
    const order = new Order({
      customer: userId,
      items: orderItems,
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
      // orderNumber is generated by the pre-save hook
    });

    await order.save({ session });

    // Update cart: remove ordered items, keep unavailable ones
    cart.items = cart.items.filter((item) =>
      unavailableItems.some(
        (unavail) =>
          unavail.productStock.toString() === item.productStock.toString()
      )
    );
    if (cart.items.length === 0) {
      cart.status = "converted"; // Cart is empty after order
    }
    await cart.save({ session });

    // Commit transaction
    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "Order placed successfully for available items",
      data: {
        order,
        unavailableItems, // Inform user about skipped items
      },
    });
  } catch (error) {
    await session.abortTransaction();
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Order number generation conflict, please try again",
      });
    }
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  } finally {
    session.endSession();
  }
};


// get order list
exports.getAllOrders = async (req, res, next) => {
  let clientConnection;

  try {
    const { clientId } = req.query; // Using query param for clientId
    const userId = req.user ? req.user._id : null; // From auth middleware

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

    // Get client-specific database connection
    clientConnection = await getClientDatabaseConnection(clientId);

    // Define models using the client-specific connection
    const Order = clientConnection.model("Order", orderSchema);
    const ProductStock = clientConnection.model("productStock", productStockSchema);
    const ProductBluePrint = clientConnection.model('productBlueprint', productBlueprintSchema);
    const User = clientConnection.model("clientUsers", clinetUserSchema);
    const Address = clientConnection.model('customerAddress', customerAddressSchema);
    const MainStock = clientConnection.model('productMainStock', productMainStockSchema);


    // Fetch orders for the user
    // const orders = await Order.find({ customer: userId })
    //   .populate({
    //     path: "items.productStock",
    //     model: ProductStock,
    //     populate: {
    //       path: "product", // Assuming productStock has a 'product' ref
    //       model: ProductBluePrint,
    //       select: "name images", // Only fetch necessary fields
    //     },
    //   })
    //   .lean(); // Convert to plain JS objects for easier manipulation


    const orders = await Order.find({ customer: userId }).populate({
      path: 'customer',
      model: User,
      select: 'firstName lastName email phone _id'
    }).populate({
      path: 'address',
      model: Address,
    }).populate({
      path: "items.productStock",
      model: ProductStock,
      populate: {
        path: "product", // Assuming productStock has a 'product' ref
        model: ProductBluePrint,
        select: "name images isCustomizable _id", // Only fetch necessary fields
      },
    }).populate({
      path: "items.productMainStock",
      model: MainStock,
      // populate: {
      //   path: "product", // Assuming productStock has a 'product' ref
      //   model: MainStock,
      //   select: "name images isCustomizable _id", // Only fetch necessary fields
      // },
    })
      .lean();

    // Transform data to match frontend expectations  
    const formattedOrders = orders.flatMap((order) =>
      order.items.map((item) => ({
        ...item,
        id: order._id.toString(), // Convert ObjectId to string
        productStock: {
          product: {
            name: item.productStock?.product?.name || "Unnamed Product",
            images: item.productStock?.product?.images || [],
          },
        },
        productMainStock: item.productMainStock,
        priceOption: item.priceOption || {},
        quantity: item.quantity || 1,
        deliveryDate: order.activities?.find((act) => act.status === "DELIVERED")?.timestamp || null, // Dynamic delivery date
      }))
    );

    res.status(httpStatusCode.OK).json({
      success: true,
      message: "Orders retrieved successfully",
      data: formattedOrders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    next(error);
  }
};


// get particular order
exports.getParticularOrder = async (req, res, next) => {
  let clientConnection;

  try {
    const { clientId } = req.query; // Using query param for clientId
    const { id } = req.params;
    const userId = req.user ? req.user._id : null; // From auth middleware

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

    // Get client-specific database connection
    clientConnection = await getClientDatabaseConnection(clientId);

    // Define models using the client-specific connection
    const Order = clientConnection.model("Order", orderSchema);
    const ProductStock = clientConnection.model("productStock", productStockSchema);
    const ProductBluePrint = clientConnection.model('productBlueprint', productBlueprintSchema);
    const MainStock = clientConnection.model('productMainStock', productMainStockSchema);

    const customerAddress = clientConnection.model(
      "customerAddress",
      customerAddressSchema
    );
    // Fetch orders for the user
    const orders = await Order.find({ customer: userId, _id: id })
      .populate({
        path: "items.productStock",
        model: ProductStock,
        populate: {
          path: "product", // Assuming productStock has a 'product' ref
          model: ProductBluePrint,
          select: "name images", // Only fetch necessary fields
        },
      })
      .populate({
        path: "items.productMainStock",
        model: MainStock,
        // populate: {
        //   path: "product", // Assuming productStock has a 'product' ref
        //   model: ProductBluePrint,
        //   select: "name images", // Only fetch necessary fields
        // },
      }).
      populate({
        path: "address",
        model: customerAddress,
      })
      .lean(); // Convert to plain JS objects for easier manipulation

    console.log("orders", orders);


    // Transform data to match frontend expectations
    const formattedOrders = orders.flatMap((order) =>
      order.items.map((item) => ({
        id: order._id.toString(), // Convert ObjectId to string
        productStock: {
          product: {
            name: item.productStock?.product?.name || "Unnamed Product",
            images: item.productStock?.product?.images || [],
          },
        },
        priceOption: item.priceOption || {},
        quantity: item.quantity || 1,
        status: order.status || "PENDING",
        deliveryDate: order.activities?.find((act) => act.status === "DELIVERED")?.timestamp || null, // Dynamic delivery date
      }))
    );

    res.status(httpStatusCode.OK).json({
      success: true,
      message: "Orders retrieved successfully",
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    next(error);
  }
};