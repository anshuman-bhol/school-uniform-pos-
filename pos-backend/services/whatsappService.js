const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
require("dotenv").config();

const uploadMedia = async (filePath) => {
    try {
        const form = new FormData();

        form.append("messaging_product", "whatsapp");

        form.append(
            "file",
            fs.createReadStream(filePath),
            {
                filename: "Invoice.pdf",
                contentType: "application/pdf"
            }
        );

        const response = await axios.post(
            `https://graph.facebook.com/v25.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/media`,
            form,
            {
                headers: {
                    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
                    ...form.getHeaders()
                },
                maxBodyLength: Infinity,
                maxContentLength: Infinity,
                timeout: 60000
            }
        );
        console.log("Upload Response:", response.data);
        return response.data.id;

    }
    catch (error) {


        throw error;
    }
};

const sendDocument = async (phone, mediaId) => {
    const response = await axios.post(
        `https://graph.facebook.com/v25.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: phone,
            type: "document",
            document: {
                id: mediaId,
                filename: "Invoice.pdf"
            }
        },
        {
            headers: {
                Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
                "Content-Type": "application/json"
            }
        }
    );

    return response.data;
};

module.exports = {
    uploadMedia,
    sendDocument
};