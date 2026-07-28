import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    orderId: "",
    customerName: "",
    customerPhone: "",
    deliveryDate: "",
    remarks: "",
}

const customerSlice = createSlice({
    name: "customer",

    initialState,

    reducers: {

        setCustomer: (state, action) => {
            const {
                name,
                phone,
                deliveryDate,
                remarks,
            } = action.payload;

            if (!state.orderId) {
                state.orderId = `${Date.now()}`;
            }

            state.customerName = name;
            state.customerPhone = phone;
            state.deliveryDate = deliveryDate;
            state.remarks = remarks;
        },

        removeCustomer: (state) => {
            state.orderId = "";
            state.customerName = "";
            state.customerPhone = "";
            state.deliveryDate = "";
            state.remarks = "";
        },

        assignTailor: (state, action) => {

            state.tailor = action.payload;

        },

    },

});

export const {
    setCustomer,
    removeCustomer,
    assignTailor,
} = customerSlice.actions;

export default customerSlice.reducer;