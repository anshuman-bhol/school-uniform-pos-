const mongoose = require("mongoose");
const createHttpError = require("http-errors");
const Tailor = require("../models/tailorModel");

// =====================
// Add Tailor
// =====================
const addTailor = async (req, res, next) => {
  try {
    const { name, phone, specialization } = req.body;

    if (!name) {
      return next(createHttpError(400, "Please enter tailor name."));
    }

    const exists = await Tailor.findOne({ name });

    if (exists) {
      return next(createHttpError(400, "Tailor already exists."));
    }

    const tailor = await Tailor.create({
      name,
      phone,
      specialization,
    });

    res.status(201).json({
      success: true,
      message: "Tailor added successfully.",
      data: tailor,
    });
  } catch (error) {
    next(error);
  }
};

// =====================
// Get Tailors
// =====================
const getTailors = async (req, res, next) => {
  try {
const tailors = await Tailor.find()
    .populate({
        path: "currentOrders",
        select:
            "invoiceNumber customerDetails items orderStatus tailorDetails orderDate completedAt bills",
    })
    .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: tailors,
    });
  } catch (error) {
    next(error);
  }
};

// =====================
// Update Tailor
// =====================
const updateTailor = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(404, "Invalid Tailor ID."));
    }
    const tailor = await Tailor.findById(id);
    if (!tailor) {
      return next(createHttpError(404, "Tailor not found."));
    }

    // Prevent marking inactive if there are active orders
    if (
      req.body.status === "Inactive" &&
      tailor.currentOrders.length > 0
    ) {
      return next(
        createHttpError(
          400,
          "Cannot mark tailor inactive while active orders exist."
        )
      );
    }

    // Update only provided fields
    if (req.body.name !== undefined) {
      tailor.name = req.body.name;
    }
    if (req.body.phone !== undefined) {
      tailor.phone = req.body.phone;
    }
    if (req.body.specialization !== undefined) {
      tailor.specialization = req.body.specialization;
    }
    if (req.body.status !== undefined) {
      tailor.status = req.body.status;
    }
    await tailor.save();
    res.status(200).json({
      success: true,
      message: "Tailor updated.",
      data: tailor,
    });
  } catch (error) {
    next(error);
  }
};

const updateTailorStatus = async (tailorId) => {
  const tailor = await Tailor.findById(tailorId);
  if (!tailor) return;
  // Don't overwrite manually inactive tailor
  if (tailor.status === "Inactive") {
    return;
  }
  tailor.status =
    tailor.currentOrders.length > 0
      ? "Busy"
      : "Available";
  await tailor.save();
};

module.exports = {
  addTailor,
  getTailors,
  updateTailor,
  updateTailorStatus,
};