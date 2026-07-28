const rejectionTemplate = ({ name, rejectionReason }) => {

    return `
    <!DOCTYPE html>
    <html>

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
                background:#dc2626;
                color:white;
                padding:25px;
                text-align:center;
            ">
                <h2 style="margin:0;">
                    Registration Request Rejected
                </h2>
            </div>

            <div style="padding:35px;">

                <h3>Hello ${name},</h3>

                <p>
                    We regret to inform you that your registration request has been rejected.
                </p>

                ${
                    rejectionReason
                        ? `
                        <div style="
                            margin:20px 0;
                            padding:15px;
                            background:#fef2f2;
                            border-left:5px solid #dc2626;
                        ">
                            <strong>Reason:</strong><br/>
                            ${rejectionReason}
                        </div>
                        `
                        : ""
                }

                <p>
                    If you believe this is a mistake, please contact the administrator.
                </p>

                <p style="margin-top:35px;">
                    Thank you.
                </p>

            </div>

        </div>

    </body>

    </html>
    `;
};

module.exports = rejectionTemplate;