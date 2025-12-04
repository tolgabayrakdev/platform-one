import HttpException from "../exceptions/http-exception.js";
import logger from "../config/logger.js";

export default function errorHandler(err, req, res, _next) {
    if (err instanceof HttpException) {
        logger.warn(`${req.method} ${req.url} - ${err.status} - ${err.message}`);
        return res.status(err.status).json({ message: err.message });
    }

    logger.error(`${req.method} ${req.url} - 500 - ${err.message}`);
    res.status(500).json({ message: "Internal server error" });
}