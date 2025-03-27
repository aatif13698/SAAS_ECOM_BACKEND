const customerAddressSchema = require("../../client/model/customerAddress");
const orderSchema = require("../../client/model/order");
const productStockSchema = require("../../client/model/productStock");
const httpStatusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");

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

// place order from the cart
exports.placeOrderTypeTwo = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { addressId,clientId } = req.body;
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
