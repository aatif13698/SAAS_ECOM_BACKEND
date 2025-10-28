// const bcrypt = require("bcrypt");
// const mongoose = require("mongoose");

// const { Schema } = mongoose;
// const ObjectId = Schema.ObjectId;

// const supplierTransportationSchema = new Schema(
//     {
//         customerId: { type: ObjectId, ref: "supplier", index: true },
//         ewayBillNo: { type: String, default: null },
//         LrNo: { type: String, default: null },
//         vehicleNo: { type: String, default: null },
//         shippingMethod: { type: String, default: null },
//         transportName: { type: String, default: null },
//         transportId: { type: String, default: null },

       
       
//         isDefault: {type: Boolean, default: false},
//         deletedAt: { type: Date, default: null, index: true }, 
//     },
//     { timestamps: true }
// );




// module.exports = supplierTransportationSchema;



const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const supplierTransportationSchema = new Schema(
    {
        /* -------------------------------------------------
        REFERENCE FIELDS
        ------------------------------------------------- */
        supplierId: {
            type: ObjectId,
            ref: "supplier",               // or "User" if supplier is a user
            required: true,
            index: true,
        },
       

        /* -------------------------------------------------
           E-WAY BILL (India)
           ------------------------------------------------- */
        ewayBillNo: { type: String, default: null, index: true },
        ewayBillDate: { type: Date, default: null },
        ewayBillValidUpto: { type: Date, default: null },
        ewayBillStatus: {
            type: String,
            enum: ["generated", "cancelled", "expired", "active"],
            default: null,
        },

        /* -------------------------------------------------
           LORRY RECEIPT (LR) – FULL DETAILS
           ------------------------------------------------- */
        lrDetails: {
            lrNo: { type: String, default: null, index: true },
            lrDate: { type: Date, default: null },

            // Consignor (seller) details – often pre-filled from supplier
            consignor: {
                name: { type: String, default: null },
                gstin: { type: String, default: null },
                address: { type: String, default: null },
                city: { type: String, default: null },
                state: { type: String, default: null },
                pincode: { type: String, default: null },
                contactPerson: { type: String, default: null },
                phone: { type: String, default: null },
                email: { type: String, default: null },
            },

            // Consignee (buyer) details – from invoice
            consignee: {
                name: { type: String, default: null },
                gstin: { type: String, default: null },
                address: { type: String, default: null },
                city: { type: String, default: null },
                state: { type: String, default: null },
                pincode: { type: String, default: null },
                contactPerson: { type: String, default: null },
                phone: { type: String, default: null },
                email: { type: String, default: null },
            },

            // Transporter / Carrier
            transporter: {
                name: { type: String, default: null },
                gstin: { type: String, default: null },
                pan: { type: String, default: null },
                address: { type: String, default: null },
                contactPerson: { type: String, default: null },
                phone: { type: String, default: null },
                email: { type: String, default: null },
                transporterId: { type: String, default: null }, // optional govt ID
            },

            // Vehicle & Driver
            vehicleNo: { type: String, default: null, uppercase: true },
            vehicleType: {
                type: String,
                enum: [
                    "truck",
                    "trailer",
                    "container",
                    "tempo",
                    "pickup",
                    "lcv",
                    "hcv",
                    "other",
                ],
                default: null,
            },
            driverName: { type: String, default: null },
            driverLicenseNo: { type: String, default: null },
            driverPhone: { type: String, default: null },

            // Freight & Charges
            freightCharges: { type: Number, default: 0 },
            freightPaidBy: {
                type: String,
                enum: ["consignor", "consignee", "transporter"],
                default: null,
            },
            hamaliCharges: { type: Number, default: 0 },
            doorDeliveryCharges: { type: Number, default: 0 },
            otherCharges: { type: Number, default: 0 },
            totalFreightAmount: { type: Number, default: 0 },

            // Goods Summary
            noOfPackages: { type: Number, default: 0 },
            packageType: { type: String, default: null }, // carton, pallet, bag, etc.
            actualWeight: { type: Number, default: 0 }, // in KG
            chargedWeight: { type: Number, default: 0 }, // in KG
            weightUnit: { type: String, default: "KG" },

            // Route
            fromPlace: { type: String, default: null },
            toPlace: { type: String, default: null },
            distanceKm: { type: Number, default: 0 },

            // Remarks
            privateMarks: { type: String, default: null },
            remarks: { type: String, default: null },
        },

        /* -------------------------------------------------
           SHIPPING METHOD & INCOTERMS (Global)
           ------------------------------------------------- */
        shippingMethod: {
            type: String,
            enum: [
                "road",
                "rail",
                "air",
                "sea",
                "courier",
                "pipeline",
                "multimodal",
                "self",
            ],
            default: null,
        },
        incoterm: {
            type: String,
            enum: [
                "EXW",
                "FCA",
                "CPT",
                "CIP",
                "DAP",
                "DPU",
                "DDP",
                "FAS",
                "FOB",
                "CFR",
                "CIF",
            ],
            default: null,
        },

        /* -------------------------------------------------
           CONTAINER / AIR / COURIER SPECIFIC
           ------------------------------------------------- */
        containerDetails: {
            containerNo: { type: String, default: null },
            sealNo: { type: String, default: null },
            containerType: { type: String, default: null }, // 20GP, 40HC, etc.
            grossWeight: { type: Number, default: 0 },
            volumeCBM: { type: Number, default: 0 },
        },

        airwayBillNo: { type: String, default: null },
        courierName: { type: String, default: null },
        courierTrackingNo: { type: String, default: null },
        courierTrackingUrl: { type: String, default: null },

        /* -------------------------------------------------
           TRACKING & STATUS
           ------------------------------------------------- */
        trackingUrl: { type: String, default: null },
        currentStatus: {
            type: String,
            enum: [
                "booked",
                "in-transit",
                "arrived-at-destination",
                "delivered",
                "cancelled",
                "returned",
            ],
            default: "booked",
        },
        statusHistory: [
            {
                status: { type: String, required: true },
                timestamp: { type: Date, default: Date.now },
                location: { type: String, default: null },
                remarks: { type: String, default: null },
            },
        ],

        /* -------------------------------------------------
           DOCUMENTS (URLs or GridFS references)
           ------------------------------------------------- */
        documents: {
            lrCopy: { type: String, default: null }, // URL or ObjectId
            ewayBillPdf: { type: String, default: null },
            invoiceCopy: { type: String, default: null },
            packingList: { type: String, default: null },
            insuranceCopy: { type: String, default: null },
            otherDocs: [{ name: String, url: String }],
        },

        /* -------------------------------------------------
           META / CONTROL
           ------------------------------------------------- */
        isDefault: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        deletedAt: { type: Date, default: null, index: true },
    },
    { timestamps: true }
);




module.exports = supplierTransportationSchema;
