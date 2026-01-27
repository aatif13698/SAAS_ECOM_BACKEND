// services/chairService.js
const { getClientDatabaseConnection } = require("../../db/connection");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const productBlueprintSchema = require("../../client/model/productBlueprint");
const bannerSchema = require("../../client/model/banner");


const create = async (clientId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Banner = clientConnection.model("banner", bannerSchema)
        // Find the current maximum order
        const maxOrderDoc = await Banner.findOne().sort({ order: -1 }).select('order').exec();
        const newOrder = maxOrderDoc && maxOrderDoc.order ? maxOrderDoc.order + 1 : 1;
        // Assign the new order to the data
        data.order = newOrder;
        const banner = await Banner.create(data);
        return banner;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating: ${error.message}`);
    }
};

const list = async (clientId, filters = {}) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Banner = clientConnection.model("banner", bannerSchema)
        const ProductBluePrint = clientConnection.model('productBlueprint', productBlueprintSchema);

        const [banners, total] = await Promise.all([
            Banner.find(filters).populate({
                path: "products.id",
                model: ProductBluePrint,
                select: "name description images"
            }),
            Banner.countDocuments(filters),
        ]);
        return { count: total, banners };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing: ${error.message}`);
    }
};

const update = async (clientId, bannerId, updateData) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Banner = clientConnection.model("banner", bannerSchema)
        const banner = await Banner.findById(bannerId);
        if (!banner) {
            throw new CustomError(statusCode.NotFound, "Banner not found");
        }
        Object.assign(banner, updateData);
        await banner.save();
        return banner
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error updating: ${error.message}`);
    }
};


const sectionType = async (clientId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Banner = clientConnection.model("banner", bannerSchema)
        const ProductBluePrint = clientConnection.model('productBlueprint', productBlueprintSchema);

        const banner = await Banner.find({})
            .populate({
                path: "products.id",
                model: ProductBluePrint
            });
        if (!banner) {
            throw new CustomError(statusCode.NotFound, "Banner not found");
        }
        return banner
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error: ${error.message}`);
    }
};

const reorder = async (clientId, bannerIds) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Banner = clientConnection.model("banner", bannerSchema)
        // Validate that all bannerIds exist and belong to this client (optional but recommended)
        const existingSections = await Banner.find({ _id: { $in: bannerIds } });
        if (existingSections.length !== bannerIds.length) {
            throw new CustomError(400, "One or more section IDs are invalid or do not exist");
        }
        // Update orders based on the new array order (starting from 1)
        const updates = bannerIds.map((id, index) => ({
            updateOne: {
                filter: { _id: id },
                update: { order: index + 1 },
            },
        }));
        await Banner.bulkWrite(updates);
        // Return the updated sections in the new order
        const updatedBanners = await Banner.find({ _id: { $in: bannerIds } }).sort({ order: 1 });
        return updatedBanners;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error reordering: ${error.message}`);
    }
};



const sectionById = async (clientId, id) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Banner = clientConnection.model("banner", bannerSchema)
        const ProductBluePrint = clientConnection.model('productBlueprint', productBlueprintSchema);

        const banner = await Banner.findById(id)
            .populate({
                path: "products.id",
                model: ProductBluePrint
            });
        if (!banner) {
            throw new CustomError(statusCode.NotFound, "Banner not found");
        }
        return banner
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error: ${error.message}`);
    }
};


module.exports = {
    create,
    list,
    update,
    sectionType,
    reorder,
    sectionById
};
