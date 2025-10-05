import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import InstructorRoute from './components/InstructorRoute';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Dashboard from './components/dashboard/Dashboard';
import AdminPanel from './components/admin/AdminPanel';
import InstructorDashboard from './pages/InstructorDashboard';
import Home from './pages/Home';
import Courses from './pages/Courses';
import Quizzes from './pages/Quizzes';
import About from './pages/About';
import Contact from './pages/Contact';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import './styles/Home.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navigation />
          <main className="main-content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <AdminPanel />
                  </AdminRoute>
                } 
              />
              <Route 
                path="/instructor" 
                element={
                  <InstructorRoute>
                    <InstructorDashboard />
                  </InstructorRoute>
                } 
              />
              <Route path="/courses" element={<Courses />} />
              <Route path="/quizzes" element={<Quizzes />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/" element={<Home />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
          <ToastContainer 
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
