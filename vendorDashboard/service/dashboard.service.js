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
const orderSchema = require("../../client/model/order");



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
            productCount,
            employeeCount
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
            ProductBluePrint.countDocuments({}),

            // 6 employees
            ClientUser.countDocuments({
                roleId: { $gt: 1 },
                // deletedAt: { $exists: false }   // or null if you set deletedAt: null
            }),
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
            employees: employeeCount,
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

const getLatest = async (clientId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const PurchaseInvoice = clientConnection.model('purchaseInvoice', purchaseInvoiceSchema);
        const SaleInvoice = clientConnection.model('saleInvoice', saleInvoiceSchema);
        const Order = clientConnection.model("Order", orderSchema);
        const User = clientConnection.model("clientUsers", clinetUserSchema)
        const Supplier = clientConnection.model('supplier', supplierSchema);

        const [
            latestSales,
            latestPurchases,
            latestOrders
        ] = await Promise.all([
            SaleInvoice.find({ deletedAt: null })
                .sort({ createdAt: -1, _id: -1 })
                .limit(5)
                .populate({
                    path: "customer",
                    model: User,
                })
            ,

            // === Latest 5 Purchase Invoices ===
            PurchaseInvoice.find({ deletedAt: null })
                .sort({ createdAt: -1, _id: -1 })
                .limit(5)
                .populate({
                    path: "supplier",
                    model: Supplier,
                    select: "-items"
                })
            ,

            // === Latest 5 Orders ===
            Order.find({ deletedAt: null })  // or whatever soft delete field you use
                .sort({ createdAt: -1, _id: -1 })
                .limit(5)
                .populate({
                    path: "customer",
                    model: User,
                    select: "firstName lastName email phone _id",
                })
            ,
        ]);



        const result = {
            latestSales,
            latestPurchases,
            latestOrders,
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
    getLatest
}; 