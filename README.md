# DebugAI | Advanced Code Debugger 🚀

**DebugAI** is a high-performance, AI-powered code debugging platform. Built with a modern glassmorphism UI, it leverages the blazing-fast **Groq API** (`llama-3.3-70b-versatile`) to instantly analyze your code, detect multiple errors, and provide exact diff-based fixes that you can apply with a single click.

✨ **Designed & Built by Mishra_ji**

![DebugAI Banner](https://img.shields.io/badge/DebugAI-Code_Debugger-6366f1?style=for-the-badge)

## 🔥 Features
- **Multi-Error Detection:** Identifies ALL errors in your code simultaneously, categorizing them by line number, type, and severity.
- **Interactive Editor Sync:** Click on any error in the output panel and the built-in IDE (Monaco Editor) will instantly scroll and highlight the exact line of code.
- **Diff View & Auto-Fix:** Provides GitHub-style Red/Green code diffs. Click "Apply Fix" to automatically inject the corrected code directly into your editor!
- **Blazing Fast AI:** Powered by a customized Node.js backend integrating the Groq LLM API, bypassing standard rate limits with built-in retry mechanisms.
- **Premium UI/UX:** Features a state-of-the-art 2-column responsive CSS Grid layout, glassmorphism overlays, and smooth CSS animations (built with Tailwind CSS and Framer Motion).

## 🛠️ Tech Stack
**Frontend:**
- React 18 + Vite
- TypeScript
- Tailwind CSS v4
- Framer Motion (Animations)
- Monaco Editor (VS Code's core editor)
- Lucide React (Icons)

**Backend:**
- Node.js + Express
- Axios
- Express Rate Limit
- Groq API (`llama-3.3-70b-versatile`)

---

## 🚀 Quick Start / Local Development

### 1. Clone the repository
```bash
git clone https://github.com/mishraji018/code-debug.git
cd code-debug
```

### 2. Set up the Backend
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory and add your Groq API key:
```env
# backend/.env
GROQ_API_KEY=gsk_your_api_key_here
```
Start the backend server:
```bash
npm start
# Server will run on http://localhost:3001
```

### 3. Set up the Frontend (In a new terminal window)
```bash
# From the root code-debug directory
npm install
npm run dev
```

### 4. Open the App!
Navigate to `http://localhost:5173` (or the port Vite provides) in your browser.

---

## 📂 Project Structure
```
├── backend/
│   ├── controllers/       # Express route handlers
│   ├── routes/            # API routing logic
│   ├── services/          # Groq LLM API Integration & Prompts
│   └── server.js          # Express app entry point
├── src/
│   ├── components/        # React Components (Editor, OutputPanel, Navbar)
│   ├── index.css          # Global Tailwind and Glassmorphism styles
│   └── main.tsx           # React DOM Entry
```

## 🔒 Security Note
Never commit your `backend/.env` file containing the `GROQ_API_KEY`. It is safely included in the `.gitignore` by default.

---
*Made with ❤️ by [Mishra_ji](https://github.com/mishraji018)*
