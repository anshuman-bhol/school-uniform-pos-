const express = require("express");

const {
    addTailor,
    getTailors,
    updateTailor,
} = require("../controllers/tailorController");

const {
    isVerifiedUser,
} = require("../middlewares/tokenVerification");

const router = express.Router();

router
    .route("/")
    .post(isVerifiedUser, addTailor)
    .get(isVerifiedUser, getTailors);

router
    .route("/:id")
    .put(isVerifiedUser, updateTailor);

module.exports = router;