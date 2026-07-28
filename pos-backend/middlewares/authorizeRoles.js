const createHttpError = require("http-errors");

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(
                createHttpError(
                    401,
                    "Please login first."
                )
            );
        }

        console.log("Logged in role:", req.user.role);
console.log("Allowed roles:", allowedRoles);
        if (!allowedRoles.includes(req.user.role)) {
            return next(
                createHttpError(
                    403,
                    "You are not authorized to perform this action."
                )
            );
        }

        next();
    };
};

module.exports = authorizeRoles;