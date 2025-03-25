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
    
    const list = await Stock.find({isActive :  true}).populate({
        path: 'product',
        model: ProductBluePrint,
        select: 'name _id images '
    });
    return res.status(httpStatusCode.OK).send({
        message : "Laptop list 1 found successfully.",
        data : list
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
      
      const product = await Stock.findOne({isActive :  true, _id : productStockId}).populate({
          path: 'product',
          model: ProductBluePrint,
          select: 'name _id images '
      });
      return res.status(httpStatusCode.OK).send({
          message : "Product found successfully.",
          data : product
      })
    } catch (error) {
      console.error("Error fetching product", error);
      next(error)
    }
  };
  
