const registrationTemplate = ({ name, email, phone }) => {
    const registeredOn = new Date().toLocaleString("en-IN", {
        dateStyle: "full",
        timeStyle: "short",
    });

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
    </head>

    <body style="margin:0;padding:30px;background:#f5f5f5;font-family:Arial,sans-serif;">

        <div style="
            max-width:650px;
            margin:auto;
            background:#ffffff;
            border-radius:10px;
            overflow:hidden;
            box-shadow:0 2px 10px rgba(0,0,0,.1);
        ">

            <div style="
                background:#facc15;
                padding:20px;
                text-align:center;
            ">
                <h2 style="margin:0;color:#222;">
                    New Employee Registration
                </h2>
            </div>

            <div style="padding:30px;">

                <p>
                    A new employee has requested access to the POS system.
                </p>

                <table style="width:100%;border-collapse:collapse;">

                    <tr>
                        <td style="padding:10px;font-weight:bold;">Employee Name</td>
                        <td style="padding:10px;">${name}</td>
                    </tr>

                    <tr style="background:#f8f8f8;">
                        <td style="padding:10px;font-weight:bold;">Email</td>
                        <td style="padding:10px;">${email}</td>
                    </tr>

                    <tr>
                        <td style="padding:10px;font-weight:bold;">Phone</td>
                        <td style="padding:10px;">${phone}</td>
                    </tr>

                    <tr style="background:#f8f8f8;">
                        <td style="padding:10px;font-weight:bold;">Requested On</td>
                        <td style="padding:10px;">${registeredOn}</td>
                    </tr>

                </table>

                <div style="
                    margin-top:30px;
                    padding:20px;
                    background:#fff8db;
                    border-left:5px solid #facc15;
                ">
                    <strong>Action Required</strong>

                    <p style="margin-top:10px;">
                        Please login to the POS Admin Dashboard and approve or reject this registration request.
                    </p>
                </div>

            </div>

        </div>

    </body>

    </html>
    `;
};

module.exports = registrationTemplate;