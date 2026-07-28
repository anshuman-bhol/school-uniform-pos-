const express = require("express");

const router = express.Router();

const {
    isVerifiedUser,
} = require("../middlewares/tokenVerification");

const authorizeRoles = require("../middlewares/authorizeRoles");

const {
    createReturn,
    createExchange,
} = require("../controllers/returnExchangeController");

router.post(
    "/return",
    isVerifiedUser,
    authorizeRoles(
        "admin",
        "manager",
        "cashier",
    ),
    createReturn
);

router.post(
    "/exchange",
    isVerifiedUser,
    createExchange
);


module.exports = router;