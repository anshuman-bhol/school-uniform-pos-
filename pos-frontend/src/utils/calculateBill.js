export const calculateBill = (
  cartItems,
  discount = {
    type: "amount",
    value: 0,
  },
  taxRate = 0.00
) => {
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (Number(item.price) || 0),
    0
  );

  const tax = (subtotal * taxRate) / 100;
  const totalWithTax = subtotal + tax;

  const rawDiscount =
    discount.type === "percentage"
      ? totalWithTax * ((discount.value || 0) / 100)
      : (discount.value || 0);

  const discountAmount = Math.min(rawDiscount, totalWithTax);

  const finalAmount = totalWithTax - discountAmount;

  return {
    subtotal,
    tax,
    totalWithTax,
    discountAmount,
    finalAmount,
  };
};