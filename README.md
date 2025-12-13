# BubbleChat - Backend 🛠️

**Real-time messaging with an emotional connection.**

This is the **Backend** repository for BubbleChat. It serves as the REST API and WebSocket server, managing user authentication, message persistence, image uploads, and AI integration for mood analysis and smart replies.

**🔗 Related Repository:**
- **Frontend**: [Link to Frontend Repository](https://github.com/Nileka03/bubble-frontend.git) 

**🌐 Live Demo:** [BubbleChat App](https://bubble-frontend-six.vercel.app/)

![Project Status](https://img.shields.io/badge/status-active-warning.svg)
![License](https://img.shields.io/badge/license-ISC-blue.svg)

---

## 💡 About the Project

Text messaging often misses the nuance of face-to-face interaction. We've all experienced the struggle of running out of things to say, worrying about "cold" replies, or misinterpreting the tone of a message.

**BubbleChat** bridges this gap using AI:
- **Never run out of words**: Context-aware AI suggestions help you reply effortlessly and keep the conversation flowing, avoiding those awkward silences.
- **Feel the vibe**: Since you can't see faces or hear voices, our Mood Theme engine analyzes the emotional tone of the chat and adapts the background color accordingly. Instantly know if the conversation is joyful, serious, or affectionate.

---

## 🚀 Features

- **RESTful API**: Endpoints for authentication, user management, and message retrieval.
- **WebSocket Server**: Powered by Socket.io for real-time message delivery and online status updates.
- **AI Integration**: Connects to **Google Gemini AI** to generating smart replies and analyze chat sentiment (Mood).
- **Secure Authentication**: Uses JWT (JSON Web Tokens) seamlessly stored in HttpOnly cookies.
- **Image Storage**: Integrates with Cloudinary for efficient image hosting.

---

## 🏗 Architecture

### Project Structure

```
server/
├── controllers/        # Route Logic
│   ├── aiController.js # Handles Gemini AI requests
│   ├── auth.controller.js
│   └── message.controller.js
├── lib/                # Configuration & Helpers
│   ├── cloudinary.js   # Cloudinary setup
│   ├── db.js           # Mongoose connection
│   └── utils.js        # Token generation
├── middleware/         # Express Middleware
│   └── auth.middleware.js # Protects routes
├── models/             # Database Models
│   ├── Message.js
│   └── User.js
├── routes/             # API Route Definitions
│   ├── aiRoutes.js
│   ├── auth.routes.js
│   └── message.routes.js
├── .env                # Environment variables
├── server.js           # Entry point (Express + Socket.io)
└── package.json        # Dependencies
```

---

## 🛠 Tech Stack

- **[Node.js](https://nodejs.org/)**: A JavaScript runtime built on Chrome's V8 JavaScript engine. Used to run the server-side code.
- **[Express.js](https://expressjs.com/)**: A minimal and flexible Node.js web application framework. Used to build the REST API endpoints and handle middleware.
- **[Socket.io](https://socket.io/)**: A library that enables low-latency, bidirectional, and event-based communication between a client and a server. Used for real-time chatting.
- **[MongoDB](https://www.mongodb.com/)**: A source-available cross-platform document-oriented database program.
- **[Mongoose](https://mongoosejs.com/)**: An Object Data Modeling (ODM) library for MongoDB and Node.js. Used to define schemas for Users and Messages.
- **[Google Generative AI](https://ai.google.dev/)**: The SDK for accessing Gemini models. Used to generate smart replies and analyze the emotional tone of conversations.
- **[Cloudinary](https://cloudinary.com/)**: A SaaS technology company that provides a cloud-based image and video management service. Used to store chat images and profile pictures.
- **[Bcryptjs](https://github.com/dcodeIO/bcrypt.js)**: A library to help you hash passwords. Used to secure user passwords before storing them in the database.
- **[JSON Web Token (JWT)](https://jwt.io/)**: An open standard (RFC 7519) that defines a compact and self-contained way for securely transmitting information between parties as a JSON object. Used for stateless authentication.
- **[Cookie-Parser](https://www.npmjs.com/package/cookie-parser)**: Middleware to parse `Cookie` header and populate `req.cookies` with an object keyed by the cookie names.

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas URI (or local instance)
- Cloudinary Credentials
- Google Gemini API Key

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/bubblechat-backend.git
cd bubblechat-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configuration
Create a `.env` file in the root of the project:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<your_connection_string>
JWT_SECRET=your_super_secure_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Google AI
GEMINI_API_KEY=...

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173
```

### 4. Run Server
```bash
npm run server
# Server running on port 5000
```

---


