import React, { createContext, useState, useEffect, ReactNode } from "react";
import { backendWsUrl } from "./pages/components/apiEndpoint";

export interface ConnContextType {
    msgSocket: WebSocket | null;
    callSocket: WebSocket | null;
    peerConnection: RTCPeerConnection | null;
}

export const ConnContext = createContext<ConnContextType>({
    msgSocket: null,
    callSocket: null,
    peerConnection: null,
});

export const ConnProvider: React.FC<{ user: string; children: ReactNode }> = ({
    user,
    children,
}) => {
    const [msgSocket, setMsgSocket] = useState<WebSocket | null>(null);
    const [callSocket, setCallSocket] = useState<WebSocket | null>(null);
    const [peerConnection, setPeerConnection] =
        useState<RTCPeerConnection | null>(null);

    useEffect(() => {
        if (user == "") return;

        const server = {
            iceServers: [
                {
                    urls: [
                        "stun:stun.l.google.com:19302",
                        "stun:stun1.l.google.com:19302",
                        "stun:stun2.l.google.com:19302",
                    ],
                },
            ],
        };

        const newMsgSocket = new WebSocket(
            `${backendWsUrl}/ws?user=${encodeURIComponent(user)}`
        );
        const newCallSocket = new WebSocket(
            `${backendWsUrl}/call?user=${encodeURIComponent(user)}`
        );
        const newPeerConnection = new RTCPeerConnection(server);

        setMsgSocket(newMsgSocket);
        setCallSocket(newCallSocket);
        setPeerConnection(newPeerConnection);
    }, [user]);

    return (
        <ConnContext.Provider value={{ msgSocket, callSocket, peerConnection }}>
            {children}
        </ConnContext.Provider>
    );
};
