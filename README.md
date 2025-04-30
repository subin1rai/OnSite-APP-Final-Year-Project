# 🏗️ OnSite – Smart Construction Management Platform

**OnSite** is a mobile-first construction management solution designed to streamline project workflows, enhance worker coordination, and track progress in real time. From attendance logging to AI-powered cost predictions, OnSite empowers builders, workers teams to collaborate seamlessly.

![OnSite Screenshot](https://res.cloudinary.com/diag9maev/image/upload/v1745996970/iPhone_15_Pro_1_mknxcn.png)

---

## 🚀 Features

- 👷‍♂️ **Role-Based Authentication** – Separate dashboards for builders, workers.
- 📆 **Attendance Tracking** – Mark and view daily worker attendance by project.
- 💰 **Budget & Finance Management** – Track and categorize expenses.
- 💬 **Real-Time Chat** – Communicate instantly using Socket.IO-powered messaging.
- 🧠 **AI-Powered Price Estimation** – Predict project cost based on inputs like area and material preference.
- 📄 **Project Reports** – Generate summaries of tasks, progress, budgets, and attendance.
- 🔔 **Push Notifications** – Stay informed with in-app and push alerts.
- 💳 **Khalti Integration** – Top-up and transfer time credits with secure payment gateway.

---

## 🛠️ Tech Stack

### 🖥️ Frontend – Mobile App (React Native)
- **React Native (Expo)** – Cross-platform mobile development
- **Zustand** – Lightweight and scalable state management
- **React Navigation** – Navigation across screens
- **NativeWind** – Tailwind-like styling for React Native

### 🧠 AI Layer
- **Flask** – Python server handling AI predictions


### ⚙️ Backend – API Services
- **Node.js + Express** – RESTful API server
- **Prisma ORM** – MySQL database management and queries
- **MySQL** – Relational database for structured data
- **Socket.IO** – WebSocket-based real-time communication



## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/onsite.git
cd onsite

```

```bash
cd Backend
npm install
npx prisma generate
npx prisma migrate dev
npm start
```

```bash
cd Frontend
npm install
npx expo start
```

```bash
cd Server
python -m venv venv
source venv/bin/activate  # For Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
