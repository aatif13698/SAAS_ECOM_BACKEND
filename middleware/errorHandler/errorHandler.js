const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500; // Default to Internal Server Error
    const message = err.message || "An unexpected error occurred";

    // Log the error for debugging purposes
    console.error("Error:", err);

    // Send a JSON response
    res.status(statusCode).json({
        status: false,
        message,
    });
};

module.exports = errorHandler;
