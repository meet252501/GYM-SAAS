# GymFlow Pro

GymFlow Pro is a unified MERN-stack gym management platform designed for modern fitness centers. It combines gym operations, real-time AI coaching, attendance tracking, and member gamification into a single, high-performance PWA (Progressive Web App).

## 🚀 Features

### For Gym Owners & Staff
*   **Multi-tenant SaaS Architecture**: Data is strictly isolated by `gymId`.
*   **Real-Time Kiosk**: Socket.io-powered rotating PIN system for secure, contactless check-ins.
*   **Automated Billing**: Stripe and Razorpay integrations with automatic PDF invoice generation.
*   **Deep Analytics**: Real-time tracking of MRR, Churn Rate, Retention, and Class capacity.

### For Members
*   **Cyber Protocol UI**: A glassmorphic, immersive design system with high-fidelity Neural GIF demonstrations.
*   **AI Coach (Llama 3.1)**: Personalized workout suggestions based on historical volume and muscle focus.
*   **Nutrition HQ (Gemini Vision)**: AI-powered food scanning and barcode integrations for macro tracking.
*   **Gamification**: Badges (Cyber Evolution), streaks, and PR (Personal Record) auto-detection.

## 🛠️ Tech Stack
*   **Frontend**: React (Vite), Zustand (State), Framer Motion (Animations), Tailwind/CSS Modules.
*   **Backend**: Node.js, Express, Socket.io (Real-time events).
*   **Database**: MongoDB (Mongoose ORM) + Redis (Session Caching).
*   **AI Integrations**: Groq SDK (Llama), Google Generative AI (Gemini).

## 📂 Project Structure

The codebase strictly adheres to industry-standard patterns:
*   `/client`: Frontend React application.
    *   `/src/api`: Axios interceptors and centralized API services.
    *   `/src/components/ui`: Reusable, atomic design components.
    *   `/src/pages`: Feature-based routing views.
*   `/server`: Backend Node/Express API.
    *   `/src/controllers`: Request handling and business logic orchestration.
    *   `/src/services`: Heavy, reusable business operations (Invoices, Badges, Email).
    *   `/src/models`: Mongoose schemas with strict validations.
    *   `/src/routes`: API endpoint definitions and RBAC middleware.

## 🏁 Getting Started

### 1. Prerequisites
*   Node.js v18+
*   MongoDB Atlas Account
*   Groq API Key (for Llama 3.1)
*   Gemini API Key (for Vision)

### 2. Backend Setup
\`\`\`bash
cd server
npm install
cp .env.example .env
# Populate the .env variables
npm run dev
\`\`\`

### 3. Frontend Setup
\`\`\`bash
cd client
npm install
npm run dev
\`\`\`

## 🛡️ Security & Performance
*   **RBAC**: Role-Based Access Control via JWT (Owner, Trainer, Member).
*   **Sanitization**: `express-mongo-sanitize` and `helmet` implemented to prevent NoSQL injection and XSS.
*   **Asset Optimization**: All exercise animations are locally hosted for 100% uptime and offline PWA capability.
