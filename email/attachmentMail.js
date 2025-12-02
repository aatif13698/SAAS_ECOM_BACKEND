// emailService.js
const nodemailer = require("nodemailer");
const path = require("path");
const hbs = require("nodemailer-express-handlebars");
const { generatePurchaseOrderPDF } = require("../helper/pdftGenerator");

const handlebarsOptions = {
    viewEngine: {
        extName: ".handlebars",
        partialsDir: path.resolve("./views"),
        layoutsDir: path.resolve("./views"),
        defaultLayout: false,
    },
    viewPath: path.resolve("./views"),
    extName: ".handlebars",
};

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER || "aatif13698@gmail.com",
        pass: process.env.EMAIL_PASS || "eipk htri oycv ibik", // use env in production!
    },
});

transporter.use("compile", hbs(handlebarsOptions));

exports.formatCustomDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

// MAIN FUNCTION: Send PO with PDF + Beautiful HTML Email
exports.sendPurchaseOrderEmail = async (poData, supplierEmail, supplierName = "Valued Supplier") => {
    try {
        // Generate PDF Buffer
        const pdfBuffer = await generatePurchaseOrderPDF(poData, {
            name: "ABC Traders Pvt Ltd",
            address: "Asansol, West Bengal",
            gstin: "19AAAAA0000A1Z5",
            phone: "+91 9876543210",
            email: "purchase@yourcompany.com"
        });

        const mailOptions = {
            from: `"Your Company Name" <${process.env.EMAIL_USER}>`,
            to: supplierEmail,
            subject: `Purchase Order ${poData.poNumber} - ₹${poData.totalOrderAmount.toLocaleString('en-IN')} - Please Confirm`,
            template: "purchase-order-email", // name of .handlebars file (without extension)
            context: {
                appName: "Your Company",
                companyName: "Your Company Name",
                companyEmail: "purchase@yourcompany.com",
                poNumber: poData.poNumber,
                formattedDate: exports.formatCustomDate(poData.poDate),
                supplierName: supplierName || poData.shippingAddress.fullName,
                totalAmount: poData.totalOrderAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
                balance: poData.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
                paymentMethod: poData.paymentMethod?.toUpperCase(),
                year: new Date().getFullYear(),
                items: poData.items.map(item => ({
                    itemName: item.itemName.name,
                    quantity: item.quantity,
                    mrp: item.mrp.toLocaleString('en-IN'),
                    totalAmount: item.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })
                }))
            },
            attachments: [
                {
                    filename: `Purchase_Order_${poData.poNumber}.pdf`,
                    content: pdfBuffer,
                    contentType: "application/pdf"
                }
            ]
        };

        await transporter.sendMail(mailOptions);
        console.log(`Purchase Order ${poData.poNumber} sent to ${supplierEmail}`);
    } catch (error) {
        console.error("Failed to send PO email:", error);
        throw error;
    }
}