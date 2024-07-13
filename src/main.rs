use axum::{routing::get, Router, http};
use std::{
    sync::{Arc},
};
use axum::http::Method;
use axum::routing::post;
use tokio::sync::broadcast;
use tower_http::cors::{Any, CorsLayer};
use http::header;

mod handlers;
mod models;
mod db;
mod schema;

use handlers::{ws_handler};
use crate::models::MessageRecv;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>>{
    let (tx, mut rx) = broadcast::channel::<MessageRecv>(100);
    let app_state = Arc::new(handlers::AppState::new(tx));
    let cors = CorsLayer::new()
        .allow_methods([Method::GET, Method::POST])
        .allow_headers([header::CONTENT_TYPE])
        .allow_origin(Any);

    let app = Router::new()
        .route("/ws", get(ws_handler::ws_handler))
        .route("/register", post(handlers::register_handler))
        .route("/login", post(handlers::login_handler))
        .route("/users", get(handlers::get_all_users))
        .route("/logout", get(handlers::logout_handler))
        .layer(cors)
        .with_state(app_state);

    let ip_addr = "localhost";
    let port = 8080;
    let addr = format!("{}:{}", ip_addr, port);
    let listener = tokio::net::TcpListener::bind(&addr).await?;

    tokio::spawn(async move {
        loop {
            if let Ok(msg) = rx.recv().await {
                println!("Broadcasting message: {:?}", msg);
            }
        }
    });

    println!("Listening on: {}", addr);
    axum::serve(listener, app).await?;
    Ok(())
}