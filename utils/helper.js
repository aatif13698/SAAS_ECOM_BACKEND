const productMainStockSchema = require("../client/model/productMainStock");
const productStockSchema = require("../client/model/productStock");
const purchaseItemsSchema = require("../client/model/purchaseItem");
const { getClientDatabaseConnection } = require("../db/connection");






const createItems = async function createBulkItemsStock(params) {
    try {
        const clientId = "67cdae13e177fa43c603b832";
        const clientConnection = await getClientDatabaseConnection(clientId);
        const MainStock = clientConnection.model('productMainStock', productMainStockSchema);
        const PurchaseItem = clientConnection.model('purchaseItems', purchaseItemsSchema);

        const mainStocks = await MainStock.find({});

        for (let index = 0; index < mainStocks.length; index++) {
            const element = mainStocks[index];
            const existingPurchaseItem = await PurchaseItem.findOne({
                product: element.product,
                productMainStockId: element._id
            });
            if (existingPurchaseItem) {
                console.log("item already exists", existingPurchaseItem);
            } else {
                const newPurchaseItem = await PurchaseItem.create({
                    businessUnit: element.businessUnit,
                    branch: element.branch,
                    warehouse: element.warehouse,
                    product: element.product,
                    productMainStockId: element._id
                })
            }
        }
    } catch (error) {
        console.log("error while creating the bulk item", error);
    }
}





module.exports = {
    createItems
}