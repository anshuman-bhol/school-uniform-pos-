const { sendOtpEmail, sendRegistrationRequestEmail, } = require("../services/emailService");
const otpStore = require("../utils/otpStore");
const createHttpError = require("http-errors")
const User = require("../models/userModel")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
const config = require("../config/config")

const register = async (req, res, next) => {
    try {
        const { name, phone, email, password } = req.body;
        if (!name || !phone || !email || !password) {
            const error = createHttpError(400, "All fields are required!")
            return next(error)
        }

        const isUserPresent = await User.findOne({ email });
        if (isUserPresent) {
            const error = createHttpError(400, "User already exist!")
            return next(error)
        }

        const user = { name, phone, email, password, role: null, status: "pending", };
        const newUser = User(user);
        await newUser.save();
        await sendRegistrationRequestEmail(newUser);

        res.status(201).json({ success: true, message: "Registration request submitted successfully. Please wait for administrator approval.", data: newUser })
    } catch (error) {
        next(error)
    }
}

const validateUserApprovalStatus = (user) => {
    if (user.status === "pending") {
        throw createHttpError(
            403,
            "Your registration request is awaiting administrator approval."
        );
    }

    if (user.status === "rejected") {
        throw createHttpError(
            403,
            "Your registration request has been rejected. Please contact the administrator."
        );
    }
};

const login = async (req, res, next) => {

    try {
        const { email, password } = req.body;
        if (!email || !password) {
            const error = createHttpError(400, "All fields are required!")
            return next(error)
        }

        const isUserPresent = await User.findOne({ email });
        validateUserApprovalStatus(isUserPresent);

        if (!isUserPresent) {
            const error = createHttpError(401, "Invalid Credentials!")
            return next(error)
        }

        const isMatch = await bcrypt.compare(password, isUserPresent.password);
        if (!isMatch) {
            const error = createHttpError(401, "Invalid Credentials!")
            return next(error)
        }

        const accessToken = jwt.sign({ _id: isUserPresent._id }, config.accessTokenSecret, {
            expiresIn: '1d'
        })

        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
            sameSite: 'none',
            secure: true
        })

        res.status(200).json({
            success: true, message: "User login successfully",
            data: isUserPresent
        })

    } catch (error) {
        next(error)
    }
}

const sendOtp = async (req, res, next) => {
    try {

        const { email } = req.body;

        if (!email) {
            return next(createHttpError(400, "Email is required!"));
        }

        const user = await User.findOne({ email });
        validateUserApprovalStatus(user);

        if (!user) {
            return next(createHttpError(404, "Employee not found!"));
        }

        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        otpStore.set(email, {
            otp,
            expires: Date.now() + 5 * 60 * 1000,
        });

        await sendOtpEmail(email, otp);

        res.status(200).json({
            success: true,
            message: "OTP sent successfully!",
        });

    } catch (error) {
        next(error);
    }
};

const verifyOtp = async (req, res, next) => {

    try {

        const { email, otp } = req.body;

        const savedOtp = otpStore.get(email);

        if (!savedOtp) {
            return next(createHttpError(400, "OTP expired!"));
        }

        if (savedOtp.expires < Date.now()) {
            otpStore.delete(email);
            return next(createHttpError(400, "OTP expired!"));
        }

        if (savedOtp.otp !== otp) {
            return next(createHttpError(400, "Invalid OTP!"));
        }

        otpStore.delete(email);

        const user = await User.findOne({ email });
        validateUserApprovalStatus(user);

        const accessToken = jwt.sign(
            { _id: user._id },
            config.accessTokenSecret,
            {
                expiresIn: "1d",
            }
        );

        res.cookie("accessToken", accessToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
            sameSite: "none",
            secure: true,
        });

        res.status(200).json({
            success: true,
            message: "Login successful!",
            data: user,
        });

    } catch (error) {
        next(error);
    }
};



const getUserData = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json({ success: true, data: user })
    } catch (error) {
        next(error)
    }
}

const logout = async (req, res, next) => {
    try {
        res.clearCookie('accessToken')
        res.status(200).json({ success: true, message: "User Logout successfully!" })
    } catch (error) {
        next(error)
    }
}

module.exports = { register, login, sendOtp, verifyOtp, getUserData, logout }