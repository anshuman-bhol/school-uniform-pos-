const createHttpError = require("http-errors");

const isAdmin = (req, res, next) => {

    if (!req.user) {
        return next(createHttpError(401, "Unauthorized"));
    }

    if (req.user.role !== "admin") {
        return next(
            createHttpError(
                403,
                "Access denied. Only administrators can perform this action."
            )
        );
    }

    next();
};

module.exports = {
    isAdmin,
};