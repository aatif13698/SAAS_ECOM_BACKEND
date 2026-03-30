// queues/auditAgenda.js

// env setup
const dotnev = require("dotenv");
dotnev.config();
let agendaInstance;

const getAgenda = async () => {
    if (agendaInstance) return agendaInstance;

    const { Agenda } = await import('agenda');
    const { MongoBackend } = await import('@agendajs/mongo-backend');

    // Create MongoDB client connection (using your existing env)
    const { MongoClient } = await import('mongodb');
    const client = await MongoClient.connect(process.env.DATABASE_URL);
    const db = client.db('SAAS_ECOM');  // uses default database from your URI

    agendaInstance = new Agenda({
        backend: new MongoBackend({
            mongo: db,
            ensureIndex: true,
            sort: { nextRunAt: 'asc', priority: 'desc' }
        }),
        processEvery: '3 seconds',
        maxConcurrency: 5,
        defaultConcurrency: 5,
        defaultLockLifetime: 15 * 60 * 1000   // 15 minutes
    });

    agendaInstance.on('ready', () => console.log('✅ Agenda started - Audit worker ready'));
    agendaInstance.on('error', (err) => console.error('❌ Agenda error:', err));

    return agendaInstance;
};

module.exports = { getAgenda };