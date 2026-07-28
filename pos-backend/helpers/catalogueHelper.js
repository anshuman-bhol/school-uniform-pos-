const XLSX = require("xlsx");

const parseCatalogueExcel = (filePath) => {

    const workbook = XLSX.readFile(filePath);

    const sheetName = workbook.SheetNames[0];

    const sheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(sheet);

    return rows.map(row => ({

        category: String(row.category || "").trim(),

        productName: String(row.product || "").trim(),

        itemType: String(row.itemType || "ReadyMade").trim(),

        school: String(row.school || "").trim(),

        gender: String(row.gender || "Unisex").trim(),

        size: String(row.size || "").trim(),

        colour: String(row.colour || "").trim(),

        price: Number(row.price),

    }));

};

module.exports = {
    parseCatalogueExcel,
};