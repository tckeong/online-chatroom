import { configureStore } from "@reduxjs/toolkit";
import webSocketWebrtcReducer from "./webSocketWebrtcSlice";

export const stateStore = configureStore({
    reducer: {
        webSocketWebRTC: webSocketWebrtcReducer,
    },
});

export type RootState = ReturnType<typeof stateStore.getState>;
export type AppDispatch = typeof stateStore.dispatch;
