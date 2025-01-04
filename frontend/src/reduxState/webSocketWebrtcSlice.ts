import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface WebSocketWebrtcState {
    msgWs: WebSocket | null;
    callWs: WebSocket | null;
    peerConnection: RTCPeerConnection | null;
    remoteCandidates: RTCIceCandidate[];
}

const initialState: WebSocketWebrtcState = {
    msgWs: null,
    callWs: null,
    peerConnection: null,
    remoteCandidates: [],
};

const webSocketWebrtcSlice = createSlice({
    name: "webSocketWebRTC",
    initialState,
    reducers: {
        setMsgWebSocket: (state, action: PayloadAction<WebSocket>) => {
            state.msgWs = action.payload;
        },
        setCallWebSocket: (state, action: PayloadAction<WebSocket>) => {
            state.callWs = action.payload;
        },
        setPeerConnection: (
            state,
            action: PayloadAction<RTCPeerConnection>
        ) => {
            state.peerConnection = action.payload;
        },
        addRemoteCandidate: (state, action: PayloadAction<RTCIceCandidate>) => {
            state.remoteCandidates.push(action.payload);
        },
    },
});

export const {
    setMsgWebSocket,
    setCallWebSocket,
    setPeerConnection,
    addRemoteCandidate,
} = webSocketWebrtcSlice.actions;

export default webSocketWebrtcSlice.reducer;
