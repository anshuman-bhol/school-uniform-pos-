const express = require("express");

const router = express.Router();

const {
    downloadCatalogueTemplate,
    downloadStockTemplate,
} = require("../controllers/templateController");

router.get(
    "/catalogue",
    downloadCatalogueTemplate
);

router.get(
    "/stock",
    downloadStockTemplate
);

module.exports = router;