const XLSX = require("xlsx");

const downloadCatalogueTemplate = (req, res) => {

    const data = [
        {
            category: "",
            product: "",
            price: "",
            school: "",
            gender: "",
            size: "",
            colour: "",
        },
    ];

    const workbook = XLSX.utils.book_new();

    const sheet = XLSX.utils.json_to_sheet(data);

    XLSX.utils.book_append_sheet(
        workbook,
        sheet,
        "Catalogue"
    );

    const buffer = XLSX.write(workbook, {
        type: "buffer",
        bookType: "xlsx",
    });

    res.setHeader(
        "Content-Disposition",
        "attachment; filename=CatalogueTemplate.xlsx"
    );

    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.send(buffer);

};

const downloadStockTemplate = (req, res) => {

    const data = [
        {
            product:"",
            size: "",
            colour: "",
            school: "",
            stock: "",
        },
    ];

    const workbook = XLSX.utils.book_new();

    const sheet = XLSX.utils.json_to_sheet(data);

    XLSX.utils.book_append_sheet(
        workbook,
        sheet,
        "Stock"
    );

    const buffer = XLSX.write(workbook, {
        type: "buffer",
        bookType: "xlsx",
    });

    res.setHeader(
        "Content-Disposition",
        "attachment; filename=StockTemplate.xlsx"
    );

    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.send(buffer);

};

module.exports = {
    downloadCatalogueTemplate,
    downloadStockTemplate,
};