const { default: mongoose } = require("mongoose");
const productBlueprintSchema = require("../../client/model/productBlueprint");
const productStockSchema = require("../../client/model/productStock");
const { getClientDatabaseConnection } = require("../../db/connection");
const httpStatusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");




// get laptop list 1
exports.getLaptopList1 = async (req, res, next) => {
  try {
    const { clientId } = req.params;
    const clientConnection = await getClientDatabaseConnection(clientId);
    const Stock = clientConnection.model("productStock", productStockSchema);
    const ProductBluePrint = clientConnection.model('productBlueprint', productBlueprintSchema);

    const list = await Stock.find({ isActive: true }).populate({
      path: 'product',
      model: ProductBluePrint,
      select: 'name _id images '
    });
    return res.status(httpStatusCode.OK).send({
      message: "Laptop list 1 found successfully.",
      data: list
    })
  } catch (error) {
    console.error("Error fetching the laptop list 1", error);
    next(error)
  }
};




// get product
exports.getProduct = async (req, res, next) => {
  try {
    const { clientId, productStockId } = req.params;
    const clientConnection = await getClientDatabaseConnection(clientId);
    const Stock = clientConnection.model("productStock", productStockSchema);
    const ProductBluePrint = clientConnection.model('productBlueprint', productBlueprintSchema);

    const product = await Stock.findOne({ isActive: true, _id: productStockId }).populate({
      path: 'product',
      model: ProductBluePrint,
      select: 'name _id images customizableOptions isCustomizable'
    });
    return res.status(httpStatusCode.OK).send({
      message: "Product found successfully.",
      data: product
    })
  } catch (error) {
    console.error("Error fetching product", error);
    next(error)
  }
};



// get products by category and subcategory controller starts here



// Validation middleware for pagination
const validatePagination = [
  (req, res, next) => {
    req.query.page = parseInt(req.query.page) || 1;
    req.query.limit = parseInt(req.query.limit) || 20;
    if (req.query.limit > 100) req.query.limit = 100; // Cap limit
    next();
  },
];

// Controller: GET /products/:clientId/category/:categoryId
exports.getProductsByCategory = [
  validatePagination,
  async (req, res, next) => {
    try {
      const { clientId, categoryId } = req.params;
      const { page, limit } = req.query;

      // Validate ObjectId
      if (!mongoose.isValidObjectId(clientId) || !mongoose.isValidObjectId(categoryId)) {
        return res.status(httpStatusCode.BadRequest).json({
          message: "Invalid client or category ID",
          data: null,
        });
      }

      // Get client database connection
      const clientConnection = await getClientDatabaseConnection(clientId);
      const Stock = clientConnection.model("productStock", productStockSchema);
      const ProductBluePrint = clientConnection.model("productBlueprint", productBlueprintSchema);

      // Calculate skip for pagination
      const skip = (page - 1) * limit;

      // Fetch products
      const products = await Stock.find({
        isActive: true,
        deletedAt: null,
        onlineStock: { $gt: 0 },
      })
        .populate({
          path: "product",
          model: ProductBluePrint,
          match: {
            categoryId: new mongoose.Types.ObjectId(categoryId),
            isActive: true,
            deletedAt: null,
          },
          select: "name _id images isCustomizable customizableOptions",
        })
        .select("priceOptions onlineStock")
        .skip(skip)
        .limit(limit)
        .lean(); // Use lean for performance

      // Filter out null products (where populate didn't match)
      const filteredProducts = products.filter((item) => item.product !== null);

      // Count total for pagination metadata
      const total = await Stock.countDocuments({
        isActive: true,
        deletedAt: null,
        onlineStock: { $gt: 0 },
        product: {
          $in: await ProductBluePrint.find({
            categoryId: new mongoose.Types.ObjectId(categoryId),
            isActive: true,
            deletedAt: null,
          }).distinct("_id"),
        },
      });

      return res.status(httpStatusCode.OK).json({
        message: "Products by category found successfully.",
        data: filteredProducts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Error fetching products by category:", error);
      return res.status(httpStatusCode.BadRequest).json({
        message: error.message || "Failed to fetch products by category",
        data: null,
      });
    }
  },
];

// Controller: GET /products/:clientId/subcategory/:subcategoryId
exports.getProductsBySubcategory = [
  validatePagination,
  async (req, res, next) => {
    try {
      const { clientId, subcategoryId } = req.params;
      const { page, limit } = req.query;

      // Validate ObjectId
      if (!mongoose.isValidObjectId(clientId) || !mongoose.isValidObjectId(subcategoryId)) {
        return res.status(httpStatusCode.BadRequest).json({
          message: "Invalid client or subcategory ID",
          data: null,
        });
      }

      // Get client database connection
      const clientConnection = await getClientDatabaseConnection(clientId);
      const Stock = clientConnection.model("productStock", productStockSchema);
      const ProductBluePrint = clientConnection.model("productBlueprint", productBlueprintSchema);

      // Calculate skip for pagination
      const skip = (page - 1) * limit;

      // Fetch products
      const products = await Stock.find({
        isActive: true,
        deletedAt: null,
        onlineStock: { $gt: 0 },
      })
        .populate({
          path: "product",
          model: ProductBluePrint,
          match: {
            subCategoryId: new mongoose.Types.ObjectId(subcategoryId),
            isActive: true,
            deletedAt: null,
          },
          select: "name _id images isCustomizable customizableOptions",
        })
        .select("priceOptions onlineStock")
        .skip(skip)
        .limit(limit)
        .lean();

      // Filter out null products
      const filteredProducts = products.filter((item) => item.product !== null);

      // Count total for pagination metadata
      const total = await Stock.countDocuments({
        isActive: true,
        deletedAt: null,
        onlineStock: { $gt: 0 },
        product: {
          $in: await ProductBluePrint.find({
            subCategoryId: new mongoose.Types.ObjectId(subcategoryId),
            isActive: true,
            deletedAt: null,
          }).distinct("_id"),
        },
      });

      return res.status(httpStatusCode.OK).json({
        message: "Products by subcategory found successfully.",
        data: filteredProducts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Error fetching products by subcategory:", error);
      return res.status(httpStatusCode.BadRequest).json({
        message: error.message || "Failed to fetch products by subcategory",
        data: null,
      });
    }
  },
];