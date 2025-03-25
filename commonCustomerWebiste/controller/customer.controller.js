const cartSchema = require("../../client/model/cart");
const clinetCategorySchema = require("../../client/model/category");
const customerAddressSchema = require("../../client/model/customerAddress");
const productBlueprintSchema = require("../../client/model/productBlueprint");
const productStockSchema = require("../../client/model/productStock");
const clientRoleSchema = require("../../client/model/role");
const clinetSubCategorySchema = require("../../client/model/subCategory");
const clinetUserSchema = require("../../client/model/user");
const { getClientDatabaseConnection } = require("../../db/connection");
const httpStatusCode = require("../../utils/http-status-code");

const message = require("../../utils/message");

// verify otp
exports.getCategoryAndSubCategory = async (req, res) => {
  try {
    const { clientId } = req.params;
    const clientConnection = await getClientDatabaseConnection(clientId);
    const Category = clientConnection.model(
      "clientCategory",
      clinetCategorySchema
    );
    const SubCategory = clientConnection.model(
      "clientSubCategory",
      clinetSubCategorySchema
    );
    const categories = await Category.find({ isActive: true }).lean();
    const subCategories = await SubCategory.find({ isActive: true }).lean();
    const result = categories.map((category) => {
      const relatedSubcategories = subCategories
        .filter((sub) => sub.categoryId.toString() === category._id.toString())
        .map((sub, index) => ({
          id: sub._id,
          name: sub.name,
          icon: sub.icon,
          link: `/${category.name.replace(/\s+/g, "-").toLowerCase()}/${sub.name
            .replace(/\s+/g, "-")
            .toLowerCase()}`,
        }));

      return {
        id: category._id,
        name: category.name,
        icon: category.icon,
        ...(relatedSubcategories.length > 0
          ? { submenu: relatedSubcategories }
          : { link: `/${category.name.replace(/\s+/g, "-").toLowerCase()}` }),
      };
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching categories and subcategories:", error);
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

// add new address
exports.addNewAddress = async (req, res, next) => {
  try {
    const {
      clientId,
      fullName,
      phone,
      alternamtivePhone,
      country,
      state,
      city,
      ZipCode,
      houseNumber,
      roadName,
      nearbyLandmark,
      address,
    } = req.body;
    const user = req.user;
    if (!clientId) {
      return res
        .status(httpStatusCode.BadRequest)
        .send({ message: message.lblClinetIdIsRequired });
    }
    const requiredFields = [
      fullName,
      phone,
      alternamtivePhone,
      country,
      state,
      city,
      ZipCode,
      houseNumber,
      roadName,
      nearbyLandmark,
      address,
    ];
    if (requiredFields.some((field) => !field)) {
      return res
        .status(httpStatusCode.BadRequest)
        .send({ message: message.lblRequiredFieldMissing });
    }
    const clientConnection = await getClientDatabaseConnection(clientId);
    const Role = clientConnection.model("clientRoles", clientRoleSchema);
    const clientUser = clientConnection.model("clientUsers", clinetUserSchema);
    const customerAddress = clientConnection.model(
      "customerAddress",
      customerAddressSchema
    );
    const customer = await clientUser.findById(user?._id);
    if (!customer) {
      return res.status(httpStatusCode.NotFound).send({
        message: "User not found.",
      });
    }
    const createdAddress = await customerAddress.create({
      customerId: user?._id,
      fullName,
      phone,
      alternamtivePhone,
      country,
      state,
      city,
      ZipCode,
      houseNumber,
      roadName,
      nearbyLandmark,
      address,
    });
    return res.status(httpStatusCode.OK).send({
      message: "Address added successfully!",
      createdAddress: createdAddress,
    });
  } catch (error) {
    next(error);
  }
};

// update address
exports.updateAddress = async (req, res, next) => {
  try {
    const {
      clientId,
      addressId,
      fullName,
      phone,
      alternamtivePhone,
      country,
      state,
      city,
      ZipCode,
      houseNumber,
      roadName,
      nearbyLandmark,
      address,
    } = req.body;
    const user = req.user;
    if (!clientId) {
      return res
        .status(httpStatusCode.BadRequest)
        .send({ message: message.lblClinetIdIsRequired });
    }
    if (!addressId) {
      return res
        .status(httpStatusCode.BadRequest)
        .send({ message: message.lblAddressIdIdRequired });
    }
    const requiredFields = [
      fullName,
      phone,
      alternamtivePhone,
      country,
      state,
      city,
      ZipCode,
      houseNumber,
      roadName,
      nearbyLandmark,
      address,
    ];
    if (requiredFields.some((field) => !field)) {
      return res
        .status(httpStatusCode.BadRequest)
        .send({ message: message.lblRequiredFieldMissing });
    }
    const clientConnection = await getClientDatabaseConnection(clientId);
    const Role = clientConnection.model("clientRoles", clientRoleSchema);
    const clientUser = clientConnection.model("clientUsers", clinetUserSchema);
    const customerAddress = clientConnection.model(
      "customerAddress",
      customerAddressSchema
    );
    const customer = await clientUser.findById(user?._id);
    if (!customer) {
      return res.status(httpStatusCode.NotFound).send({
        message: "User not found.",
      });
    }
    const existingAddress = await customerAddress.findById(addressId);

    if (!existingAddress) {
      return res
        .status(httpStatusCode.BadRequest)
        .send({ message: message.lblAddressNotFound });
    }

    const updatedAddress = await customerAddress.findByIdAndUpdate(
      addressId,
      {
        fullName,
        phone,
        alternamtivePhone,
        country,
        state,
        city,
        ZipCode,
        houseNumber,
        roadName,
        nearbyLandmark,
        address,
      },
      { new: true }
    );

    return res.status(httpStatusCode.OK).json({
      message: message.lblAddressUpdatedSuccess,
      data: updatedAddress,
    });
  } catch (error) {
    next(error);
  }
};

// delete address
exports.deleteAddress = async (req, res, next) => {
  try {
    const { clientId, addressId } = req.body;
    if (!clientId) {
      return res
        .status(httpStatusCode.BadRequest)
        .json({ message: message.lblClinetIdIsRequired });
    }
    if (!addressId) {
      return res
        .status(httpStatusCode.BadRequest)
        .json({ message: message.lblAddressIdIdRequired });
    }
    const clientConnection = await getClientDatabaseConnection(clientId);
    const customerAddress = clientConnection.model(
      "customerAddress",
      customerAddressSchema
    );
    const existingAddress = await customerAddress.findOne({
      _id: addressId,
      deletedAt: null,
    });
    if (!existingAddress) {
      return res
        .status(httpStatusCode.NotFound)
        .json({ message: message.lblAddressNotFound });
    }
    await customerAddress.findByIdAndUpdate(addressId, {
      deletedAt: new Date(),
    });
    return res.status(httpStatusCode.OK).json({
      message: message.lblAddressSoftDeletedSuccess,
    });
  } catch (error) {
    next(error);
  }
};

// get addresses
exports.getAddresses = async (req, res, next) => {
  try {
    const { clientId, customerId } = req.params;
    const user = req.user;
    if (!clientId) {
      return res
        .status(httpStatusCode.BadRequest)
        .send({ message: message.lblClinetIdIsRequired });
    }
    if (!customerId) {
      return res
        .status(httpStatusCode.BadRequest)
        .send({ message: message.lblCustomerIdIsRequired });
    }
    const clientConnection = await getClientDatabaseConnection(clientId);
    const clientUser = clientConnection.model("clientUsers", clinetUserSchema);
    const customerAddress = clientConnection.model(
      "customerAddress",
      customerAddressSchema
    );
    const customer = await clientUser.findById(customerId);
    if (!customer) {
      return res.status(httpStatusCode.NotFound).send({
        message: "User not found.",
      });
    }
    const addresses = await customerAddress.find({
      customerId: customerId,
      deletedAt: null,
    });
    return res.status(httpStatusCode.OK).send({
      message: message.lblAddressFoundSuccessfully,
      addresses: addresses,
    });
  } catch (error) {
    next(error);
  }
};

// add to cart
exports.addToCart = async (req, res, next) => {
  try {
    const { clientId, productStockId, quantity, priceOption, sessionId } =
      req.body;
    if (!clientId) {
      return res
        .status(httpStatusCode.BadRequest)
        .send({ message: message.lblClinetIdIsRequired });
    }
    const userId = req.user ? req.user._id : null; // From auth middleware
    // Validate input
    if (!productStockId || !quantity || !priceOption) {
      return res.status(httpStatusCode.BadRequest).send({
        success: false,
        message: message.lblRequiredFieldMissing,
      });
    }
    const clientConnection = await getClientDatabaseConnection(clientId);
    const clientUser = clientConnection.model("clientUsers", clinetUserSchema);
    const Stock = clientConnection.model("productStock", productStockSchema);
    const Cart = clientConnection.model("cart", cartSchema);
    // Fetch product stock
    const productStock = await Stock.findById(productStockId);
    if (!productStock || !productStock.isActive) {
      return res.status(httpStatusCode.NotFound).json({
        success: false,
        message: "Product stock not found or inactive",
      });
    }
    // Validate price option
    const validPriceOption = productStock.priceOptions.find(
      (opt) =>
        opt.quantity === priceOption.quantity &&
        opt.unit === priceOption.unit &&
        opt.price === priceOption.price
    );
    if (!validPriceOption) {
      return res.status(400).json({
        success: false,
        message: "Invalid price option",
      });
    }
    // Check stock availability
    if (productStock.onlineStock < quantity) {
      return res.status(httpStatusCode.Conflict).json({
        success: false,
        message: "Insufficient stock",
      });
    }
    // Find or create cart
    let cart;
    if (userId) {
      cart = await Cart.findOne({ user: userId, status: "active" });
      if (!cart) {
        cart = new Cart({ user: userId, createdBy: userId });
      }
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId, status: "active", isGuest: true });
      if (!cart) {
        cart = new Cart({ sessionId, isGuest: true });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "User or session ID required",
      });
    }
    // Check if item already exists in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.productStock.toString() === productStockId
    );
    if (itemIndex > -1) {
      // Update quantity if item exists
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        productStock: productStockId,
        quantity,
        priceOption,
      });
    }
    // Save cart
    await cart.save();
    // Optionally, update product stock (e.g., reserve stock)
    // productStock.onlineStock -= quantity;
    // await productStock.save();
    res.status(httpStatusCode.Created).json({
      success: true,
      message: "Item added to cart",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

// remove from cart
exports.removeFromCart = async (req, res, next) => {
  const maxRetries = 3;
  let retries = 0;
  while (retries < maxRetries) {
    try {
      const { clientId, productStockId, sessionId } = req.body;
      if (!clientId) {
        return res
          .status(httpStatusCode.BadRequest)
          .send({ message: message.lblClinetIdIsRequired });
      }
      const userId = req.user ? req.user._id : null; // From auth middleware
      // Validate input
      if (!productStockId) {
        return res.status(httpStatusCode.BadRequest).send({
          success: false,
          message: "Product stock ID is required",
        });
      }
      const clientConnection = await getClientDatabaseConnection(clientId);
      const Cart = clientConnection.model("cart", cartSchema);
      // Find the cart
      let cart;
      if (userId) {
        cart = await Cart.findOne({ user: userId, status: "active" });
      } else if (sessionId) {
        cart = await Cart.findOne({
          sessionId,
          status: "active",
          isGuest: true,
        });
      } else {
        return res.status(httpStatusCode.BadRequest).json({
          success: false,
          message: "User or session ID required",
        });
      }

      if (!cart) {
        return res.status(httpStatusCode.NotFound).json({
          success: false,
          message: "Cart not found",
        });
      }

      // Find item in cart
      const itemIndex = cart.items.findIndex(
        (item) => item.productStock.toString() === productStockId
      );
      if (itemIndex === -1) {
        return res.status(httpStatusCode.BadRequest).json({
          success: false,
          message: "Item not found in cart",
        });
      }
      // Get quantity to restore
      const quantityToRestore = cart.items[itemIndex].quantity;
      // Remove item from cart
      cart.items.splice(itemIndex, 1);
      // If cart is empty, optionally mark it as abandoned or delete it
      if (cart.items.length === 0) {
        cart.status = "abandoned"; // Or delete: await cart.deleteOne();
      }
      // Save cart with optimistic locking
      await cart.save(); // Throws VersionError if modified concurrently

      return res.status(httpStatusCode.OK).json({
        success: true,
        message: "Item removed from cart",
        data: cart,
      });
    } catch (error) {
      if (error.name === "VersionError") {
        retries++;
        if (retries === maxRetries) {
          return res.status(409).json({
            success: false,
            message: "Conflict detected after max retries. Please try again.",
          });
        }
        // Exponential backoff before retrying
        await new Promise((resolve) => setTimeout(resolve, 100 * retries));
        continue;
      }
      next(error);
    }
  }
};

// get cart
exports.getCart = async (req, res, next) => {
  try {
    const { sessionId, clientId } = req.query; // From query params
    const userId = req.user ? req.user._id : null; // From auth middleware, if present
    if (!clientId) {
      return res
        .status(httpStatusCode.BadRequest)
        .send({ message: message.lblClinetIdIsRequired });
    }
    const clientConnection = await getClientDatabaseConnection(clientId);
    const Cart = clientConnection.model("cart", cartSchema);
    const Stock = clientConnection.model("productStock", productStockSchema);
    const ProductBluePrint = clientConnection.model(
      "productBlueprint",
      productBlueprintSchema
    );

    if (!userId && !sessionId) {
      return res.status(httpStatusCode.BadRequest).json({
        success: false,
        message: "User authentication or session ID is required",
      });
    }
    let cart;
    if (userId) {
      // Fetch cart for authenticated user
      cart = await Cart.findOne({ user: userId, status: "active" })
        .populate({
          path: "items.productStock",
          model: Stock,
          select: " _id product ",
          populate: {
            path: "product",
            model: ProductBluePrint,
            select: "name description images sku categoryId subCategoryId brandId",
          },
        })
        .lean(); // Return plain JS object for performance
    } else if (sessionId) {
      // Fetch cart for guest user
      cart = await Cart.findOne({
        sessionId,
        isGuest: true,
        status: "active",
      }).populate({
        path: "items.productStock",
        model: Stock,
        select: " _id product ",
        populate: {
          path: "product",
          model: ProductBluePrint,
          select: "name description images sku categoryId subCategoryId brandId",
        },
      })
      .lean();
    }
    if (!cart) {
      return res.status(httpStatusCode.NotFound).json({
        success: false,
        message: "Cart not found",
      });
    }
    res.status(httpStatusCode.OK).json({
      success: true,
      message: "Cart retrieved successfully",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};
