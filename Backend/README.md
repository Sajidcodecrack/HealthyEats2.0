# HealthyEats 2.0 Backend Setup Guide

This documentation walks new developers through setting up and running the HealthyEats 2.0 backend locally.

---

## 1. Project Overview

The HealthyEats 2.0 backend is a Node.js service using Express and MongoDB. It provides RESTful APIs for user management, meal planning, health tracking, and AI-driven recommendations.

## 2. Prerequisites

* **Node.js** ≥14.x
* **npm** (comes with Node.js)
* **MongoDB** Community Edition running locally or access to a MongoDB Atlas cluster
* **Git** for source control

## 3. Clone the Repository

```bash
git clone https://github.com/Sajidcodecrack/HealthyEats2.0.git
cd HealthyEats2.0
```

Replace `origin` URL if using a different remote.

## 4. Install Dependencies

```bash
npm install
```

This installs:

* **express**: HTTP server framework
* **mongoose**: MongoDB ODM
* **dotenv**: Environment variable loader
* **nodemon** (dev): Automatic server restarts on file changes

## 5. Environment Variables

Create a `.env` file at project root with the following:

```dotenv
MONGODB_URI=mongodb://localhost:27017/HealthyEats2.0
PORT=4000
```

* `MONGODB_URI`: Your MongoDB connection string (local or Atlas)
* `PORT`: Port for Express server

## 6. Folder Structure

```
HealthyEats2.0/
├─ controllers/   # Route handlers implementing business logic
├─ models/        # Mongoose schema definitions
├─ routes/        # Express router configurations
├─ services/      # Reusable helper functions & integrations
├─ server.js      # Entry point: loads env, connects DB, mounts routers
├─ .env           # Local environment variables (ignored by Git)
├─ .gitignore     # Files/folders to exclude from Git
└─ package.json   # Project metadata & scripts
```

## 7. Database Setup

Ensure MongoDB is running locally on port 27017, or update `MONGODB_URI`:

```bash
# Windows (PowerShell as admin)
net start MongoDB
```

## 8. Running the Server

* **Development** (with auto-restart):

  ```bash
  npm run dev
  ```
* **Production**:

  ```bash
  npm start
  ```node server.js

By default, the server listens on `http://localhost:4000/`. A health-check endpoint is available at `/`.

## 9. Testing Endpoints

Use tools like **Postman** or **curl** to verify APIs. Example:

```bash
curl http://localhost:4000/api/users
```

(Assuming you have mounted `user` routes under `/api/users`.)

## 10. Linting & Formatting

Ensure code style by running (if set up):

```bash
npm run lint
npm run format
```

*(Add ESLint/Prettier configs if desired.)*

## 11. Contributing

1. **Branching**: Create feature branches off `main`:

   ```bash
   git checkout -b feature/<your-feature>
   ```
2. **Pull Requests**: Target `main`, include clear description, and link related issues.
3. **Code Reviews**: Ensure tests (if any) pass and code adheres to style guidelines.

---

Welcome aboard—happy coding! 🚀

