const createHttpError = require("http-errors");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const config = require("../config/config");

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || "";
        const bearerToken = authHeader.startsWith("Bearer ")
            ? authHeader.slice(7).trim()
            : "";
        const accessToken = req.cookies?.accessToken || bearerToken;

        if (!accessToken) {
            return next(createHttpError(401, "Authentication required"));
        }

        const decodedToken = jwt.verify(accessToken, config.accessTokenSecret);
        const user = await User.findById(decodedToken._id).select("-password");

        if (!user) {
            return next(createHttpError(401, "User not found"));
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return next(createHttpError(401, "Session expired. Please login again."));
        }

        return next(createHttpError(401, "Invalid or expired token"));
    }
};

module.exports = authenticate;
