const createHttpError = require("http-errors");
const User = require("../models/userModel");
const userDTO = require("../dto/userDTO");
const { sendApprovalEmail } = require("../services/emailService");
const { sendRejectionEmail } = require("../services/emailService");

const rejectUser = async (req, res, next) => {
    try {

        const { id } = req.params;
        const { rejectionReason } = req.body;

        const user = await User.findById(id);

        if (!user) {
            return next(
                createHttpError(404, "User not found.")
            );
        }

        if (user.status !== "pending") {
            return next(
                createHttpError(
                    400,
                    "This registration request has already been processed."
                )
            );
        }

        user.status = "rejected";
        user.role = null;
        user.rejectionReason = rejectionReason || null;
        user.approvedBy = req.user._id;
        user.approvedAt = new Date();

        await user.save();

        await sendRejectionEmail(user);

        res.status(200).json({
            success: true,
            message: "User rejected successfully.",
            data: user,
        });

    } catch (error) {
        next(error);
    }
};

const approveUser = async (req, res, next) => {
    try {

        const { id } = req.params;
        const { role } = req.body;

        const allowedRoles = ["admin", "cashier", "employee"];

        if (!allowedRoles.includes(role)) {
            return next(
                createHttpError(400, "Invalid role selected.")
            );
        }

        const user = await User.findById(id);

        if (!user) {
            return next(
                createHttpError(404, "User not found.")
            );
        }

        if (user.status !== "pending") {
            return next(
                createHttpError(
                    400,
                    "This registration request has already been processed."
                )
            );
        }

        user.role = role;
        user.status = "approved";
        user.approvedBy = req.user._id;
        user.approvedAt = new Date();
        user.rejectionReason = null;

        await user.save();
        const responseUser = await User.findById(user._id).select("-password");

        await sendApprovalEmail(user);

        res.status(200).json({
            success: true,
            message: "User approved successfully.",
            data: responseUser,
        });

    } catch (error) {
        next(error);
    }
};

const getUsers = async (req, res, next) => {
    try {

        const { status } = req.query;
        const allowedStatus = [
            "pending",
            "approved",
            "rejected",
        ];

        if (status && !allowedStatus.includes(status)) {
            return next(
                createHttpError(400, "Invalid status filter.")
            );
        }

        const filter = {};

        if (status) {
            filter.status = status;
        }

        const users = await User.find(filter)
            .populate("approvedBy", "name email")
            .select("-password")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            data: users,
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUsers,
    approveUser,
    rejectUser,
};