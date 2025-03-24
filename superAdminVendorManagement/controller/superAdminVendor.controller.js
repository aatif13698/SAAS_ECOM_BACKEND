

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const dotnev = require("dotenv");
const mongoose = require("mongoose");

const User = require("../../model/user");
const Roles = require("../../model/role");
const MainCategory = require("../../model/category")

const clientRoleSchema = require("../../client/model/role");
const clinetUserSchema = require("../../client/model/user");
const clinetCategorySchema = require("../../client/model/category")
const clinetBusinessUnitSchema = require("../../client/model/businessUnit");



const { clientRoles } = require("../../utils/constant")



const { generateOtp } = require("../../helper/common");
const { mailSender } = require("../../email/emailSend");
const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");

const { createClientDatabase } = require("../../db/connection");
const clinetSubCategorySchema = require("../../client/model/subCategory");


// env 
dotnev.config();
const PRIVATEKEY = process.env.PRIVATEKEY;






// create Vendor 
exports.createVendor = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const superAdmin = req.user
    const { firstName, lastName, email, phone, optionalEmail, emergencyPhone, panNumber, city, state, country, address, pinCode, companyType, password } = req.body;
    if (!firstName || !email || !phone || !password) {
      return res.status(statusCode.BadRequest).send({
        message: message.lblRequiredFieldMissing,
      });
    }
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone }],
    }).session(session);
    if (existingUser) {
      return res.status(statusCode.BadRequest).send({
        message: message.lblVendorAlreadyExists,
      });
    }
    const role = await Roles.findOne({ id: 3 }).session(session);
    if (!role) {
      return res.status(statusCode.NotFound).send({
        message: message.lblRoleNotFound,
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    let vandeorData = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone, optionalEmail, emergencyPhone, panNumber, city, state, country, address, pinCode, companyType,
      password: hashedPassword,
      role: role._id,
      roleId: role.id,
      isActive: true,
      isUserVerified: true,
      tc: true,
      isCreatedBySuperAdmin: true,
      createdBy: superAdmin._id,

    }

    const imgs = [];
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const element = req.files[i];
        imgs.push(element?.filename)
      }
    }
    if(imgs?.length > 0){
      vandeorData ={
        ...vandeorData,
        profileImage : imgs[0],
        tradeLicense : imgs[1]
      }
    }
    const newUser = await User.create(
      [
        {
          ...vandeorData
        },
      ],
      { session }
    );
    const clientConnection = await createClientDatabase(newUser[0]._id);
    const clientRole = clientConnection.model('clientRoles', clientRoleSchema);
    const roles = clientRoles;
    const createdRole = await clientRole.insertMany(roles);
    const vendorRoleId = createdRole.find((item) => {
      return item?.id == 1
    })
    const clientUser = clientConnection.model('clientUsers', clinetUserSchema);
    const newClient = await clientUser.create({
      role: vendorRoleId?._id,
      roleId: vendorRoleId?.id,
      firstName: newUser[0].firstName,
      lastName: newUser[0].lastName,
      email: newUser[0].email,
      phone: newUser[0].phone,
      password: newUser[0].password,
      tc: true,
      isUserVerified: true,
      isActive: true,
    });
    const mainCategoryList = await MainCategory.find({});
    const categoryData = mainCategoryList.map((item) => {
      return {
        name: item?.name ,
        description: item?.description ,
        slug: item?.slug,
        icon: item?.icon ,
      }
    });
    const Category = clientConnection.model('clientCategory', clinetCategorySchema);
    await Category.insertMany(categoryData);
    await session.commitTransaction();
    session.endSession();
    return res.status(statusCode.OK).send({
      message: message.lblVendorCreatedSuccess,
      data: { userId: newUser[0]._id, email: newUser[0].email, roles, createdRole },
    });
  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    session.endSession();
    console.error("Error in create Vendor:", error);
    return res.status(statusCode.InternalServerError).send({
      message: message.lblInternalServerError,
      error: error.message,
    });
  }
};


// update vendor
exports.updateVendor = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const { userId } = req.params;
    const { firstName, lastName, phone, email, password } = req.body;
    // Check if required fields are provided
    if (!userId) {
      return res.status(statusCode.BadRequest).send({
        message: message.lblUserIdRequired,
      });
    }
    // Fetch user along with potential conflict data in a single query
    const user = await User.findById(userId).session(session);
    if (!user) {
      return res.status(statusCode.NotFound).send({
        message: message.lblUserNotFound,
      });
    }
    const updates = {};
    // Handle phone update with conflict check
    if (phone && phone !== user.phone) {
      const phoneConflict = await User.exists({
        _id: { $ne: userId },
        phone: phone,
      });
      if (phoneConflict) {
        return res.status(statusCode.Conflict).send({
          message: message.lblPhoneAlreadyExists,
        });
      }
      updates.phone = phone;
    }
    // Handle email update with conflict check
    if (email && email !== user.email) {
      const emailConflict = await User.exists({
        _id: { $ne: userId },
        email: email,
      });
      if (emailConflict) {
        return res.status(statusCode.Conflict).send({
          message: message.lblEmailAlreadyExists,
        });
      }
      updates.email = email;
    }
    // Apply updates to user document
    if (firstName) updates.firstName = firstName;
    if (lastName) updates.lastName = lastName;
    // Hash password if provided
    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }
    // Only update the document if there are changes
    if (Object.keys(updates).length > 0) {
      Object.assign(user, updates);
      await user.save({ session });
    }
    // Commit transaction and end session
    await session.commitTransaction();
    session.endSession();
    return res.status(statusCode.OK).send({
      message: message.lblVendorUpdatedSuccess,
    });
  } catch (error) {
    // Rollback transaction in case of error
    if (session.inTransaction()) await session.abortTransaction();
    session.endSession();
    console.error("Error in update Vendor:", error);
    return res.status(statusCode.InternalServerError).send({
      message: message.lblInternalServerError,
      error: error.message,
    });
  }
};


// GET Vendor by ID
exports.getVendor = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { userId } = req.params;
    if (!userId) {
      return res.status(statusCode.BadRequest).send({
        message: message.lblUserIdRequired
      });
    }
    const vendor = await User.findById(userId)
      // .select("firstName middleName lastName email phone ")
      .session(session);
    if (!vendor) {
      return res.status(statusCode.NotFound).send({
        message: message.lblVendorNotFound,
      });
    }
    await session.commitTransaction();
    session.endSession();
    return res.status(statusCode.OK).send({
      message: message.lblVendorFoundSuccessfully,
      data: vendor, 
    });

  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    session.endSession();
    console.error("Error in get Vendor:", error);
    return res.status(statusCode.InternalServerError).send({
      message: message.lblInternalServerError,
      error: error.message,
    });
  }
};

// list vendor
exports.listVendor = async (req, res) => {
  try {
    const searchText = req.query.keyword ? req.query.keyword.trim() : '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.perPage) || 10;
    const skip = (page - 1) * limit;


    let whereCondition = {
      deletedAt: null,
      roleId : 3
    };

    if (searchText) {
      whereCondition.$or = [
        { firstName: { $regex: searchText, $options: "i" } },
        { lastName: { $regex: searchText, $options: "i" } },
        { email: { $regex: searchText, $options: "i" } },
        { phone: { $regex: searchText, $options: "i" } },
      ];
    }

    const [vendor, count] = await Promise.all([
      User.find(whereCondition)
        .select('firstName lastName email phone city')
        .skip(skip)
        .limit(limit)
        .sort({ _id: 'desc' }),

      User.countDocuments(whereCondition),
    ]);

    return res.json({
      message: 'List of all Vendor!',
      count: count,
      listOfVendor: vendor,
    });

  } catch (error) {
    console.error("Error in list vendor:", error);

    return res.status(statusCode.InternalServerError).send({
      message: message.lblInternalServerError,
      error: error.message,
    });
  }
};

// active inactive vendor
exports.activeinactiveVendor = async (req, res) => {

  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const { keyword, page, perPage, id, status } = req.body;
    req.query.keyword = keyword;
    req.query.page = page;
    req.query.perPage = perPage;


    // Find the vendor by ID
    const vendor = await User.findById(id).session(session);

    if (!vendor) {
      await session.abortTransaction();
      session.endSession();
      return res.status(statusCode.ExpectationFailed).send({
        message: message.lblVendorNotFound,
      });
    }

    vendor.isActive = status === "1";
    await vendor.save({ session });

    await session.commitTransaction();
    session.endSession();
    this.listVendor(req, res);

  } catch (error) {

    if (session.inTransaction()) await session.abortTransaction();
    session.endSession();

    console.error("Error in activeinactive vendor:", error);
    return res.status(statusCode.InternalServerError).send({
      message: message.lblInternalServerError,
      error: error.message,
    });

  }
};

// Soft delete vendor
exports.softDeleteVendor = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { id, keyword, page, perPage, } = req.body;

    req.query.keyword = keyword;
    req.query.page = page;
    req.query.perPage = perPage;

    const vendor = await User.findById(id).session(session);

    if (!vendor) {
      await session.abortTransaction();
      session.endSession();
      return res.status(statusCode.ExpectationFailed).send({
        message: message.lblVendorNotFound,
      });
    }

    vendor.deletedAt = new Date();
    await vendor.save({ session });

    await session.commitTransaction();
    session.endSession();

    this.listVendor(req, res);

  } catch (error) {
    if (session.inTransaction()) await session.abortTransaction();
    session.endSession();
    console.error("Error in softDelete vendor:", error);
    return res.status(statusCode.InternalServerError).send({
      message: message.lblInternalServerError,
      error: error.message,
    });
  }
};


// restore vendor
exports.restoreVendor = async (req, res) => {

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { id, keyword, page, perPage } = req.body;

    req.query.keyword = keyword;
    req.query.page = page;
    req.query.perPage = perPage;

    const vendor = await User.findById(id).session(session);

    if (!vendor || !vendor.deletedAt) {
      await session.abortTransaction();
      session.endSession();
      return res.status(statusCode.ExpectationFailed).send({
        message: message.lblVendorRestoredSuccess,
      });
    }

    vendor.deletedAt = null;
    await vendor.save({ session });

    await session.commitTransaction();
    session.endSession();
    this.listVendor(req, res);

  } catch (error) {

    if (session.inTransaction()) await session.abortTransaction();
    session.endSession();

    console.error("Error in restore vendor:", error);
    return res.status(statusCode.InternalServerError).send({
      message: message.lblInternalServerError,
      error: error.message,
    });
  }
};


