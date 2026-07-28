export const formatCurrency = (amount) => {
    const value = Math.abs(Number(amount)).toFixed(2);
    return Number(amount) < 0 ? `-₹${value}` : `₹${value}`;
};