# DevPulse - Internal Tech Issue & Feature Tracker

[![Live API](https://img.shields.io/badge/Live%20API-Up-brightgreen?style=for-the-badge)](https://devpulse-api.up.railway.app)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github)](https://github.com/najmulcodes/devpulse)

DevPulse is a robust and scalable REST API for tracking internal technical issues and feature requests. Built with a modern tech stack, it provides a clean, secure, and efficient way for development teams to manage their workflow.

---

## ✨ Features

- **Modular Architecture**: Code is organized by feature modules (auth, issues) for better maintainability and scalability.
- **JWT Authentication**: Secure, stateless authentication using JSON Web Tokens.
- **Role-Based Access Control (RBAC)**: Differentiated permissions for `contributor` and `maintainer` roles.
- **Raw SQL with No ORM**: Full control over database queries using the `pg` library for optimal performance.
- **Dynamic Filtering & Sorting**: `GET /api/issues` endpoint supports dynamic filtering by `type` and `status`, and sorting by creation date.

---

## 🛠️ Tech Stack

| Category          | Technology                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------ |
| **Backend**       | Node.js, Express.js                                    |
| **Language**      | TypeScript                                                          |
| **Database**      | PostgreSQL (hosted on NeonDB)                       |
| **Authentication**| bcrypt (hashing), JWT (tokens)                |
| **Deployment**    | Railway                                                                        |

---

## 🚀 Local Setup

Follow these steps to get the project running on your local machine.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/najmulcodes/devpulse.git
    cd devpulse
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root directory by copying the example file:
    ```bash
    cp .env.example .env
    ```
    Then, fill in the required values in the `.env` file.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The server will start on the port specified in your `.env` file (default: 5000).

---

## ⚙️ Environment Variables

The following environment variables are required for the application to run:

| Variable         | Description                                                                 | Example                                                              |
| ---------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `DATABASE_URL`   | Your full PostgreSQL connection string.                                     | `postgresql://user:password@host:port/dbname`                        |
| `JWT_SECRET`     | A long, random, and secret string for signing JWTs.                         | `a-very-long-and-super-secret-key-for-jwt`                           |
| `NODE_ENV`       | The application environment.                                                | `development` or `production`                                        |
| `PORT`           | The port on which the server will run.                                      | `5000`                                                               |

---

## 🗃️ Database Schema

The database consists of two main tables:

#### `users`
- `id` (Primary Key)
- `name`
- `email` (Unique)
- `password` (Hashed)
- `role` (`contributor` or `maintainer`)
- `created_at`
- `updated_at`

#### `issues`
- `id` (Primary Key)
- `title`
- `description`
- `type` (`bug` or `feature_request`)
- `status` (`open`, `in_progress`, or `resolved`)
- `reporter_id` (Foreign Key to `users.id`)
- `created_at`
- `updated_at`

---

## Endpoints

| Method  | Endpoint               | Access       | Description                                                  |
| :------ | :--------------------- | :----------- | :----------------------------------------------------------- |
| `POST`  | `/api/auth/signup`     | **Public**   | Register a new user.                                         |
| `POST`  | `/api/auth/login`      | **Public**   | Log in to receive a JSON Web Token (JWT).                    |
| `POST`  | `/api/issues`          | Authenticated| Create a new issue.                                          |
| `GET`   | `/api/issues`          | **Public**   | Get all issues. Supports filtering and sorting.              |
| `GET`   | `/api/issues/:id`      | **Public**   | Get a single issue by its ID.                                |
| `PATCH` | `/api/issues/:id`      | Authenticated| Update an issue's details.                                   |
| `DELETE`| `/api/issues/:id`      | Maintainer   | Delete an issue.                                             |

---

## 🔐 Authorization Rules

Access to certain endpoints is restricted based on user roles:

- **Contributor** (default role):
  - Can create new issues.
  - Can update their **own** issues, but only if the issue `status` is `open`.
  - Cannot delete any issues.

- **Maintainer**:
  - Has all the permissions of a `contributor`.
  - Can update **any** issue, regardless of its status.
  - Can delete **any** issue.

---

## 📦 Request & Response Examples

### User Signup

**`POST /api/auth/signup`**

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "password": "securePassword123"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "role": "contributor"
  }
}
```

### Create Issue

**`POST /api/issues`** (Requires Bearer Token)

**Request Body:**
```json
{
  "title": "API endpoint returning 500 error",
  "description": "The /api/users/profile endpoint is consistently returning a 500 Internal Server Error when a valid token is provided. This started after the last deployment.",
  "type": "bug"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Issue created successfully",
  "data": {
    "id": 101,
    "title": "API endpoint returning 500 error",
    "description": "The /api/users/profile endpoint is consistently returning a 500 Internal Server Error when a valid token is provided. This started after the last deployment.",
    "type": "bug",
    "status": "open",
    "reporter_id": 1,
    "created_at": "2023-10-27T10:00:00.000Z",
    "updated_at": "2023-10-27T10:00:00.000Z"
  }
}
```