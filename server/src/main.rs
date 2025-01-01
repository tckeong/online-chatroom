use axum::{routing::get, Router};
use std::{
    sync::{Arc},
};
use std::error::Error;
use std::net::{IpAddr, Ipv4Addr, SocketAddr};
use axum::http::Method;
use axum::routing::post;
use tokio::sync::broadcast;
use tower_http::cors::{Any, CorsLayer};

mod handlers;
mod models;
mod db;
mod schema;

use handlers::{ws_handler};
use crate::models::{CallResponse, MessageRecv};

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>>{
    let (message_tx, mut message_rx) = broadcast::channel::<MessageRecv>(100);
    let (call_tx, mut call_rx) = broadcast::channel::<CallResponse>(100);
    let app_state = Arc::new(handlers::AppState::new(message_tx, call_tx));
    let cors = CorsLayer::new()
        .allow_methods([Method::GET, Method::POST])
        .allow_headers(Any)
        .allow_origin(Any);

    // Get the local IP address
    let local_ip = get_local_ip().expect("Failed to get local IP address");

    let app = Router::new()
        .route("/ws", get(ws_handler::ws_handler))
        .route("/register", post(handlers::register_handler))
        .route("/login", post(handlers::login_handler))
        .route("/users", get(handlers::get_all_users))
        .route("/logout", get(handlers::logout_handler))
        .route("/call", get(ws_handler::call_handler))
        .layer(cors)
        .with_state(app_state);

    let port = 8080;
    let addr = SocketAddr::new(IpAddr::V4(Ipv4Addr::UNSPECIFIED), port);
    let listener = tokio::net::TcpListener::bind(&addr).await?;

    tokio::spawn(async move {
        loop {
            if let Ok(msg) = message_rx.recv().await {
                println!("Broadcasting message: {:?}", msg);
            }

        }
    });

    tokio::spawn(async move {
        loop {
            if let Ok(call) = call_rx.recv().await {
                println!("Broadcasting call: {:?}", call);
            }
        }
    });

    println!("Listening on http://{}:8080", local_ip);
    println!("You can also access it via http://localhost:8080");
    axum::serve(listener, app).await?;
    Ok(())
}

fn get_local_ip() -> Option<Ipv4Addr> {
    let socket = std::net::UdpSocket::bind("0.0.0.0:0").ok()?;
    socket.connect("8.8.8.8:80").ok()?;
    socket.local_addr().ok()?.ip().to_string().parse().ok()
}