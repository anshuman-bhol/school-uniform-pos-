const nodemailer = require("nodemailer");
const config = require("../config/config");
const otpTemplate = require("../templates/otpTemplate");
const registrationTemplate = require("../templates/registrationTemplate");
const approvalTemplate = require("../templates/approvalTemplate");
const rejectionTemplate = require("../templates/rejectionTemplate");
const appConfig = require("../config/appConfig");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS,
    },
});

const sendOtpEmail = async (email, otp) => {
    await transporter.sendMail({
        from: config.EMAIL_USER,
        to: email,
        subject: `${appConfig.APP_NAME} Login OTP`,
        html: otpTemplate(otp),
    });
};

const sendApprovalEmail = async (user) => {

    await transporter.sendMail({

        from: config.EMAIL_USER,

        to: user.email,

        subject: "Registration Approved",

        html: approvalTemplate(user),

    });

};

const sendRegistrationRequestEmail = async (user) => {
    await transporter.sendMail({
        from: config.EMAIL_USER,
        to: config.ADMIN_EMAIL,
        subject: `New ${appConfig.APP_NAME} Employee Registration Request`,
        html: registrationTemplate(user),
    });
};

const sendRejectionEmail = async (user) => {
    await transporter.sendMail({
        from: config.EMAIL_USER,
        to: user.email,
        subject: "Registration Request Rejected",
        html: rejectionTemplate(user),
    });
};

module.exports = {
    transporter, sendOtpEmail, sendRegistrationRequestEmail, sendApprovalEmail, sendRejectionEmail,
};