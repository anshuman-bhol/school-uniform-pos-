const appConfig = Object.freeze({
    APP_NAME: "PUSTAK MANDIR",
    COMPANY_NAME: "PUSTAK MANDIR",

    SUPPORT_EMAIL: process.env.SUPPORT_EMAIL || process.env.EMAIL_USER,

    APP_URL: process.env.APP_URL || "http://localhost:5173",

    ADMIN_DASHBOARD_PATH: "/admin",
});

module.exports = appConfig;