const express = require("express")
const { addOrder, getOrders, getPaymentLedger, getOrderById, updateOrder, updateOrderPayment, changeOrderTailor, updateOrderBill} = require("../controllers/orderController")
const { isVerifiedUser } = require("../middlewares/tokenVerification")
const authorizeRoles = require("../middlewares/authorizeRoles");
const router = express.Router()

router.route("/").post(isVerifiedUser,addOrder)
router.route("/").get(isVerifiedUser,getOrders)
router.route("/payment-ledger").get(isVerifiedUser, authorizeRoles("admin"), getPaymentLedger);
router.route("/:id").get(isVerifiedUser,getOrderById)
router.route("/:id").put(isVerifiedUser,updateOrder)
router.route("/:id/change-tailor").put(isVerifiedUser, changeOrderTailor);
router.route("/:id/payment").put(isVerifiedUser, updateOrderPayment);
router.route("/:id/bill").put(isVerifiedUser, updateOrderBill);

module.exports=router;