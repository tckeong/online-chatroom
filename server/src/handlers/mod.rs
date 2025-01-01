use std::collections::{HashMap, HashSet};
use std::sync::{Arc, Mutex};
use axum::extract::{Query, State};
use axum::Json;
use axum::response::IntoResponse;
use serde_json::json;
use tokio::sync::broadcast;
use crate::models::{CallMessage, LoginUser, MessageRecv, User};
use crate::db::{DBConnection, DBError};
use crate::handlers::ws_handler::Params;

pub(crate) mod ws_handler;

// Shared state
pub struct AppState {
    message_tx: broadcast::Sender<MessageRecv>,
    pub call_tx: broadcast::Sender<CallMessage>,
    users: Mutex<HashSet<String>>,
}

impl AppState {
    pub fn new(message_tx: broadcast::Sender<MessageRecv>, call_tx: broadcast::Sender<CallMessage>) -> Self {
        Self {
            message_tx,
            call_tx,
            users: Mutex::new(HashSet::from(["all".to_string()])),
        }
    }
}

pub(crate) async fn register_handler(Json(user): Json<User>) -> Result<(), DBError> {
    DBConnection::new()?.register(user)
}

pub(crate) async fn login_handler(Json(user): Json<LoginUser>) -> Result<impl IntoResponse, DBError> {
    let user = DBConnection::new()?.login(user)?;
    Ok(Json(json!({
        "name": user.name,
    })))
}

pub(crate) async fn get_all_users(State(state): State<Arc<AppState>>) -> impl IntoResponse {
    let users: Vec<String> = state.users.lock().unwrap().iter().cloned().collect();

    Json(json!({
        "users": users,
    }))
}

pub(crate) async fn logout_handler(State(state): State<Arc<AppState>>, Query(user): Query<Params>) -> impl IntoResponse {
    state.users.lock().unwrap().remove(&user.name);
    "Logged out"
}