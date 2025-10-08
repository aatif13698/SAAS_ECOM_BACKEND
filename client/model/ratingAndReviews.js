

const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const ratingAndReviewsSchema = new Schema(
    {
        customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'clientUsers', required: true }, 
        productMainStockId: { type: ObjectId, ref: "productMainStock", required: true },
        
        rating:  { type: Number}, // should be grater than equal to 1 and less than 5.
        name: {type: String, default: null},
        description : {type: String, default: null},
        images: [{ type: String }],
       
        createdBy: { type: ObjectId, ref: "clientUsers", index: true },
        deletedAt: { type: Date, default: null, index: true },
        updatedAt: { type: Date, default: null, index: true },
    },
    { timestamps: true }
);

module.exports = ratingAndReviewsSchema;





