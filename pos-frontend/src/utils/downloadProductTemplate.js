import * as XLSX from "xlsx";

export const downloadProductTemplate = () => {

    const rows = [

        {
            category: "Shirt",
            product: "White School Shirt",
            price: 650,
            size: 28,
            stock: 15,
        },

        {
            category: "Shirt",
            product: "White School Shirt",
            price: 650,
            size: 30,
            stock: 20,
        },

        {
            category: "Shirt",
            product: "White School Shirt",
            price: 650,
            size: 32,
            stock: 18,
        },

        {
            category: "Pant",
            product: "Navy Pant",
            price: 850,
            size: 30,
            stock: 10,
        },

        {
            category: "Pant",
            product: "Navy Pant",
            price: 850,
            size: 32,
            stock: 8,
        },

    ];

    const worksheet = XLSX.utils.json_to_sheet(rows);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Products"
    );

    XLSX.writeFile(
        workbook,
        "Garment_Product_Template.xlsx"
    );

};