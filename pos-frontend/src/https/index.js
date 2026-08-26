import axios from "axios"

export const ACCESS_TOKEN_KEY = "accessToken";

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
    }
})

api.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
});


export const login = (data) => api.post("/api/user/login", data)
export const register = (data) => api.post("/api/user/register", data)
export const sendOtp = (data) => api.post("/api/user/send-otp", data);
export const verifyOtp = (data) => api.post("/api/user/verify-otp", data);
export const getUserData = () => api.get("/api/user")
export const logout = () => api.post("/api/user/logout")

export const addTailor = (data) => api.post("/api/tailor/", data)
export const getTailors = () => api.get("/api/tailor")
export const updateTailor = ({ tailorId, ...tailorData }) => api.put(`/api/tailor/${tailorId}`, tailorData);
export const addOrder = (data) => api.post("/api/order/", data)
export const getOrders = () => api.get("/api/order")
export const getPaymentLedger = () => api.get("/api/order/payment-ledger");
export const getOrderById = (id) => api.get(`/api/order/${id}`);
export const createReturn = (data) => api.post("/api/return-exchange/return", data);
export const createExchange = (data) => api.post("/api/return-exchange/exchange", data);
export const deleteTailor = (id) => api.delete(`/api/tailor/${id}`);
export const assignTailor = (orderId, tailorId) => api.put(`/api/order/${orderId}`, { tailor: tailorId, });
export const updateOrderStatus = ({ orderId, readyMadeStatus, tailoringStatus, tailor, }) => api.put(`/api/order/${orderId}`, { readyMadeStatus, tailoringStatus, tailor, });
export const updateOrderBill = ({ orderId, ...data }) => api.put(`/api/order/${orderId}/bill`, data);
export const changeOrderTailor = ({ orderId, tailorId }) => api.put(`/api/order/${orderId}/change-tailor`, {tailorId,});
export const updateOrderPayment = ({ orderId, paymentData }) => api.put(`/api/order/${orderId}/payment`, paymentData);
export const downloadCatalogueTemplate = () => api.get("/api/template/catalogue", { responseType: "blob", });
export const downloadStockTemplate = () => api.get("/api/template/stock", { responseType: "blob", });

export const uploadCatalogue = (formData) => api.post("/api/product/catalogue-upload", formData, {headers: { "Content-Type": "multipart/form-data", },});
export const addProducts = (formData) => api.post("api/product/add-products", formData, {headers: { "Content-Type": "multipart/form-data", },});
export const uploadStock = (formData) => api.post("/api/product/stock-upload", formData, {headers: { "Content-Type": "multipart/form-data", },});

export const updateStockManual = (data) => api.put("/api/product/stock/manual", data);
export const getProducts = () => api.get("/api/product");
export const getStockHistory = () => api.get("/api/product/history");

// -------------------- ADMIN --------------------

export const getUsers = (status) => api.get(`/api/admin/users?status=${status}`);
export const approveUser = ({ userId, role }) => api.put(`/api/admin/approve/${userId}`, { role });
export const rejectUser = ({ userId, rejectionReason }) => api.put(`/api/admin/reject/${userId}`, {rejectionReason,});