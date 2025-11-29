// generatePOpdf.js
const PDFDocument = require('pdfkit');
const PDFTable = require('pdfkit-table');

async function generatePurchaseOrderPDF(poData, companyInfo = {}) {
  return new Promise(async (resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const pageWidth = doc.page.width;
    const primaryColor = '#1a1a1a';
    const secondaryColor = '#444444';

    // Helper: Draw line
    const drawLine = (y) => {
      doc.moveTo(50, y).lineTo(pageWidth - 50, y).stroke('#eeeeee');
    };

    // Header
    doc.font('Helvetica-Bold').fontSize(24).fillColor(primaryColor).text('PURCHASE ORDER', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor(secondaryColor).text(`PO Number: ${poData.poNumber}`, { align: 'right' });
    doc.text(`PO Date: ${new Date(poData.poDate).toLocaleDateString('en-IN')}`, { align: 'right' });
    doc.moveDown(1);

    // Company & Supplier Info Side by Side
    const startY = doc.y;
    const halfWidth = (pageWidth - 100) / 2;

    // Your Company Info (customize this)
    doc.font('Helvetica-Bold').fontSize(14).fillColor(primaryColor).text(companyInfo.name || 'Your Company Name', 50, startY);
    doc.font('Helvetica').fontSize(10).fillColor('#333');
    doc.text(companyInfo.address || '123 Business Street, City, State - 713301');
    doc.text(companyInfo.phone || '+91 98765 43210');
    doc.text(companyInfo.email || 'purchase@yourcompany.com');
    doc.text(`GSTIN: ${companyInfo.gstin || '19AAAAA0000A1Z5'}`);

    // Supplier Info
    const supplierY = startY;
    doc.font('Helvetica-Bold').fontSize(14).fillColor(primaryColor).text('Supplier', 50 + halfWidth + 20, supplierY);
    doc.font('Helvetica').fontSize(10);
    doc.text(poData.shippingAddress.fullName);
    doc.text(poData.shippingAddress.address);
    doc.text(`${poData.shippingAddress.city}, ${poData.shippingAddress.state}`);
    doc.text(`PIN: ${poData.shippingAddress.ZipCode}`);
    doc.text(`Phone: ${poData.shippingAddress.phone}`);
    // You'll need to populate supplier email separately if not in shippingAddress
    // doc.text(`Email: supplier@example.com`);

    doc.moveDown(2);
    drawLine(doc.y);
    doc.moveDown(1);

    // Items Table
    const table = {
      headers: [
        { label: "Sr.No", headerColor: "#f0f0f0", width: 40 },
        { label: "Item Name", headerColor: "#f0f0f0", width: 180 },
        { label: "Qty", headerColor: "#f0f0f0", width: 50, align: "right" },
        { label: "MRP", headerColor: "#f0f0f0", width: 70, align: "right" },
        { label: "Disc.", headerColor: "#f0f0f0", width: 60, align: "right" },
        { label: "Taxable Amt", headerColor: "#f0f0f0", width: 90, align: "right" },
        { label: "IGST %", headerColor: "#f0f0f0", width: 60, align: "right" },
        { label: "Tax Amount", headerColor: "#f0f0f0", width: 80, align: "right" },
        { label: "Total", headerColor: "#f0f0f0", width: 100, align: "right" },
      ],
      rows: poData.items.map(item => [
        item.srNo.toString(),
        item.itemName.name,
        item.quantity.toString(),
        item.mrp.toLocaleString('en-IN'),
        item.discount.toLocaleString('en-IN'),
        item.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
        item.igstPercent + "%",
        item.tax.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
        item.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      ]),
    };

    await doc.table(table, {
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(9),
      prepareRow: () => doc.font("Helvetica").fontSize(9),
      x: 50,
      y: doc.y,
      columnSpacing: 5,
    });

    doc.moveDown(2);

    // Total Summary
    const totalY = doc.y;
    doc.font('Helvetica-Bold').fontSize(12).fillColor(primaryColor);
    doc.text('Total Order Amount:', pageWidth - 250, totalY);
    doc.text(`₹${poData.totalOrderAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, { align: 'right' });

    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#333');
    doc.text(`Paid Amount: ₹${poData.paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
    doc.text(`Balance Due: ₹${poData.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, { align: 'right' });

    doc.moveDown(2);

    // Bank Details
    if (poData.bankDetails) {
      doc.font('Helvetica-Bold').fontSize(12).text('Bank Details for Payment:');
      doc.font('Helvetica').fontSize(10);
      doc.text(`Bank: ${poData.bankDetails.bankName}`);
      doc.text(`A/c No: ${poData.bankDetails.accountNumber}`);
      doc.text(`IFSC: ${poData.bankDetails.ifscCode}`);
      doc.text(`Branch: ${poData.bankDetails.branch}`);
    }

    doc.moveDown(2);

    // Notes
    if (poData.notes) {
      doc.font('Helvetica-Bold').fontSize(11).text('Notes:');
      doc.font('Helvetica').fontSize(10).text(poData.notes);
    }

    // Footer
    doc.moveDown(4);
    drawLine(doc.y - 10);
    doc.fontSize(9).fillColor('#666').text('This is a computer-generated Purchase Order.', { align: 'center' });

    doc.end();
  });
}

module.exports = { generatePurchaseOrderPDF };