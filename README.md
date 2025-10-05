# Online Learning Platform

A modern, full-stack online learning platform built with React.js, Firebase Authentication, and MongoDB. This platform supports secure user authentication through email/password and Google OAuth, with comprehensive user profile management.

## 🚀 Features

### Authentication
- ✅ **Email/Password Authentication** - Secure login and signup
- ✅ **Google OAuth 2.0** - One-click Google sign-in
- ✅ **Firebase Integration** - Robust authentication backend
- ✅ **Protected Routes** - Secure access to dashboard and features

### User Management
- 📊 **User Dashboard** - Personalized learning dashboard
- 👤 **Profile Management** - User profiles stored in MongoDB
- 📈 **Progress Tracking** - Course progress and learning analytics
- 🎯 **Learning Goals** - Personalized learning objectives

### Platform Features
- 📚 **Course Management** - Course enrollment and tracking
- 🏆 **Achievements** - Certificates and progress badges
- 📱 **Responsive Design** - Mobile-friendly interface
- 🎨 **Modern UI** - Beautiful, intuitive user experience

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React.js 18+ |
| **Authentication** | Firebase Authentication |
| **OAuth** | Google Cloud OAuth 2.0 |
| **Database** | MongoDB |
| **Backend** | Node.js + Express |
| **Styling** | CSS3 with modern design |
| **Icons** | Lucide React |
| **Routing** | React Router DOM |

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Firebase project with Authentication enabled
- Google Cloud Console project for OAuth

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd WT-one-credit

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Environment Setup

```bash
# Copy environment file
cd server
cp .env.example .env
```

Edit `server/.env` with your configuration:
```env
MONGODB_URI=mongodb://localhost:27017/online-learning-platform
PORT=5000
```

### 3. Firebase Configuration

Your Firebase config is already set up in `src/config/firebase.js`. Make sure your Firebase project has:
- Authentication enabled
- Email/Password provider enabled
- Google provider enabled
- Web app configured

### 4. Start the Application

```bash
# Terminal 1: Start the backend server
cd server
npm run dev

# Terminal 2: Start the React frontend
cd ..
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 📁 Project Structure

```
WT-one-credit/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── Login.js
│   │   │   ├── Signup.js
│   │   │   └── Auth.css
│   │   ├── dashboard/
│   │   │   ├── Dashboard.js
│   │   │   └── Dashboard.css
│   │   └── PrivateRoute.js
│   ├── contexts/
│   │   └── AuthContext.js
│   ├── config/
│   │   └── firebase.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── server/
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── package.json
└── README.md
```

## 🔐 Authentication Flow

1. **User Registration/Login**
   - Email/password or Google OAuth
   - Firebase handles authentication
   - JWT tokens for session management

2. **User Data Storage**
   - User profile saved to MongoDB
   - Includes: UID, email, display name, photo URL
   - Additional fields: role, enrolled courses, preferences

3. **Protected Access**
   - Private routes require authentication
   - Automatic redirect to login if not authenticated
   - Persistent sessions across browser refreshes

## 🎯 API Endpoints

### User Management
- `POST /api/users` - Create or update user
- `GET /api/users/:uid` - Get user by UID
- `PUT /api/users/:uid` - Update user profile
- `GET /api/users` - Get all users (admin)
- `GET /api/health` - Health check

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase project
2. Enable Authentication
3. Add Email/Password and Google providers
4. Get your config object and update `src/config/firebase.js`

### MongoDB Setup
1. Install MongoDB locally or use MongoDB Atlas
2. Update connection string in `server/.env`
3. Database and collections will be created automatically

### Google OAuth Setup
1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Add authorized domains
4. Configure in Firebase Authentication

## 🚀 Deployment

### Frontend (Netlify/Vercel)
```bash
npm run build
# Deploy the build folder
```

### Backend (Heroku/Railway)
```bash
cd server
# Deploy server folder
```

### Environment Variables for Production
- `MONGODB_URI` - Production MongoDB connection
- `NODE_ENV=production`
- Firebase config (if using server-side Firebase)

## 🎨 Customization

### Styling
- Modify CSS files in component directories
- Update color scheme in CSS custom properties
- Responsive design already implemented

### Features
- Add new routes in `App.js`
- Create new components in `src/components/`
- Extend user schema in `server/server.js`

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Authentication Errors**
   - Check Firebase project configuration
   - Verify API keys and domain settings

2. **MongoDB Connection Issues**
   - Ensure MongoDB is running
   - Check connection string format

3. **CORS Errors**
   - Backend CORS is configured for localhost
   - Update for production domains

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section
2. Review Firebase and MongoDB documentation
3. Create an issue in the repository

---

**Happy Learning! 🎓**
