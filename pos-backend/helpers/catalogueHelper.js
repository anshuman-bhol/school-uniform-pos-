const XLSX = require("xlsx");

const normalizeHeader = (header) =>
    String(header || "").toLowerCase().replace(/[^a-z0-9]/g, "");

const getCellValue = (row, aliases) => {
    const normalizedRow = Object.entries(row).reduce((values, [key, value]) => {
        values[normalizeHeader(key)] = value;
        return values;
    }, {});

    for (const alias of aliases) {
        const value = normalizedRow[alias];
        if (value !== undefined && value !== null && String(value).trim() !== "") {
            return value;
        }
    }

    return "";
};

const parseCatalogueExcel = (filePath) => {

    const workbook = XLSX.readFile(filePath);

    const sheetName = workbook.SheetNames[0];

    const sheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(sheet);

    const parsedRows = [];
    const errors = [];

    rows.forEach((row, index) => {
        const category = String(getCellValue(row, ["category", "categoryname"]) || "").trim();
        const productName = String(getCellValue(row, ["product", "productname", "item", "itemname"]) || "").trim();
        const itemType = String(getCellValue(row, ["itemtype", "type"]) || "ReadyMade").trim();
        const school = String(getCellValue(row, ["school", "schoolname"]) || "").trim();
        const gender = String(getCellValue(row, ["gender"]) || "Unisex").trim();
        const size = String(getCellValue(row, ["size", "sizes"]) || "").trim();
        const colour = String(getCellValue(row, ["colour", "color"]) || "").trim();
        const rawPrice = getCellValue(row, ["price", "sellingprice", "sellingpricers", "sellingpriceinrs", "amount"]);
        const price = Number(rawPrice);
        const missingFields = [];

        if (!category) missingFields.push("category");
        if (!productName) missingFields.push("product");
        if (!size) missingFields.push("size");
        if (rawPrice === "" || !Number.isFinite(price)) missingFields.push("price");

        if (missingFields.length) {
            errors.push(`row ${index + 2}: missing or invalid ${missingFields.join(", ")}`);
            return;
        }

        parsedRows.push({
            category,
            productName,
            itemType,
            school,
            gender,
            size,
            colour,
            price,
        });
    });

    if (errors.length) {
        throw new Error(`Invalid catalogue data: ${errors.slice(0, 5).join("; ")}`);
    }

    return parsedRows;

};

module.exports = {
    parseCatalogueExcel,
};