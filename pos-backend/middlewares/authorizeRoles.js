const createHttpError = require("http-errors");

const authorizeRoles = (...allowedRoles) => {
    const normalizedAllowedRoles = allowedRoles.map((role) => role?.toLowerCase());

    return (req, res, next) => {
        if (!req.user || typeof req.user !== "object") {
            return next(createHttpError(401, "Authentication required"));
        }

        const userRole = req.user.role?.toLowerCase();

        if (!normalizedAllowedRoles.includes(userRole)) {
            return next(
                createHttpError(403, "Access denied. Insufficient permissions.")
            );
        }

        next();
    };
};

module.exports = authorizeRoles;