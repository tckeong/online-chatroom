use diesel::pg::PgConnection;
use diesel::prelude::*;
use dotenvy::dotenv;
use std::env;
use axum::response::IntoResponse;
use axum::{http::Response, http::StatusCode, body::Body};
use crate::models::{DBUser, LoginUser, User};
use bcrypt::{hash, DEFAULT_COST};


pub enum DBError {
    ConnectionError,
    QueryError,
}

impl IntoResponse for DBError {
    fn into_response(self) -> Response<Body> {
        match self {
            DBError::ConnectionError=> {
                StatusCode::INTERNAL_SERVER_ERROR.into_response()
            },
            DBError::QueryError => {
                StatusCode::BAD_REQUEST.into_response()
            },
        }
    }
}

pub struct DBConnection {
    pub connection: PgConnection,
}

impl DBConnection {
    pub fn new() -> Result<Self, DBError> {
        dotenv().ok();

        let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
        let conn = PgConnection::establish(&database_url)
                .map_err(|_| DBError::ConnectionError)?;

        Ok(Self {
            connection: conn,
        })
    }

    pub fn register(&mut self, user: User) -> Result<(), DBError> {
        use crate::schema::users::dsl::*;

        let user = User {
            password: Self::hashed_password(&user.password),
            ..user
        };

        diesel::insert_into(users)
            .values(&user)
            .execute(&mut self.connection)
            .map_err(|_| DBError::ConnectionError)?;

        Ok(())
    }

    pub fn login(&mut self, user: LoginUser) -> Result<DBUser, DBError> {
        use crate::schema::users::dsl::*;

        let result: DBUser = users
            .filter(email.eq(&user.email))
            .first(&mut self.connection)
            .map_err(|_| DBError::QueryError)?;

        if !Self::verify_password(&user.password, &result.password) {
            return Err(DBError::QueryError);
        }

        Ok(result)
    }

    fn hashed_password(password: &str) -> String {
        hash(password, DEFAULT_COST).unwrap()
    }

    fn verify_password(password: &str, hash: &str) -> bool {
        bcrypt::verify(password, hash).unwrap()
    }
}