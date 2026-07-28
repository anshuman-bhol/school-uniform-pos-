const approvalTemplate = ({ name, role }) => {

    const approvedOn = new Date().toLocaleString("en-IN", {
        dateStyle: "full",
        timeStyle: "short",
    });

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
                background:#16a34a;
                color:white;
                padding:25px;
                text-align:center;
            ">
                <h2 style="margin:0;">
                    Registration Approved
                </h2>
            </div>

            <div style="padding:35px;">

                <h3>Hello ${name},</h3>

                <p>
                    Congratulations!
                    Your registration request has been approved.
                </p>

                <table style="width:100%;border-collapse:collapse;">

                    <tr>
                        <td style="padding:10px;font-weight:bold;">
                            Assigned Role
                        </td>

                        <td style="padding:10px;">
                            ${role}
                        </td>
                    </tr>

                    <tr style="background:#f8f8f8;">
                        <td style="padding:10px;font-weight:bold;">
                            Approved On
                        </td>

                        <td style="padding:10px;">
                            ${approvedOn}
                        </td>
                    </tr>

                </table>

                <div style="
                    margin-top:30px;
                    padding:20px;
                    background:#ecfdf5;
                    border-left:5px solid #16a34a;
                ">

                    You can now login using your registered email address and password.

                </div>

                <p style="margin-top:35px;">
                    Thank you.
                </p>

            </div>

        </div>

    </body>

    </html>
    `;

};

module.exports = approvalTemplate;