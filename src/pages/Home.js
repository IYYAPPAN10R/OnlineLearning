import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <section className="hero">
        <h1>Welcome to Our Learning Platform</h1>
        <p>Start your learning journey today with our wide range of courses.</p>
        <div className="cta-buttons">
          <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
          <Link to="/signup" className="btn btn-secondary">Sign Up Free</Link>
        </div>
      </section>
      
      <section className="features">
        <h2>Why Choose Us?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Expert Instructors</h3>
            <p>Learn from industry professionals with years of experience.</p>
          </div>
          <div className="feature-card">
            <h3>Flexible Learning</h3>
            <p>Study at your own pace, anytime, anywhere.</p>
          </div>
          <div className="feature-card">
            <h3>Practical Skills</h3>
            <p>Gain hands-on experience with real-world projects.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
