

// const { getAgenda } = require('../queues/auditAgenda');
// const { auditItem } = require('../helper/inventoryHelper');  
// const purchaseInvoiceSchema = require('../client/model/purchaseInvoice');
// const { getClientDatabaseConnection } = require('../db/connection');
// // Define the job
// (async () => {
//     const agenda = await getAgenda();

//     agenda.define('audit-purchase-invoice', async (job) => {
//         const { clientId, invoiceId, createdBy } = job.attrs.data;
//         const startTime = Date.now();

//         try {
//             console.log(`🚀 Starting audit for invoice ${invoiceId} (client: ${clientId})`);

//             const clientConnection = await getClientDatabaseConnection(clientId);
//             console.log("444", clientConnection);

//             const PurchaseInvoice = clientConnection.model('purchaseInvoice', purchaseInvoiceSchema);

//             const invoice = await PurchaseInvoice.findById(invoiceId);
//             console.log("555", invoice);

//             if (!invoice) throw new Error('Invoice not found');

//             if (invoice.auditStatus === 'pending') {
//                 invoice.auditStatus = 'in-progress';
//                 await invoice.save();
//             }

//             const nonAuditedItems = invoice.items.filter(item => !item.audited);

//             for (let i = 0; i < nonAuditedItems.length; i++) {
//                 const item = nonAuditedItems[i];
//                 const productMainStockId = item.itemName.productMainStock;

//                 await auditItem(clientId, invoiceId, productMainStockId, { _id: createdBy });

//                 const progress = Math.round(((i + 1) / nonAuditedItems.length) * 100);
//                 job.progress(progress);

//                 console.log(`   ✅ Audited item ${i + 1}/${nonAuditedItems.length} for invoice ${invoiceId}`);
//             }

//             console.log(`🎉 Audit completed for invoice ${invoiceId} in ${Date.now() - startTime}ms`);
//         } catch (error) {
//             console.error(`❌ Audit failed for invoice ${invoiceId}:`, error);
//             throw error; // Agenda will retry
//         }
//     });

//     await agenda.start();
//     console.log('✅ Agenda audit worker is running...');
// })();

// // Graceful shutdown
// process.on('SIGTERM', async () => {
//     console.log('🛑 Shutting down Agenda worker...');
//     const agenda = await getAgenda();
//     await agenda.stop();
//     process.exit(0);
// });



// worker/auditAgendaWorker.js

require('dotenv').config();                    // ← Load env variables

// === CRITICAL: Initialize MAIN database connection FIRST ===
const { ConnectDb } = require('../db/connection');
const { getClientDatabaseConnection } = require('../db/connection');

// Connect to main database before doing anything else
(async () => {
    try {
        await ConnectDb(process.env.DATABASE_URL);
        console.log('✅ Main database connected in worker...');
    } catch (err) {
        console.error('❌ Failed to connect main database in worker:', err);
        process.exit(1);
    }
})();

// Now import everything else
const { getAgenda } = require('../queues/auditAgenda');
const { auditItem, auditItemForSale } = require('../helper/inventoryHelper');
const purchaseInvoiceSchema = require('../client/model/purchaseInvoice');
const saleInvoiceSchema = require('../client/model/saleInvoice');

// Define the job
(async () => {
    const agenda = await getAgenda();

    agenda.define('audit-purchase-invoice', async (job) => {
        const { clientId, invoiceId, createdBy } = job.attrs.data;
        const startTime = Date.now();

        try {
            console.log(`🚀 Starting audit for invoice ${invoiceId} (client: ${clientId})`);

            const clientConnection = await getClientDatabaseConnection(clientId);
            const PurchaseInvoice = clientConnection.model('purchaseInvoice', purchaseInvoiceSchema);

            const invoice = await PurchaseInvoice.findById(invoiceId);
            if (!invoice) throw new Error('Invoice not found');

            if (invoice.auditStatus === 'pending') {
                invoice.auditStatus = 'in-progress';
                await invoice.save();
            }

            const nonAuditedItems = invoice.items.filter(item => !item.audited);

            for (let i = 0; i < nonAuditedItems.length; i++) {
                const item = nonAuditedItems[i];
                const productMainStockId = item.itemName.productMainStock;

                await auditItem(clientId, invoiceId, productMainStockId, { _id: createdBy });

                const progress = Math.round(((i + 1) / nonAuditedItems.length) * 100);
                await job.touch(progress);                    // ← Progress reporting for Agenda v6

                console.log(`   ✅ Audited item ${i + 1}/${nonAuditedItems.length} for invoice ${invoiceId}`);
            }

            console.log(`🎉 Audit completed for invoice ${invoiceId} in ${Date.now() - startTime}ms`);
        } catch (error) {
            console.error(`❌ Audit failed for invoice ${invoiceId}:`, error);
            throw error; // Agenda will retry automatically
        }
    });

    // sale invoice
     agenda.define('audit-sale-invoice', async (job) => {
        const { clientId, invoiceId, createdBy } = job.attrs.data;
        const startTime = Date.now();

        try {
            console.log(`🚀 Starting audit for invoice ${invoiceId} (client: ${clientId})`);

            const clientConnection = await getClientDatabaseConnection(clientId);
            const SaleInvoice = clientConnection.model('saleInvoice', saleInvoiceSchema);
            

            const invoice = await SaleInvoice.findById(invoiceId);
            if (!invoice) throw new Error('Invoice not found');

            if (invoice.auditStatus === 'pending') {
                invoice.auditStatus = 'in-progress';
                await invoice.save();
            }

            const nonAuditedItems = invoice.items.filter(item => !item.audited);

            for (let i = 0; i < nonAuditedItems.length; i++) {
                const item = nonAuditedItems[i];
                const productMainStockId = item.itemName.productMainStock;

                await auditItemForSale(clientId, invoiceId, productMainStockId, { _id: createdBy });

                const progress = Math.round(((i + 1) / nonAuditedItems.length) * 100);
                await job.touch(progress);                    // ← Progress reporting for Agenda v6

                console.log(`   ✅ Audited item ${i + 1}/${nonAuditedItems.length} for invoice ${invoiceId}`);
            }

            console.log(`🎉 Audit completed for invoice ${invoiceId} in ${Date.now() - startTime}ms`);
        } catch (error) {
            console.error(`❌ Audit failed for invoice ${invoiceId}:`, error);
            throw error; // Agenda will retry automatically
        }
    });

    await agenda.start();
    console.log('✅ Agenda audit worker is running...');
})();

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🛑 Shutting down Agenda worker...');
    const agenda = await getAgenda();
    await agenda.stop();
    process.exit(0);
});