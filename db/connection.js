const mongoose = require('mongoose');

const User = require("../model/user");
const { ObjectId } = mongoose.Types; // Import ObjectId


require('dotenv').config();

const ConnectDb = async (DATABASE_URL) => {
    try {
        const DB_OPTION = { dbName: "SAAS_ECOM" };
        await mongoose.connect(DATABASE_URL, DB_OPTION);
        console.log("Main database connected successfully...");
    } catch (error) {
        console.error("Error connecting main database:", error);
    }
};

// Cache for active client connections
const clientConnections = {};


// Function to create or retrieve a database connection for a specific client
const createClientDatabase = async (clientId) => {
    // Check if the client connection already exists
    if (clientConnections[clientId]) {
        return clientConnections[clientId];
    }

    // Append the client-specific database name to the base URL
    const clientDatabaseUrl = `${process.env.DATABASE_URL}client_${clientId}?retryWrites=true&w=majority`;

    // Create a new database connection for the client
    const clientConnection = mongoose.createConnection(clientDatabaseUrl, {});

    clientConnections[clientId] = clientConnection;

    return clientConnection;
};



// In-memory connection pool
const connectionPool = new Map();

const getClientDatabaseConnection = async (clientId) => {

    

    if (connectionPool.has(clientId)) {
        // Reuse existing connection if available
        return connectionPool.get(clientId);
    }

    
    const objectId = new ObjectId(clientId);

    // Create a new connection if none exists
    const clientData = await User.findById( objectId );


    if (!clientData) throw new Error('Client not found');

    // Append the client-specific database name to the base URL
    const clientDatabaseUrl = `${process.env.DATABASE_URL}client_${clientId}?retryWrites=true&w=majority`;

    const clientConnection = mongoose.createConnection(clientDatabaseUrl, {});

    // Store the connection in the pool
    connectionPool.set(clientId, clientConnection);

    // Optionally set a timeout to close the connection if idle
    // setTimeout(() => {
    //     if (connectionPool.has(clientId)) {
    //         connectionPool.get(clientId).close();
    //         connectionPool.delete(clientId);
    //     }
    // }, 10 * 60 * 1000); // Close after 10 minutes of inactivity

    return clientConnection;

};

module.exports = { ConnectDb, createClientDatabase, getClientDatabaseConnection };
