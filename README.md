# User Management Service

## Overview

The **User Management Service** is a RESTful API built with NestJS. It provides functionalities for managing users, including user creation, authentication, and blocking/unblocking users. It also includes caching mechanisms to optimize search operations and handles user blocking/unblocking with cache invalidation.

## Features

- **User Creation:** Register new users.
- **User Authentication:** Login users and issue JWT tokens.
- **User Search:** Search users based on username and age range with caching.
- **Block/Unblock Users:** Block or unblock users, with cache invalidation.
- **Error Handling:** Proper error handling and response formatting.

## Technologies

- **NestJS:** Framework for building efficient, reliable, and scalable server-side applications.
- **PostgreSQL:** Database for storing user and block information.
- **TypeORM:** ORM for interacting with the PostgreSQL database.
- **Cache Manager:** Caching mechanism for optimizing search operations.

## Installation

1. **Clone the Repository:**


   git clone https://github.com/your-repo/user-management-service.git
   cd user-management-service


2. **Install Dependencies:**

    npm install

3. **Setup Environment Variables:**

    DATABASE_HOST=localhost
    DATABASE_PORT=5432
    DATABASE_USERNAME=your_username
    DATABASE_PASSWORD=your_password
    DATABASE_NAME=your_database
    JWT_SECRET=your_jwt_secret

## Usage

1. **Run the Application:**

    npm run start

2. **Run Tests:**

    npm run test


# Endpoints

## User Management

1. **Create User:**

    POST /users/create
    Request Body: { "username": "string", "pwd": "string", "name": "string", "surname": "string", "birthdate": "YYYY-MM-DD" }
    Response: { "statusCode": 200, "message": "User created successfully", "data": {...}, "timestamp": "ISO_DATE" }

2. **Login User:**

    POST /users/login
    Request Body: { "username": "string", "pwd": "string" }
    Response: { "statusCode": 200, "message": "User fetched successfully", "data": { "username": "string", "access_token": "string" }, "timestamp": "ISO_DATE" }

3. **Search User:**

    GET /users/search?username=string&minAge=number&maxAge=number
    Response: { "statusCode": 200, "message": "Users fetched successfully", "data": [{...}, {...}], "timestamp": "ISO_DATE" }

4. **Get User by ID:**

    GET /users/:id
    Response: { "statusCode": 200, "message": "User fetched successfully", "data": {...}, "timestamp": "ISO_DATE" }

5. **Update User:**

    PUT /users
    Request Body: { "name": "string", "surname": "string", "birthdate": "YYYY-MM-DD" }
    Response: { "statusCode": 200, "message": "User updated successfully", "data": {...}, "timestamp": "ISO_DATE" }

6. **Delete User:**

      DELETE /users
      Response: { "statusCode": 200, "message": "User deleted successfully", "data": {...}, "timestamp": "ISO_DATE" }


## Block Management

1. **Block User:**

    POST /block/:blockedId
    Response: { "statusCode": 200, "message": "User blocked successfully", "timestamp": "ISO_DATE" }

2. **UnBlock User:**

    DELETE /block/:blockedId
    Response: { "statusCode": 200, "message": "User unblocked successfully", "timestamp": "ISO_DATE" }
