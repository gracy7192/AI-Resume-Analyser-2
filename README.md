# AI ATS Resume Scorer Platform

A complete, production-ready, full-stack AI-powered ATS (Applicant Tracking System) platform. It allows users to upload their resumes, paste job descriptions, and receive a highly detailed, algorithmically generated ATS score with actionable improvement suggestions.

## 🌟 Features

- **Authentication System:** Secure JWT-based registration and login.
- **File Parsing:** Robust extraction of text from PDF (`pdf-parse`) and DOCX (`mammoth`) formats.
- **AI/NLP Engine (100% Offline):** 
  - **TF-IDF Keyword Matching:** Extracts core keywords from the JD and checks resume frequency.
  - **Cosine Similarity:** Mathematically measures semantic alignment between resume and JD vectors.
  - **Pattern Matching:** Detects years of experience, action verbs, job titles, and degrees.
  - **Skill Extraction:** Uses a curated dictionary of 200+ industry skills to identify gaps.
- **Real-Time Progress:** Uses Socket.IO to provide live feedback while the AI analyzes the document.
- **Dashboards:** User dashboard for history tracking; Admin dashboard for platform-wide analytics.
- **Modern UI:** Glassmorphism design built with Tailwind CSS, React Router v6, and Framer Motion.

---

## 🛠️ Tech Stack

**Frontend:** React, Vite, Tailwind CSS v3, Framer Motion, Chart.js, React-Router-DOM, Axios
**Backend:** Node.js, Express.js, Sequelize ORM, MySQL, JWT, Multer, Socket.IO
**Testing:** Jest, Supertest

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- **Node.js:** v18+ 
- **MySQL:** Installed and running locally

### 2. Database Setup
1. Open your MySQL client (e.g., MySQL Workbench or CLI).
2. Create the database: `CREATE DATABASE ats_resume;`
3. The Sequelize ORM will automatically create all tables (`users`, `resumes`, `job_descriptions`, `analyses`) when the server starts.

### 3. Backend Setup
```bash
cd server
npm install
cp .env.example .env
```
*Edit the `.env` file to include your MySQL credentials.*
```bash
npm run dev
```

### 4. Frontend Setup
```bash
cd client
npm install
npm run dev
```

The frontend will start on `http://localhost:5173` and automatically proxy API requests to the backend on `http://localhost:5000`.

---

## 🧪 Running Tests
The backend contains unit tests for the AI Scoring engine and integration tests for Authentication.
```bash
cd server
npm test
```

---

## 📁 Project Architecture
Refer to the `docs/` folder for deeper technical insights:
- `docs/architecture.md` - System design and data flow.
- `docs/api-documentation.md` - Detailed API endpoints.
- `docs/deployment-guide.md` - Steps for cloud deployment (Vercel + Render).
