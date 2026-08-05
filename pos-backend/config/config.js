const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

const config = Object.freeze({
    port: process.env.PORT || 3000,
    databaseURI: process.env.MONGODB_URI || "mongodb://localhost:2703",
    nodeEnv: process.env.NODE_ENV || "development",

    accessTokenSecret: process.env.JWT_SECRET,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
});

module.exports = config;