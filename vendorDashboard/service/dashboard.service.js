// services/chairService.js 
const { getClientDatabaseConnection } = require("../../db/connection");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const { DateTime } = require("luxon");
const clinetUserSchema = require("../../client/model/user");
const supplierSchema = require("../../client/model/supplier");
const purchaseInvoiceSchema = require("../../client/model/purchaseInvoice");
const saleInvoiceSchema = require("../../client/model/saleInvoice");
const productBlueprintSchema = require("../../client/model/productBlueprint");



// const getCounts = async (clientId) => {
//     try {
//         const clientConnection = await getClientDatabaseConnection(clientId);

//         const clientUser = clientConnection.model('clientUsers', clinetUserSchema);
//         const Supplier = clientConnection.model('supplier', supplierSchema)
//         const PurchaseInvoice = clientConnection.model('purchaseInvoice', purchaseInvoiceSchema);
//         const SaleInvoice = clientConnection.model('saleInvoice', saleInvoiceSchema);
//         const ProductBluePrint = clientConnection.model('productBlueprint', productBlueprintSchema);

//         const [customers, suppliers] = Promise.all([
//             clientUser.find({ roleId: 0 }),
//             Supplier.find({}),
//             ProductBluePrint.find({})
//         ]);


//         return true;
//     } catch (error) {
//         throw new CustomError(error.statusCode || 500, `Error getting holiday: ${error.message}`);
//     }
// };


const getCounts = async (clientId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);

        // Model registration (best done once when connection is created, but safe here)
        const ClientUser = clientConnection.model('clientUsers', clinetUserSchema);
        const Supplier = clientConnection.model('supplier', supplierSchema);
        const PurchaseInvoice = clientConnection.model('purchaseInvoice', purchaseInvoiceSchema);
        const SaleInvoice = clientConnection.model('saleInvoice', saleInvoiceSchema);
        const ProductBluePrint = clientConnection.model('productBlueprint', productBlueprintSchema);

        const [
            salesStats,
            purchaseStats,
            customerCount,
            supplierCount,
            productCount
        ] = await Promise.all([
            // 1. Sales Stats - Single aggregation (very fast)
            SaleInvoice.aggregate([
                { $match: { deletedAt: null } },
                {
                    $group: {
                        _id: null,
                        totalSalesCount: { $sum: 1 },
                        totalSaleValue: { $sum: '$grandTotal' },
                        totalReceivedAmount: { $sum: '$paidAmount' }
                    }
                }
            ]),

            // 2. Purchase Stats - Single aggregation
            PurchaseInvoice.aggregate([
                { $match: { deletedAt: null } },
                {
                    $group: {
                        _id: null,
                        totalPurchasesCount: { $sum: 1 },
                        totalPurchaseValue: { $sum: '$grandTotal' },     // now using stored field
                        totalPaidAmount: { $sum: '$paidAmount' }
                    }
                }
            ]),

            // 3. Customers
            ClientUser.countDocuments({
                roleId: 0,
                // deletedAt: { $exists: false }   // or null if you set deletedAt: null
            }),

            // 4. Suppliers
            Supplier.countDocuments({}),

            // 5. Products
            ProductBluePrint.countDocuments({})
        ]);

        console.log("purchaseStats", purchaseStats);
        

        const result = {
            sales: {
                totalSalesCount: salesStats[0]?.totalSalesCount || 0,
                totalSaleValue: salesStats[0]?.totalSaleValue || 0,
                totalReceivedAmount: salesStats[0]?.totalReceivedAmount || 0
            },
            purchases: {
                totalPurchasesCount: purchaseStats[0]?.totalPurchasesCount || 0,
                totalPurchaseValue: purchaseStats[0]?.totalPurchaseValue || 0,
                totalPaidAmount: purchaseStats[0]?.totalPaidAmount || 0
            },
            customers: customerCount,
            suppliers: supplierCount,
            products: productCount,
            lastUpdated: new Date().toISOString()
        };

        return result;

    } catch (error) {
        console.error('❌ Dashboard Counts Error:', error);
        throw new CustomError(
            error.statusCode || 500,
            `Error fetching dashboard counts: ${error.message}`
        );
    }
};



module.exports = {
    getCounts,
}; 