


const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const path = require("path");

const morgan = require("morgan");


const helper = require("./utils/helper.js")


const errorHandler = require("./middleware/errorHandler/errorHandler.js");


// cors setup
const cors = require("cors");


// env setup
const dotnev = require("dotenv");
dotnev.config();



// socket setup
const { app, server } = require("./socket/socket.js");

app.use(express.static(path.join(__dirname, "public")));


// databse connection setup
const { ConnectDb, createClientDatabase, getClientDatabaseConnection } = require("./db/connection.js");


// routes import for super admin
const welcomeRouter = require("./routes/welcome");
const superAdminRouter = require("./superAdminManagement/routes/superAdmin.routes.js");
const superAdminCategoryRouter = require("./superAdminManagement/routes/category.routes.js");
const superAdminSubCategoryRouter = require("./superAdminManagement/routes/subCategory.routes.js");
const superAdminBuRouter = require("./superAdminVendorManagement/routes/superAdminVendor.routes.js");
const superAdminRequestRoute = require("./superAdminVendorManagement/routes/request.routes.js");
const superAdminQueryRoute = require("./superAdminVendorManagement/routes/query.routes.js");

// routes import for vendor

const vendorAuthRouter = require("./commonClinetAuthentication/routes/clientAuth.routes.js");
const vendorBusinessRouter = require("./VendorAdministration/routes/businessUnit.routes.js");
const vendorBranchRouter = require("./VendorAdministration/routes/branch.routes.js");
const vendorWarehouseRouter = require("./VendorAdministration/routes/warehouse.routes.js");
const vendorSubCategoryhRouter = require("./VendorAdministration/routes/subCategory.routes.js");
const vendorBrandRouter = require("./VendorAdministration/routes/brand.routes.js");
const vendorManufacturerRouter = require("./VendorAdministration/routes/manufacturer.routes.js");
const vendorRoleRouter = require("./commonClinetRolesAndPermission/routes/roles.routes.js");
const vendorEmployeeRouter = require("./VendorAdministration/routes/employee.routes.js");
const vendorCustomerRouter = require("./VendorAdministration/routes/customers.routes.js");
const vendorDepartmentRouter = require("./VendorAdministration/routes/workingDepartments.routes.js");
const vendorShiftRouter = require("./VendorAdministration/routes/shifts.routes.js");
const vendorChangeShiftRouter = require("./VendorAdministration/routes/changeShift.routes.js");
const vendorRequestShiftRouter = require("./VendorAdministration/routes/requestShifts.routes.js");
const documentRouter = require("./VendorAdministration/routes/documentRequirements.routes.js");
const assetRouter = require("./VendorAdministration/routes/assets.routes.js");
const leaveCategoryRoute = require("./VendorHr/routes/leaveCategories.route.js");
const holidayRoute = require("./VendorHr/routes/holiday.route.js");
const attendanceRoute = require("./VendorHr/routes/attendance.route.js");


const vendorAttribute = require("./VendorAdministration/routes/attributes.routes.js")
const vendorProductBlueprint = require("./VendorAdministration/routes/productBluePrint.routes.js");
const productQa = require("./VendorAdministration/routes/productQA.routes.js")
const vendorProductVariant = require("./VendorAdministration/routes/variant.routes.js");
const vendorProductPrice = require("./VendorAdministration/routes/productRate.routes.js");
const vendorSupplier = require("./VendorInventory/routes/supplier.routes.js");
const transporter = require("./VendorInventory/routes/supplierTransport.routes.js");
const vendorStock = require("./VendorInventory/routes/stock.routes.js");
const vendorOrder = require("./VendorInventory/routes/orders.routes.js");

const vendorLedgerGroup = require("./VendorAccount/routes/ledgerGroup.routes.js");
const ledger = require("./VendorAccount/routes/ledger.routes.js");
const financialYear = require("./VendorAccount/routes/financialYear.routes.js");
const currency = require("./VendorAccount/routes/currency.routes.js");
const voucherGroup = require("./VendorAccount/routes/voucherGroup.routes.js");
const Voucher = require("./VendorAccount/routes/voucher.routes.js");


const PurchaseOrder = require("./vendorPurchase/routes/purchaseOrder.routes.js");
const PurchaseInvoice = require("./vendorPurchase/routes/purchaseInvoice.routes.js");



// routes import for staff
const staffAuthRouter = require("./staffAuthentication/routes/staffAuth.routes.js");



// routes import for customer
const customerAuthRouter = require("./commonUserAuthentication/routes/user.routes.js");
const customer = require("./commonCustomerWebiste/routes/customer.routes.js");
const productListing = require("./productListing/routes/productListing.routes.js");
const productOrder = require("./commonCustomerOrder/routes/order.routes.js")



// model import
const Roles = require("./model/role.js");
const User = require("./model/user.js");
const clientRoleSchema = require("./client/model/role.js");
const { defaultPersmissionsList } = require("./utils/constant.js");
const {vendorPersmissionsList} = require("./utils/constant.js");


// middleware setup

// app.use(cors());

app.use(cors({
  origin: ['http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'https://dolphin-app-2-kv7tw.ondigitalocean.app', 'https://orca-app-r5am7.ondigitalocean.app', 'https://seal-app-qjy6w.ondigitalocean.app'], // Allow Vite dev server
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Include OPTIONS for preflight
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // If your app uses cookies or auth
}));

app.use(express.json())
app.use(express.static('public'))
app.use(bodyParser.json());
app.use(morgan('dev'));




// connecting database
const DATABASE_URL = process.env.DATABASE_URL;


// routes setup for super admin
app.use("/api", welcomeRouter.router);
app.use("/api/superAdmin", superAdminRouter.router);
app.use("/api/superAdmin/category", superAdminCategoryRouter.router);
app.use("/api/superAdmin/subCategory", superAdminSubCategoryRouter.router);
app.use("/api/superAdmin/vendor/", superAdminBuRouter.router);
app.use("/api/superAdmin/request/", superAdminRequestRoute.router);
app.use("/api/superAdmin/query/", superAdminQueryRoute.router);



// routes setup for client
app.use("/api/vendor/auth/", vendorAuthRouter.router);
app.use("/api/vendor/department", vendorDepartmentRouter.router);
app.use("/api/vendor/shift", vendorShiftRouter.router);
app.use("/api/vendor/changeShift", vendorChangeShiftRouter.router);
app.use("/api/vendor/requestShift", vendorRequestShiftRouter.router);
app.use("/api/vendor/business/", vendorBusinessRouter.router);
app.use("/api/vendor/branch/", vendorBranchRouter.router);
app.use("/api/vendor/warehouse/", vendorWarehouseRouter.router);
app.use("/api/vendor/subCategory/", vendorSubCategoryhRouter.router);
app.use("/api/vendor/brand/", vendorBrandRouter.router);
app.use("/api/vendor/manufacturer/", vendorManufacturerRouter.router);
app.use("/api/vendor/role", vendorRoleRouter.router);
app.use("/api/vendor/employee", vendorEmployeeRouter.router);
app.use("/api/vendor/customer", vendorCustomerRouter.router);
app.use("/api/vendor/hr/doc", documentRouter.router);
app.use("/api/vendor/hr/asset", assetRouter.router);
app.use("/api/vendor/hr/leavecategory", leaveCategoryRoute.router);
app.use("/api/vendor/hr/holiday", holidayRoute.router);
app.use("/api/vendor/hr/attendance", attendanceRoute.router);


// route setup for products
app.use("/api/vendor/attribute", vendorAttribute.router);
app.use("/api/vendor/blueprint", vendorProductBlueprint.router);
app.use("/api/vendor/product/qa", productQa.router);
app.use("/api/vendor/variant", vendorProductVariant.router);
app.use("/api/vendor/price", vendorProductPrice.router);

// route setup for inventory
app.use("/api/vendor/supplier", vendorSupplier.router);
app.use("/api/vendor/transporter", transporter.router);
app.use("/api/vendor/stock", vendorStock.router);
app.use("/api/vendor/order", vendorOrder.router);

// route setup for accounting master
app.use("/api/vendor/accounts/lg", vendorLedgerGroup.router);
app.use("/api/vendor/accounts/l", ledger.router);
app.use("/api/vendor/accounts/fy", financialYear.router);
app.use("/api/vendor/accounts/cu", currency.router);
app.use("/api/vendor/accounts/vg", voucherGroup.router);
app.use("/api/vendor/accounts/vo", Voucher.router);



// routes setup for purchase

app.use("/api/vendor/purhcase/po", PurchaseOrder.router);
app.use("/api/vendor/purhcase/pi", PurchaseInvoice.router);




// routes setup for vendor staff
app.use("/api/vendor/staff/auth/", staffAuthRouter.router);


// routes for cutomer
app.use("/api/customer/auth", customerAuthRouter.router);
app.use("/api/customer", customer.router);
app.use("/api/listing", productListing.router);
app.use("/api/customer/order", productOrder.router);





// insert role
const roles = [
    { id: 1, name: 'superAdmin' },
    { id: 2, name: 'superAdminEmployee' },
    { id: 3, name: 'vendor' },
    { id: 4, name: 'vendorEmployee' },
];

async function insertRole() {

    Roles.countDocuments({})
        .exec()
        .then(count => {
            if (count === 0) {
                // Insert predefined roles into the Role collection
                return Roles.insertMany(roles);
            } else {
                console.log('Roles already exist in the database.');
            }
        })
        .catch(err => {
            console.error('Error:', err);
        })
        .finally(() => {
        });

}


// insert super admin
async function createSuperAdmin() {

    try {

        const email = process.env.SUPER_ADMIN_EMAIL;
        const password = process.env.SUPER_ADMIN_PASSWORD;
        const phone = process.env.SUPER_ADMIN_PHONE;


        const isSuperAdminExists = await User.findOne({
            $or: [{ phone: phone }, { email: email }]
        })

        if (isSuperAdminExists) {

            console.log("Super admin credentials already exists", isSuperAdminExists);
            return
        }

        const role = await Roles.findOne({ id: 1 });

        const hash = bcrypt.hashSync(password, 10);

        const create = await User.create({
            role: role._id,
            roleId: 1,
            firstName: "Super",
            lastName: "Admin",
            email: email,
            phone: phone,
            password: hash,
            isActive: true,
            isUserVerified: true,
            tc: true,
        });

        console.log("super admin create successfully");

    } catch (error) {
        console.log("error in inserting super admin", error);
    }

}

// createSuperAdmin()



async function createNewRole(params) {

    try {

        const roleData = {
            name: "clientStaff",
            id: 5,
        }

        const role = await Roles.findOne({ name: roleData.name });

        if (role) {
            
            console.log("ROle already Exisits", role);

            return
        }

        const create = await Roles.create(roleData);

        console.log("role created successfully", create);

    } catch (error) {
        console.error("Error creating new role:", error);
    }

}


// createNewRole()



async function createRoleInDatbaseInstance() {
    try {
        const clientId = "67cdae13e177fa43c603b832";
        const data =  { id: 4, name: 'Warehouse Head', capability: defaultPersmissionsList };
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Role = clientConnection.model('clientRoles', clientRoleSchema);
        const existing = await Role.findOne({ id: 4 });
        if (existing) {
            console.log("cutomer role already exists");
            return false
        }
        const create = await Role.create(data);
        console.log("customer role created successfully");
        return true;
    } catch (error) {
        console.log("error while creating the customer", error);
    }
}
// createRoleInDatbaseInstance()



async function updateRoleInDatbaseInstance() {
    try {
        const clientId = "67cdae13e177fa43c603b832";
        const capability = vendorPersmissionsList;
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Role = clientConnection.model('clientRoles', clientRoleSchema);
        const existing = await Role.findOne({ id: 1 });
        if (existing) {
            existing.capability = capability;
            await existing.save()
        } else {
            console.log("role not found");
        }

    } catch (error) {
        console.log("error while creating the petient", error);
    }
}

// updateRoleInDatbaseInstance()


// create items
// helper.createItems()



// Place errorHandler at the END after all routes
app.use(errorHandler);


// port setup
const port = process.env.PORT;

// listening server
server.listen(port, async () => {

await ConnectDb(DATABASE_URL);

await insertRole()

    console.log(`APP STARTED SUCCESSFULLY on port ${port}....`)
});



// testing comment



