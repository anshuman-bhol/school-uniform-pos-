import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { removeAllItems, } from "../../redux/slices/cartSlice";
import { removeCustomer, } from "../../redux/slices/customerSlice";
import { setPendingOrder, } from "../../redux/slices/pendingOrderSlice";
import DeliveryDateModal from "../customer/DeliveryDateModal";
import AssignTailorChoiceModal from "../tailors/AssignTailorChoiceModal";
import { addOrder, } from "../../https";
import Invoice from "../invoice/Invoice";
import PaymentModal from "../payment/Paymentmodal";
import PriceModal from "../billing/PriceModal";
import { calculateBill } from "../../utils/calculateBill";

const Bill = () => {
  console.log("Bill component rendered");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const customerData = useSelector((state) => state.customer);
  const cartData = useSelector((state) => state.cart);
  const [editableCart, setEditableCart] = useState([]);
  useEffect(() => { setEditableCart(cartData.map(item => ({ ...item }))); }, [cartData]);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const queryClient = useQueryClient();
  const tailoringPricePending = editableCart.some(
    (item) =>
      item.customPrice &&
      (!item.pricePerQuantity || item.pricePerQuantity <= 0)
  );
  const [showInvoice, setShowInvoice] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);
  const [showAssignChoice, setShowAssignChoice] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({
    paymentMethod: "",
    paymentStatus: "Pending",
    cashAmount: 0,
    upiAmount: 0,
    advancePaid: 0,
    remainingAmount: 0,
    discount: {
      type: "amount",
      value: 0,
      amount: 0,
    },
  });
  const {
    subtotal: total,
    tax,
    totalWithTax,
    finalAmount, } = calculateBill(
      editableCart,
      paymentInfo.discount
    );

  const today = new Date().toISOString().split("T")[0];
  const now = new Date();
  const currentTime =`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState(today);
  const [deliveryTime, setDeliveryTime] = useState(currentTime);
  const hasAdvancePayment = paymentInfo.advancePaid > 0;
  const hasTailoringItems = editableCart.some((item) => item.itemType === "Tailoring");
  const requireFullPayment = !hasTailoringItems;
  const initialOrderStatus = hasTailoringItems
    ? "Order Placed"
    : "Delivered";
  const orderMutation = useMutation({
    mutationFn: ({ orderData }) =>
      addOrder(orderData),
    onSuccess: async (response, variables) => {
      const order = response.data.data;
      setOrderInfo(order);
      dispatch(removeCustomer());
      dispatch(removeAllItems());
      await queryClient.invalidateQueries({
        queryKey: ["products"],
      });
      enqueueSnackbar(
        variables.orderStatus === "Ready"
          ? "Ready-made order created!"
          : "Tailoring order created!",
        {
          variant: "success",
        }
      );
      setShowInvoice(true);
    },

    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message ||
        "Unable to create order",
        {
          variant: "error",
        }
      );
    },
  });

  const generateInvoiceNumber = () =>
    `PMPL-${new Date().getFullYear()}-${crypto
      .randomUUID()
      .slice(0, 8)
      .toUpperCase()}`;

  const buildOrderData = (orderStatus, selectedDeliveryDate) => {
    const deliveryDateTime = new Date(
      `${selectedDeliveryDate}T${deliveryTime}`
    );

    return {
      invoiceNumber: generateInvoiceNumber(),

      customerDetails: {
        name: customerData.customerName,
        phone: customerData.customerPhone,
        deliveryDate: deliveryDateTime,
        remarks: customerData.remarks,
      },

      orderStatus,

      bills: {
        total,
        tax,
        totalWithTax,
        discount: paymentInfo.discount,
        finalAmount,
      },

      items: editableCart,

      paymentMethod: paymentInfo.paymentMethod,
      paymentStatus: paymentInfo.paymentStatus,

      paymentData: {
        cashAmount: paymentInfo.cashAmount,
        upiAmount: paymentInfo.upiAmount,
        advancePaid: paymentInfo.advancePaid,
        remainingAmount: paymentInfo.remainingAmount,
      },
    };
  };

  // Order Placed 
  const handleCreateOrder = () => {
    if (tailoringPricePending) {
      enqueueSnackbar(
        "Please enter price for all tailoring items.",
        {
          variant: "warning",
        }
      );
      return;
    }
    if (total <= 0) {
      console.log("Failed: total <= 0");
      enqueueSnackbar("Please add products.", {
        variant: "warning",
      });
      return;
    }
    if (!hasAdvancePayment) {
      console.log("Failed: no advance payment");
      enqueueSnackbar(
        "Please collect an advance payment first.",
        {
          variant: "warning",
        }
      );
      return;
    }

    if (hasTailoringItems) {
      console.log("Opening delivery modal");
      setShowDeliveryModal(true);
      return;
    }

    console.log("Creating ready-made order");
    const orderData = buildOrderData(
      initialOrderStatus,
      today
    );

    console.log(orderData.customerDetails);
    orderMutation.mutate({
      orderData,
      orderStatus: initialOrderStatus,
    });
  };

  return (
    <div className="shrink-0">
      <div className="max-h-40 overflow-y-auto px-5 mt-2 scrollbar-none">

        {editableCart
          .filter(item => item.customPrice)
          .map((item) => (

            <div
              key={item.id}
              className="flex justify-between items-center border-b border-[#3a3a3a] py-3"
            >

              <div>

                <p className="text-white font-medium">
                  {item.name}
                </p>

                <p className="text-sm text-gray-400">

                  Qty : {item.quantity}

                  {
                    item.itemType === "ReadyMade"
                      ? ` • ${item.size}`
                      : ""
                  }

                </p>

              </div>

              <div className="text-right">
                {
                  item.customPrice && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setShowPriceModal(true);
                        }}
                        className="bg-yellow-500 text-black text-sm font-bold px-3 py-1 rounded-lg"
                      >
                        {
                          item.pricePerQuantity > 0
                            ? "Edit Price"
                            : "Enter Price"
                        }
                      </button>

                      {
                        item.pricePerQuantity > 0 && (
                          <p className="text-green-400 mt-2">
                            ₹{item.pricePerQuantity}
                            {" × "}
                            {item.quantity}
                            {" = ₹"}
                            {item.price}
                          </p>
                        )
                      }
                    </>
                  )
                }
              </div>
            </div>
          ))}
      </div>
      <div className="flex items-center justify-between px-5 mt-2">
        <p className="text-xs text-[#ababab] font-medium">Items ({editableCart.length})</p>
        <h1 className="text-[#f5f5f5] font-bold">₹ {total.toFixed(2)}</h1>
      </div>

      {/* <div className="flex items-center justify-between px-5 mt-2">
        <p className="text-xs text-[#ababab] font-medium">GST (0.00%)</p>
        <h1 className="text-[#f5f5f5] font-bold">₹ {tax.toFixed(2)}</h1>
      </div> */}

      <div className="flex items-center justify-between px-5 mt-2">
        <p className="text-xs text-[#ababab] font-medium">Total</p>
        <div className="text-right">
          {
            paymentInfo.discount?.amount > 0 && (
              <p className="text-xs text-gray-400 line-through">₹ {totalWithTax.toFixed(2)}</p>
            )
          }
          <h1 className="text-yellow-400 text-lg font-bold">₹ {finalAmount.toFixed(2)}</h1>
        </div>
      </div>

      <p
        className={`text-yellow-400 text-sm font-light mt-2 text-center h-5 ${editableCart.some(item => item.customPrice)
          ? "visible"
          : "invisible"
          }`}
      >Tailoring item prices will be entered during billing.</p>

      {/* Payment Method */}
      <div className="px-5 mt-1">
        <button disabled={total <= 0 || tailoringPricePending} onClick={() => setShowPaymentModal(true)}
          className={`w-full py-3 rounded-lg font-semibold transition
            ${paymentInfo.paymentStatus === "Paid"
              ? "bg-green-600 text-white"
              : "bg-blue-600 text-white"}
        `}>
          {
            tailoringPricePending
              ? "Enter Tailoring Prices"
              : paymentInfo.paymentStatus === "Paid"
                ? "Payment Completed"
                : paymentInfo.advancePaid > 0
                  ? `Advance Paid ₹${paymentInfo.advancePaid.toFixed(2)}`
                  : "Make Payment"
          }
        </button>
      </div>
      <p className="text-sm text-gray-400 mt-2 text-center font-medium px-5">
        {
          requireFullPayment
            ? "Full payment required for ReadyMade products"
            : "Advance payment accepted for tailoring orders"
        }
      </p>

      {/* Buttons */}
      <div className="px-5 mt-2">

        <button
          disabled={
            !hasAdvancePayment ||
            total <= 0 ||
            tailoringPricePending
          }
          onClick={() => {
            handleCreateOrder()
          }}
          className={`
      w-full py-3 mb-2 rounded-lg font-bold transition
      ${hasAdvancePayment && total > 0
              ? "bg-yellow-500 text-black"
              : "bg-[#4b4b4b] text-gray-400"
            }
    `}
        >
          Create Order
        </button>

      </div>

      {showPaymentModal && (
        <PaymentModal
          cartItems={editableCart}
          taxRate={0.00}
          requireFullPayment={requireFullPayment}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={(payment) => {


            // Update cart with edited tailoring prices
            setEditableCart(payment.updatedCart);

            // Save payment information
            setPaymentInfo({
              paid: true,
              paymentMethod: payment.paymentMethod,
              paymentStatus: payment.paymentStatus,
              cashAmount: payment.cash,
              upiAmount: payment.upi,
              advancePaid: payment.advancePaid,
              remainingAmount: payment.remainingAmount,
              discount: payment.discount,
            });

            setShowPaymentModal(false);

            enqueueSnackbar("Payment Successful!", {
              variant: "success",
            });

          }}
        />
      )}

      {
        showPriceModal && (
          <PriceModal
            item={selectedItem}
            onClose={() => {
              setShowPriceModal(false);
              setSelectedItem(null);
            }}
            onSave={(unitPrice) => {
              setEditableCart(prev =>
                prev.map(item =>
                  item.id === selectedItem.id
                    ? {
                      ...item,
                      pricePerQuantity: unitPrice,
                      price: unitPrice * item.quantity,
                    }
                    : item
                )
              );
              setShowPriceModal(false);
              setSelectedItem(null);
            }}
          />
        )
      }

      {showInvoice && (
        <Invoice
          orderInfo={orderInfo}
          onClose={() => {
            setShowInvoice(false);

            setPaymentInfo({
              paymentMethod: "",
              paymentStatus: "Pending",
              cashAmount: 0,
              upiAmount: 0,
              advancePaid: 0,
              remainingAmount: 0,
              discount: {
                type: "amount",
                value: 0,
                amount: 0,
              },
            });

            setEditableCart([]);
            setOrderInfo(null);
          }}
        />
      )}

      <DeliveryDateModal
        isOpen={showDeliveryModal}
        deliveryDate={deliveryDate}
        setDeliveryDate={setDeliveryDate}
        deliveryTime={deliveryTime}
        setDeliveryTime={setDeliveryTime}
        onClose={() => {
          setShowDeliveryModal(false);
          setDeliveryDate(today);
        }}

        onContinue={(selectedDate) => {
          setShowDeliveryModal(false);

          const orderData = buildOrderData(
            initialOrderStatus,
            selectedDate
          );

          setPendingOrderData(orderData);
          setShowAssignChoice(true);
        }}
      />
      {showAssignChoice && (
        <AssignTailorChoiceModal
          onClose={() => {
            setShowAssignChoice(false);
            setPendingOrderData(null);
          }}

          onAssignNow={() => {
            dispatch(setPendingOrder(pendingOrderData));
            setShowAssignChoice(false);
            navigate("/tailors");
          }}

          onAssignLater={() => {
            orderMutation.mutate({
              orderData: pendingOrderData,
              orderStatus: "Order Placed",
            });

            setShowAssignChoice(false);
            setPendingOrderData(null);
          }}
        />
      )}
    </div>
  );

};

export default Bill;

