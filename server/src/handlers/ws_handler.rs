use std::sync::{Arc};
use axum::{
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade},
        State,
    },
    response::IntoResponse,
};
use axum::extract::Query;
use futures::{SinkExt, StreamExt};
use serde::Deserialize;
use crate::handlers::AppState;

use crate::models::{CallResponse, MessageRecv, MessageSend};

#[derive(Deserialize)]
pub(crate) struct Params {
    #[serde(rename = "user")]
    pub name: String
}

pub(crate) async fn ws_handler (
    ws: WebSocketUpgrade,
    State(state): State<Arc<AppState>>,
    Query(user): Query<Params>
) -> impl IntoResponse {
    state.users.lock().unwrap().insert(user.name.clone());
    ws.on_upgrade(|socket| handle_socket(socket, state, user.name))
}

async fn handle_socket(socket: WebSocket, state: Arc<AppState>, username: String) {
    let (mut sender, mut receiver) = socket.split();
    let mut rx = state.message_tx.subscribe();

    // Task to send messages to the WebSocket
    let mut send_task = tokio::spawn(async move {
        while let Ok(msg) = rx.recv().await {
            if msg.to == username || msg.to == "all" {
                match serde_json::to_string(&MessageSend::from(msg)) {
                    Ok(msg) => {
                        if sender.send(Message::Text(msg)).await.is_err() {
                            break;
                        }
                    },
                    Err(e) => {
                        eprintln!("Error serializing message: {:?}", e);
                    }
                }
            }
        }
    });

    // Task to receive messages from the WebSocket
    let tx = state.message_tx.clone();
    let mut recv_task = tokio::spawn(async move {
        while let Some(Ok(Message::Text(text))) = receiver.next().await {
            if let Ok(msg) = serde_json::from_str::<MessageRecv>(&text) {
                let _ = tx.send(msg);
            }
        }
    });

    // Wait for either task to finish
    tokio::select! {
        _ = (&mut send_task) => recv_task.abort(),
        _ = (&mut recv_task) => send_task.abort(),
    }
}

pub(crate) async fn call_handler (
    ws: WebSocketUpgrade,
    State(state): State<Arc<AppState>>,
    Query(user): Query<Params>
) -> impl IntoResponse {
    ws.on_upgrade(|socket| handle_call(socket, state, user.name)
    )
}

async fn handle_call(socket: WebSocket, state: Arc<AppState>, username: String) {
    let (mut sender, mut receiver) = socket.split();
    let state_clone = state.clone();

    // Task to send messages to the WebSocket
    let mut send_task = tokio::spawn(async move {
        loop {
            if let Some(call) = state_clone.get_call(username.clone()) {
                match serde_json::to_string(&call) {
                    Ok(msg) => {
                        if sender.send(Message::Text(msg)).await.is_err() {
                            break;
                        }
                    },
                    Err(e) => {
                        eprintln!("Error serializing message: {:?}", e);
                    }
                }
            }
        }
    });

    // Task to receive messages from the WebSocket
    let tx = state.call_tx.clone();
    let mut recv_task = tokio::spawn(async move {
        while let Some(Ok(Message::Text(text))) = receiver.next().await {
            if let Ok(msg) = serde_json::from_str::<CallResponse>(&text) {
                state.add_call(msg.clone());
                let _ = tx.send(msg);
            }
        }
    });

    // Wait for either task to finish
    tokio::select! {
        _ = (&mut send_task) => recv_task.abort(),
        _ = (&mut recv_task) => send_task.abort(),
    }
}