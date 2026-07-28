const XLSX = require("xlsx");
const fs = require("fs");
const Product = require("../models/productModel");
const StockHistory = require("../models/stockHistoryModel");
const { parseCatalogueExcel, } = require("../helpers/catalogueHelper");

const uploadCatalogue = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Excel file required",
            });
        }
        const rows = parseCatalogueExcel(req.file.path);
        const productData = {};
        rows.forEach((row) => {
            const { category, productName, itemType, school, gender, size, colour, price, } = row;
            if (!productData[category]) {
                productData[category] = {
                    category,
                    items: [],
                    productsMap: {},
                };
            }
            const key = `${productName}_${school}_${gender}`;
            if (!productData[category].productsMap[key]) {
                productData[category].productsMap[key] = {
                    name: productName,
                    itemType,
                    sellingPrice: price,
                    school,
                    gender,
                    active: true,
                    variants: [],
                };
                productData[category].items.push(
                    productData[category].productsMap[key]
                );
            }
            productData[category].productsMap[key].variants.push({
                size,
                color: colour,
                stock: 0,
            });
        });

        Object.values(productData).forEach((category) => {
            delete category.productsMap;
        });

        const catalogue = Object.values(productData).map((category) => ({
            category: category.category,
            items: category.items,
        }));


        // -------------------------------
        // Merge every uploaded category
        // -------------------------------

        for (const uploadedCategory of catalogue) {

            let existingCategory = await Product.findOne({
                category: uploadedCategory.category,
            });

            // New category
            if (!existingCategory) {
                await Product.create(uploadedCategory);
                continue;
            }

            // -------------------------------
            // Remove deleted products
            // -------------------------------

            const uploadedProductKeys =
                uploadedCategory.items.map(
                    (item) =>
                        `${item.name}|${item.school}|${item.gender}`
                );

            existingCategory.items =
                existingCategory.items.filter((item) => {

                    const key =
                        `${item.name}|${item.school}|${item.gender}`;

                    return uploadedProductKeys.includes(key);

                });

            // -------------------------------
            // Merge products
            // -------------------------------

            for (const uploadedItem of uploadedCategory.items) {

                let existingItem =
                    existingCategory.items.find(
                        (item) =>
                            item.name === uploadedItem.name &&
                            item.school === uploadedItem.school &&
                            item.gender === uploadedItem.gender
                    );

                // New product
                if (!existingItem) {

                    existingCategory.items.push(uploadedItem);
                    continue;

                }

                // Update only selling price
                existingItem.sellingPrice =
                    uploadedItem.sellingPrice;

                // -------------------------------
                // Remove deleted variants
                // -------------------------------

                const uploadedVariantKeys =
                    uploadedItem.variants.map(
                        (variant) =>
                            `${variant.size}|${variant.color}`
                    );

                existingItem.variants =
                    existingItem.variants.filter((variant) => {

                        const key =
                            `${variant.size}|${variant.color}`;

                        return uploadedVariantKeys.includes(key);

                    });

                // -------------------------------
                // Add new variants
                // -------------------------------

                for (const uploadedVariant of uploadedItem.variants) {

                    const existingVariant =
                        existingItem.variants.find(
                            (variant) =>
                                variant.size === uploadedVariant.size &&
                                variant.color === uploadedVariant.color
                        );

                    if (!existingVariant) {

                        existingItem.variants.push({
                            size: uploadedVariant.size,
                            color: uploadedVariant.color,
                            stock: 0,
                        });

                    }

                }

            }

            await existingCategory.save();

        }

        // -------------------------------
        // Remove deleted categories
        // -------------------------------

        const uploadedCategoryNames = catalogue.map(
            (c) => c.category
        );

        await Product.deleteMany({
            category: {
                $nin: uploadedCategoryNames,
            },
        });


        const validProducts = [];
        catalogue.forEach(category => {
            category.items.forEach(item => {
                item.variants.forEach(variant => {
                    validProducts.push({
                        productName: item.name,
                        school: item.school,
                        size: variant.size,
                        colour: variant.color,
                    });
                });
            });
        });

        const history = await StockHistory.find(
            {},
            {
                productName: 1,
                school: 1,
                size: 1,
                colour: 1,
            }
        );

        const idsToDelete = [];

        history.forEach(record => {

            const exists = validProducts.some(product =>
                product.productName === record.productName &&
                product.school === record.school &&
                product.size === record.size &&
                product.colour === record.colour
            );

            if (!exists) {
                idsToDelete.push(record._id);
            }

        });

        if (idsToDelete.length) {

            await StockHistory.deleteMany({
                _id: {
                    $in: idsToDelete,
                },
            });

        }

        fs.unlinkSync(req.file.path);

        return res.status(200).json({
            success: true,
            message: "Catalogue uploaded successfully",
        });

    } catch (error) {

        console.log(error);

        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

const addProducts = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Excel file required",
            });
        }
        const rows = parseCatalogueExcel(req.file.path);
        for (const row of rows) {
            const { category, productName, itemType, school, gender, size, colour, price, } = row;

            let categoryDoc = await Product.findOne({ category, });
            if (!categoryDoc) {
                categoryDoc = new Product({
                    category,
                    items: [],
                });

            }

            let item = categoryDoc.items.find(
                (i) =>
                    i.name === productName &&
                    i.school === school &&
                    i.gender === gender
            );
            if (!item) {
                categoryDoc.items.push({
                    name: productName,
                    itemType,
                    sellingPrice: price,
                    school,
                    gender,
                    active: true,
                    variants: [],
                });
                item = categoryDoc.items[
                    categoryDoc.items.length - 1
                ];
            }

            item.sellingPrice = price;
            let variant = item.variants.find(
                (v) =>
                    v.size === size &&
                    v.color === colour
            );
            if (!variant) {
                item.variants.push({
                    size,
                    color: colour,
                    stock: 0,
                });
            }
            await categoryDoc.save();
        }
        fs.unlinkSync(req.file.path);
        return res.status(200).json({
            success: true,
            message: "Products merged successfully",
        });
    } catch (error) {
        console.log(error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const uploadStock = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Excel file required",
            });
        }

        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet);
        console.log(rows[0]);
        for (const row of rows) {
            const productName = String(row.product || "").trim();
            const size = String(row.size).trim();
            const colour = String(row.colour || "").trim();
            const school = String(row.school || "").trim();
            const stock = Number(row.stock);
            const category = await Product.findOne({
                "items.name": productName,
            });

            if (!category) {
                console.log(`Product name ${productName} not found`);
                continue;
            }
            const item = category.items.find(
                (i) =>
                    i.name === productName &&
                    (i.school || "") === school
            );

            if (!item) continue;
            const variant = item.variants.find(
                (v) =>
                    v.size === size &&
                    (v.color || "") === colour
            );
            if (!variant) {
                console.log(
                    `Variant not found -> Product:${productName}, School:${school}, Size:${size}, Colour:${colour}`
                );
                continue;
            }
            const previousStock = Number(variant.stock);
            const newStock = previousStock + Number(stock);
            variant.stock = newStock;
            await category.save();
            console.log(
                item.name,
                variant.size,
                variant.color,
                variant.stock
            );
            await StockHistory.create({
                productName: item.name,
                category: category.category,
                school: item.school,
                size: variant.size,
                colour: variant.color,
                operation: "add",
                quantity: Number(stock),
                previousStock,
                newStock,
                remarks: "Bulk Stock Upload",
            });
        }
        fs.unlinkSync(req.file.path);
        return res.status(200).json({
            success: true,
            message: "Stock file read successfully",
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const updateStockManual = async (req, res) => {

    try {

        const {
            productName,
            school,
            size,
            colour,
            quantity,
            operation,
        } = req.body;

        const category = await Product.findOne({
            "items.name": productName,
        });

        if (!category) {

            return res.status(404).json({
                success: false,
                message: "Product not found",
            });

        }

        const item = category.items.find(
            (i) =>
                i.name === productName &&
                (i.school || "") === (school || "")
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Item not found",
            });
        }

        const variant = item.variants.find(
            (v) =>
                v.size === size &&
                (v.color || "") === colour
        );

        if (!variant) {
            return res.status(404).json({
                success: false,
                message: "Variant not found",
            });
        }
        const previousStock = Number(variant.stock);
        let newStock;
        if (operation === "add") {
            newStock = previousStock + Number(quantity);
        } else {
            newStock = Number(quantity);
        }
        variant.stock = newStock;
        await category.save(); 
        await StockHistory.create({
            productName: item.name,
            category: category.category,
            school: item.school,
            size: variant.size,
            colour: variant.color,
            operation,
            quantity: Number(quantity),
            previousStock,
            newStock,
        });
        return res.status(200).json({
            success: true,
            message: "Stock updated successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getProduct = async (req, res) => {

    try {
        const products = await Product.find();
        res.status(200).json({
            success: true,
            products,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getStockHistory = async (req, res) => {

    try {
        const history = await StockHistory
            .find()
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            history,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    uploadCatalogue,
    addProducts,
    uploadStock,
    updateStockManual,
    getProduct,
    getStockHistory,
};