const { default: mongoose } = require("mongoose");
const cartSchema = require("../../client/model/cart");
const clinetCategorySchema = require("../../client/model/category");
const customerAddressSchema = require("../../client/model/customerAddress");
const productBlueprintSchema = require("../../client/model/productBlueprint");
const productMainStockSchema = require("../../client/model/productMainStock");
const productRateSchema = require("../../client/model/productRate");
const productStockSchema = require("../../client/model/productStock");
const productVariantSchema = require("../../client/model/productVariant");
const ratingAndReviewsSchema = require("../../client/model/ratingAndReviews");
const clientRoleSchema = require("../../client/model/role");
const clinetSubCategorySchema = require("../../client/model/subCategory");
const clinetUserSchema = require("../../client/model/user");
const wishListSchema = require("../../client/model/wishList");
const { getClientDatabaseConnection } = require("../../db/connection");
const { convertPricingTiers } = require("../../helper/common");
const httpStatusCode = require("../../utils/http-status-code");

const message = require("../../utils/message");



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

// Helper function to upload file to DigitalOcean Spaces
const uploadProductImageToS3 = async (file, clientId) => {
  const fileExtension = path.extname(file.originalname).toLowerCase();
  const fileName = `saasEcommerce/${clientId}/products/${uuidv4()}${fileExtension}`;
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
          link: `/${category._id}/${sub._id}`,
        }));

      return {
        id: category._id,
        name: category.name,
        icon: category.icon,
        ...(relatedSubcategories.length > 0
          ? { submenu: relatedSubcategories }
          : { link: `/${category._id}` }),
      };
    });

    console.log("result", result);
    return res.status(200).send({ success: true, data: result });
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

// add new address by vendor
exports.addNewAddressByVendor = async (req, res, next) => {
  try {
    const {
      clientId,
      customerId,
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
    const customer = await clientUser.findById(customerId);
    if (!customer) {
      return res.status(httpStatusCode.NotFound).send({
        message: "User not found.",
      });
    }
    const createdAddress = await customerAddress.create({
      customerId: customerId,
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

// update address by vendor
exports.updateAddressByVendor = async (req, res, next) => {
  try {
    const {
      clientId,
      addressId,
      customerId,
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
    const customer = await clientUser.findById(customerId);
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

// delete address by vendor
exports.deleteAddressByVendor = async (req, res, next) => {
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

// add to cart new
exports.addToCartNew = async (req, res, next) => {
  try {
    const { clientId, productStockId, productMainStockId, quantity, priceOption, sessionId } = req.body;
    if (!clientId) {
      return res
        .status(httpStatusCode.BadRequest)
        .send({ message: message.lblClinetIdIsRequired });
    }
    const userId = req.user ? req.user._id : null; // From auth middleware
    // Validate input
    if (!productStockId || !productMainStockId || !quantity || !priceOption) {
      return res.status(httpStatusCode.BadRequest).send({
        success: false,
        message: message.lblRequiredFieldMissing,
      });
    }

    // handling customisation
    const customizationDetails = {};
    const customizationFiles = [];
    for (const [key, value] of Object.entries(req.body)) {
      if (key !== "productStockId" && key !== "productMainStockId" && key !== "quantity" && key !== "priceOption" && key !== "sessionId" && key !== "clientId") {
        customizationDetails[key] = value;
      }
    }


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



    // // Handle file uploads
    // if (req.files && req.files.length > 0) {
    //   req.files.forEach((file) => {
    //     customizationFiles.push({
    //       fieldName: file.fieldname,
    //       fileUrl: `/public/customizations/${file.filename}`, // Correct path
    //       originalName: file.originalname,
    //       mimeType: file.mimetype,
    //       size: file.size,
    //     });
    //   });
    // } else {
    //   console.log("No files uploaded"); // Debug log
    // }


    const clientConnection = await getClientDatabaseConnection(clientId);
    const clientUser = clientConnection.model("clientUsers", clinetUserSchema);
    const Stock = clientConnection.model("productStock", productStockSchema);
    const Cart = clientConnection.model("cart", cartSchema);
    const MainStock = clientConnection.model('productMainStock', productMainStockSchema);
    const ProductVariant = clientConnection.model('productVariant', productVariantSchema);
    const ProductRate = clientConnection.model('productRate', productRateSchema);
    const ProductBluePrint = clientConnection.model('productBlueprint', productBlueprintSchema);


    // Fetch product stock
    const productStock = await Stock.findById(productStockId);
    if (!productStock || !productStock.isActive) {
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

    console.log("priceObject", priceObject);



    const calculatedPrice = priceObject?.unitPrice * quantity;
    if (calculatedPrice !== JSON.parse(priceOption)?.price) {
      return res.status(httpStatusCode.Conflict).json({
        success: false,
        message: "Invalid price calculation occured.",
      });
    }


    let finalPriceOption = JSON.parse(priceOption);


    const pasrsedPriceOption = JSON.parse(priceOption);

    if (pasrsedPriceOption?.hasDiscount) {

      finalPriceOption.price = finalPriceOption?.price - finalPriceOption?.price * (finalPriceOption?.discountPercent / 100);

    }

    console.log("pasrsedPriceOption", pasrsedPriceOption);
    console.log("finalPriceOption", finalPriceOption);







    // Validate price option
    // const parsedPriceOption = JSON.parse(priceOption);
    // const validPriceOption = productStock.priceOptions.find(
    //   (opt) =>
    //     opt.quantity === parsedPriceOption.quantity &&
    //     opt.unit === parsedPriceOption.unit &&
    //     opt.price === parsedPriceOption.price
    // );
    // if (!validPriceOption) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Invalid price option",
    //   });
    // }


    // Check stock availability
    if (productMainStock.onlineStock < quantity) {
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
      (item) => item.productMainStock.toString() === productMainStock.toString()
    );
    if (itemIndex > -1) {
      // Update quantity if item exists
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        productStock: productStockId,
        productMainStock: productMainStockId,
        quantity,
        priceOption: finalPriceOption,
        customizationDetails: new Map(Object.entries(customizationDetails)),
        customizationFiles,
      });
    }
    // Save cart
    await cart.save();
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
    const MainStock = clientConnection.model('productMainStock', productMainStockSchema);
    const ProductRate = clientConnection.model('productRate', productRateSchema);
    const ProductVariant = clientConnection.model('productVariant', productVariantSchema);



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
        .populate({
          path: "items.productMainStock",
          model: MainStock,
          populate: [
            {
              path: 'variant',
              model: ProductVariant,
              select: "priceId ",
              populate: {
                path: 'priceId',
                model: ProductRate,
                select: "price product variant"
              }
            }
          ],
          select: "name priceId description totalStock images onlineStock"
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
      }).populate({
        path: "items.productMainStock",
        model: MainStock,
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

// add to wishlist
exports.addToWishList = async (req, res, next) => {
  try {
    const { clientId, productStockId, productMainStockId, sessionId } = req.body;
    if (!clientId) {
      return res
        .status(httpStatusCode.BadRequest)
        .send({ message: message.lblClinetIdIsRequired });
    }
    const userId = req.user ? req.user._id : null; // From auth middleware
    // Validate input
    if (!productStockId || !productMainStockId) {
      return res.status(httpStatusCode.BadRequest).send({
        success: false,
        message: message.lblRequiredFieldMissing,
      });
    }

    const clientConnection = await getClientDatabaseConnection(clientId);
    const Stock = clientConnection.model("productStock", productStockSchema);
    const WishList = clientConnection.model("wishlist", wishListSchema)
    const MainStock = clientConnection.model('productMainStock', productMainStockSchema);
    const ProductVariant = clientConnection.model('productVariant', productVariantSchema);
    const ProductRate = clientConnection.model('productRate', productRateSchema);
    const ProductBluePrint = clientConnection.model('productBlueprint', productBlueprintSchema);


    // Fetch product stock
    const productStock = await Stock.findById(productStockId);
    if (!productStock || !productStock.isActive) {
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

    // Find or create wishlist
    let wishlist;
    if (userId) {
      wishlist = await WishList.findOne({ user: userId });
      if (!wishlist) {
        wishlist = new WishList({ user: userId, createdBy: userId });
      }
    } else if (sessionId) {
      wishlist = await WishList.findOne({ sessionId, isGuest: true });
      if (!wishlist) {
        wishlist = new WishList({ sessionId, isGuest: true });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "User or session ID required",
      });
    }
    // Check if item already exists in wishlist
    const itemIndex = wishlist.items.findIndex(
      (item) => item.productMainStock.toString() === productMainStock.toString()
    );
    if (itemIndex > -1) {
      // Update quantity if item exists
      wishlist.items[itemIndex].quantity += quantity;
    } else {
      // Add new item
      wishlist.items.push({
        productStock: productStockId,
        productMainStock: productMainStockId,
      });
    }
    // Save wishlist
    await wishlist.save();
    res.status(httpStatusCode.Created).json({
      success: true,
      message: "Item added to wishlist",
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};

// get wishlist
exports.getWishList = async (req, res, next) => {
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
    const WishList = clientConnection.model("wishlist", wishListSchema)

    const Stock = clientConnection.model("productStock", productStockSchema);
    const MainStock = clientConnection.model('productMainStock', productMainStockSchema);
    const ProductRate = clientConnection.model('productRate', productRateSchema);
    const ProductVariant = clientConnection.model('productVariant', productVariantSchema);



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
    let wishList;
    if (userId) {
      // Fetch cart for authenticated user
      wishList = await WishList.findOne({ user: userId })
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
        .populate({
          path: "items.productMainStock",
          model: MainStock,
          populate: [
            {
              path: 'variant',
              model: ProductVariant,
              select: "priceId ",
              populate: {
                path: 'priceId',
                model: ProductRate,
                select: "price product variant"
              }
            }
          ],
          select: "name priceId description totalStock images onlineStock"
        })
        .lean(); // Return plain JS object for performance
    } else if (sessionId) {
      wishList = await WishList.findOne({
        sessionId,
        isGuest: true,
      }).populate({
        path: "items.productStock",
        model: Stock,
        select: " _id product ",
        populate: {
          path: "product",
          model: ProductBluePrint,
          select: "name description images sku categoryId subCategoryId brandId",
        },
      }).populate({
        path: "items.productMainStock",
        model: MainStock,
      })
        .lean();
    }
    if (!wishList) {
      return res.status(httpStatusCode.NotFound).json({
        success: false,
        message: "WishList not found",
      });
    }
    res.status(httpStatusCode.OK).json({
      success: true,
      message: "WishList retrieved successfully",
      data: wishList,
    });
  } catch (error) {
    next(error);
  }
};


// remove from wish list
exports.removeFromWishList = async (req, res, next) => {
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
      const WishList = clientConnection.model("wishlist", wishListSchema)
      // Find the cart
      let wishList;
      if (userId) {
        wishList = await WishList.findOne({ user: userId, });
      } else if (sessionId) {
        wishList = await WishList.findOne({
          sessionId,

          isGuest: true,
        });
      } else {
        return res.status(httpStatusCode.BadRequest).json({
          success: false,
          message: "User or session ID required",
        });
      }

      if (!wishList) {
        return res.status(httpStatusCode.NotFound).json({
          success: false,
          message: "wishList not found",
        });
      }

      // Find item in cart
      const itemIndex = wishList.items.findIndex(
        (item) => item.productMainStock.toString() === productStockId
      );
      if (itemIndex === -1) {
        return res.status(httpStatusCode.BadRequest).json({
          success: false,
          message: "Item not found in wishList",
        });
      }


      // Remove item from cart
      wishList.items.splice(itemIndex, 1);

      // Save wishList with optimistic locking
      await wishList.save(); // Throws VersionError if modified concurrently

      return res.status(httpStatusCode.OK).json({
        success: true,
        message: "Item removed from wishList",
        data: wishList,
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



// post rating
exports.postRating = async (req, res, next) => {
  try {
    const { clientId, productMainStockId, productStock, rating, name, description } = req.body;
    // const customerId = req.user.id; // From auth middleware, assuming JWT with user.id as clientUsers _id
    const customerId = req.user ? req.user._id : null; // From auth middleware, if present

    // Validate required fields
    if (!productMainStockId || !productStock || !rating) {
      return res.status(httpStatusCode.BadRequest).json({ message: 'productMainStockId and rating are required' });
    }

    // Validate rating: between 1 and 5, in 0.5 increments
    if (Number(rating) < 1 || Number(rating) > 5) {
      return res.status(httpStatusCode.BadRequest).json({ message: 'Rating must be between 1 and 5 ' });
    }

    const clientConnection = await getClientDatabaseConnection(clientId);
    const ProductMainStock = clientConnection.model('productMainStock', productMainStockSchema);
    const RatingAndReview = clientConnection.model('ratingAndReview', ratingAndReviewsSchema);

    // Check if product exists
    const product = await ProductMainStock.findById(productMainStockId);
    if (!product) {
      return res.status(httpStatusCode.NotFound).json({ message: 'Product not found' });
    }

    // Check if customer has already reviewed this product (prevent duplicates)
    const existingReview = await RatingAndReview.findOne({ customerId, productMainStockId });
    if (existingReview) {
      return res.status(httpStatusCode.BadRequest).json({ message: 'You have already reviewed this product' });
    }

    // Placeholder: Check if customer purchased the product
    // const hasPurchased = await Order.exists({
    //   customerId,
    //   'items.productMainStockId': productMainStockId,
    //   status: { $in: ['delivered', 'completed'] } // Adjust based on your order statuses
    // });
    // if (!hasPurchased) {
    //   return res.status(403).json({ message: 'You must purchase the product to review it' });
    // }

    const dataObject = {
      customerId,
      productStock,
      productMainStockId,
      rating: Number(rating),
      name: name || null,
      description: description || null,
      createdBy: customerId, // Assuming createdBy is the same as customerId
    }

    let attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await uploadProductImageToS3(file, clientId);
        attachments.push(uploadResult.url);
      }
      dataObject.images = attachments;
    }

    // Create the review
    const newReview = new RatingAndReview(dataObject);
    await newReview.save();
    await updateAverageRating(clientId, productMainStockId);
    res.status(201).json({ message: 'Review created successfully', review: newReview });

  } catch (error) {
    next(error)
  }
};

exports.getReviewsByProduct = async (req, res) => {
  try {
    const { clientId, productMainStockId } = req.params;
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query; // Pagination and sorting

    const clientConnection = await getClientDatabaseConnection(clientId);
    const ProductMainStock = clientConnection.model('productMainStock', productMainStockSchema);
    const RatingAndReview = clientConnection.model('ratingAndReview', ratingAndReviewsSchema);

    // Validate product exists
    const product = await ProductMainStock.findById(productMainStockId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const reviews = await RatingAndReview.find({ productMainStockId })
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))

    const total = await RatingAndReview.countDocuments({ productMainStockId });

    res.status(200).json({
      reviews,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllReviewsByCustomer = async (req, res) => {
  try {
    const { clientId } = req.query; // Using query param for clientId
    const userId = req.user ? req.user._id : null; // From auth middleware   
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query; // Pagination and sorting
    const clientConnection = await getClientDatabaseConnection(clientId);
    const RatingAndReview = clientConnection.model('ratingAndReview', ratingAndReviewsSchema);
    const ProductStock = clientConnection.model("productStock", productStockSchema);
    const ProductBluePrint = clientConnection.model('productBlueprint', productBlueprintSchema);
    const MainStock = clientConnection.model('productMainStock', productMainStockSchema);

    const reviews = await RatingAndReview.find({ customerId: userId })
      .populate({
        path: "productStock",
        model: ProductStock,
        populate: {
          path: "product", // Assuming productStock has a 'product' ref
          model: ProductBluePrint,
          select: "name images isCustomizable _id", // Only fetch necessary fields
        },
      })
      .populate({
        path: "productMainStockId",
        model: MainStock,
        // populate: {
        //   path: "product", // Assuming productStock has a 'product' ref
        //   model: MainStock,
        //   select: "name images isCustomizable _id", // Only fetch necessary fields
        // },
      })
      .sort(sort)
    // .skip((page - 1) * limit)
    // .limit(parseInt(limit))

    const total = await RatingAndReview.countDocuments({ customerId: userId });
    res.status(200).json({
      reviews,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to update average rating
const updateAverageRating = async (clientId, productMainStockId) => {

  const clientConnection = await getClientDatabaseConnection(clientId);
  const ProductMainStock = clientConnection.model('productMainStock', productMainStockSchema);
  const RatingAndReview = clientConnection.model('ratingAndReview', ratingAndReviewsSchema);

  const aggregation = await RatingAndReview.aggregate([
    { $match: { productMainStockId: new mongoose.Types.ObjectId(productMainStockId) } },
    {
      $group: {
        _id: '$productMainStockId',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  if (aggregation.length > 0) {
    const { averageRating, reviewCount } = aggregation[0];
    await ProductMainStock.findByIdAndUpdate(productMainStockId, {
      averageRating: parseFloat(averageRating.toFixed(1)), // Round to 1 decimal for display
      reviewCount,
    });
  } else {
    // If no reviews, reset to defaults
    await ProductMainStock.findByIdAndUpdate(productMainStockId, {
      averageRating: 0,
      reviewCount: 0,
    });
  }
};