# 📌 LoreStack

LoreStack is a sophisticated, community-driven social web platform designed for **mood-based content discovery** and deep community interaction. It bridges the gap between passive content consumption and active discussion by organizing users into "LoreRooms" (communities) and providing highly personalized recommendations through advanced collaborative filtering.

---

## 🚀 Key Features

### 🧠 Intelligent Recommendations
- **Mood-Based Discovery**: Effortlessly find movies and series that match your current emotional state (Happy, Sad, Thrilled, etc.).
- **Taste Circles**: Leverage collaborative filtering (Cosine Similarity) to discover content based on the preferences of like-minded users.
- **Dynamic Feeds**: Personalized home page that prioritizes active discussions and trending LoreRoom content.

### 👥 LoreRooms (Communities)
- **Niche Discussions**: Join or create specialized communities focused on specific genres, franchises, or topics.
- **Threaded Conversations**: Engage in deep, organized discussions with nested replies and real-time interactions.
- **Popularity Ranking**: Content within LoreRooms is dynamically sorted by "Latest" or "Popular" (most upvoted).

### 🔒 Secure & Seamless Auth
- **Google Sign-In**: One-tap authentication using Google OAuth 2.0.
- **JWT Protection**: Secure, stateless session management with access and refresh token rotation.

### 🔍 Discovery & Profiles
- **Global Search**: Quickly find users, posts, and movies across the platform.
- **Rich User Profiles**: Showcase your "Lore", track your interactions, and discover others' tastes.
- **Media Integration**: Detailed movie/series views powered by TMDB API, featuring trailers, cast, and related discussions.

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: [React 19](https://react.dev/) with [Vite](https://vitejs.dev/) for lightning-fast builds.
- **State Management**: React Hooks & Context API.
- **Routing**: [React Router 7](https://reactrouter.com/).
- **Styling**: Vanilla CSS (Custom Design System) for a premium, bespoke UI/UX.
- **Icons**: [Lucide React](https://lucide.dev/) & [React Icons](https://react-icons.github.io/react-icons/).

### **Backend**
- **Framework**: [Django 4.2](https://www.djangoproject.com/) & [Django REST Framework](https://www.django-rest-framework.org/).
- **Authentication**: Simple JWT & Google OAuth.
- **Database**: PostgreSQL (Production-ready) / SQLite (Development).
- **Storage**: [Cloudinary](https://cloudinary.com/) for media and image hosting.
- **APIs**: The Movie Database (TMDB) for rich media metadata.

---

## ⚙️ Project Setup

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure Environment Variables (.env)
# Create a .env file and add:
# SECRET_KEY=your_secret_key
# TMDB_API_KEY=your_tmdb_key
# GOOGLE_CLIENT_ID=your_google_id
# CLOUDINARY_CLOUD_NAME=...
# CLOUDINARY_API_KEY=...
# CLOUDINARY_API_SECRET=...

# Run migrations and start server
python manage.py migrate
python manage.py runserver
```

### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Configure Environment Variables (.env)
# VITE_GOOGLE_CLIENT_ID=your_google_id

# Start development server
npm run dev
```

---

## 🏗️ Architecture Overview

LoreStack follows a modern decoupled architecture:
- **Backend**: A robust RESTful API that handles business logic, recommendation algorithms (Cosine Similarity), and database interactions.
- **Frontend**: A high-performance Single Page Application (SPA) that consumes the API and provides a fluid, responsive user experience.
- **Integration**: Communication between services is secured via JWT, with media assets offloaded to Cloudinary for optimized delivery.

---

## 👥 The Team

- **Aayush Sapkota** — Backend Architecture & Recommendation Systems
- **Nitesh** — Frontend Development & UX Design
- **Bimal** — Frontend Development & Component Engineering

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.