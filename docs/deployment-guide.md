# Deployment Guide

This guide covers deploying the AI ATS Resume Scorer platform to free/low-cost cloud providers.

## 1. Database (Cloud MySQL)
We recommend **Aiven**, **Railway**, or **PlanetScale** for a free/cheap MySQL database.
1. Create an account on Railway (railway.app).
2. Provision a new "MySQL" database.
3. Copy the database credentials (Host, Port, User, Password, Database Name).

## 2. Backend Deployment (Render or Railway)
We recommend **Render.com** for hosting the Node.js API.
1. Push your repository to GitHub.
2. Go to Render.com and create a new **Web Service**.
3. Connect your GitHub repository.
4. Set the Root Directory to `server`.
5. Build Command: `npm install`
6. Start Command: `npm start` (ensure `package.json` has `"start": "node src/server.js"`)
7. **Environment Variables:** Add all variables from your `.env` file here, replacing local DB credentials with your Railway DB credentials. Set `CLIENT_URL` to your future frontend URL.

## 3. Frontend Deployment (Vercel)
We recommend **Vercel** for the React frontend.
1. Go to Vercel.com and create a new project.
2. Import your GitHub repository.
3. Set the Framework Preset to `Vite`.
4. Set the Root Directory to `client`.
5. **Important Configuration:** In Vite, proxying only works locally. For production, you must configure Axios to use your Render backend URL.
   
   *Update `client/src/services/api.js`:*
   ```javascript
   const api = axios.create({
     baseURL: import.meta.env.VITE_API_URL || '/api', 
   });
   ```
   *Update Socket.io in `client/src/pages/Analysis.jsx`:*
   ```javascript
   const socketUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
   const socket = io(socketUrl, { auth: { token } });
   ```
6. Add `VITE_API_URL` to your Vercel Environment Variables, pointing to your Render backend (e.g., `https://ats-api.onrender.com/api`).
7. Deploy!
