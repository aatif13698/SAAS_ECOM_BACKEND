



const { validationResult } = require('express-validator');

const httpsStatusCode = require("../../utils/http-status-code");
const { mailSender } = require('../../email/emailSend');
const UserRequest = require("../../model/request")














exports.createRequest = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(httpsStatusCode.BadRequest).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
        errorCode: 'VALIDATION_ERROR',
      });
    }

    const { name, phone_number, email, message } = req.body;

    // // Check if phone number already exists (excluding soft-deleted records)
    // const existingRequest = await UserRequest.findOne({ 
    //   phone, 
    //   deletedAt: null 
    // });
    // if (existingRequest) {
    //   return res.status(httpsStatusCode.Conflict).json({
    //     success: false,
    //     message: 'Phone number already exists',
    //     errorCode: 'DUPLICATE_PHONE',
    //   });
    // }

    // Create new request
    const newRequest = new UserRequest({
      name,
      phone: phone_number,
      email,
      message,
    });

    await newRequest.save();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Welcome To SAAS Ecom",
      template: "requestDemoThanksResponse",
      context: {
        appName: process.env.APP_NAME,
        name: name,
        email: email,
        phone: phone_number,
        message: message,
        appUrl: 'https://aestree.com',
        logoUrl: 'https://billionforms-files.blr1.cdn.digitaloceanspaces.com/CompanyLogo/aestree-logo.png',
        contactEmail: 'contact@aestree.in',
        contactPhone: '+91 80694 56009',
        emailSignature: 'Customer Success Team',
        currentYear: new Date().getFullYear(),
      },
    };

    await mailSender(mailOptions);

    return res.status(httpsStatusCode.Created).json({
      success: true,
      message: 'Request created successfully',
      data: newRequest,
    });
  } catch (error) {
    console.error('Error in createRequest:', error);
    return res.status(httpsStatusCode.InternalServerError).json({
      success: false,
      message: 'Internal server error',
      errorCode: 'SERVER_ERROR',
      error: error.message,
    });
  }
};

// get demo requests list
exports.getDemoRequestList = async (req, res, next) => {
  try {
    const { keyword = '', page = 1, perPage = 10, companyId } = req.query;
    const limit = perPage
    const skip = (page - 1) * limit;
    let filters = {
      ...(keyword && {
        $or: [
          { name: { $regex: keyword.trim(), $options: "i" } },
          { email: { $regex: keyword.trim(), $options: "i" } },
          { phone: { $regex: keyword.trim(), $options: "i" } },
          { message: { $regex: keyword.trim(), $options: "i" } },
        ],
      }),
    };

    const [requests, total] = await Promise.all([
      UserRequest.find(filters).skip(skip).limit(limit).sort({ _id: -1 }).lean(),
      UserRequest.countDocuments(filters),
    ]);
    return res.status(httpsStatusCode.OK).json({
      success: true,
      message: "Request found successfully",
      data: {
        data: requests,
        total: total
      },
    });
  } catch (error) {
    console.error("Request getting error:", error);
    return res.status(httpsStatusCode.InternalServerError).json({
      success: false,
      message: "Internal server error",
      errorCode: "SERVER_ERROR",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.getIndividualRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [request] = await Promise.all([
      UserRequest.findById(id).populate('replies.sentBy', 'firstName lastName email _id')
        .lean()
    ]);
    if (!request) {
      return res.status(httpsStatusCode.NotFound).json({
        success: false,
        message: message.lblRequestNotFound,
      });
    };

    return res.status(httpsStatusCode.OK).json({
      success: true,
      message: "Request Found successfully.",
      data: {
        data: request,
      },
    });
  } catch (error) {
    console.error("Request fetching error:", error);
    return res.status(httpsStatusCode.InternalServerError).json({
      success: false,
      message: "Internal server error",
      errorCode: "SERVER_ERROR",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};


exports.softDeleteRequest = async (req, res, next) => {
  try {
    const { clientId, keyword, page, perPage } = req.body;
    req.query.keyword = keyword;
    req.query.page = page;
    req.query.perPage = perPage;
    if (!clientId) {
      return res.status(httpsStatusCode.BadRequest).send({
        message: "Id is required.",
      });
    }
    const request = await UserRequest.findByIdAndDelete(clientId);
    // if (!request) {
    //   return res.status(httpsStatusCode.NotFound).send({
    //     message: message.lblRequestNotFound,
    //   });
    // }
    // Object.assign(request, {
    //   deletedAt: new Date(),
    // });
    // await request.save();
    this.getDemoRequestList(req, res)
  } catch (error) {
    console.error("Request soft delete error:", error);
    return res.status(httpsStatusCode.InternalServerError).json({
      success: false,
      message: "Internal server error",
      errorCode: "SERVER_ERROR",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.restoreRequest = async (req, res, next) => {
  try {
    const { clientId, keyword, page, perPage, } = req.body;
    req.query.keyword = keyword;
    req.query.page = page;
    req.query.perPage = perPage;
    if (!clientId) {
      return res.status(httpsStatusCode.BadRequest).send({
        message: "Id is required",
      });
    }
    const request = await UserRequest.findById(clientId);
    if (!request) {
      return res.status(httpsStatusCode.NotFound).send({
        message: "Request not found",
      });
    }
    Object.assign(request, {
      deletedAt: null,
    });
    await request.save();
    this.getDemoRequestList(req, res)
  } catch (error) {
    console.error("Request restore error:", error);
    return res.status(httpsStatusCode.InternalServerError).json({
      success: false,
      message: "Internal server error",
      errorCode: "SERVER_ERROR",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};


exports.addReply = async (req, res) => {
  try {
    const { subject, message, meetingLink } = req.body;
    console.log("req.body",req.body);
    
    const request = await UserRequest.findById(req.params.id);
    if (!request || request.deletedAt) {
      throw createError(httpsStatusCode.NotFound, 'Request not found');
    }

    let normalizedMeetingLink = meetingLink || null;
    if (meetingLink && !/^https?:\/\//i.test(meetingLink)) {
      normalizedMeetingLink = `https://${meetingLink}`;
    }

    const reply = {
      sentBy: req.user._id,
      subject: subject,
      message: message,
      meetingLink: normalizedMeetingLink
    };
    request.replies.push(reply);
    request.status = request.replies.length === 1 ? 'in_progress' : request.status;
    await request.save();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: request.email,
      subject: subject,
      template: "responseOfRequest",
      context: {
        appName: process.env.APP_NAME,
        name: request.name,
        email: request.email,
        phone: request.phone,
        message: message,
        meetingLink: normalizedMeetingLink,
        appUrl: 'https://aestree.in',
        logoUrl: 'https://billionforms-files.blr1.cdn.digitaloceanspaces.com/CompanyLogo/aestree-logo.png',
        contactEmail: 'contact@aestree.in',
        contactPhone: '+91 80694 56009',
        emailSignature: 'Customer Success Team',
        currentYear: new Date().getFullYear(),
      },
    };
    await mailSender(mailOptions);
    request.replies[request.replies.length - 1].isSent = true;
    await request.save();

    const newReply = await await UserRequest.findById(req.params.id).populate('replies.sentBy', 'firstName lastName email _id')
    return res.status(httpsStatusCode.OK).json({
      success: true,
      data: newReply,
    });
  } catch (error) {
    console.error("Request soft delete error:", error);
    return res.status(httpsStatusCode.InternalServerError).json({
      success: false,
      message: "Internal server error",
      errorCode: "SERVER_ERROR",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}