
// const puppeteer = require('puppeteer');
// const handlebars = require('handlebars');
// const fs = require('fs').promises;
// const path = require('path');

// async function generatePurchaseOrderPDF(poData, companyInfo = {}) {
//   try {
//     // Compile Handlebars template (FIX: Adjust path to root-level views folder)
//     const templatePath = path.join(__dirname, '..', 'views', 'purchase-order-pdf.hbs');
//     const templateSource = await fs.readFile(templatePath, 'utf8');
//     const template = handlebars.compile(templateSource);

//     // Prepare context (reuses your email-like structure; fixes supplier from poData.supplier)
//     const context = {
//       poNumber: poData.poNumber,
//       formattedDate: new Date(poData.poDate).toLocaleDateString('en-IN'),
//       companyName: companyInfo.name || 'Your Company Name',
//       companyAddress: companyInfo.address || '123 Business Street, City, State - 713301',
//       companyPhone: companyInfo.phone || '+91 98765 43210',
//       companyEmail: companyInfo.email || 'purchase@yourcompany.com',
//       companyGstin: companyInfo.gstin || '19AAAAA0000A1Z5',
//       supplierName: poData.supplier?.name || 'Supplier',
//       supplierAddress: poData.supplier?.address || '',
//       supplierCity: poData.supplier?.city || '',
//       supplierState: poData.supplier?.state || '',
//       supplierZipCode: poData.supplier?.ZipCode || '',
//       supplierPhone: poData.supplier?.contactNumber || '',
//       supplierEmail: poData.supplier?.emailContact || '',
//       items: poData.items.map(item => ({
//         srNo: item.srNo,
//         itemName: item.itemName.name,
//         quantity: item.quantity,
//         mrp: item.mrp.toLocaleString('en-IN'),
//         discount: item.discount.toLocaleString('en-IN'),  // Add '%' if it's a percentage
//         taxableAmount: item.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
//         igstPercent: item.igstPercent,
//         tax: item.tax.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
//         totalAmount: item.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })
//       })),
//       totalAmount: poData.totalOrderAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
//       paidAmount: poData.paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
//       balance: poData.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
//       paymentMethod: poData.paymentMethod?.toUpperCase() || 'CASH',
//       bankDetails: poData.bankDetails,
//       notes: poData.notes
//     };

//     const html = template(context);

//     // Render to PDF with Puppeteer
//     const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });  // Production args for stability
//     const page = await browser.newPage();
//     await page.setContent(html, { waitUntil: 'networkidle0' });

//     const pdfBuffer = await page.pdf({
//       format: 'A4',
//       printBackground: true,
//       margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
//       displayHeaderFooter: false  // Customize if needed
//     });

//     await browser.close();
//     return pdfBuffer;
//   } catch (error) {
//     console.error('PDF Generation Error:', error);
//     throw new Error(`Failed to generate PDF: ${error.message}`);
//   }
// }

// module.exports = { generatePurchaseOrderPDF };




// helper/generatePOpdf.js

// const puppeteer = require('puppeteer');
// const handlebars = require('handlebars');
// const fs = require('fs').promises;
// const path = require('path');

// async function generatePurchaseOrderPDF(poData, companyInfo = {}) {
//   try {
//     // Reliable path from project root
//     const templatePath = path.resolve(process.cwd(), 'views', 'purchase-order-pdf.hbs');

//     console.log('Looking for template at:', templatePath); // Remove in production

//     const templateSource = await fs.readFile(templatePath, 'utf8');
//     const template = handlebars.compile(templateSource);

//     // Compute totals for the summary section
//     const totalTaxableAmount = poData.items.reduce((sum, item) => sum + item.taxableAmount, 0);
//     const totalCGST = poData.items.reduce((sum, item) => sum + item.cgst, 0);
//     const totalSGST = poData.items.reduce((sum, item) => sum + item.sgst, 0);
//     const totalIGST = poData.items.reduce((sum, item) => sum + item.igst, 0);
//     const totalTaxAmount = poData.items.reduce((sum, item) => sum + item.tax, 0);

//     // Prepare context
//     const context = {
//       poNumber: poData.poNumber,
//       formattedDate: new Date(poData.poDate).toLocaleDateString('en-IN'),
//       companyName: companyInfo.name || 'ABC Traders Pvt Ltd',
//       companyAddress: companyInfo.address || 'Asansol, West Bengal',
//       companyPhone: companyInfo.phone || '+91 9876543210',
//       companyEmail: companyInfo.email || 'purchase@yourcompany.com',
//       companyGstin: companyInfo.gstin || '19AAAAA0000A1Z5',
//       supplierName: poData.supplier?.name || 'Valued Supplier',
//       supplierAddress: poData.supplier?.address || '',
//       supplierCity: poData.supplier?.city || '',
//       supplierState: poData.supplier?.state || '',
//       supplierZipCode: poData.supplier?.ZipCode || '',
//       supplierPhone: poData.supplier?.contactNumber || '',
//       supplierEmail: poData.supplier?.emailContact || '',
//       isInterState: poData.isInterState || false,
//       items: poData.items.map(item => ({
//         srNo: item.srNo,
//         itemName: item.itemName.name,
//         quantity: item.quantity,
//         mrp: item.mrp.toLocaleString('en-IN'),
//         discount: item.discount.toLocaleString('en-IN'),
//         taxableAmount: item.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
//         cgstPercent: item.cgstPercent,
//         sgstPercent: item.sgstPercent,
//         igstPercent: item.igstPercent,
//         cgst: item.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
//         sgst: item.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
//         igst: item.igst.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
//         tax: item.tax.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
//         totalAmount: item.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })
//       })),
//       totalTaxableAmount: totalTaxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
//       totalCGST: totalCGST.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
//       totalSGST: totalSGST.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
//       totalIGST: totalIGST.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
//       totalTaxAmount: totalTaxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
//       grandTotal: poData.totalOrderAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
//       paidAmount: poData.paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
//       balance: poData.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
//       paymentMethod: poData.paymentMethod?.toUpperCase() || 'CASH',
//       bankDetails: poData.bankDetails,
//       notes: poData.notes
//     };

//     context.isInterState = !!poData.isInterState; // true = Intra-state (CGST+SGST), false = Inter-state (IGST)

//     const html = template(context);

//     const browser = await puppeteer.launch({
//       headless: 'new',
//       args: ['--no-sandbox', '--disable-setuid-sandbox']
//     });
//     const page = await browser.newPage();
//     await page.setContent(html, { waitUntil: 'networkidle0' });

//     const pdfBuffer = await page.pdf({
//       format: 'A4',
//       printBackground: true,
//       margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
//     });

//     await browser.close();
//     return pdfBuffer;

//   } catch (error) {
//     console.error('PDF Generation Failed:', error.message);
//     console.error('Template path was:', path.resolve(process.cwd(), 'views', 'purchase-order-pdf.hbs'));
//     throw new Error(`PDF generation failed: ${error.message}`);
//   }
// }

// module.exports = { generatePurchaseOrderPDF };


const puppeteer = require('puppeteer-core');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

async function generatePurchaseOrderPDF(poData, companyInfo = {}) {
  try {
    // Reliable path from project root
    const templatePath = path.resolve(process.cwd(), 'views', 'purchase-order-pdf.hbs');

    console.log('Looking for template at:', templatePath); // Remove in production

    const templateSource = await fs.readFile(templatePath, 'utf8');
    const template = handlebars.compile(templateSource);

    // Compute totals for the summary section
    const totalTaxableAmount = poData.items.reduce((sum, item) => sum + item.taxableAmount, 0);
    const totalCGST = poData.items.reduce((sum, item) => sum + item.cgst, 0);
    const totalSGST = poData.items.reduce((sum, item) => sum + item.sgst, 0);
    const totalIGST = poData.items.reduce((sum, item) => sum + item.igst, 0);
    const totalTaxAmount = poData.items.reduce((sum, item) => sum + item.tax, 0);

    // Prepare context
    const context = {
      poNumber: poData.poNumber,
      formattedDate: new Date(poData.poDate).toLocaleDateString('en-IN'),
      companyName: companyInfo.name || 'ABC Traders Pvt Ltd',
      companyAddress: companyInfo.address || 'Asansol, West Bengal',
      companyPhone: companyInfo.phone || '+91 9876543210',
      companyEmail: companyInfo.email || 'purchase@yourcompany.com',
      companyGstin: companyInfo.gstin || '19AAAAA0000A1Z5',
      supplierName: poData.supplier?.name || 'Valued Supplier',
      supplierAddress: poData.supplier?.address || '',
      supplierCity: poData.supplier?.city || '',
      supplierState: poData.supplier?.state || '',
      supplierZipCode: poData.supplier?.ZipCode || '',
      supplierPhone: poData.supplier?.contactNumber || '',
      supplierEmail: poData.supplier?.emailContact || '',

      shippingName: poData.shippingAddress?.fullName || 'Valued Supplier',
      shippingAddress: poData.shippingAddress?.address || '',
      shippingCity: poData.shippingAddress?.city || '',
      shippingState: poData.shippingAddress?.state || '',
      shippingZipCode: poData.shippingAddress?.ZipCode || '',
      shippingPhone: poData.shippingAddress?.phone || '',

      isInterState: poData.isInterState || false,
      items: poData.items.map(item => ({
        srNo: item.srNo,
        itemName: item.itemName.name,
        quantity: item.quantity,
        mrp: item.mrp.toLocaleString('en-IN'),
        discount: item.discount.toLocaleString('en-IN'),
        taxableAmount: item.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
        cgstPercent: item.cgstPercent,
        sgstPercent: item.sgstPercent,
        igstPercent: item.igstPercent,
        cgst: item.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
        sgst: item.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
        igst: item.igst.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
        tax: item.tax.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
        totalAmount: item.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })
      })),
      totalTaxableAmount: totalTaxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      totalCGST: totalCGST.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      totalSGST: totalSGST.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      totalIGST: totalIGST.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      totalTaxAmount: totalTaxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      grandTotal: poData.totalOrderAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      paidAmount: poData.paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      balance: poData.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      paymentMethod: poData.paymentMethod?.toUpperCase() || 'CASH',
      bankDetails: poData.bankDetails,
      notes: poData.notes
    };

    context.isInterState = !!poData.isInterState; // true = Intra-state (CGST+SGST), false = Inter-state (IGST)

    const html = template(context);

    // NEW: Auto-detect executablePath based on OS (real-world robustness)
    let executablePath = process.env.CHROME_BIN;
    if (!executablePath) {
      console.log('No CHROME_BIN env var set. Auto-detecting based on OS...');
      if (process.platform === 'darwin') {  // macOS
        executablePath = '/opt/homebrew/bin/chromium';  // Apple Silicon (M1+)
        // Fallback for Intel: '/usr/local/bin/chromium'
        if (!require('fs').existsSync(executablePath)) {
          executablePath = '/usr/local/bin/chromium';
        }
        if (!require('fs').existsSync(executablePath)) {
          throw new Error('Chromium not found on macOS. Install via: brew install chromium');
        }
      } else if (process.platform === 'linux') {  // Linux/DOAP
        executablePath = '/usr/bin/chromium-browser';
      } else if (process.platform === 'win32') {  // Windows
        executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
      } else {
        throw new Error(`Unsupported platform: ${process.platform}. Set CHROME_BIN manually.`);
      }
    }
    console.log(`Using Chrome executable at: ${executablePath}`);  // Debug log

    const browser = await puppeteer.launch({
      headless: 'new',
      executablePath: executablePath,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'  // Container stability
      ]
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });

    await browser.close();
    console.log('PDF generated successfully');  // Success log
    return pdfBuffer;

  } catch (error) {
    console.error('PDF Generation Failed:', error.message);
    console.error('Template path was:', path.resolve(process.cwd(), 'views', 'purchase-order-pdf.hbs'));
    console.error('Platform:', process.platform);  // Debug: Helps diagnose OS issues
    throw new Error(`PDF generation failed: ${error.message}`);
  }
}

module.exports = { generatePurchaseOrderPDF };