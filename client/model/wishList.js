const mongoose = require("mongoose");  

const { Schema } = mongoose;  
const ObjectId = Schema.ObjectId;  

const wishListSchema = new Schema(  
  {  
    user: {  
      type: ObjectId,  
      ref: "clientUsers",  
      index: true,  
      required: function () {  
        return !this.isGuest; // Required if not a guest   
      },  
    },  
    isGuest: {  
      type: Boolean,  
      default: false,  
    },  
    sessionId: {  
      type: String,  
      index: true,  
      required: function () {  
        return this.isGuest; // Required for guest   
      },  
    },  
    items: [  
      {  
        productStock: {  
          type: ObjectId,  
          ref: "productStock",  
          required: true,  
        },  
        productMainStock: {  
          type: ObjectId,  
          ref: "productMainStock",  
          required: true,  
        },  
        addedAt: {  
          type: Date,  
          default: Date.now,  
        },  
      },  
    ],  
    expiresAt: {  
      type: Date,  
      index: { expires: "7d" }, // Auto-expire guest wishlist after 7 days  
      default: function () {  
        return this.isGuest ? Date.now() + 7 * 24 * 60 * 60 * 1000 : null;  
      },  
    },  
    createdBy: {  
      type: ObjectId,  
      ref: "clientUsers",  
      index: true,  
    },  
    deletedAt: {  
      type: Date,  
      default: null,  
      index: true,  
    },  
  },  
  { timestamps: true }  
);  

module.exports = wishListSchema;  