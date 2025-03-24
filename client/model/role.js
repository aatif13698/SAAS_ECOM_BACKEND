const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.ObjectId

const clientRoleSchema = new mongoose.Schema({
    id: { type: Number },
    name: { type: String, trim: true, require: true },
    capability: {
        type: [
            {
                name: { type: String, required: true }, // Capability name
                access: { type: Boolean, default: false },
                menu: {
                    type: [
                        {
                            name: { type: String, required: true },
                            displayName: { type: String, default: null },
                            access: { type: Boolean, default: false },
                            subMenus: {
                                // list: {
                                //     id: { type: Number, require: true },
                                //     access: { type: Boolean, default: false },
                                //     api: { type: String, default: null },
                                // },
                                create: {
                                    id: { type: Number, require: true },
                                    access: { type: Boolean, default: false },
                                    api: { type: String, default: null },
                                },
                                view: {
                                    id: { type: Number, require: true },
                                    access: { type: Boolean, default: false },
                                    api: { type: String, default: null },
                                },
                                update: {
                                    id: { type: Number, require: true },
                                    access: { type: Boolean, default: false },
                                    api: { type: String, default: null },
                                },
                                softDelete: {
                                    id: { type: Number, require: true },
                                    access: { type: Boolean, default: false },
                                    api: { type: String, default: null },
                                },
                                // hardDelete: {
                                //     id: { type: Number, require: true },
                                //     access: { type: Boolean, default: false },
                                //     api: { type: String, default: null },
                                // },
                                activeActive: {
                                    id: { type: Number, require: true },
                                    access: { type: Boolean, default: false },
                                    api: { type: String, default: null },
                                },
                            }
                        }
                    ],
                    default: []
                },
            },
        ],
        default: [], // Default to an empty array
    },
    createdBy : { type: ObjectId, ref: "clientUsers", default:null, index: true },
    isActive: { type: Number, default: 1 },
    deletedAt: { type: Date, default: null, index: true }, 
}, { timestamps: true });



module.exports = clientRoleSchema;
