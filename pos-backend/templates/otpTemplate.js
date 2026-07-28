const appConfig = require("../config/appConfig");
const otpTemplate = (otp) => {
    return `
        <!DOCTYPE html>
        <html>

        <body style="margin:0;padding:40px;background:#f5f5f5;font-family:Arial,sans-serif;">

            <div style="max-width:600px;margin:auto;background:white;border-radius:10px;padding:40px;">

                <h2>${appConfig.APP_NAME}</h2>    
                <h2 style="color:#222;">Login Verification</h2>
                <p>Your One-Time Password is</p>

                <h1 style="
                    text-align:center;
                    letter-spacing:8px;
                    color:#2563eb;
                ">
                    ${otp}
                </h1>

                <p>
                    This OTP is valid for <b>5 minutes</b>.
                </p>

                <hr>

                <small>
                    If you didn't request this login,
                    you can safely ignore this email.
                </small>

            </div>

        </body>

        </html>
    `;
};

module.exports = otpTemplate;