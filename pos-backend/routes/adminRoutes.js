const express = require("express");

const router = express.Router();
const {getUsers, approveUser, rejectUser,} = require("../controllers/adminController");
const {isVerifiedUser,} = require("../middlewares/tokenVerification");
const {isAdmin,} = require("../middlewares/adminMiddleware");

router.get(
    "/users",
    isVerifiedUser,
    isAdmin,
    getUsers
);
router.put(
    "/approve/:id",
    isVerifiedUser,
    isAdmin,
    approveUser
);

router.put(
    "/reject/:id",
    isVerifiedUser,
    isAdmin,
    rejectUser
);

module.exports = router;