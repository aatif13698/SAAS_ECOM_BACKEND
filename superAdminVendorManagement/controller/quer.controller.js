



const { validationResult } = require('express-validator');

const httpsStatusCode = require("../../utils/http-status-code");
const { mailSender } = require('../../email/emailSend');

const UserQuery = require("../../model/query")














exports.createQuery = async (req, res, next) => {
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

    // Create new Query
    const newRequest = new UserQuery({
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
      template: "query",
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
      message: 'Query submitted successfully',
      data: newRequest,
    });
  } catch (error) {
    console.error('Error in create Query:', error);
    return res.status(httpsStatusCode.InternalServerError).json({
      success: false,
      message: 'Internal server error',
      errorCode: 'SERVER_ERROR',
      error: error.message,
    });
  }
};

// get Query list
exports.getQueryList = async (req, res, next) => {
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
      UserQuery.find(filters).skip(skip).limit(limit).sort({ _id: -1 }).lean(),
      UserQuery.countDocuments(filters),
    ]);
    return res.status(httpsStatusCode.OK).json({
      success: true,
      message: "Query found successfully",
      data: {
        data: requests,
        total: total
      },
    });
  } catch (error) {
    console.error("Query getting error:", error);
    return res.status(httpsStatusCode.InternalServerError).json({
      success: false,
      message: "Internal server error",
      errorCode: "SERVER_ERROR",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.getIndividualQuery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [request] = await Promise.all([
      UserQuery.findById(id).populate('replies.sentBy', 'firstName lastName email _id')
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
      message: "Query Found successfully.",
      data: {
        data: request,
      },
    });
  } catch (error) {
    console.error("Query fetching error:", error);
    return res.status(httpsStatusCode.InternalServerError).json({
      success: false,
      message: "Internal server error",
      errorCode: "SERVER_ERROR",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};


exports.deleteQuery = async (req, res, next) => {
  try {
    console.log("comming here");
    
    const { clientId, keyword, page, perPage } = req.body;
    req.query.keyword = keyword;
    req.query.page = page;
    req.query.perPage = perPage;
    if (!clientId) {
      return res.status(httpsStatusCode.BadRequest).send({
        message: "Id is required.",
      });
    }
    const request = await UserQuery.findByIdAndDelete(clientId);
    // if (!request) {
    //   return res.status(httpsStatusCode.NotFound).send({
    //     message: message.lblRequestNotFound,
    //   });
    // }
    // Object.assign(request, {
    //   deletedAt: new Date(),
    // });
    // await request.save();
    this.getQueryList(req, res)
  } catch (error) {
    console.error("Query soft delete error:", error);
    return res.status(httpsStatusCode.InternalServerError).json({
      success: false,
      message: "Internal server error",
      errorCode: "SERVER_ERROR",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

exports.restoreQuery = async (req, res, next) => {
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
    const request = await UserQuery.findById(clientId);
    if (!request) {
      return res.status(httpsStatusCode.NotFound).send({
        message: "Query not found",
      });
    }
    Object.assign(request, {
      deletedAt: null,
    });
    await request.save();
    this.getDemoRequestList(req, res)
  } catch (error) {
    console.error("Query restore error:", error);
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
    
    const query = await UserQuery.findById(req.params.id);
    if (!query || query.deletedAt) {
      throw createError(httpsStatusCode.NotFound, 'Query not found');
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
    query.replies.push(reply);
    query.status = query.replies.length === 1 ? 'in_progress' : query.status;
    await query.save();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: query.email,
      subject: subject,
      template: "queryResponse",
      context: {
        appName: process.env.APP_NAME,
        name: query.name,
        email: query.email,
        phone: query.phone,
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
    query.replies[query.replies.length - 1].isSent = true;
    await query.save();

    const newReply =  await UserQuery.findById(req.params.id).populate('replies.sentBy', 'firstName lastName email _id')
    return res.status(httpsStatusCode.OK).json({
      success: true,
      data: newReply,
    });
  } catch (error) {
    console.error("Query soft delete error:", error);
    return res.status(httpsStatusCode.InternalServerError).json({
      success: false,
      message: "Internal server error",
      errorCode: "SERVER_ERROR",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}