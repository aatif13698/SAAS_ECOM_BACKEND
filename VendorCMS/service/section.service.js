// services/chairService.js
const { getClientDatabaseConnection } = require("../../db/connection");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const sectionSchema = require("../../client/model/section");
const productBlueprintSchema = require("../../client/model/productBlueprint");


const create = async (clientId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Section = clientConnection.model("section", sectionSchema);

        // Find the current maximum order
        const maxOrderDoc = await Section.findOne().sort({ order: -1 }).select('order').exec();
        const newOrder = maxOrderDoc && maxOrderDoc.order ? maxOrderDoc.order + 1 : 1;

        // Assign the new order to the data
        data.order = newOrder;

        const section = await Section.create(data);
        return section;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating: ${error.message}`);
    }
};

const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Section = clientConnection.model("section", sectionSchema);
        const { page, limit } = options;
        const skip = (Number(page) - 1) * Number(limit);
        const [sections, total] = await Promise.all([
            Section.find(filters).skip(skip).limit(limit),
            Section.countDocuments(filters),
        ]);
        return { count: total, sections };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing: ${error.message}`);
    }
};

const activeInactive = async (clientId, sectionId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Section = clientConnection.model("section", sectionSchema);
        const section = await Section.findById(sectionId);
        if (!section) {
            throw new CustomError(statusCode.NotFound, "Section not found");
        }
        Object.assign(section, data);
        return await section.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error active inactive: ${error.message}`);
    }
};

const update = async (clientId, sectionId, updateData) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Section = clientConnection.model("section", sectionSchema);
        const section = await Section.findById(sectionId);
        if (!section) {
            throw new CustomError(statusCode.NotFound, "Section not found");
        }
        Object.assign(section, updateData);
        await section.save();
        return section
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error updating: ${error.message}`);
    }
};


const sectionType = async (clientId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Section = clientConnection.model("section", sectionSchema);
        const ProductBluePrint = clientConnection.model('productBlueprint', productBlueprintSchema);

        const section = await Section.find({}).populate({
            path: "products.id",
            model: ProductBluePrint
        });
        if (!section) {
            throw new CustomError(statusCode.NotFound, "Section not found");
        }
        return section
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error: ${error.message}`);
    }
};




module.exports = {
    create,
    list,
    update,
    activeInactive,
    sectionType
};
