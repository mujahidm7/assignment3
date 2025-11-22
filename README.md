# Assignment 3 – Assignment Tracker

## Overview
This is a secure CRUD web application that lets a logged-in user track their school assignments.

## Features
- User registration and login (passwords hashed with bcrypt)
- Session-based authentication using express-session and connect-mongo
- Create, read, update, and delete assignments
- Each assignment has title, course, due date, and status
- MongoDB Atlas for data storage
- Deployed on Render

## Tech Stack
- Node.js, Express.js
- MongoDB + Mongoose
- EJS templates
- Bootstrap + custom CSS

## How to Run Locally
1. Clone the repo.
2. Run `npm install`.
3. Create a `.env` file with:
   - `MONGO_URI=...`
   - `SESSION_SECRET=...`
4. Run `npm run dev` and open `http://localhost:3000`.

