use std::time::{SystemTime, UNIX_EPOCH};
use serde::{Deserialize, Serialize};
use diesel::prelude::*;
use crate::schema::users;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct MessageRecv {
    pub from: String,
    pub content: String,
    pub to: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct MessageSend {
    #[serde(rename = "username")]
    pub name: String,
    pub content: String,
    #[serde(rename = "isPrivate")]
    pub is_private: bool,
    #[serde(rename = "timeStamp")]
    pub time: String,
}

#[derive(Queryable, Selectable, Debug)]
#[diesel(table_name = users)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct DBUser {
    pub id: i32,
    pub name: String,
    pub email: String,
    pub password: String,
}

#[derive(Deserialize)]
pub struct LoginUser {
    pub email: String,
    pub password: String,
}

#[derive(Insertable, Deserialize)]
#[diesel(table_name = users)]
pub struct User {
    pub name: String,
    pub password: String,
    pub email: String,
}

impl From<MessageRecv> for MessageSend {
    fn from(msg: MessageRecv) -> Self {
        Self {
            name: msg.from,
            content: msg.content,
            time: SystemTime::now()
                    .duration_since(UNIX_EPOCH)
                    .unwrap()
                    .as_millis()
                    .to_string(),
            is_private: msg.to != "all",
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CallMessage {
    #[serde(rename = "type")]
    pub call_type: String,
    pub payload: String,
    pub to: String,
    pub from: String
}