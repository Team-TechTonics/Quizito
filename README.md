# 🧠 Quizito - AI-Powered Interactive Learning Platform

![Quizito Banner](https://via.placeholder.com/1200x400?text=Quizito+AI+Learning+Platform)

[![Live Demo](https://img.shields.io/badge/Demo-Live-green?style=for-the-badge&logo=vercel)](https://quizito-frontend.onrender.com)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)

**Quizito** is a next-generation quiz platform that leverages **Artificial Intelligence** to revolutionize how we learn and assess knowledge. It combines real-time multiplayer gaming with adaptive learning and instant AI-generated content.

## ✨ Key Features

### 🤖 AI-Powered Intelligence
- **Instant Quiz Generation**: Generate quizzes from any topic, text, PDF documents, or even audio files using advanced LLMs (DeepSeek, Llama, OpenAI).
- **Adaptive Difficulty**: The system learns from your performance and adjusts the difficulty in real-time.
- **Smart Explanations**: detailed AI-generated explanations for every answer.

### 🎮 Real-Time Multiplayer
- **Live Host Mode**: Host quizzes for hundreds of players simultaneously with low latency.
- **Interactive Gameplay**: Use power-ups (50/50, Time Freeze, Double Points) to gain an edge.
- **Live Leaderboard**: Watch rankings change in real-time as players answer.
- **Team Mode**: Collaborate with friends to compete against other teams.

### 📊 Deep Analytics
- **Performance Insights**: Detailed breakdown of accuracy, speed, and topic mastery.
- **Skill Analysis**: Identify strong and weak areas with visual charts.
- **Host Dashboard**: Comprehensive reports on session engagement and class performance.

### 🌍 Global Reach
- **Multi-language Support**: Fully localized interface (English, Hindi, Odia, Spanish, etc.).
- **Accessibility**: Designed with WCAG guidelines for inclusive learning.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: TailwindCSS, Framer Motion (Animations)
- **State Management**: React Context + Hooks
- **Real-time**: Socket.io-client
- **Charts**: Recharts, Chart.js

### Backend
- **Runtime**: Node.js (v20.x)
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Real-time**: Socket.io (WebSockets)
- **Caching**: Redis (Optional)
- **Authentication**: JWT, Passport (Google/GitHub OAuth)
- **AI Integration**: OpenAI SDK, Groq SDK

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (Local or Atlas URI)
- (Optional) Redis server

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Team-TechTonics/Quizito.git
   cd Quizito
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in `backend/`:
   ```env
   PORT=10000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_key
   
   # AI Keys (At least one required for AI features)
   OPENAI_API_KEY=your_openai_key
   DEEPSEEK_API_KEY=your_deepseek_key
   GROQ_API_KEY=your_groq_key
   
   # OAuth (Optional)
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   ```
   Start the backend:
   ```bash
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```
   Start the frontend:
   ```bash
   npm run dev
   ```

4. **Access the App**
   Open `http://localhost:5173` in your browser.

---

## 📁 Project Structure

```
Quizito/
├── backend/            # Express + MongoDB API
│   ├── models/         # Database schemas
│   ├── routes/         # API endpoints
│   ├── services/       # AI & business logic
│   └── server.js       # Entry point
│
├── frontend/           # React + Vite App
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Route pages (Home, Quiz, Host)
│   │   ├── locales/    # i18n translation files
│   │   └── context/    # Global state
│
└── README.md           # Documentation
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  
**Built with ❤️ by Team TechTonics**

[![Star History Chart](https://api.star-history.com/svg?repos=Team-TechTonics/Quizito&type=date)](https://star-history.com/#Team-TechTonics/Quizito&Date)

</div>
