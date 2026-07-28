import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    orderData: null,
};


const pendingOrderSlice = createSlice({

    name: "pendingOrder",

    initialState,

    reducers: {

        setPendingOrder: (state, action) => {
            state.orderData = action.payload;
        },


        clearPendingOrder: (state) => {
            state.orderData = null;
        },

    },

});
export const {
    setPendingOrder,
    clearPendingOrder,
} = pendingOrderSlice.actions;


export default pendingOrderSlice.reducer;